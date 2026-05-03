import Razorpay from "razorpay";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const razorpay = new Razorpay({
      key_id: process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET
    });

    const body = req.body;
    // Vercel serverless functions automatically parse JSON body if content-type is application/json
    // But to be safe, we parse it if it's a string
    const data = typeof body === 'string' ? JSON.parse(body) : body;
    const amount = data.amount;

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise
      currency: "INR"
    });

    res.json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: error.message });
  }
}
