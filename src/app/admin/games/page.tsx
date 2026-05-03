"use client";

import { useState, useEffect } from "react";
import { Plus, Save, Trash, Gamepad2 } from "lucide-react";

interface Question {
  type: string;
  question: string;
  options: string[];
  answer: string | number;
  points: number;
}

interface GameLevel {
  levelNumber: number;
  title: string;
  description: string;
  type: string;
  questions: Question[];
}

export default function AdminGameManager() {
  const [levels, setLevels] = useState<GameLevel[]>([]);
  const [currentLevel, setCurrentLevel] = useState<GameLevel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/games');
      const data = await res.json();
      if (data.levels) setLevels(data.levels);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentLevel) return;
    try {
      const res = await fetch('/api/admin/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentLevel)
      });
      if (res.ok) {
        alert("Level berhasil disimpan!");
        fetchLevels();
        setCurrentLevel(null);
      }
    } catch (error) {
      alert("Gagal menyimpan");
    }
  };

  const addNewQuestion = () => {
    if (!currentLevel) return;
    setCurrentLevel({
      ...currentLevel,
      questions: [
        ...currentLevel.questions,
        { type: 'QUIZ', question: 'Pertanyaan Baru', options: ['A', 'B', 'C', 'D'], answer: 0, points: 100 }
      ]
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
            <Gamepad2 className="text-emerald-500" size={36} />
            Manajemen Game Petualangan
          </h1>
          <p className="text-gray-500 mt-2">Kelola level, jenis soal, dan aset permainan di sini.</p>
        </div>
        <button 
          onClick={() => setCurrentLevel({ levelNumber: levels.length + 1, title: 'Level Baru', description: '', type: 'Quiz', questions: [] })}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"
        >
          <Plus size={20} /> Buat Level Baru
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* List of Levels */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-xl mb-4 border-b pb-2">Daftar Level</h2>
          {loading ? <p>Loading...</p> : (
            <div className="space-y-3">
              {levels.map((lvl) => (
                <div 
                  key={lvl.levelNumber} 
                  onClick={() => setCurrentLevel(lvl)}
                  className={`p-4 rounded-xl cursor-pointer border-2 transition-all ${currentLevel?.levelNumber === lvl.levelNumber ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 hover:border-emerald-200'}`}
                >
                  <div className="font-bold text-gray-800">Level {lvl.levelNumber}: {lvl.title}</div>
                  <div className="text-sm text-gray-500">{lvl.questions.length} Soal</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Level Editor */}
        {currentLevel && (
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-2xl">Edit Level {currentLevel.levelNumber}</h2>
              <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                <Save size={18} /> Simpan Level
              </button>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Judul Level</label>
                <input 
                  type="text" 
                  value={currentLevel.title}
                  onChange={(e) => setCurrentLevel({...currentLevel, title: e.target.value})}
                  className="w-full p-3 border rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xl">Daftar Soal</h3>
              <button onClick={addNewQuestion} className="text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-lg">
                + Tambah Soal
              </button>
            </div>

            <div className="space-y-6">
              {currentLevel.questions.map((q, idx) => (
                <div key={idx} className="p-4 border rounded-xl bg-gray-50">
                  <div className="flex justify-between mb-4">
                    <h4 className="font-bold">Soal {idx + 1}</h4>
                    <select 
                      value={q.type}
                      onChange={(e) => {
                        const newQ = [...currentLevel.questions];
                        newQ[idx].type = e.target.value;
                        setCurrentLevel({...currentLevel, questions: newQ});
                      }}
                      className="border rounded px-2 py-1"
                    >
                      <option value="QUIZ">Pilihan Ganda (Quiz)</option>
                      <option value="MATCH_WORD">Pencocokan Kata</option>
                      <option value="OPEN_BOX">Membuka Kotak</option>
                      <option value="MATCHING_PAIRS">Menemukan Kecocokan (Matching Pairs)</option>
                      <option value="MATCH_UP">Mencocokkan Item (Match Up)</option>
                      <option value="SPIN_WHEEL">Roda Acak (Spin Wheel)</option>
                      <option value="ANAGRAMS">Anagram (Acak Kata)</option>
                    </select>
                  </div>

                  <input 
                    type="text" 
                    placeholder="URL Gambar Pendukung (Opsional - Upload Game Bergambar)" 
                    onChange={(e) => {
                      const newQ = [...currentLevel.questions];
                      (newQ[idx] as any).imageUrl = e.target.value;
                      setCurrentLevel({...currentLevel, questions: newQ});
                    }}
                    className="w-full p-2 border rounded mb-3 bg-blue-50 focus:border-blue-500"
                  />

                  <input 
                    type="text" 
                    placeholder="Pertanyaan / Instruksi" 
                    value={q.question}
                    onChange={(e) => {
                      const newQ = [...currentLevel.questions];
                      newQ[idx].question = e.target.value;
                      setCurrentLevel({...currentLevel, questions: newQ});
                    }}
                    className="w-full p-2 border rounded mb-3"
                  />

                  {q.type === 'QUIZ' && (
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2">
                          <input 
                            type="radio" 
                            name={`answer-${idx}`} 
                            checked={q.answer === oIdx}
                            onChange={() => {
                              const newQ = [...currentLevel.questions];
                              newQ[idx].answer = oIdx;
                              setCurrentLevel({...currentLevel, questions: newQ});
                            }}
                          />
                          <input 
                            type="text" 
                            value={opt}
                            onChange={(e) => {
                              const newQ = [...currentLevel.questions];
                              newQ[idx].options[oIdx] = e.target.value;
                              setCurrentLevel({...currentLevel, questions: newQ});
                            }}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {q.type === 'MATCH_WORD' && (
                    <div className="text-sm text-gray-500">
                      Format: Isi opsi dengan kata-kata yang diacak (pisahkan dengan koma di kotak opsi pertama), lalu jawaban yang benar. (Contoh sederhana).
                    </div>
                  )}

                  {q.type === 'OPEN_BOX' && (
                    <div className="text-sm text-gray-500">
                      Terdapat kotak rahasia. Jawaban adalah isi teks atau angka yang benar untuk membuka kotak.
                    </div>
                  )}
                </div>
              ))}
              {currentLevel.questions.length === 0 && (
                <p className="text-gray-500 italic text-center py-4">Belum ada soal.</p>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
