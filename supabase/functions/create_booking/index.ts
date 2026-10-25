
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
    const check_in = body.check_in;
    const check_out = body.check_out;

    // Accept a guests array; also support a single guest with email.
    const guests = Array.isArray(body.guests)
      ? body.guests
      : [{
          guest_name: body.guest_name,
          email: body.email,
          phone: body.phone,
        }];

    // 1. Validate booking input.
    if (!room_id || !check_in || !check_out) {
      return respond({
        error: "room_id, check_in and check_out are required",
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

    if (!Array.isArray(guests) || guests.length === 0) {
      return respond({
        error: "At least one guest is required",
      }, 400);
    }

    const normalizedGuests = [];

    for (const guest of guests) {
      const guest_name =
        typeof guest?.guest_name === "string"
          ? guest.guest_name.trim()
          : "";
      const email =
        typeof guest?.email === "string"
          ? guest.email.trim().toLowerCase()
          : "";
      const phone =
        typeof guest?.phone === "string"
          ? guest.phone.trim()
          : null;

      if (!guest_name || !email) {
        return respond({
          error: "Every guest requires guest_name and email",
        }, 400);
      }

      normalizedGuests.push({
        guest_name,
        email,
        phone: phone || null,
      });
    }

    // 2. Find Room.
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

    // 3. Preserve the existing room-conflict rule.
    // Existing check_in < requested check_out
    // AND existing check_out > requested check_in.
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
      return respond({
        error: "Unable to check room availability",
      }, 500);
    }

    if (conflicts && conflicts.length > 0) {
      return respond({
        error: "Room is not available for selected dates",
      }, 409);
    }

    // 4. Delegate Guest reuse/creation, Booking creation and
    // booking_guests links to the database function.
    // The SQL function checks conflicts again and locks the room,
    // protecting against concurrent booking attempts.
    const { data: result, error: rpcError } = await supabase.rpc(
      "create_booking_with_guests",
      {
        p_room_id: room_id,
        p_check_in: check_in,
        p_check_out: check_out,
        p_guests: normalizedGuests,
      },
    );

    if (rpcError) {
      console.error("Guest booking RPC failed:", rpcError.message);
      return respond({
        error: "Failed to create booking",
        details: rpcError.message,
      }, 500);
    }

    if (!result || typeof result !== "object") {
      return respond({
        error: "Invalid response from booking function",
      }, 500);
    }

    const rpcResult = result as Record<string, unknown>;
    const httpStatus =
      typeof rpcResult.http_status === "number"
        ? rpcResult.http_status
        : 500;

    const { http_status: _ignored, ...responseBody } = rpcResult;

    return respond(responseBody, httpStatus);
  } catch (error) {
    console.error(
      "Unexpected create_booking error:",
      error instanceof Error ? error.message : error,
    );

    return respond({ error: "Internal server error" }, 500);
  }
});
