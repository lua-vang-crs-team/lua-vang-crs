import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const { booking_id } = await req.json()

    if (!booking_id) {
      return new Response(JSON.stringify({ error: "Thiếu booking_id" }), { status: 400 })
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Tìm phòng xem có tồn tại không
    const { data: booking, error: findError } = await supabaseClient
      .from('Bookings') 
      .select('status')
      .eq('booking_id', booking_id)
      .single()

    if (findError || !booking) {
      return new Response(JSON.stringify({ error: "Không tìm thấy Booking" }), { status: 404 })
    }

    if (booking.status !== 'confirmed') {
      return new Response(JSON.stringify({ error: "Booking không ở trạng thái confirmed để hủy" }), { status: 400 })
    }

    // Đổi trạng thái thành cancelled
    const { error: updateError } = await supabaseClient
      .from('Bookings')
      .update({ status: 'cancelled' })
      .eq('booking_id', booking_id)

    if (updateError) {
      throw updateError
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Booking cancelled successfully" 
    }), { status: 200 })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
