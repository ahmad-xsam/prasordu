"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { materiPramuka } from '@/data/materiPramuka';
import { Lock, Unlock, Star } from 'lucide-react';

export default function Materi() {
  const [unlockedBab, setUnlockedBab] = useState<number>(1);
  const [stars, setStars] = useState<number>(0);

  useEffect(() => {
    // Read progress from localStorage
    const savedBab = localStorage.getItem('pramuka_unlocked_bab');
    const savedStars = localStorage.getItem('pramuka_stars');
    if (savedBab) setUnlockedBab(parseInt(savedBab));
    if (savedStars) setStars(parseInt(savedStars));
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Materi Pramuka</h1>
          <p className="text-gray-500">Pelajari materi dari buku Boyman dan kumpulkan bintang!</p>
        </div>
        <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg font-bold">
          <Star className="fill-yellow-500 text-yellow-500" />
          <span>{stars} Bintang</span>
        </div>
      </div>

      <div className="grid gap-4">
        {materiPramuka.map((materi) => {
          const isUnlocked = materi.bab <= unlockedBab;
          const isCompleted = materi.bab < unlockedBab;

          return (
            <div 
              key={materi.id} 
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
