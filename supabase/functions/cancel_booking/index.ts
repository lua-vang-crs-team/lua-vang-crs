import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// 1. Thêm bộ CORS headers (Giải quyết vấn đề 1)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 2. Xử lý preflight OPTIONS (Giải quyết vấn đề 2)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { booking_id } = await req.json()

    if (!booking_id) {
      return new Response(JSON.stringify({ error: "Thiếu booking_id" }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      })
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // 3. Đổi tên bảng thành 'booking' chữ thường (Giải quyết vấn đề 3)
    const { data: booking, error: findError } = await supabaseClient
      .from('booking') 
      .select('status')
      .eq('booking_id', booking_id)
      .single()

    if (findError || !booking) {
      return new Response(JSON.stringify({ error: "Không tìm thấy Booking" }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404 
      })
    }

    if (booking.status !== 'confirmed') {
      return new Response(JSON.stringify({ error: "Booking không ở trạng thái confirmed để hủy" }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      })
    }

    // Đổi tên bảng thành 'booking'
    const { error: updateError } = await supabaseClient
      .from('booking')
      .update({ status: 'cancelled' })
      .eq('booking_id', booking_id)

    if (updateError) {
      throw updateError
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Booking cancelled successfully" 
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200 
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500 
    })
  }
})
