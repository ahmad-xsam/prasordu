"use client";

import { useState, useEffect } from "react";
import { Plus, Save, Trash, Gamepad2 } from "lucide-react";

export default function AdminGameManager() {
  const [levels, setLevels] = useState<any[]>([]);
  const [currentLevel, setCurrentLevel] = useState<any>(null);
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

  const handleDeleteLevel = async (id: string) => {
    if (!confirm("Yakin ingin menghapus level ini beserta seluruh soalnya?")) return;
    try {
      const res = await fetch(`/api/admin/games?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert("Level dihapus!");
        fetchLevels();
        if (currentLevel && currentLevel._id === id) setCurrentLevel(null);
      }
    } catch (error) {
      alert("Gagal menghapus level");
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

  const removeQuestion = (idx: number) => {
    if (!currentLevel) return;
    if (!confirm("Hapus soal ini?")) return;
    const newQ = [...currentLevel.questions];
    newQ.splice(idx, 1);
    setCurrentLevel({...currentLevel, questions: newQ});
  };

  const handleQuestionChange = (idx: number, field: string, value: any) => {
    const newQ = [...currentLevel.questions];
    newQ[idx][field] = value;

    // Reset formats when type changes
    if (field === 'type') {
      if (value === 'QUIZ') { newQ[idx].options = ['A', 'B', 'C', 'D']; newQ[idx].answer = 0; }
      if (value === 'YES_NO') { newQ[idx].options = []; newQ[idx].answer = true; }
      if (value === 'ANAGRAMS') { newQ[idx].options = []; newQ[idx].answer = "PRAMUKA"; }
      if (value === 'FILL_BLANK') { newQ[idx].options = []; newQ[idx].answer = "jawaban"; }
      if (value === 'OPEN_BOX') { newQ[idx].options = []; newQ[idx].answer = "1234"; }
      if (value === 'MATCHING_PAIRS') { newQ[idx].options = ["Baden", "Powell", "Tunas", "Kelapa"]; newQ[idx].answer = ""; }
    }
    
    setCurrentLevel({...currentLevel, questions: newQ});
  };

  return (
    <div className="p-6 max-w-6xl mx-auto pb-32">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
            <Gamepad2 className="text-emerald-500" size={36} />
            Manajemen Game Petualangan
          </h1>
          <p className="text-gray-500 mt-2">Kelola level, jenis soal, dan aset permainan interaktif (Educaplay Style).</p>
        </div>
        <button 
          onClick={() => setCurrentLevel({ levelNumber: levels.length + 1, title: 'Level Baru', description: '', type: 'Adventure', questions: [] })}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"
        >
          <Plus size={20} /> Buat Level Baru
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* List of Levels */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
          <h2 className="font-bold text-xl mb-4 border-b pb-2">Daftar Level</h2>
          {loading ? <p>Loading...</p> : (
            <div className="space-y-3">
              {levels.map((lvl) => (
                <div 
                  key={lvl._id} 
                  className={`p-4 rounded-xl border-2 transition-all group relative cursor-pointer ${currentLevel?.levelNumber === lvl.levelNumber ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 hover:border-emerald-200'}`}
                  onClick={() => setCurrentLevel(lvl)}
                >
                  <div className="font-bold text-gray-800">Level {lvl.levelNumber}: {lvl.title}</div>
                  <div className="text-sm text-gray-500">{lvl.questions.length} Soal</div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteLevel(lvl._id); }}
                    className="absolute top-4 right-4 text-red-400 hover:text-red-600 p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 rounded-lg"
                  >
                    <Trash size={16} />
                  </button>
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
              <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-black flex items-center gap-2 shadow-lg shadow-blue-500/30">
                <Save size={20} /> Simpan Level
              </button>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Judul Misi / Kategori Level</label>
                <input 
                  type="text" 
                  value={currentLevel.title}
                  onChange={(e) => setCurrentLevel({...currentLevel, title: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl font-bold text-lg"
                  placeholder="Contoh: PENGETAHUAN AGAMA"
                />
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xl">Daftar Sub-Misi (Soal)</h3>
              <button onClick={addNewQuestion} className="text-emerald-600 font-bold hover:bg-emerald-100 bg-emerald-50 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                <Plus size={16} /> Tambah Soal Baru
              </button>
            </div>

            <div className="space-y-6">
              {currentLevel.questions.map((q: any, idx: number) => (
                <div key={idx} className="p-6 border-2 border-gray-200 rounded-2xl bg-white relative group shadow-sm">
                  <button 
                    onClick={() => removeQuestion(idx)}
                    className="absolute top-4 right-4 bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition-colors"
                    title="Hapus Soal"
                  >
                    <Trash size={18} />
                  </button>

                  <div className="flex justify-between items-center mb-4 mr-12 border-b pb-4">
                    <h4 className="font-black text-lg bg-emerald-100 text-emerald-800 px-3 py-1 rounded-md">Soal {idx + 1}</h4>
                    <select 
                      value={q.type}
                      onChange={(e) => handleQuestionChange(idx, 'type', e.target.value)}
                      className="border-2 border-emerald-200 rounded-lg px-4 py-2 font-bold bg-emerald-50 text-emerald-700 outline-none"
                    >
                      <option value="QUIZ">1. Pilihan Ganda (Quiz)</option>
                      <option value="YES_NO">2. Benar atau Salah (Yes/No)</option>
                      <option value="FILL_BLANK">3. Isi Rumpang (Fill in Blank)</option>
                      <option value="ANAGRAMS">4. Acak Kata (Anagrams)</option>
                      <option value="OPEN_BOX">5. Teka-Teki Kotak (Open Box)</option>
                      <option value="MATCHING_PAIRS">6. Kartu Memori (Matching Pairs)</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase">URL Gambar / Aset 3D (Opsional)</label>
                      <input 
                        type="text" 
                        placeholder="https://link-gambar.com/aset-3d.png" 
                        value={q.imageUrl || ''}
                        onChange={(e) => handleQuestionChange(idx, 'imageUrl', e.target.value)}
                        className="w-full p-3 border-2 rounded-xl bg-gray-50 focus:border-emerald-500 outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase">Pertanyaan / Instruksi Permainan</label>
                      <textarea 
                        rows={2}
                        placeholder="Ketik pertanyaan atau instruksi game di sini..." 
                        value={q.question}
                        onChange={(e) => handleQuestionChange(idx, 'question', e.target.value)}
                        className="w-full p-3 border-2 border-gray-300 rounded-xl font-medium outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase">Durasi Waktu Mengerjakan (Detik)</label>
                      <input 
                        type="number" 
                        min="5" max="300"
                        placeholder="15" 
                        value={q.duration || 15}
                        onChange={(e) => handleQuestionChange(idx, 'duration', parseInt(e.target.value) || 15)}
                        className="w-full p-3 border-2 rounded-xl bg-gray-50 focus:border-emerald-500 outline-none font-bold text-emerald-700"
                      />
                    </div>

                    {/* DYNAMIC FORMS BASED ON GAME TYPE */}
                    
                    {q.type === 'QUIZ' && (
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <label className="text-xs font-bold text-blue-800 uppercase mb-2 block">Opsi Jawaban & Kunci (Pilih yang benar)</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {q.options.map((opt: string, oIdx: number) => (
                            <div key={oIdx} className={`flex items-center gap-3 p-3 rounded-lg border-2 ${q.answer === oIdx ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white'}`}>
                              <input 
                                type="radio" 
                                name={`answer-${currentLevel.levelNumber}-${idx}`} 
                                checked={q.answer === oIdx}
                                onChange={() => handleQuestionChange(idx, 'answer', oIdx)}
                                className="w-5 h-5 accent-emerald-600"
                              />
                              <input 
                                type="text" 
                                value={opt}
                                onChange={(e) => {
                                  const newOptions = [...q.options];
                                  newOptions[oIdx] = e.target.value;
                                  handleQuestionChange(idx, 'options', newOptions);
                                }}
                                className="w-full outline-none bg-transparent font-medium"
                                placeholder={`Opsi ${['A', 'B', 'C', 'D'][oIdx]}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {q.type === 'YES_NO' && (
                      <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                        <label className="text-xs font-bold text-indigo-800 uppercase mb-2 block">Kunci Jawaban</label>
                        <div className="flex gap-4">
                          <label className={`flex-1 flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer ${q.answer === true ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white'}`}>
                            <input type="radio" name={`yn-${idx}`} checked={q.answer === true} onChange={() => handleQuestionChange(idx, 'answer', true)} className="w-5 h-5 accent-emerald-600" />
                            <span className="font-bold text-lg">BENAR (YES)</span>
                          </label>
                          <label className={`flex-1 flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer ${q.answer === false ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}`}>
                            <input type="radio" name={`yn-${idx}`} checked={q.answer === false} onChange={() => handleQuestionChange(idx, 'answer', false)} className="w-5 h-5 accent-red-600" />
                            <span className="font-bold text-lg">SALAH (NO)</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {(q.type === 'FILL_BLANK' || q.type === 'ANAGRAMS' || q.type === 'OPEN_BOX') && (
                      <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                        <label className="text-xs font-bold text-amber-800 uppercase mb-2 block">
                          {q.type === 'FILL_BLANK' ? 'Kata Kunci (Jawaban Isian)' : q.type === 'ANAGRAMS' ? 'Kata yang akan diacak (Tanpa Spasi)' : 'Kode Rahasia Kotak'}
                        </label>
                        <input 
                          type="text" 
                          value={q.answer}
                          onChange={(e) => handleQuestionChange(idx, 'answer', e.target.value)}
                          className="w-full p-4 border-2 border-amber-200 rounded-xl font-black text-xl uppercase tracking-widest text-amber-700 outline-none focus:border-amber-500"
                          placeholder="Ketik Jawaban Benar..."
                        />
                      </div>
                    )}

                    {q.type === 'MATCHING_PAIRS' && (
                      <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                        <label className="text-xs font-bold text-purple-800 uppercase mb-2 block">Daftar Kata Unik (Sistem akan membuatkan pasangannya secara otomatis)</label>
                        <div className="grid grid-cols-2 gap-2">
                          {q.options.map((opt: string, oIdx: number) => (
                            <div key={oIdx} className="flex gap-2">
                              <input 
                                type="text" 
                                value={opt}
                                onChange={(e) => {
                                  const newOptions = [...q.options];
                                  newOptions[oIdx] = e.target.value;
                                  handleQuestionChange(idx, 'options', newOptions);
                                }}
                                className="w-full p-3 border-2 border-purple-200 rounded-lg outline-none font-bold text-purple-700"
                                placeholder="Kata unik..."
                              />
                              <button onClick={() => {
                                const newOptions = q.options.filter((_:any, i:number) => i !== oIdx);
                                handleQuestionChange(idx, 'options', newOptions);
                              }} className="bg-red-100 text-red-500 p-3 rounded-lg"><Trash size={16}/></button>
                            </div>
                          ))}
                        </div>
                        <button onClick={() => {
                          handleQuestionChange(idx, 'options', [...q.options, "Kata Baru"]);
                        }} className="mt-3 text-sm font-bold text-purple-600 bg-purple-100 px-3 py-1 rounded-lg">
                          + Tambah Kartu
                        </button>
                      </div>
                    )}

                  </div>
                </div>
              ))}
              {currentLevel.questions.length === 0 && (
                <div className="text-gray-500 italic text-center py-12 border-2 border-dashed border-gray-300 rounded-2xl">
                  <Gamepad2 size={48} className="mx-auto text-gray-300 mb-4" />
                  <p>Belum ada soal sub-misi.</p>
                  <p>Klik tombol <span className="font-bold text-emerald-600">Tambah Soal Baru</span> untuk memulai.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
