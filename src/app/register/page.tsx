"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, phone, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Registration failed");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 relative overflow-hidden"
    >
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/jungle_bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="max-w-5xl w-full bg-[#EBF3D3] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[650px] border border-white/20 relative z-10">
        
        {/* Left Side - Monkey Hero */}
        <div className="w-full h-[250px] md:h-auto md:w-[45%] relative bg-[#f7eedf] md:min-h-full block">
          <img
            src="/monkey_hero.png"
            alt="Monkey Explorer"
            className="w-full h-full object-cover object-center absolute inset-0"
          />
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-[55%] p-8 md:p-12 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-[#4a2e1b] mb-2" style={{ fontFamily: 'sans-serif' }}>
              Welcome Explorer!
            </h1>
            <p className="text-[#6d5b4b] text-sm md:text-base font-medium">
              Join now to start your exciting journey and<br/>unlock new adventures waiting for you!
            </p>
          </div>

          {success ? (
            <div className="text-center space-y-4">
              <div className="bg-green-100 text-green-700 p-4 rounded-xl font-bold">
                Account created successfully!
              </div>
              <Link href="/login" className="inline-block py-3 px-6 bg-[#f4853b] hover:bg-[#e0752d] text-white font-bold rounded-xl shadow-md transition-colors">
                Go to Login
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm text-center font-semibold">
                  {error}
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full">
                  <label className="block text-[#4a2e1b] font-bold text-sm mb-1.5">First Name</label>
                  <input 
                    type="text" 
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter your first name" 
                    className="w-full px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-[#f2863b] bg-white text-gray-700 shadow-sm"
                  />
                </div>
                <div className="w-full">
                  <label className="block text-[#4a2e1b] font-bold text-sm mb-1.5">Last Name</label>
                  <input 
                    type="text" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Input Last Name" 
                    className="w-full px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-[#f2863b] bg-white text-gray-700 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#4a2e1b] font-bold text-sm mb-1.5">Email</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Input your email" 
                  className="w-full px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-[#f2863b] bg-white text-gray-700 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-[#4a2e1b] font-bold text-sm mb-1.5">Phone Number</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number" 
                  className="w-full px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-[#f2863b] bg-white text-gray-700 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-[#4a2e1b] font-bold text-sm mb-1.5">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Input your password" 
                    className="w-full px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-[#f2863b] bg-white text-gray-700 shadow-sm pr-12"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 mt-4 bg-[#f4853b] hover:bg-[#e0752d] text-white font-bold rounded-xl text-lg shadow-md transition-colors disabled:opacity-70"
              >
                {loading ? "Creating..." : "Create Account"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-xs text-[#6d5b4b] mb-6">
              By continuing with Google, Apple, or Email, you agree to monkey<br/>
              <Link href="#" className="font-bold underline hover:text-[#4a2e1b]">Terms of Service</Link> and <Link href="#" className="font-bold underline hover:text-[#4a2e1b]">Privacy Policy.</Link>
            </p>

            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px bg-[#c9d4b6] flex-1"></div>
              <span className="text-xs text-[#8a8174] uppercase tracking-wider font-semibold">or continue with</span>
              <div className="h-px bg-[#c9d4b6] flex-1"></div>
            </div>

            <div className="flex gap-4 mb-6">
              <button className="flex-1 flex items-center justify-center gap-2 bg-white px-4 py-3 rounded-xl shadow-sm hover:shadow-md transition-shadow font-semibold text-gray-700">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                Google
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 bg-white px-4 py-3 rounded-xl shadow-sm hover:shadow-md transition-shadow font-semibold text-gray-700">
                <img src="https://www.svgrepo.com/show/511330/apple-173.svg" alt="Apple" className="w-5 h-5" />
                Apple
              </button>
            </div>

            <p className="text-[#6d5b4b] text-sm font-medium">
              Do have an account? <Link href="/login" className="font-bold text-[#4a2e1b] hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
