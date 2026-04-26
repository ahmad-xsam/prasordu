"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import Link from 'next/link';

export default function TambahMateriPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    bab: '',
    title: '',
    content: '',
    imageUrl: '',
    youtubeUrl: '',
    quiz: [
      { question: '', options: ['', '', '', ''], correctAnswerIndex: 0 }
    ]
  });

  const handleAddQuestion = () => {
    setFormData({
      ...formData,
      quiz: [...formData.quiz, { question: '', options: ['', '', '', ''], correctAnswerIndex: 0 }]
    });
  };

  const handleRemoveQuestion = (idx: number) => {
    const newQuiz = [...formData.quiz];
    newQuiz.splice(idx, 1);
    setFormData({ ...formData, quiz: newQuiz });
  };

  const updateQuestion = (idx: number, field: string, value: any) => {
    const newQuiz = [...formData.quiz];
    (newQuiz[idx] as any)[field] = value;
    setFormData({ ...formData, quiz: newQuiz });
  };

  const updateOption = (qIdx: number, optIdx: number, value: string) => {
    const newQuiz = [...formData.quiz];
    newQuiz[qIdx].options[optIdx] = value;
    setFormData({ ...formData, quiz: newQuiz });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        bab: parseInt(formData.bab),
      };

      const res = await fetch('/api/materi-pramuka', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        router.push('/materi');
      } else {
        setError(data.error || 'Gagal menyimpan materi');
      }
    } catch (err) {
      setError('Terjadi kesalahan pada server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <Link href="/materi" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali ke Daftar Materi
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Tambah Materi BAB Baru</h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">BAB (Angka)</label>
              <input 
                type="number" 
                required 
                value={formData.bab}
                onChange={e => setFormData({...formData, bab: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary-500 focus:border-primary-500 outline-none" 
                placeholder="Contoh: 4"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Judul Materi</label>
              <input 
                type="text" 
                required 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary-500 focus:border-primary-500 outline-none" 
                placeholder="Contoh: Sandi Morse dan Semaphore"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Konten Materi (Teks / HTML)</label>
            <textarea 
              required 
              rows={6}
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary-500 focus:border-primary-500 outline-none font-mono text-sm" 
              placeholder="<p>Isi paragraf di sini...</p>"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link Gambar (Opsional)</label>
              <input 
                type="url" 
                value={formData.imageUrl}
                onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary-500 focus:border-primary-500 outline-none" 
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link Video YouTube (Opsional)</label>
              <input 
                type="url" 
                value={formData.youtubeUrl}
                onChange={e => setFormData({...formData, youtubeUrl: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary-500 focus:border-primary-500 outline-none" 
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
          </div>

          <div className="pt-8 border-t">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Pertanyaan Kuis</h2>
              <button 
                type="button" 
                onClick={handleAddQuestion}
                className="text-primary-600 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center transition-colors"
              >
                <Plus size={16} className="mr-1" /> Tambah Soal
              </button>
            </div>

            <div className="space-y-6">
              {formData.quiz.map((q: any, qIdx: number) => (
                <div key={qIdx} className="border border-gray-200 rounded-xl p-5 bg-gray-50 relative group">
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      type="button"
                      onClick={() => handleRemoveQuestion(qIdx)}
                      className="text-red-500 p-1 hover:bg-red-100 rounded-md"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Soal {qIdx + 1}</label>
                    <input 
                      type="text" 
                      required 
                      value={q.question}
                      onChange={e => updateQuestion(qIdx, 'question', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-primary-500 outline-none" 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.options.map((opt: string, optIdx: number) => (
                      <div key={optIdx} className="flex items-center">
                        <input 
                          type="radio" 
                          name={`correct-${qIdx}`}
                          checked={q.correctAnswerIndex === optIdx}
                          onChange={() => updateQuestion(qIdx, 'correctAnswerIndex', optIdx)}
                          className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 mr-2"
                        />
                        <input 
                          type="text" 
                          required
                          value={opt}
                          onChange={e => updateOption(qIdx, optIdx, e.target.value)}
                          placeholder={`Opsi ${optIdx + 1}`}
                          className="flex-1 border border-gray-300 rounded-md p-1.5 text-sm outline-none focus:border-primary-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={isLoading}
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-bold flex items-center shadow-md disabled:opacity-70 transition-colors"
            >
              {isLoading ? 'Menyimpan...' : (
                <><Save size={20} className="mr-2" /> Simpan Materi & Kuis</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
