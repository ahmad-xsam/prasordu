"use client";

import { useState, useEffect } from "react";
import { Plus, Save, BookOpen, Image as ImageIcon, Trash } from "lucide-react";

export default function AdminMaterialManager() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [currentMaterial, setCurrentMaterial] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/materials');
      const data = await res.json();
      if (data.materials) setMaterials(data.materials);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addNewMaterial = () => {
    setCurrentMaterial({
      title: "Materi Baru",
      category: "",
      content: "",
      imageUrl: "",
      videoUrl: ""
    });
  };

  const handleSave = async () => {
    if (!currentMaterial) return;
    try {
      const method = currentMaterial._id ? 'PUT' : 'POST';
      const res = await fetch('/api/materials', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentMaterial)
      });
      if (res.ok) {
        alert("Materi berhasil disimpan ke Database!");
        fetchMaterials();
        setCurrentMaterial(null);
      } else {
        alert("Gagal menyimpan materi.");
      }
    } catch (error) {
      alert("Terjadi kesalahan.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin hapus materi ini?")) return;
    try {
      const res = await fetch(`/api/materials?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert("Materi dihapus!");
        fetchMaterials();
        if (currentMaterial && currentMaterial._id === id) setCurrentMaterial(null);
      }
    } catch (error) {
      alert("Gagal menghapus.");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
            <BookOpen className="text-amber-500" size={36} />
            Kelola Materi Belajar
          </h1>
          <p className="text-gray-500 mt-2">Tambahkan modul bacaan dan ilustrasi gambar materi.</p>
        </div>
        <button 
          onClick={addNewMaterial}
          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"
        >
          <Plus size={20} /> Buat Materi Baru
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-xl mb-4 border-b pb-2">Daftar Materi</h2>
          {loading ? <p>Loading...</p> : (
            <div className="space-y-3">
              {materials.map((mat, i) => (
                <div key={mat._id || i} className="p-4 border-2 border-gray-100 hover:border-amber-200 rounded-xl transition-all cursor-pointer group relative" onClick={() => setCurrentMaterial(mat)}>
                  <div className="font-bold">{mat.title}</div>
                  <div className="text-xs text-gray-500">{mat.category}</div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(mat._id); }}
                    className="absolute top-4 right-4 text-red-400 hover:text-red-600 p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 rounded-lg"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              ))}
              {materials.length === 0 && <p className="text-gray-500 italic">Belum ada materi.</p>}
            </div>
          )}
        </div>

        {currentMaterial && (
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-2xl">Edit Materi</h2>
              <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                <Save size={18} /> Simpan
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Judul Materi</label>
                <input 
                  type="text" 
                  value={currentMaterial.title}
                  onChange={(e) => setCurrentMaterial({...currentMaterial, title: e.target.value})}
                  className="w-full p-3 border rounded-xl"
                  placeholder="Contoh: Sejarah Baden Powell"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Kategori Materi (Ketik Bebas)</label>
                <input 
                  type="text"
                  value={currentMaterial.category}
                  onChange={(e) => setCurrentMaterial({...currentMaterial, category: e.target.value})}
                  className="w-full p-3 border rounded-xl bg-white"
                  placeholder="Contoh: Sejarah Dunia, P3K, Sandi"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                  <ImageIcon size={18} /> URL Gambar Ilustrasi (Opsional)
                </label>
                <input 
                  type="text" 
                  placeholder="https://link-gambar.com/ilustrasi.png"
                  value={currentMaterial.imageUrl || ''}
                  onChange={(e) => setCurrentMaterial({...currentMaterial, imageUrl: e.target.value})}
                  className="w-full p-3 border rounded-xl bg-amber-50 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                  URL Video YouTube / TikTok (Opsional)
                </label>
                <input 
                  type="text" 
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={currentMaterial.videoUrl || ''}
                  onChange={(e) => setCurrentMaterial({...currentMaterial, videoUrl: e.target.value})}
                  className="w-full p-3 border rounded-xl bg-red-50 focus:border-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Isi Materi</label>
                <textarea 
                  rows={15}
                  value={currentMaterial.content}
                  onChange={(e) => setCurrentMaterial({...currentMaterial, content: e.target.value})}
                  className="w-full p-3 border rounded-xl outline-none"
                  placeholder="Tuliskan isi materi pramuka di sini..."
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
