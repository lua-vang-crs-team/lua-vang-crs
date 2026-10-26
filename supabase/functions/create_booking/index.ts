
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
    return respond({ error: "Method not allowed" }, 405)
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

    if (!supabaseUrl || !serviceRoleKey) {
      return respond({ error: "Server configuration error" }, 500)
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    let body: Record<string, any>

    try {
      body = await req.json()
    } catch {
      return respond({ error: "Invalid JSON body" }, 400)
    }

    const { room_id, check_in, check_out, guests, source_channel } = body

    // Validate required booking fields.
    if (
      typeof room_id !== "string" ||
      !room_id.trim() ||
      typeof check_in !== "string" ||
      typeof check_out !== "string" ||
      !check_in ||
      !check_out
    ) {
      return respond(
        { error: "room_id, check_in, and check_out are required" },
        400,
      )
    }

    // Validate dates in YYYY-MM-DD format.
    const datePattern = /^\d{4}-\d{2}-\d{2}$/

    if (
      !datePattern.test(check_in) ||
      !datePattern.test(check_out) ||
      !Number.isFinite(Date.parse(`${check_in}T00:00:00Z`)) ||
      !Number.isFinite(Date.parse(`${check_out}T00:00:00Z`)) ||
      check_in >= check_out
    ) {
      return respond(
        { error: "Invalid dates: check_out must be after check_in" },
        400,
      )
    }

    // Validate guest list before writing any data.
    if (
      !Array.isArray(guests) ||
      guests.length === 0 ||
      guests.some(
        (guest: any) =>
          !guest ||
          typeof guest.guest_name !== "string" ||
          !guest.guest_name.trim() ||
          typeof guest.email !== "string" ||
          !guest.email.trim(),
      )
    ) {
      return respond(
        {
          error:
            "At least one guest with guest_name and email is required",
        },
        400,
      )
    }

    // Keep channel names consistent with the project contract.
    const allowedChannels = ["direct", "ota_1", "ota_2"]
    const currentChannel =
      typeof source_channel === "string" &&
      allowedChannels.includes(source_channel)
        ? source_channel
        : "direct"

    // Create the booking and associate one or more guests.
    // The SQL function checks room conflicts before inserting data.
    const { data: bookingResult, error: bookingErr } = await supabase.rpc(
      "create_booking_with_guests",
      {
        p_room_id: room_id.trim(),
        p_check_in: check_in,
        p_check_out: check_out,
        p_guests: guests.map((guest: any) => ({
          guest_name: guest.guest_name.trim(),
          email: guest.email.trim().toLowerCase(),
          ...(typeof guest.phone === "string" && guest.phone.trim()
            ? { phone: guest.phone.trim() }
            : {}),
        })),
      },
    )

    if (bookingErr) {
      console.error(
        "create_booking_with_guests failed:",
        bookingErr.message,
      )
      return respond({ error: "Failed to create booking" }, 500)
    }

    const bookingStatus = Number(bookingResult?.http_status ?? 500)

    // Preserve the SQL function's conflict status, including HTTP 409.
    if (bookingStatus !== 201 || bookingResult?.success !== true) {
      const status =
        bookingStatus >= 400 && bookingStatus <= 599
          ? bookingStatus
          : 500

      return respond(
        {
          error: bookingResult?.error ?? "Failed to create booking",
        },
        status,
      )
    }

    // Booking and guest links have been created successfully.
    // Channel inventory sync belongs to the separate 4.1 integration step.
    return respond(
      {
        success: true,
        message: "Booking created successfully",
        booking: bookingResult.booking,
        booking_id: bookingResult.booking_id,
        guest_count: bookingResult["guest-count"] ??
          bookingResult.guest_count,
        guest_ids: bookingResult.guest_ids,
        source_channel: currentChannel,
      },
      201,
    )
  } catch (error) {
    console.error("Unexpected error:", error)
    return respond({ error: "Internal server error" }, 500)
  }
})
