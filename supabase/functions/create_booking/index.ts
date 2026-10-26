
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

function respond(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

function nextDate(date: string): string {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return respond({ error: "Method not allowed" }, 405)
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

    if (!supabaseUrl || !serviceRoleKey) {
      return respond({ error: "Server configuration error" }, 500)
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    let body: Record<string, any>
    try {
      body = await req.json()
    } catch {
      return respond({ error: "Invalid JSON body" }, 400)
    }

    const { room_id, check_in, check_out, guests, source_channel } = body

    if (
      typeof room_id !== "string" || !room_id.trim() ||
      typeof check_in !== "string" ||
      typeof check_out !== "string"
    ) {
      return respond({
        error: "room_id, check_in, and check_out are required",
      }, 400)
    }

    const datePattern = /^\d{4}-\d{2}-\d{2}$/
    const validDate = (s: string) => {
      if (!datePattern.test(s)) return false
      const d = new Date(`${s}T00:00:00Z`)
      return Number.isFinite(d.getTime()) &&
        d.toISOString().slice(0, 10) === s
    }

    if (
      !validDate(check_in) ||
      !validDate(check_out) ||
      check_in >= check_out
    ) {
      return respond({
        error: "Invalid dates: check_out must be after check_in",
      }, 400)
    }

    if (
      !Array.isArray(guests) ||
      guests.length === 0 ||
      guests.some((g: any) =>
        !g ||
        typeof g.guest_name !== "string" ||
        !g.guest_name.trim() ||
        typeof g.email !== "string" ||
        !g.email.trim()
      )
    ) {
      return respond({
        error: "At least one guest with guest_name and email is required",
      }, 400)
    }

    const allowedChannels = ["direct", "ota_1", "ota_2"]
    const currentChannel =
      typeof source_channel === "string" &&
      allowedChannels.includes(source_channel)
        ? source_channel
        : "direct"

    // Step 1: Create booking and associate guests.
    const { data: bookingResult, error: bookingErr } = await supabase.rpc(
      "create_booking_with_guests",
      {
        p_room_id: room_id.trim(),
        p_check_in: check_in,
        p_check_out: check_out,
        p_guests: guests.map((g: any) => ({
          guest_name: g.guest_name.trim(),
          email: g.email.trim().toLowerCase(),
          ...(typeof g.phone === "string" && g.phone.trim()
            ? { phone: g.phone.trim() }
            : {}),
        })),
      },
    )

    if (bookingErr) {
      console.error("Booking RPC failed:", bookingErr.message)
      return respond({ error: "Failed to create booking" }, 500)
    }

    const bookingStatus = Number(bookingResult?.http_status ?? 500)

    // On conflict, stop here: do not calculate or push inventory.
    if (bookingStatus !== 201 || bookingResult?.success !== true) {
      const status =
        bookingStatus >= 400 && bookingStatus <= 599
          ? bookingStatus
          : 500

      return respond({
        error: bookingResult?.error ?? "Failed to create booking",
      }, status)
    }

    // The booking is now committed. Inventory sync failures must not
    // be reported as if the booking itself failed.
    const syncResults: Array<Record<string, unknown>> = []

    try {
      // Step 2: Get the room type for the booked physical room.
      const { data: room, error: roomError } = await supabase
        .from("room")
        .select("room_type")
        .eq("room_id", room_id.trim())
        .maybeSingle()

      if (roomError || !room?.room_type) {
        throw new Error("Could not determine room_type for inventory")
      }

      const roomType = room.room_type

      // Step 3: Count rooms of this type.
      // Assumption: all rows of this room type are sellable.
      const { data: rooms, error: roomsError } = await supabase
        .from("room")
        .select("room_id")
        .eq("room_type", roomType)

      if (roomsError) throw roomsError

      const totalRooms = new Set(
        (rooms ?? []).map((r: any) => r.room_id),
      ).size

      // Step 4: Calculate availability for each occupied night.
      for (
        let date = check_in;
        date < check_out;
        date = nextDate(date)
      ) {
        const followingDate = nextDate(date)

        const { data: bookings, error: bookingsError } = await supabase
          .from("booking")
          .select("room_id")
          .eq("status", "confirmed")
          .lt("check_in", followingDate)
          .gt("check_out", date)

        if (bookingsError) throw bookingsError

        const occupiedRoomIds = new Set(
          (bookings ?? [])
            .map((b: any) => b.room_id)
            .filter(Boolean),
        )

        const availableCount = Math.max(
          0,
          totalRooms -
            [...occupiedRoomIds].filter((id) =>
              (rooms ?? []).some((r: any) => r.room_id === id)
            ).length,
        )

        // Send one night per call because availability can vary by date.
        const pushResponse = await fetch(
          `${supabaseUrl}/functions/v1/push_availability_update`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "apikey": serviceRoleKey,
              "Authorization": `Bearer ${serviceRoleKey}`,
            },
            body: JSON.stringify({
              room_type: roomType,
              check_in: date,
              check_out: followingDate,
              available_count: availableCount,
              event_type: "booking_created",
              source_channel: currentChannel,
            }),
            signal: AbortSignal.timeout(15000),
          },
        )

        let pushResult: Record<string, any> = {}
        try {
          pushResult = await pushResponse.json()
        } catch {
          pushResult = { error: "Invalid response from inventory function" }
        }

        syncResults.push({
          date,
          available_count: availableCount,
          http_status: pushResponse.status,
          database_updated:
            pushResponse.ok && pushResult.database_updated === true,
          ota_sync_completed: pushResult.ota_sync_completed === true,
          error: pushResponse.ok ? undefined : pushResult.error,
          mock_sync: pushResult.mock_sync,
        })
      }
    } catch (syncError) {
      console.error("Inventory sync failed after booking:", syncError)
      syncResults.push({
        error: syncError instanceof Error
          ? syncError.message
          : "Inventory sync failed",
      })
    }

    const inventoryUpdated =
      syncResults.length > 0 &&
      syncResults.every((r) => r.database_updated === true)

    const otaSyncCompleted =
      inventoryUpdated &&
      syncResults.every((r) => r.ota_sync_completed === true)

    // Return booking success even if the separate sync step fails.
    return respond({
      success: true,
      message: "Booking created successfully",
      booking: bookingResult.booking,
      booking_id: bookingResult.booking_id,
      guest_count:
        bookingResult["guest-count"] ?? bookingResult.guest_count,
      guest_ids: bookingResult.guest_ids,
      source_channel: currentChannel,
      inventory_updated: inventoryUpdated,
      ota_sync_completed: otaSyncCompleted,
      inventory_sync: syncResults,
    }, 201)
  } catch (error) {
    console.error("Unexpected error:", error)
    return respond({ error: "Internal server error" }, 500)
  }
})
