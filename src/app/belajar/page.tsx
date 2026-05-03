"use client";

import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Search, Compass, BookMarked, Globe, Tent } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const materiData = [
  { id: 1, title: "Lambang Gerakan Pramuka", icon: Compass, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  { id: 2, title: "Sejarah Pramuka Indonesia", icon: BookMarked, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30" },
  { id: 3, title: "Sejarah Pramuka Dunia", icon: Globe, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  { id: 4, title: "Pengetahuan Kepramukaan Dasar", icon: Tent, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
];

export default function BelajarPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen bg-[#070b14] text-white font-sans selection:bg-amber-500 overflow-hidden relative">
      <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/old-mathematics.png')]" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full h-full min-h-screen flex flex-col max-w-6xl mx-auto px-6 py-8">
        
        {/* Header */}
        <header className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-6">
            <Link href="/" className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all shadow-lg hover:shadow-amber-500/20">
              <ArrowLeft size={24} className="text-amber-400" />
            </Link>
            <div>
              <h1 className="text-3xl md:text-5xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 uppercase flex items-center gap-3">
                <BookOpen size={40} className="text-amber-500 hidden md:block" /> Ruang Belajar
              </h1>
              <p className="text-amber-500/70 font-medium tracking-widest text-sm mt-2">PERPUSTAKAAN PRAMUKA INTERAKTIF</p>
            </div>
          </div>
        </header>

        {/* Search */}
        <div className="relative max-w-2xl mx-auto w-full mb-16">
          <input 
            type="text" 
            placeholder="Cari materi pramuka..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/50 border-2 border-slate-700 focus:border-amber-500 rounded-2xl px-6 py-5 pl-14 text-lg outline-none transition-all shadow-[0_0_30px_rgba(0,0,0,0.5)] focus:shadow-[0_0_30px_rgba(245,158,11,0.2)]"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {materiData.filter(m => m.title.toLowerCase().includes(search.toLowerCase())).map((materi, i) => (
            <motion.div
              key={materi.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={`/belajar/${materi.id}`} className={`block h-full bg-slate-900/80 backdrop-blur-sm border-2 ${materi.border} rounded-3xl p-6 hover:-translate-y-2 transition-all hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] group`}>
                <div className={`w-16 h-16 ${materi.bg} rounded-2xl flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform`}>
                  <materi.icon className={materi.color} size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-200 group-hover:text-amber-400 transition-colors leading-snug">{materi.title}</h3>
                <p className="text-slate-500 text-sm">Baca selengkapnya &rarr;</p>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
