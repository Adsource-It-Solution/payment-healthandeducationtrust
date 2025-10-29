import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import connect from "@/app/lib/mongodb";
import Transaction, { ITransaction } from "@/app/models/transaction";
import ReceiptDocument from "@/app/pdf/ReceiptDocument";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { transactionId } = await req.json();
    if (!transactionId) {
      return NextResponse.json(
        { success: false, message: "Missing transaction ID" },
        { status: 400 }
      );
    }

    // 1️⃣ Connect DB
    await connect();

    // 2️⃣ Fetch transaction
    const transaction = (await Transaction.findById(transactionId).lean()) as ITransaction | null;
    if (!transaction) {
      return NextResponse.json(
        { success: false, message: "Transaction not found" },
        { status: 404 }
      );
    }

    if (!transaction.createdAt) transaction.createdAt = new Date();

    // 3️⃣ Generate PDF Receipt
    const pdfBuffer = await renderToBuffer(<ReceiptDocument transaction={transaction} />);

    // 4️⃣ Setup Gmail transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER!,
        pass: process.env.EMAIL_PASS!,
      },
    });


    const recipients = [
      transaction.email,
      process.env.COMPANY_EMAIL!,
    ];

    // 6️⃣ Send email with PDF
    await transporter.sendMail({
      from: `"Health And Education Trust" <${process.env.EMAIL_USER!}>`,
      to: recipients,
      subject: `Payment Receipt - ₹${transaction.amount}`,
      html: `
  <div style="
    background: url('/logo-pdf.png') no-repeat center top;
    background-size: contain;
    padding: 40px 20px;
    font-family: 'Segoe UI', Arial, sans-serif;
    color: #333;
  ">
    <div style="
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffffcc;
      backdrop-filter: blur(4px);
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      overflow: hidden;
      padding: 30px 40px;
    ">

      <!-- Header with Logo -->
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #d35400; margin: 0;">Health and Education Trust</h2>
        <p style="color:#666; font-size: 13px; margin:4px 0;">Registered NGO | Promoting Health & Education Initiatives</p>
      </div>

      <!-- Greeting -->
      <p style="font-size: 15px;">Dear <strong>${transaction.name}</strong>,</p>

      <p style="font-size: 15px; line-height: 1.6;">
        We sincerely thank you for your generous donation of 
        <strong>₹${transaction.amount}</strong>.
        Your support helps us continue our mission to improve lives through education and healthcare.
      </p>

      <!-- Transaction Details -->
      <div style="margin-top: 25px;">
        <table style="width:100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color:#444;"><strong>Transaction ID:</strong></td>
            <td style="padding: 8px 0; color:#444;">${transaction._id}</td>
          </tr>
          <tr style="border-top:1px solid #eee;">
            <td style="padding: 8px 0; color:#444;"><strong>Amount:</strong></td>
            <td style="padding: 8px 0; color:#444;">${transaction.amount}</td>
          </tr>
          <tr style="border-top:1px solid #eee;">
            <td style="padding: 8px 0; color:#444;"><strong>Date:</strong></td>
            <td style="padding: 8px 0; color:#444;">${new Date(transaction.createdAt).toLocaleString()}</td>
          </tr>
          
          <tr style="border-top:1px solid #eee;">
            <td style="padding: 8px 0; color:#444;"><strong>Payment Mode:</strong></td>
            <td style="padding: 8px 0; color:#444;">Online via Razorpay</td>
          </tr>
        </table>
      </div>

      <!-- Footer -->
      <div style="margin-top: 40px; text-align: center;">
        <p style="font-size: 14px; color:#555;">
          Your official receipt is attached to this email as a PDF document.<br/>
          Please keep it for your records.
        </p>
        <p style="margin-top:20px; font-size:13px; color:#888;">
          Warm regards,<br/>
          <strong>Health and Education Trust</strong><br/>
          <span style="font-size:12px;">New Delhi, India</span>
        </p>
      </div>

    </div>
  </div>
  `,
      attachments: [
        {
          filename: "receipt.pdf",
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    
    return NextResponse.json({
      success: true,
      message: "Receipt sent successfully to user and company",
    });
  } catch (error: any) {
    console.error("[SEND_RECEIPT_ERROR]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to send receipt" },
      { status: 500 }
    );
  }
}