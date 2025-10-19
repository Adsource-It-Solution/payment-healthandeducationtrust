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

    // 5️⃣ Define recipients — user + company
    const recipients = [
      transaction.email,              // customer
      process.env.COMPANY_EMAIL!,     // company (added in your .env)
    ];

    // 6️⃣ Send email with PDF
    await transporter.sendMail({
      from: `"Edunova Payments" <${process.env.EMAIL_USER!}>`,
      to: recipients,
      subject: `Payment Receipt - ₹${transaction.amount}`,
      text: `Dear ${transaction.name},

Thank you for your payment of ₹${transaction.amount}.
Attached is your official payment receipt.

Transaction ID: ${transaction._id}
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
