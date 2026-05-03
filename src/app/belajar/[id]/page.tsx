"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function DetailMateriPage() {
  const { id } = useParams();
  const [materi, setMateri] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch('/api/materials')
        .then(res => res.json())
        .then(data => {
          if (data.materials) {
            const found = data.materials.find((m: any) => m._id === id);
            setMateri(found);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center">
        <div className="text-amber-500 font-bold text-xl animate-pulse">Memuat Materi...</div>
      </div>
    );
  }

  if (!materi) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center text-white">
        <h1 className="text-4xl font-bold mb-4">Materi Tidak Ditemukan</h1>
        <Link href="/belajar" className="text-amber-500 hover:underline flex items-center gap-2">
          <ArrowLeft size={20} /> Kembali ke Ruang Belajar
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white font-sans selection:bg-amber-500 overflow-hidden relative">
      <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/old-mathematics.png')]" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full min-h-screen flex flex-col max-w-4xl mx-auto px-6 py-8">
        <header className="flex items-center gap-6 mb-12">
          <Link href="/belajar" className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all shadow-lg hover:shadow-amber-500/20">
            <ArrowLeft size={24} className="text-amber-400" />
          </Link>
          <div className="text-amber-500 font-bold uppercase tracking-widest text-sm bg-amber-500/10 px-4 py-2 rounded-lg border border-amber-500/30">
            {materi.category}
          </div>
        </header>

        <main className="bg-slate-900/80 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-slate-800 shadow-2xl">
          <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mb-8 leading-tight">
            {materi.title}
          </h1>

          {materi.imageUrl && (
            <div className="w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden mb-10 border-2 border-slate-700 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <img src={materi.imageUrl} alt={materi.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="prose prose-invert prose-amber max-w-none text-slate-300 text-lg leading-relaxed whitespace-pre-wrap">
            {materi.content}
          </div>
        </main>
      </div>
    </div>
  );
}
