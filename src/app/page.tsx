"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Volume2, VolumeX, Shield, Swords, Map as MapIcon, Users, BookOpen } from "lucide-react";

import jungleBg from "../../public/cave_bg.jpg";
import scoutBoy from "../../public/scout_boy.jpg";
import scoutGirl from "../../public/scout_girl.jpg";

// Dynamically import heavy components to avoid SSR issues
const ThreeCanvas = dynamic(() => import("@/components/ThreeCanvas"), { ssr: false });
const MiniMap = dynamic(() => import("@/components/MiniMap"), { ssr: false, loading: () => <div className="w-full h-full bg-slate-900 animate-pulse rounded-2xl" /> });

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  // Play ambient sound on mount (requires user interaction in some browsers, hence muted by default)
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      // Auto play requires muted to be true initially on most modern browsers
      audioRef.current.play().catch(e => console.log("Audio autoplay prevented", e));
    }
  }, []);

  const toggleSound = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      if (isMuted) audioRef.current.play();
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="bg-[#050B14] min-h-screen text-slate-200 overflow-x-hidden selection:bg-emerald-500/30">
      <audio ref={audioRef} src="https://actions.google.com/sounds/v1/ambiences/fire.ogg" loop muted={isMuted} />
      
      {/* Fixed Sound Toggle */}
      <button 
        onClick={toggleSound}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-emerald-900/50 backdrop-blur-md border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-800/60 transition-all hover:scale-110 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
      >
        {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
      </button>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        <motion.div style={{ y: yBg }} className="absolute inset-0 z-0 opacity-40">
          <img src={jungleBg.src} alt="Jungle" className="w-full h-full object-cover" />
        </motion.div>
        
        {/* 3D Canvas Background Element */}
        <ThreeCanvas />

        <div className="absolute inset-0 bg-gradient-to-b from-[#050B14]/40 via-transparent to-[#050B14] z-10" />

        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto flex flex-col items-center">


          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-6 inline-block"
          >
            <span className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 font-bold tracking-widest uppercase text-sm shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              Multiplayer Web Game
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, type: "spring" }}
            className="text-6xl md:text-8xl font-black mb-6 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-200 to-teal-500 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]"
          >
            PRASORDU ADVENTURE
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-xl md:text-2xl text-emerald-100/80 mb-10 max-w-2xl font-medium"
          >
            Pilih senjatamu, gabung dengan regu, dan taklukkan misteri hutan kuno bersama kawan-kawanmu.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex gap-6 flex-col sm:flex-row flex-wrap justify-center"
          >
            <Link href="/play" className="group relative px-8 py-4 bg-emerald-600 rounded-xl font-bold text-white text-lg overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.6)] hover:shadow-[0_0_30px_rgba(16,185,129,0.8)] transition-all">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
              Join Adventure
            </Link>
            <Link href="/belajar" className="group relative px-8 py-4 bg-amber-600 rounded-xl font-bold text-white text-lg overflow-hidden shadow-[0_0_20px_rgba(245,158,11,0.6)] hover:shadow-[0_0_30px_rgba(245,158,11,0.8)] transition-all flex items-center gap-2">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
              <BookOpen size={24} /> Ruang Belajar
            </Link>
            <Link href="/login" className="px-8 py-4 rounded-xl font-bold text-emerald-400 text-lg border-2 border-emerald-500/50 hover:bg-emerald-500/10 transition-all hover:border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              Login to Play
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-2 z-20 text-emerald-500 opacity-70"
        >
          <div className="w-6 h-10 border-2 border-emerald-500 rounded-full flex justify-center p-1">
            <div className="w-1.5 h-3 bg-emerald-500 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Story Section */}
      <section className="py-32 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-600 mb-6 drop-shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              KISAH PRAMUKA vs MISTERI HUTAN
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Sebuah legenda kuno menyebutkan tentang pusaka Kujang dan Panah magis yang hilang di Hutan Larangan. Sebagai anggota Pramuka terpilih, tugasmu adalah menelusuri jejak, menyelesaikan sandi, dan melindungi hutan dari entitas gelap.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Characters Section */}
      <section className="py-20 px-4 relative bg-[#0a1424]">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black text-center mb-20 text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">
            ANGGOTA REGU
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Character 1 */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="group relative bg-[#0f1c2e] rounded-3xl p-8 border border-slate-700 hover:border-emerald-500/50 transition-all shadow-xl hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-0 group-hover:opacity-20 transition duration-500" />
              <div className="relative aspect-square w-full mb-8 rounded-2xl overflow-hidden bg-gradient-to-b from-slate-800 to-[#0f1c2e]">
                <img src={scoutBoy.src} alt="Boy Scout with Bow" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f1c2e] via-transparent to-transparent" />
              </div>
              <h3 className="text-3xl font-black text-white mb-2 group-hover:text-emerald-400 transition-colors">Archer Scout</h3>
              <p className="text-slate-400 mb-6">Penembak jitu regu. Bersenjatakan Panah Magis yang dapat menembus kegelapan dan mengaktifkan saklar jarak jauh.</p>
              <div className="flex gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-900/50 text-emerald-400 text-sm font-bold border border-emerald-500/30">Ranged Attack</span>
                <span className="px-3 py-1 rounded-full bg-blue-900/50 text-blue-400 text-sm font-bold border border-blue-500/30">Agility</span>
              </div>
            </motion.div>

            {/* Character 2 */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="group relative bg-[#0f1c2e] rounded-3xl p-8 border border-slate-700 hover:border-amber-500/50 transition-all shadow-xl hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl blur opacity-0 group-hover:opacity-20 transition duration-500" />
              <div className="relative aspect-square w-full mb-8 rounded-2xl overflow-hidden bg-gradient-to-b from-slate-800 to-[#0f1c2e]">
                <img src={scoutGirl.src} alt="Girl Scout with Kujang" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f1c2e] via-transparent to-transparent" />
              </div>
              <h3 className="text-3xl font-black text-white mb-2 group-hover:text-amber-400 transition-colors">Kujang Master</h3>
              <p className="text-slate-400 mb-6">Petarung jarak dekat. Membawa Kujang Suci yang bersinar terang, mampu membelah ilusi misteri hutan dan melindungi rekan setim.</p>
              <div className="flex gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-900/50 text-amber-400 text-sm font-bold border border-amber-500/30">Melee Combat</span>
                <span className="px-3 py-1 rounded-full bg-red-900/50 text-red-400 text-sm font-bold border border-red-500/30">Defense</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gameplay & Minimap Section */}
      <section className="py-32 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <h2 className="text-4xl md:text-5xl font-black text-white mb-8">
                FITUR <span className="text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">GAMEPLAY</span>
              </h2>
              
              <div className="space-y-8">
                <div className="flex items-start gap-4 group">
                  <div className="p-3 rounded-xl bg-emerald-900/50 text-emerald-400 border border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <Users size={28} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">Live Multiplayer</h4>
                    <p className="text-slate-400">Main langsung di browsermu bersama teman. Saling bantu menyelesaikan misi dan mengalahkan monster.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 group">
                  <div className="p-3 rounded-xl bg-blue-900/50 text-blue-400 border border-blue-500/30 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <MapIcon size={28} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">Mini Map Interaktif</h4>
                    <p className="text-slate-400">Lacak lokasi regumu secara real-time. Temukan pos tersembunyi dan petunjuk harta karun di hutan larangan.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="p-3 rounded-xl bg-amber-900/50 text-amber-400 border border-amber-500/30 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                    <Swords size={28} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">Animasi Combat Pro</h4>
                    <p className="text-slate-400">Rasakan efek memukau saat mengayunkan Kujang atau melepaskan Panah magis dengan efek partikel GSAP & Three.js.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Minimap Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2 relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[2.5rem] blur-xl opacity-20" />
              <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden border-2 border-slate-700 bg-slate-900 shadow-2xl p-2 flex flex-col">
                <div className="flex justify-between items-center px-4 py-3 bg-slate-800 rounded-t-2xl border-b border-slate-700">
                  <h3 className="font-bold text-emerald-400 flex items-center gap-2">
                    <MapIcon size={18} /> Peta Petualangan
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-slate-400 font-bold uppercase">Live Tracker</span>
                  </div>
                </div>
                <div className="flex-1 bg-black rounded-b-2xl overflow-hidden relative">
                  <MiniMap />
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-900/20" />
        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-black mb-8">SIAP MEMULAI PETUALANGAN?</h2>
          <Link href="/play" className="inline-block px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl font-black text-white text-xl shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:shadow-[0_0_50px_rgba(16,185,129,0.8)] hover:scale-105 transition-all">
            MAIN SEKARANG
          </Link>
        </div>
      </section>
    </div>
  );
}
