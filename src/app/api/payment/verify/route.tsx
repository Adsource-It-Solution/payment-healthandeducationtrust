import { NextResponse } from "next/server";
import crypto from "crypto";
import connect from "@/app/lib/mongodb";
import Transaction from "@/app/models/transaction";
import { renderToBuffer } from "@react-pdf/renderer";
import ReceiptDocument from "@/app/pdf/ReceiptDocument";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  console.log("------------------------------------------------------------");
  console.log("[VERIFY] 🔔 Payment verification process started...");

  try {
    const body = await req.json();
    console.log("[VERIFY] 📨 Incoming request body:", body);

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, formData } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error("[VERIFY] ❌ Missing Razorpay payment details");
      return NextResponse.json(
        { success: false, message: "Missing Razorpay verification fields" },
        { status: 400 }
      );
    }

    // 1️⃣ Verify Razorpay signature
    console.log("[VERIFY] 🧾 Verifying Razorpay signature...");
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      console.error("[VERIFY] ❌ Invalid Razorpay signature!");
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 400 }
      );
    }
    console.log("[VERIFY] ✅ Signature verification passed!");

    // 2️⃣ Connect to MongoDB
    console.log("[VERIFY] 🌐 Connecting to MongoDB...");
    await connect();
    console.log("[VERIFY] ✅ MongoDB connection established");

    // 3️⃣ Save transaction in DB
    console.log("[VERIFY] 💾 Saving transaction to MongoDB...");
    const transaction = await Transaction.create({
      ...formData,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      signature: razorpay_signature,
      status: "success",
      createdAt: new Date(),
    });
    console.log("[VERIFY] ✅ Transaction saved successfully:", {
      id: transaction._id,
      email: transaction.email,
      name: transaction.name,
      amount: transaction.amount,
      status: transaction.status,
    });

    // 4️⃣ Generate PDF Receipt
    console.log("[VERIFY] 🧾 Generating PDF receipt...");
    const pdfBuffer = await renderToBuffer(<ReceiptDocument transaction={transaction} />);
    console.log("[VERIFY] ✅ PDF receipt generated successfully");

    // 5️⃣ Setup Nodemailer
    console.log("[VERIFY] ✉️ Setting up Gmail transporter...");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER!,
        pass: process.env.EMAIL_PASS!,
      },
    });
    console.log("[VERIFY] ✅ Gmail transporter configured");

    // 6️⃣ Define recipients
    const recipients = [transaction.email, process.env.COMPANY_EMAIL!];
    console.log("[VERIFY] 📧 Email recipients:", recipients);

    // 7️⃣ Send email with PDF
    console.log("[VERIFY] 🚀 Sending payment receipt email...");
    await transporter.sendMail({
      from: `"Ngo payment" <${process.env.EMAIL_USER!}>`,
      to: recipients,
      subject: `Payment Receipt - ₹${transaction.amount}`,
      text: `Dear ${transaction.name},

Thank you for your payment of ₹${transaction.amount}.
Attached is your official payment receipt.

Transaction ID: ${transaction._id}
Payment ID: ${razorpay_payment_id}
Date: ${new Date(transaction.createdAt).toLocaleString()}

Regards,
Edunova Payments`,
      attachments: [
        {
          filename: "receipt.pdf",
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });
    console.log("[VERIFY] ✅ Email sent successfully to:", recipients);

    // 8️⃣ Return response
    console.log("[VERIFY] 🎉 Payment verified and receipt process completed successfully!");
    console.log("------------------------------------------------------------");

    return NextResponse.json({
      success: true,
      message: "Payment verified and receipt sent successfully",
      transaction,
    });
  } catch (error: any) {
    console.error("[VERIFY_PAYMENT_ERROR] ❌", error);
    console.log("------------------------------------------------------------");
    return NextResponse.json(
      { success: false, message: error.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}
