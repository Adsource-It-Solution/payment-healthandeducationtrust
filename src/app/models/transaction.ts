import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  name: string;
  email: string;
  phone: string;
  address: string;
  amount: number;
  paymentId: string;
  orderId: string;
  signature: string;
  status: "created" | "success" | "failed";
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>({
  name: String,
  email: String,
  phone: String,
  address: String,
  amount: Number,
  paymentId: String,
  orderId: String,
  signature: String,
  status: { 
    type: String, 
    enum: ["created", "success", "failed"], 
    default: "created" 
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);
