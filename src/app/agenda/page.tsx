"use client";

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock, MapPin, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";

export default function AgendaPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'ADMIN';
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activities, setActivities] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newActivity, setNewActivity] = useState({ title: '', date: '', type: 'SCOUT', description: '' });

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    const res = await fetch('/api/activities');
    const data = await res.json();
    setActivities(data.activities || []);
  };

  const handleAddActivity = async () => {
    const res = await fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newActivity)
    });
    if (res.ok) {
      fetchActivities();
      setShowAddModal(false);
      setNewActivity({ title: '', date: '', type: 'SCOUT', description: '' });
    }
  };

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const days = [];
  const totalDays = daysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const startDay = firstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

  for (let i = 0; i < startDay; i++) days.push(null);
  for (let i = 1; i <= totalDays; i++) days.push(i);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <img src="/logo_prasordu.png" alt="Logo" className="h-10 w-auto drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
            AGENDA KEGIATAN
          </h1>
          <p className="text-gray-500 dark:text-slate-400 font-medium">Kalender Pendidikan & Jadwal Kegiatan Terpadu</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-primary-600/20"
          >
            <Plus size={20} /> TAMBAH KEGIATAN
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="p-6 bg-primary-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
            <h2 className="text-xl font-black text-primary-900 dark:text-primary-400 uppercase tracking-widest">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-full transition-all"><ChevronLeft /></button>
              <button onClick={nextMonth} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-full transition-all"><ChevronRight /></button>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-7 mb-4">
              {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map(d => (
                <div key={d} className="text-center text-xs font-black text-slate-400 uppercase tracking-tighter">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2 sm:gap-4">
              {days.map((day, i) => {
                if (day === null) return <div key={`empty-${i}`} />;
                
                const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                const hasActivity = activities.some(a => new Date(a.date).toDateString() === dayDate.toDateString());
                const isToday = new Date().toDateString() === dayDate.toDateString();

                return (
                  <div 
                    key={day} 
                    className={`aspect-square sm:h-24 p-2 rounded-2xl border-2 transition-all flex flex-col items-center justify-center relative
                      ${isToday ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700'}
                      ${hasActivity ? 'bg-amber-50 dark:bg-amber-900/10' : ''}
                    `}
                  >
                    <span className={`text-lg font-black ${isToday ? 'text-primary-600' : 'text-gray-600 dark:text-slate-400'}`}>{day}</span>
                    {hasActivity && <div className="absolute bottom-2 w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Activity List */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest">JADWAL TERDEKAT</h3>
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.map((a, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-md group hover:border-primary-500 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${a.type === 'ACADEMIC' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                      {a.type}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{new Date(a.date).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-lg font-black text-gray-800 dark:text-white mb-2 uppercase">{a.title}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{a.description}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-400 font-bold italic">
                Belum ada kegiatan dijadwalkan.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Activity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
            <h3 className="text-2xl font-black mb-6 uppercase">TAMBAH KEGIATAN</h3>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Judul Kegiatan" 
                value={newActivity.title}
                onChange={e => setNewActivity({...newActivity, title: e.target.value})}
                className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 outline-none font-bold"
              />
              <input 
                type="date" 
                value={newActivity.date}
                onChange={e => setNewActivity({...newActivity, date: e.target.value})}
                className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 outline-none font-bold"
              />
              <select 
                value={newActivity.type}
                onChange={e => setNewActivity({...newActivity, type: e.target.value as any})}
                className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 outline-none font-bold"
              >
                <option value="SCOUT">KEGIATAN PRAMUKA</option>
                <option value="ACADEMIC">KALENDER PENDIDIKAN</option>
                <option value="OTHER">LAINNYA</option>
              </select>
              <textarea 
                placeholder="Deskripsi" 
                value={newActivity.description}
                onChange={e => setNewActivity({...newActivity, description: e.target.value})}
                className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 outline-none font-bold min-h-[100px]"
              />
              <div className="flex gap-4 pt-4">
                <button onClick={handleAddActivity} className="flex-1 bg-primary-600 py-4 rounded-2xl text-white font-black hover:bg-primary-700 transition-all">SIMPAN</button>
                <button onClick={() => setShowAddModal(false)} className="flex-1 bg-slate-100 dark:bg-slate-800 py-4 rounded-2xl font-black">BATAL</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
