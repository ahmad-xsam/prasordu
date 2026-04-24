"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X } from "lucide-react";

type Anggota = {
  _id: string;
  nama: string;
  tanggalLahir: string;
  kelas: string;
  jabatan: string;
};

export default function Keanggotaan() {
  const [data, setData] = useState<Anggota[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [formData, setFormData] = useState({
    _id: "",
    nama: "",
    tanggalLahir: "",
    kelas: "",
    jabatan: "",
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/anggota");
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({ _id: "", nama: "", tanggalLahir: "", kelas: "", jabatan: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (anggota: Anggota) => {
    setIsEditMode(true);
    setFormData({
      _id: anggota._id,
      nama: anggota.nama,
      tanggalLahir: new Date(anggota.tanggalLahir).toISOString().split('T')[0],
      kelas: anggota.kelas,
      jabatan: anggota.jabatan,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = isEditMode ? `/api/anggota/${formData._id}` : "/api/anggota";
    const method = isEditMode ? "PUT" : "POST";

    try {
      const { _id, ...submitData } = formData;
      const bodyData = isEditMode ? formData : submitData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });
      const result = await res.json();
      if (result.success) {
        setIsModalOpen(false);
        fetchData();
      } else {
        alert("Gagal menyimpan data");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;
    
    try {
      const res = await fetch(`/api/anggota/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        fetchData();
      } else {
        alert("Gagal menghapus data");
      }
    } catch (error) {
      console.error("Error deleting data:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Keanggotaan</h1>
          <p className="text-gray-500 mt-1">Kelola daftar anggota, kelas, dan jabatan.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors font-medium"
        >
          <Plus className="h-5 w-5" />
          Tambah Anggota
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th scope="col" className="px-6 py-4">No</th>
                <th scope="col" className="px-6 py-4">Nama Lengkap</th>
                <th scope="col" className="px-6 py-4">Tanggal Lahir</th>
                <th scope="col" className="px-6 py-4">Kelas</th>
                <th scope="col" className="px-6 py-4">Jabatan</th>
                <th scope="col" className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Memuat data...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Belum ada data anggota.
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={item._id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{item.nama}</td>
                    <td className="px-6 py-4">
                      {new Date(item.tanggalLahir).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {item.kelas}
                      </span>
                    </td>
                    <td className="px-6 py-4">{item.jabatan}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => openEditModal(item)} className="text-amber-500 hover:text-amber-600 transition-colors" title="Edit">
                          <Edit className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-600 transition-colors" title="Hapus">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {isEditMode ? "Edit Anggota" : "Tambah Anggota Baru"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">Nama Lengkap</label>
                <input 
                  type="text" 
                  name="nama" 
                  value={formData.nama} 
                  onChange={handleInputChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none" 
                  required 
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">Tanggal Lahir</label>
                <input 
                  type="date" 
                  name="tanggalLahir" 
                  value={formData.tanggalLahir} 
                  onChange={handleInputChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none" 
                  required 
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">Kelas</label>
                <input 
                  type="text" 
                  name="kelas" 
                  value={formData.kelas} 
                  onChange={handleInputChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none" 
                  required 
                  placeholder="Contoh: X IPA 1"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">Jabatan</label>
                <input 
                  type="text" 
                  name="jabatan" 
                  value={formData.jabatan} 
                  onChange={handleInputChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none" 
                  required 
                  placeholder="Contoh: Ketua Regu, Anggota"
                />
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                >
                  {isEditMode ? "Simpan Perubahan" : "Tambah Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
