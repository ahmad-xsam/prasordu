"use client";

import { BookOpen, Trophy, Medal, Star } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import LiveNavigation from '@/components/LiveNavigation';

// Icons for Ranks
const RankIcon = ({ rank }: { rank: number }) => {
  if (rank === 1) return <div className="p-2 bg-yellow-100 rounded-full dark:bg-yellow-900/50 text-yellow-500 shadow-[0_0_15px_rgba(253,224,71,0.8)] border border-yellow-300 dark:border-yellow-600"><Trophy size={20} /></div>;
  if (rank === 2) return <div className="p-2 bg-slate-100 rounded-full dark:bg-slate-700 text-slate-400 shadow-[0_0_15px_rgba(148,163,184,0.6)] border border-slate-300 dark:border-slate-500"><Medal size={20} /></div>;
  if (rank === 3) return <div className="p-2 bg-orange-100 rounded-full dark:bg-orange-900/50 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.6)] border border-orange-300 dark:border-orange-600"><Medal size={20} /></div>;
  return <div className="p-2 bg-purple-100 rounded-full dark:bg-purple-900/30 text-purple-500"><Star size={20} /></div>;
};

// Circular Progress Component
const CircularProgress = ({ percentage }: { percentage: number }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_8px_rgba(204,255,0,0.4)]" viewBox="0 0 100 100">
        <circle
          className="text-purple-200 dark:text-purple-900/50"
          strokeWidth="8"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
        />
        <circle
          className="text-[#ccff00] transition-all duration-1000 ease-out"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-xl font-black text-purple-900 dark:text-white drop-shadow-[0_0_8px_rgba(204,255,0,0.5)]">
          {percentage}%
        </span>
      </div>
    </div>
  );
};

