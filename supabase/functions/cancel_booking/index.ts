
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return respond({ success: false, error: "Method not allowed" }, 405)
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

    if (!supabaseUrl || !serviceRoleKey) {
      return respond({ success: false, error: "Server configuration error" }, 500)
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const body = await req.json()
    const bookingId =
      typeof body.booking_id === "string" ? body.booking_id.trim() : ""

    const sourceChannel = body.source_channel ?? "direct"

    if (!bookingId) {
      return respond({ success: false, error: "booking_id is required" }, 400)
    }

    if (!["direct", "ota_1", "ota_2"].includes(sourceChannel)) {
      return respond({ success: false, error: "Invalid source_channel" }, 400)
    }

    // 1. Find booking
    const { data: booking, error: findError } = await supabase
      .from("booking")
      .select("booking_id, room_id, check_in, check_out, status")
      .eq("booking_id", bookingId)
      .maybeSingle()

    if (findError) {
      return respond({ success: false, error: "Failed to find booking" }, 500)
    }

    if (!booking) {
      return respond({ success: false, error: "Booking not found" }, 404)
    }

    if (booking.status !== "confirmed") {
      return respond({
        success: false,
        error: "Booking is not confirmed or already cancelled",
      }, 409)
    }

    // 2. Atomically claim cancellation: only confirmed booking can be updated
    const { data: cancelledBooking, error: cancelError } = await supabase
      .from("booking")
      .update({ status: "cancelled" })
      .eq("booking_id", bookingId)
      .eq("status", "confirmed")
      .select("booking_id, room_id, check_in, check_out, status")
      .maybeSingle()

    if (cancelError) {
      console.error("Cancel failed:", cancelError.message)
      return respond({ success: false, error: "Failed to cancel booking" }, 500)
    }

    if (!cancelledBooking) {
      return respond({
        success: false,
        error: "Booking was already cancelled or changed",
      }, 409)
    }

    // Cancellation succeeded. Inventory/OTA sync is a separate result.
    const { data: room, error: roomError } = await supabase
      .from("room")
      .select("room_type")
      .eq("room_id", cancelledBooking.room_id)
      .maybeSingle()

    if (roomError || !room) {
      return respond({
        success: true,
        message: "Booking cancelled; inventory sync could not start.",
        booking: cancelledBooking,
        inventory_updated: false,
        ota_sync_completed: false,
      })
    }

    const { data: rooms, error: roomsError } = await supabase
      .from("room")
      .select("room_id")
      .eq("room_type", room.room_type)

    if (roomsError || !rooms?.length) {
      return respond({
        success: true,
        message: "Booking cancelled; room inventory could not be calculated.",
        booking: cancelledBooking,
        inventory_updated: false,
        ota_sync_completed: false,
      })
    }

    const roomIds = rooms.map((r) => r.room_id)
    const start = new Date(`${cancelledBooking.check_in}T00:00:00Z`)
    const end = new Date(`${cancelledBooking.check_out}T00:00:00Z`)
    const inventorySync: Array<Record<string, unknown>> = []

    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || start >= end) {
      return respond({
        success: true,
        message: "Booking cancelled; invalid booking date range.",
        booking: cancelledBooking,
        inventory_updated: false,
        ota_sync_completed: false,
      })
    }

    // 3. Recalculate inventory and call the shared sync function per night
    for (let date = new Date(start); date < end; date.setUTCDate(date.getUTCDate() + 1)) {
      const checkIn = date.toISOString().slice(0, 10)
      const nextDate = new Date(date)
      nextDate.setUTCDate(nextDate.getUTCDate() + 1)
      const checkOut = nextDate.toISOString().slice(0, 10)

      const { data: activeBookings, error: availabilityError } = await supabase
        .from("booking")
        .select("room_id")
        .in("room_id", roomIds)
        .eq("status", "confirmed")
        .lte("check_in", checkIn)
        .gt("check_out", checkIn)

      if (availabilityError) {
        inventorySync.push({
          date: checkIn,
          success: false,
          stage: "calculate_inventory",
          error: availabilityError.message,
        })
        continue
      }

      const occupiedRooms = new Set((activeBookings ?? []).map((b) => b.room_id))
      const availableCount = Math.max(0, roomIds.length - occupiedRooms.size)

      try {
        const response = await fetch(
          `${supabaseUrl}/functions/v1/push_availability_update`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "apikey": serviceRoleKey,
              "Authorization": `Bearer ${serviceRoleKey}`,
            },
            body: JSON.stringify({
              room_type: room.room_type,
              check_in: checkIn,
              check_out: checkOut,
              available_count: availableCount,
              event_type: "booking_cancelled",
              source_channel: sourceChannel,
            }),
            signal: AbortSignal.timeout(15000),
          },
        )

        const result = await response.json().catch(() => ({}))

        inventorySync.push({
          date: checkIn,
          available_count: availableCount,
          http_status: response.status,
          success: response.ok && result.success === true,
          database_updated: result.database_updated === true,
          ota_sync_completed: result.ota_sync_completed === true,
          details: result,
        })
      } catch (error) {
        inventorySync.push({
          date: checkIn,
          available_count: availableCount,
          success: false,
          error: error instanceof Error ? error.message : "Inventory sync failed",
        })
      }
    }

    const inventoryUpdated = inventorySync.every(
      (r) => r.success === true && r.database_updated === true,
    )
    const otaSyncCompleted = inventorySync.every(
      (r) => r.success === true && r.ota_sync_completed === true,
    )

    return respond({
      success: true,
      message: otaSyncCompleted
        ? "Booking cancelled; inventory synchronized with both OTA channels."
        : "Booking cancelled; inventory/OTA sync is incomplete. Check inventory_sync.",
      booking: cancelledBooking,
      inventory_updated: inventoryUpdated,
      ota_sync_completed: otaSyncCompleted,
      inventory_sync: inventorySync,
    })
  } catch (error) {
    console.error("cancel_booking error:", error)
    return respond({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    }, 500)
  }
})
