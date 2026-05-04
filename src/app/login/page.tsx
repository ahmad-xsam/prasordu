"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import jungleBg from "../../../public/cave_bg.jpg";
import monkeyHero from "../../../public/monkey_hero.png";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Username atau password salah");
        setLoading(false);
        return;
      }

      router.replace("/dashboard");
    } catch (error) {
      setError("Terjadi kesalahan sistem");
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
          backgroundImage: `url('${jungleBg.src}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="max-w-5xl w-full bg-[#EBF3D3] dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[650px] border border-white/20 dark:border-slate-800 relative z-10">
        
        {/* Left Side - Monkey Hero */}
        <div className="w-full h-[250px] md:h-auto md:w-[45%] relative bg-[#f7eedf] dark:bg-slate-800 md:min-h-full block">
          <img
            src={monkeyHero.src}
            alt="Monkey Explorer"
            className="w-full h-full object-cover object-center absolute inset-0"
          />
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-[55%] p-8 md:p-12 flex flex-col justify-center bg-white/30 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-[#4a2e1b] dark:text-white mb-2" style={{ fontFamily: 'sans-serif' }}>
              Welcome Explorer!
            </h1>
            <p className="text-[#6d5b4b] dark:text-slate-400 text-sm md:text-base font-medium">
              Log in now to continue your exciting journey and<br/>unlock new adventures waiting for you!
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm text-center font-semibold">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-[#4a2e1b] font-bold text-sm mb-1.5">Username</label>
              <input 
                type="text" 
                required
                placeholder="Enter your username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border-none focus:ring-2 focus:ring-[#f2863b] bg-white text-gray-700 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-[#4a2e1b] font-bold text-sm mb-1.5">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  placeholder="Input your password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border-none focus:ring-2 focus:ring-[#f2863b] bg-white text-gray-700 shadow-sm pr-12"
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
              className="w-full py-4 mt-6 bg-[#f4853b] hover:bg-[#e0752d] text-white font-bold rounded-xl text-lg shadow-md transition-colors disabled:opacity-70"
            >
              {loading ? "Memproses..." : "Log In"}
            </button>
          </form>

          <div className="mt-8 text-center">
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
              Don't have an account? <Link href="/register" className="font-bold text-[#4a2e1b] hover:underline">Register</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
