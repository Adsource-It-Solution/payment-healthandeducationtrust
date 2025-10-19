"use client";
import { useState } from "react";
import {
  HeartHandshake,
  Mail,
  Phone,
  MapPin,
  Lock,
  PartyPopper,
  User,
  IndianRupee,
  IdCard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assests/logo-pdf.png";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import Image from "next/image";

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
    pancard: ""
  });

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
            setTimeout(() => setIsSuccess(false), 4000);
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
      {/* Decorative light blobs */}
      <div className="absolute w-96 h-96 bg-orange-200/40 rounded-full blur-3xl -top-20 -left-20 animate-pulse" />
      <div className="absolute w-96 h-96 bg-pink-200/40 rounded-full blur-3xl bottom-0 right-0 animate-pulse" />

      <div className="relative w-full z-10 grid grid-cols-2">
        {/* Header */}
        <div className="text-center mt-8">
          <Image src={logo} alt="Logo" />
          <div className="gird grid-cols-1 justify-center items-center gap-3 relative top-20">
            <div className="text-4xl font-bold text-orange-900">
              Donate Now</div>
            <p className="text-orange-700 mt-3 text-sm">
              “Your kindness lights the path for others 🌍”
            </p>
          </div>
          <p className="fixed bottom-10 left-48 mt-6 text-orange-700 text-sm">
            Thank you for supporting Health & Education Trust ❤️
          </p>
        </div>
        {/* Card */}
        <div>

          <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 md:p-10 relative overflow-hidden">
            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 flex flex-col items-center justify-center text-white rounded-3xl z-20"
                >
                  <PartyPopper className="w-16 h-16 mb-4 animate-bounce" />
                  <h2 className="text-3xl font-bold mb-2">Thank You 💖</h2>
                  <p className="text-white/90">Your donation makes a difference!</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "Full Name*", name: "name", icon: <User />, type: "text", placeholder: "Name" },
                  { label: "Email*", name: "email", icon: <Mail />, type: "email", placeholder: "yourname@example.com" },
                  { label: "Phone", name: "phone", icon: <Phone />, type: "tel", placeholder: "+91 XXXXX XXXXX" },
                  { label: "Donation Amount*", name: "amount", icon: <IndianRupee />, type: "number", placeholder: "500" },
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-orange-800 mb-2">
                    Pan Card*
                  </label>
                  <div className="relative">
                    <IdCard className="absolute left-4 top-4 text-orange-500" />
                    <input
                      type="text"
                      name="pancard"
                      value={formData.pancard}
                      onChange={handleInputChange}
                      required
                      placeholder="Pan Card"
                      className="w-full pl-12 pr-4 py-3 bg-white border border-orange-200 rounded-xl text-orange-900 placeholder-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-orange-800 mb-2">
                    Donation for*
                  </label>
                  <FormControl fullWidth>
                    <InputLabel id="demo-donation-select-label">Select</InputLabel>
                    <Select
                      labelId="demo-donation-select-label"
                      id="demo-donation-select"
                      value={formData.donationtype}
                      label="Donation for"
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, donationtype: e.target.value }))
                      }
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 48 * 3.5,
                            overflowY: "auto",
                          },
                        },
                      }}
                      sx={{
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#fbbf24",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#fb923c",
                        },
                        "& .MuiSelect-select": {
                          color: "#78350f",
                          backgroundColor: "rgba(255,255,255,0.8)",
                        },
                        "& .MuiSvgIcon-root": {
                          color: "#fb923c",
                        },
                        borderRadius: "12px",
                      }}
                    >
                      <MenuItem value="Baby Vinayak">Baby Vinayak</MenuItem>
                      <MenuItem value="Avleen kaur">Avleen kaur</MenuItem>
                      <MenuItem value="Mother Saroj Devi">Mother Saroj Devi</MenuItem>
                      <MenuItem value="Baby Samarjot singh">Baby Samarjot singh</MenuItem>
                      <MenuItem value="Ahmad Raza">Ahmad Raza</MenuItem>
                      <MenuItem value="Baby Raj">Baby Raj</MenuItem>
                      <MenuItem value="Baby Ankush">Baby Ankush</MenuItem>
                      <MenuItem value="Dry Ration Kit">Dry Ration Kit</MenuItem>
                      <MenuItem value="Old Age Home">Old Age Home</MenuItem>
                      <MenuItem value="Education and Health">Education &amp; Health</MenuItem>
                      <MenuItem value="Wheel Chair">Wheel Chair</MenuItem>
                      <MenuItem value="Blankets">Blankets</MenuItem>
                      <MenuItem value="Animal’s Feeding">Animal’s Feeding</MenuItem>
                    </Select>
                  </FormControl>
                </div>
              </div>

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
                    required
                    className="w-full pl-12 pr-4 py-3 bg-white border border-orange-200 rounded-xl text-orange-900 placeholder-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition resize-none"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-orange-700 bg-orange-50 p-3 rounded-lg">
                <Lock className="w-4 h-4 text-green-500" />
                <span>Your payment is 100% secure and encrypted</span>
              </div>
              <span className="text-orange-700 text-sm">All field with <span className="text-black">*</span> is mandatory. </span>

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