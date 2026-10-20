
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function respond(
  body: Record<string, unknown>,
  status = 200,
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return respond({ error: "Method not allowed" }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Supabase environment variables are missing.");
      return respond({ error: "Server configuration error" }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const body = await req.json();

    const room_id =
      typeof body.room_id === "string" ? body.room_id.trim() : "";
    const guest_name =
      typeof body.guest_name === "string" ? body.guest_name.trim() : "";
    const check_in = body.check_in;
    const check_out = body.check_out;

    // 1. Validate input
    if (!room_id || !guest_name || !check_in || !check_out) {
      return respond({
        error: "room_id, guest_name, check_in and check_out are required",
      }, 400);
    }

    if (
      typeof check_in !== "string" ||
      typeof check_out !== "string" ||
      !Number.isFinite(Date.parse(check_in)) ||
      !Number.isFinite(Date.parse(check_out))
    ) {
      return respond({
        error: "check_in and check_out must be valid date strings",
      }, 400);
    }

    if (Date.parse(check_in) >= Date.parse(check_out)) {
      return respond({
        error: "check_in must be before check_out",
      }, 400);
    }

    // 2. Find Room
    const { data: room, error: roomError } = await supabase
      .from("room")
      .select("room_id")
      .eq("room_id", room_id)
      .maybeSingle();

    if (roomError) {
      console.error("Room query failed:", roomError.message);
      return respond({ error: "Unable to verify room" }, 500);
    }

    if (!room) {
      return respond({ error: "Room not found" }, 404);
    }

    // 3. Search for overlapping confirmed bookings
    // Existing check_in < requested check_out
    // AND existing check_out > requested check_in
    const { data: conflicts, error: conflictError } = await supabase
      .from("booking")
      .select("booking_id")
      .eq("room_id", room_id)
      .eq("status", "confirmed")
      .lt("check_in", check_out)
      .gt("check_out", check_in)
      .limit(1);

    if (conflictError) {
      console.error("Conflict query failed:", conflictError.message);
      return respond({ error: "Unable to check room availability" }, 500);
    }

    if (conflicts && conflicts.length > 0) {
      return respond({
        error: "Room is not available for selected dates",
      }, 409);
    }

    // 4. Insert booking only if no conflict exists
    const booking_id = crypto.randomUUID();

    const { data: booking, error: insertError } = await supabase
      .from("booking")
      .insert({
        booking_id,
        room_id,
        guest_name,
        check_in,
        check_out,
        status: "confirmed",
      })
      .select("booking_id, room_id, guest_name, check_in, check_out, status")
      .single();

    if (insertError) {
      console.error("Booking insert failed:", insertError.message);
      return respond({ error: "Failed to create booking" }, 500);
    }

    return respond({
      success: true,
      message: "Booking created successfully",
      booking_id: booking.booking_id,
      booking,
    }, 201);
  } catch (error) {
    console.error(
      "Unexpected create_booking error:",
      error instanceof Error ? error.message : error,
    );

    return respond({ error: "Internal server error" }, 500);
  }
});