export default function Home() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [stats, setStats] = useState({ percentage: 0, playersCount: 0, totalUsers: 0 });
  const [agenda, setAgenda] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lbRes, statsRes, agendaRes] = await Promise.all([
          fetch('/api/mission/leaderboard'),
          fetch('/api/mission/stats'),
          fetch('/api/activities')
        ]);
        const lbData = await lbRes.json();
        const stData = await statsRes.json();
        const agendaData = await agendaRes.json();
        
        if (lbData.success) setLeaderboard(lbData.data);
        if (stData.success) setStats(stData.data);
        
        if (agendaData.activities) {
          const now = new Date();
          now.setHours(0, 0, 0, 0); // Start of today
          const nextMonth = new Date(now);
          nextMonth.setMonth(nextMonth.getMonth() + 1); // 1 month ahead
          
          const monthAgenda = agendaData.activities.filter((act: any) => {
            const actDate = new Date(act.date);
            return actDate >= now && actDate <= nextMonth;
          });
          setAgenda(monthAgenda);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6 bg-purple-50 dark:bg-[#0a0014] min-h-screen transition-colors p-4 rounded-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-purple-900 dark:text-white uppercase tracking-tight drop-shadow-[0_0_10px_rgba(204,255,0,0.3)]">
            {isAdmin ? "Selamat Datang di Admin" : "Selamat Datang User"} 👋
          </h1>
          <p className="text-purple-700 dark:text-purple-300 mt-1 font-medium">
            {isAdmin ? "Panel kontrol sistem manajemen." : "Cek peringkat dan aktivitas belajarmu hari ini!"}
          </p>
        </div>
        {!isAdmin && (
          <button className="bg-[#ccff00] hover:bg-[#aacc00] text-purple-900 px-6 py-3 rounded-xl shadow-[0_0_15px_rgba(204,255,0,0.5)] transition-all font-bold uppercase tracking-wide">
            Main Sekarang
          </button>
        )}
      </div>

      {/* Hero Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Leaderboard */}
        <div className="md:col-span-2 bg-white/80 dark:bg-[#1a0b2e]/80 backdrop-blur-md p-6 rounded-2xl border border-purple-200 dark:border-purple-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_0_20px_rgba(138,43,226,0.1)]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-purple-900 dark:text-white uppercase flex items-center gap-2">
              <Trophy className="text-[#ccff00]" /> Leaderboard
            </h2>
          </div>
          
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1,2,3,4].map(i => <div key={i} className="h-16 bg-purple-100 dark:bg-purple-900/30 rounded-xl"></div>)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {leaderboard.length > 0 ? leaderboard.map((player, idx) => (
                <div key={idx} className="flex items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800/50 hover:border-[#ccff00] dark:hover:border-[#ccff00] transition-all duration-300 group hover:shadow-[0_0_15px_rgba(204,255,0,0.2)] hover:-translate-y-1 cursor-default">
                  <div className="font-black text-xl w-8 text-purple-400 dark:text-purple-600 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">#{idx + 1}</div>
                  <div className="flex-1 ml-2">
                    <h3 className="font-bold text-purple-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-[#ccff00] transition-colors">{player.fullName}</h3>
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-bold">{player.totalScore} Poin</p>
                  </div>
                  <RankIcon rank={idx + 1} />
                </div>
              )) : (
                <div className="col-span-2 text-center py-8 text-purple-500 font-medium">Belum ada pemain yang masuk ke papan peringkat.</div>
              )}
            </div>
          )}
        </div>

        {/* Circular Stats & Character */}
        <div className="flex flex-col gap-6">
          <div className="bg-white/80 dark:bg-[#1a0b2e]/80 backdrop-blur-md p-6 rounded-2xl border border-purple-200 dark:border-purple-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-between">
            <div>
              <h3 className="font-bold text-purple-900 dark:text-white mb-1">Misi Selesai</h3>
              <p className="text-sm text-purple-600 dark:text-purple-400 mb-2 font-medium">{stats.playersCount} dari {stats.totalUsers} Siswa</p>
            </div>
            <CircularProgress percentage={stats.percentage} />
          </div>

          <LiveNavigation />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/80 dark:bg-[#1a0b2e]/80 rounded-2xl border border-purple-200 dark:border-purple-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-6">
          <h2 className="text-xl font-bold text-purple-900 dark:text-white mb-4">Materi Terbaru</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center p-4 border border-purple-100 dark:border-purple-800/50 rounded-xl hover:border-[#ccff00] dark:hover:border-[#ccff00] transition-colors cursor-pointer group bg-purple-50 dark:bg-purple-900/10">
                <div className="h-12 w-12 bg-white dark:bg-[#0a0014] rounded-lg flex items-center justify-center mr-4 shadow-sm group-hover:shadow-[0_0_10px_rgba(204,255,0,0.3)] transition-shadow">
                  <BookOpen className="h-6 w-6 text-purple-500 dark:text-purple-400 group-hover:text-[#ccff00]" />
                </div>
                <div className="flex-1">
                  <h4 className="text-md font-semibold text-purple-900 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-[#ccff00] transition-colors">Pemrograman Web Lanjut</h4>
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Pertemuan ke-{item + 4}: React Hooks</p>
                </div>
                <button className="text-purple-600 dark:text-[#ccff00] text-sm font-bold hover:underline">
                  Lihat
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/80 dark:bg-[#1a0b2e]/80 rounded-2xl border border-purple-200 dark:border-purple-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-6">
          <h2 className="text-xl font-bold text-purple-900 dark:text-white mb-4">Agenda Bulan Ini</h2>
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-purple-300 dark:before:via-purple-800 before:to-transparent">
            {agenda.length > 0 ? agenda.map((item, i) => (
              <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-4 h-4 rounded-full border border-white dark:border-[#0a0014] bg-purple-300 dark:bg-purple-800 group-[.is-active]:bg-purple-500 dark:group-[.is-active]:bg-[#ccff00] group-[.is-active]:shadow-[0_0_10px_rgba(204,255,0,0.8)] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-all" />
                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl border border-purple-200 dark:border-purple-800/50 shadow-sm ml-4 md:ml-0 bg-white dark:bg-purple-900/20 group-hover:border-purple-400 dark:group-hover:border-[#ccff00]/50 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-purple-900 dark:text-slate-100">{item.title}</span>
                    <div className="flex gap-2 items-center">
                      <span className="text-[10px] font-bold text-purple-600 dark:text-purple-300">{new Date(item.date).toLocaleDateString()}</span>
                      <span className="text-[10px] font-bold text-purple-700 dark:text-[#ccff00] bg-purple-100 dark:bg-[#0a0014] px-2 py-0.5 rounded-md">{item.type}</span>
                    </div>
                  </div>
                  <div className="text-purple-600 dark:text-purple-400 text-xs font-medium line-clamp-2">{item.description || "Tidak ada deskripsi"}</div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-purple-600 dark:text-purple-400 text-sm font-medium relative z-10">
                Tidak ada agenda untuk bulan ini.<br/>Selamat beristirahat!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
