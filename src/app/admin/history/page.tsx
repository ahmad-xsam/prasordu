"use client";

import { useEffect, useState } from "react";
import { History, Trophy, User, Shield, Swords, Calendar, Trash2 } from "lucide-react";

export default function MissionHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = () => {
    fetch('/api/admin/history')
      .then(res => res.json())
      .then(data => {
        setHistory(data.history || []);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus riwayat misi ini?")) return;
    try {
      const res = await fetch(`/api/admin/history?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHistory(prev => prev.filter(h => h._id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-slate-950 min-h-screen text-gray-900 dark:text-white transition-colors">
      <div className="flex flex-col items-center mb-12">
        <img src="/logo_prasordu.png" alt="Logo" className="h-32 w-auto mb-6 drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]" />
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400">
            <History size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">RIWAYAT MISI</h1>
            <p className="text-slate-400">Daftar agen yang berhasil menyelesaikan tantangan</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 p-6 rounded-3xl shadow-sm">
          <p className="text-gray-500 dark:text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">TOTAL PENYELESAIAN</p>
          <p className="text-4xl font-black text-gray-900 dark:text-white">{history.length}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-3xl shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-white/5 text-xs font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest border-b border-gray-100 dark:border-white/5">
            <tr>
              <th className="px-6 py-4">Waktu</th>
              <th className="px-6 py-4">Nama Agen</th>
              <th className="px-6 py-4">Regu</th>
              <th className="px-6 py-4">Level</th>
              <th className="px-6 py-4">Score</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {history.map((h, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-400">
                  {new Date(h.completedAt).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
                      <User size={18} className="text-emerald-400" />
                    </div>
                    <span className="font-bold">{h.fullName}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${h.squadType === 'Putra' ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' : 'bg-pink-500/10 border-pink-500/50 text-pink-400'}`}>
                    {h.squadName}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-black text-emerald-400">LEVEL {h.levelNumber}</span>
                </td>
                <td className="px-6 py-4 font-black">
                  {h.score}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleDelete(h._id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {history.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-slate-500 font-bold">
                  Belum ada data penyelesaian misi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
