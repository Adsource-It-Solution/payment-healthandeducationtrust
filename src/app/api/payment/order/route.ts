import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import connect from "@/app/lib/mongodb";
import Transaction from "@/app/models/transaction";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[INFO] Request body:", body);

    const { amount, name, email, phone, address } = body;

    if (!amount) {
      return NextResponse.json(
        { success: false, message: "Amount is required" },
        { status: 400 }
      );
    }

    await connect();

    console.log("[INFO] Creating Razorpay instance...");
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    console.log("[INFO] Creating Razorpay order...");
    const order = await razorpay.orders.create({
      amount: Number(amount) * 100,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    console.log("[SUCCESS] Razorpay order created:", order);

    const transaction = await Transaction.create({
      name,
      email,
      phone,
      address,
      amount,
      orderId: order.id,
      createdAt: new Date(),
      status: "created",
    });

    console.log("[SUCCESS] Transaction saved:", transaction._id);

    return NextResponse.json({
      success: true,
      order,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      transactionId: transaction._id,
    });
  } catch (error) {
    console.error("[RAZORPAY_ORDER_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Failed to create order", error: String(error) },
      { status: 500 }
    );
  }
}
