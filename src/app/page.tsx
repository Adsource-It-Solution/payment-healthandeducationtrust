"use client";
import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Lock,
  PartyPopper,
  User,
  IndianRupee,
  IdCard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assests/logo-pdf.png";
import Image from "next/image";
import { useRouter } from "next/navigation";


declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function DonationPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    amount: "",
    donationtype: "",
    pancard: "",
  });

  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);

    if (!formData.name || !formData.email || !formData.phone || !formData.amount) {
      alert("Please fill in all required fields");
      setIsProcessing(false);
      return;
    }
    try {
      const orderRes = await fetch("/api/payment/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(formData.amount) }),
      });
      const { order, key } = await orderRes.json();

      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: "HEALTH AND EDUCATION TRUST",
        description: "Donation for social welfare",
        image: logo.src,
        order_id: order.id,
        handler: async function (response: any) {
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              formData,
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            await fetch("/api/payment/receipt", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                transactionId: verifyData.transaction._id,
              }),
            });

            setIsSuccess(true);
            setFormData({
              name: "",
              email: "",
              phone: "",
              address: "",
              amount: "",
              donationtype: "",
              pancard: "",
            });
            setTimeout(() => {
              router.push("https://healthandeducationtrust.org");
            }, 3000);
          }
          setIsProcessing(false);
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: "#ff914d" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF4E0] via-[#FFE3D3] to-[#FFD8BE] p-4 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute w-72 md:w-96 h-72 md:h-96 bg-orange-200/40 rounded-full blur-3xl -top-20 -left-20 animate-pulse" />
      <div className="absolute w-72 md:w-96 h-72 md:h-96 bg-pink-200/40 rounded-full blur-3xl bottom-0 right-0 animate-pulse" />

      <div className="relative w-full z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
        {/* Left Section */}
        <div className="text-center flex flex-col items-center justify-center px-6">
          <Image
            src={logo}
            alt="Logo"
            className="mx-auto w-28 md:w-40 h-auto"
          />
          <div className="grid grid-cols-1 justify-center items-center gap-3 mt-6">
            <div className="text-3xl md:text-4xl font-bold text-orange-900">
              Donate Now
            </div>
            <p className="text-orange-700 mt-3 text-sm md:text-base">
              “Your kindness lights the path for others 🌍”
            </p>
          </div>
          <p className="mt-8 md:mt-16 text-orange-700 text-sm md:text-base">
            Thank you for supporting Health & Education Trust ❤️
          </p>
        </div>

        {/* Right Section (Form Card) */}
        <div>
          <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 md:p-10 relative overflow-hidden">
            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 flex flex-col items-center justify-center text-white rounded-3xl z-20"
                >
                  <PartyPopper className="w-12 h-12 md:w-16 md:h-16 mb-4 animate-bounce" />
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    Thank You 💖
                  </h2>
                  <p className="text-white/90 text-sm md:text-base">
                    Your donation makes a difference!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    label: "Full Name*",
                    name: "name",
                    icon: <User />,
                    type: "text",
                    placeholder: "Name",
                  },
                  {
                    label: "Email*",
                    name: "email",
                    icon: <Mail />,
                    type: "email",
                    placeholder: "yourname@example.com",
                  },
                  {
                    label: "Phone*",
                    name: "phone",
                    icon: <Phone />,
                    type: "tel",
                    placeholder: "+91 XXXXX XXXXX",
                  },
                  {
                    label: "Donation Amount*",
                    name: "amount",
                    icon: <IndianRupee />,
                    type: "number",
                    placeholder: "500",
                  },
                ].map((field) => (
                  <div key={field.name} className="flex flex-col">
                    <label className="block text-sm font-semibold text-orange-800 mb-2">
                      {field.label}
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500">
                        {field.icon}
                      </span>
                      <input
                        type={field.type}
                        name={field.name}
                        value={(formData as any)[field.name]}
                        onChange={handleInputChange}
                        required
                        placeholder={field.placeholder}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-orange-200 rounded-xl text-orange-900 placeholder-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* PAN + Donation Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-orange-800 mb-2">
                    Pan Card
                  </label>
                  <div className="relative">
                    <IdCard className="absolute left-4 top-4 text-orange-500" />
                    <input
                      type="text"
                      name="pancard"
                      value={formData.pancard}
                      onChange={handleInputChange}
                      placeholder="Pan Card"
                      className="w-full pl-12 pr-4 py-3 bg-white border border-orange-200 rounded-xl text-orange-900 placeholder-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-orange-800 mb-2">
                    Donation for
                  </label>
                  <input
                      type="text"
                      name="pancard"
                      value={formData.donationtype}
                      onChange={handleInputChange}
                      placeholder="Donation For"
                      className="w-full pl-12 pr-4 py-3 bg-white border border-orange-200 rounded-xl text-orange-900 placeholder-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                    />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-orange-800 mb-2">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 text-orange-500" />
                  <textarea
                    name="address"
                    rows={3}
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your complete address"
                    className="w-full pl-12 pr-4 py-3 bg-white border border-orange-200 rounded-xl text-orange-900 placeholder-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-orange-700 bg-orange-50 p-3 rounded-lg">
                <Lock className="w-4 h-4 text-green-500" />
                <span>Your payment is 100% secure and encrypted</span>
              </div>

              <p className="text-orange-700 text-sm">
                All fields with <span className="text-black">*</span> are mandatory.
              </p>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-orange-400 to-pink-500 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-orange-300/40 transform hover:scale-[1.02] transition"
              >
                {isProcessing ? "Processing Donation..." : "Donate Now"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
