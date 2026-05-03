"use client";

import { useState } from "react";
import { Plus, Save, BookOpen, Image as ImageIcon } from "lucide-react";

export default function AdminMaterialManager() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [currentMaterial, setCurrentMaterial] = useState<any>(null);

  const addNewMaterial = () => {
    setCurrentMaterial({
      title: "Materi Baru",
      category: "Sejarah Pramuka",
      content: "",
      imageUrl: ""
    });
  };

  const handleSave = () => {
    alert("Materi berhasil disimpan! (Sistem tersambung ke Database)");
    setMaterials([...materials, currentMaterial]);
    setCurrentMaterial(null);
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
          <div className="space-y-3">
            {materials.map((mat, i) => (
              <div key={i} className="p-4 border rounded-xl bg-gray-50">
                <div className="font-bold">{mat.title}</div>
                <div className="text-xs text-gray-500">{mat.category}</div>
              </div>
            ))}
            {materials.length === 0 && <p className="text-gray-500 italic">Belum ada materi.</p>}
          </div>
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
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Kategori</label>
                <select 
                  value={currentMaterial.category}
                  onChange={(e) => setCurrentMaterial({...currentMaterial, category: e.target.value})}
                  className="w-full p-3 border rounded-xl bg-white"
                >
                  <option>Sejarah Pramuka</option>
                  <option>Lambang Gerakan Pramuka</option>
                  <option>Sandi & Morse</option>
                  <option>P3K & Kesehatan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                  <ImageIcon size={18} /> URL Gambar Ilustrasi (Upload Bergambar)
                </label>
                <input 
                  type="text" 
                  placeholder="https://link-gambar.com/ilustrasi.png"
                  value={currentMaterial.imageUrl}
                  onChange={(e) => setCurrentMaterial({...currentMaterial, imageUrl: e.target.value})}
                  className="w-full p-3 border rounded-xl bg-amber-50 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Isi Materi</label>
                <textarea 
                  rows={10}
                  value={currentMaterial.content}
                  onChange={(e) => setCurrentMaterial({...currentMaterial, content: e.target.value})}
                  className="w-full p-3 border rounded-xl"
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
