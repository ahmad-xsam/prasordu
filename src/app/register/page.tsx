"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);

  // Note: For now this form is just the UI matching the design.
  // In a real app, this would post to /api/auth/register (which we'd need to create for public registration).

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
        <div className="w-full md:w-[45%] relative bg-[#f7eedf] min-h-[300px] md:min-h-full hidden md:block">
          <Image
            src="/monkey_hero.png"
            alt="Monkey Explorer"
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-[55%] p-8 md:p-12 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-[#4a2e1b] mb-2" style={{ fontFamily: 'sans-serif' }}>
              Welcome Explorer!
            </h1>
            <p className="text-[#6d5b4b] text-sm md:text-base font-medium">
              Log in now to continue your exciting journey and<br/>unlock new adventures waiting for you!
            </p>
          </div>

          <form className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full">
                <label className="block text-[#4a2e1b] font-bold text-sm mb-1.5">First Name</label>
                <input 
                  type="text" 
                  placeholder="Enter your first name" 
                  className="w-full px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-[#f2863b] bg-white text-gray-700 shadow-sm"
                />
              </div>
              <div className="w-full">
                <label className="block text-[#4a2e1b] font-bold text-sm mb-1.5">Last Name</label>
                <input 
                  type="text" 
                  placeholder="Input Username" 
                  className="w-full px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-[#f2863b] bg-white text-gray-700 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#4a2e1b] font-bold text-sm mb-1.5">Email</label>
              <input 
                type="email" 
                placeholder="Input your email" 
                className="w-full px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-[#f2863b] bg-white text-gray-700 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-[#4a2e1b] font-bold text-sm mb-1.5">Phone Number</label>
              <input 
                type="tel" 
                placeholder="Enter your phone number" 
                className="w-full px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-[#f2863b] bg-white text-gray-700 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-[#4a2e1b] font-bold text-sm mb-1.5">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
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
              type="button" 
              className="w-full py-4 mt-4 bg-[#f4853b] hover:bg-[#e0752d] text-white font-bold rounded-xl text-lg shadow-md transition-colors"
            >
              Create Account
            </button>
          </form>

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
              Do have an account? <Link href="/login" className="font-bold text-[#4a2e1b] hover:underline">Sign</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
