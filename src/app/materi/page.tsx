"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Lock, Unlock, Star, Plus } from 'lucide-react';

export default function Materi() {
  const [unlockedBab, setUnlockedBab] = useState<number>(1);
  const [stars, setStars] = useState<number>(0);

  const [materiList, setMateriList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Read progress from localStorage
    const savedBab = localStorage.getItem('pramuka_unlocked_bab');
    const savedStars = localStorage.getItem('pramuka_stars');
    if (savedBab) setUnlockedBab(parseInt(savedBab));
    if (savedStars) setStars(parseInt(savedStars));

    // Fetch materi from API
    fetch('/api/materi-pramuka')
      .then(res => res.json())
      .then((data: any) => {
        if (data.success) {
          setMateriList(data.data);
        }
        setIsLoading(false);
      })
      .catch((err: any) => {
        console.error("Failed to fetch materi", err);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Materi Pramuka</h1>
          <p className="text-gray-500 mb-4">Pelajari materi dari buku Boyman dan kumpulkan bintang!</p>
          <Link href="/materi/tambah" className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm">
            <Plus className="mr-2" size={18} /> Tambah Materi Baru
          </Link>
        </div>
        <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg font-bold">
          <Star className="fill-yellow-500 text-yellow-500" />
          <span>{stars} Bintang</span>
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-10 text-gray-500">Memuat data materi...</div>
        ) : materiList.length === 0 ? (
          <div className="text-center py-10 text-gray-500 border rounded-xl border-dashed">Belum ada materi. Silakan tambah materi baru.</div>
        ) : materiList.map((materi: any) => {
          const isUnlocked = materi.bab <= unlockedBab;
          const isCompleted = materi.bab < unlockedBab;

          return (
            <div 
              key={materi._id || materi.id} 
              className={`border rounded-xl p-5 flex items-center justify-between transition-all ${isUnlocked ? 'border-primary-200 bg-primary-50/30 hover:border-primary-400' : 'border-gray-200 bg-gray-50 opacity-75'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${isUnlocked ? 'bg-primary-100 text-primary-600' : 'bg-gray-200 text-gray-400'}`}>
                  {isUnlocked ? <Unlock size={20} /> : <Lock size={20} />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">BAB {materi.bab}: {materi.title}</h2>
                  <p className="text-sm text-gray-500">
                    {isCompleted ? '✓ Selesai' : isUnlocked ? 'Belum diselesaikan' : 'Terkunci'}
                  </p>
                </div>
              </div>
              
              {isUnlocked ? (
                <Link href={`/materi/${materi.bab}`} className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm">
                  {isCompleted ? 'Baca Ulang' : 'Mulai Belajar'}
                </Link>
              ) : (
                <button disabled className="bg-gray-200 text-gray-500 px-5 py-2 rounded-lg font-medium text-sm cursor-not-allowed">
                  Terkunci
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
