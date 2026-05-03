import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL, 
      process.env.SUPABASE_SERVICE_ROLE
    );

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.razorpay_order_id + "|" + body.razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== body.razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    // Confirm booking (DB SAFE)
    // In actual implementation, confirm_booking RPC should mark booking as 'CONFIRMED'
    // For now, we will update the booking row directly if RPC doesn't exist yet
    const { data: rpcData, error: rpcError } = await supabase.rpc("confirm_booking", {
      p_slot_id: body.slot_id,
      p_user_id: body.user_id,
      p_payment_id: body.razorpay_payment_id,
      p_order_id: body.razorpay_order_id
    });

    if (rpcError) {
      // Fallback if RPC isn't set up yet:
      console.warn("RPC failed, falling back to direct update", rpcError);
      await supabase
        .from('bookings')
        .update({ status: 'CONFIRMED', payment_id: body.razorpay_payment_id })
        .eq('slot_id', body.slot_id)
        .eq('user_id', body.user_id);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: error.message });
  }
}
