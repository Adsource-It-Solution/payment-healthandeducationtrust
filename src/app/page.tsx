"use client";

import { useState } from "react";
import {
  CreditCard,
  User,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Lock,
  PartyPopper,
} from "lucide-react";
import Image from "next/image";
import logo from "@/assests/logo-pdf.png";
import { motion, AnimatePresence } from "framer-motion";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    amount: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Handle input updates
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);
    console.log("%c[STEP 1] Payment started...", "color: orange; font-weight: bold;");

    try {
      if (!formData.amount || Number(formData.amount) <= 0) {
        alert("Please enter a valid amount.");
        console.warn("[WARN] Invalid amount entered:", formData.amount);
        setIsProcessing(false);
        return;
      }

      // 1️⃣ Create Razorpay order
      console.log("%c[STEP 2] Creating Razorpay order...", "color: cyan; font-weight: bold;");
      const orderRes = await fetch("/api/payment/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(formData.amount) }),
      });

      const { order, key } = await orderRes.json();
      console.log("[INFO] Razorpay order response:", { order, key });

      if (!order || !key) throw new Error("Failed to initialize payment");

      // 2️⃣ Configure Razorpay
      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: "HEALTH AND EDUCATION TRUST",
        description: "Donation Payment",
        image: logo.src,
        order_id: order.id,

        handler: async function (response: any) {
          console.log("%c[STEP 3] Payment success callback triggered ✅", "color: green; font-weight: bold;");
          console.log("[INFO] Razorpay success response:", response);

          // ✅ Verify payment on backend (saves transaction in MongoDB)
          console.log("%c[STEP 4] Verifying payment on backend...", "color: blue; font-weight: bold;");
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              formData,
            }),
          });

          const verifyData = await verifyRes.json();
          console.log("[INFO] Verify API Response:", verifyData);

          if (verifyData.success) {
            console.log("%c[STEP 5] Payment verified ✅", "color: green; font-weight: bold;");
            console.log("%c[STEP 6] Sending receipt email...", "color: purple; font-weight: bold;");

            // ✅ Then send receipt email (after MongoDB save)
            const emailRes = await fetch("/api/payment/receipt", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                transactionId: verifyData.transaction._id,
              }),
            });


            const emailData = await emailRes.json();
            console.log("[INFO] Email send response:", emailData);
          } else {
            console.error("[ERROR] Payment verification failed:", verifyData.message);
          }

          setIsProcessing(false);
          setIsSuccess(true);
          console.log("%c[STEP 7] Payment flow completed ✅", "color: green; font-weight: bold;");

          // Reset form after delay
          setTimeout(() => {
            setIsSuccess(false);
            setFormData({
              name: "",
              email: "",
              phone: "",
              address: "",
              amount: "",
            });
          }, 4000);
        },

        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: "#9B5DE5" },
      };

      const razorpay = new window.Razorpay(options);
      console.log("%c[STEP 8] Opening Razorpay checkout...", "color: cyan; font-weight: bold;");
      razorpay.open();

      razorpay.on("payment.failed", function (response: any) {
        console.error("[ERROR] Payment failed:", response.error);
        alert("Payment failed: " + response.error.description);
        setIsProcessing(false);
      });
    } catch (err) {
      console.error("%c[ERROR] Payment initialization failed:", "color: red; font-weight: bold;", err);
      alert("Payment initialization failed. Please try again.");
      setIsProcessing(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E04FB3] via-[#9B5DE5] to-[#6C2EB9] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Lights */}
      <div className="absolute w-96 h-96 -top-48 -left-48 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute w-96 h-96 -bottom-48 -right-48 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      <div className="relative w-full max-w-2xl z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center gap-4 items-center">
            <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg shadow-blue-500/50">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Secure Payment
            </h1>
          </div>
          <p className="text-slate-300 mt-2">Powered by Razorpay</p>
        </div>

        {/* Payment Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden relative">
          {/* ✅ Success Popup */}
          <AnimatePresence>
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center z-20 rounded-3xl"
              >
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center px-6"
                >
                  <PartyPopper className="w-20 h-20 text-white mx-auto mb-4 animate-bounce" />
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Thank You!
                  </h2>
                  <p className="text-white/90 mb-4">
                    Payment received successfully 🎉
                  </p>
                  <p className="text-white/80 text-sm">
                    Your contribution helps us continue our mission.
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Payment Form */}
          <div className="p-8 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Input Fields */}
              {[
                {
                  label: "Full Name",
                  name: "name",
                  type: "text",
                  icon: <User />,
                  placeholder: "John Doe",
                },
                {
                  label: "Email Address",
                  name: "email",
                  type: "email",
                  icon: <Mail />,
                  placeholder: "john@example.com",
                },
                {
                  label: "Phone Number",
                  name: "phone",
                  type: "tel",
                  icon: <Phone />,
                  placeholder: "+91 98765 43210",
                },
              ].map((field, idx) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    {field.label}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700">
                      {field.icon}
                    </span>
                    <input
                      type={field.type}
                      name={field.name}
                      value={(formData as any)[field.name]}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/10"
                      placeholder={field.placeholder}
                    />
                  </div>
                </div>
              ))}

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-700" />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/10 resize-none"
                    placeholder="Enter your complete address"
                  />
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700" />
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    min="1"
                    step="0.01"
                    className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/10"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Security Info */}
              <div className="flex items-center gap-2 text-sm text-slate-300 bg-white/5 rounded-lg p-3">
                <Lock className="w-4 h-4 text-green-400" />
                <span>Your payment is secured with 256-bit SSL encryption</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-[#E04FB3] to-[#6C2EB9] text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-[#E04FB3]/40 transform hover:scale-[1.02] transition-all duration-300"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 
                        0 0 5.373 0 12h4zm2 5.291A7.962 
                        7.962 0 014 12H0c0 3.042 1.135 
                        5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing Payment...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Lock className="w-5 h-5" />
                    Pay with Razorpay
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-slate-400 text-sm">
          <p>Secured by Razorpay | All transactions are encrypted</p>
        </div>
      </div>
    </div>
  );
}
