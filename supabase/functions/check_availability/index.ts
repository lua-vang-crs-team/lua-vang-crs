import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { check_in, check_out } = await req.json();

    if (!check_in || !check_out) {
      return new Response(
        JSON.stringify({ error: "Missing check_in or check_out parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: overlappingBookings, error: bookingError } = await supabase
      .from("booking")
      .select("room_id")
      .eq("status", "confirmed")
      .lt("check_in", check_out)
      .gt("check_out", check_in);

    if (bookingError) {
      throw bookingError;
    }

    const occupiedRoomIds = [...new Set(overlappingBookings?.map((b) => b.room_id) || [])];

    const { data: allRooms, error: roomError } = await supabase
      .from("room")
      .select("*");

    if (roomError) {
      throw roomError;
    }

    const availableRooms = allRooms?.filter((room) => !occupiedRoomIds.includes(room.room_id)) || [];

    return new Response(
      JSON.stringify({
        available_rooms: availableRooms,
        count: availableRooms.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
