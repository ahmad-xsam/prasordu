"use client";

import { useState, useEffect } from "react";
import { UsersRound, Plus, X, ShieldAlert } from "lucide-react";

type Anggota = {
  _id: string;
  nama: string;
  kelas: string;
  jenisKelamin: string;
  namaRegu: string;
};

const REGU_PUTRA = ["LION", "SCORPION", "KIJANG", "NAGA", "COBRA"];
const REGU_PUTRI = ["LAVENDER", "GARDENIA", "AZALEA", "AMARYLIS", "WIJAYAKUSUMAH", "ANGGREK", "TULIP", "MAWAR", "MELATI"];

export default function DaftarAnggotaRegu() {
  const [activeTab, setActiveTab] = useState<'Putra' | 'Putri'>('Putra');
  const [dataAnggota, setDataAnggota] = useState<Anggota[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRegu, setSelectedRegu] = useState<string>("");
  const [selectedAnggotaId, setSelectedAnggotaId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/anggota");
      const result = await res.json();
      if (result.success) {
        setDataAnggota(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch anggota:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (regu: string) => {
    setSelectedRegu(regu);
    setSelectedAnggotaId("");
    setIsModalOpen(true);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnggotaId) {
      alert("Silakan pilih anggota terlebih dahulu!");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/anggota/${selectedAnggotaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ namaRegu: selectedRegu }),
      });
      const result = await res.json();
      if (result.success) {
        setIsModalOpen(false);
        fetchData(); // Refresh data
      } else {
        alert(`Gagal menambah anggota: ${result.error}`);
      }
    } catch (error) {
      console.error("Error adding member to regu:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (anggotaId: string, nama: string) => {
    if (!confirm(`Keluarkan ${nama} dari regu?`)) return;

    try {
      const res = await fetch(`/api/anggota/${anggotaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ namaRegu: "-" }),
      });
      const result = await res.json();
      if (result.success) {
        fetchData();
      } else {
        alert("Gagal mengeluarkan anggota dari regu");
      }
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  // Derived data
  const currentReguList = activeTab === 'Putra' ? REGU_PUTRA : REGU_PUTRI;
  const filteredAnggota = dataAnggota.filter(a => a.jenisKelamin === activeTab);
  
  // Available members to be added (must be same gender and not currently in any regu)
  const availableMembers = filteredAnggota.filter(a => !a.namaRegu || a.namaRegu === '-');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <UsersRound className="h-6 w-6" />
            </div>
            Daftar Anggota Regu
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Struktur organisasi dan pembagian kelompok regu (Maksimal 10 orang/regu).</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500">
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('Putra')}
              className={`inline-flex items-center justify-center p-4 border-b-2 rounded-t-lg group transition-colors ${
                activeTab === 'Putra'
                  ? "text-indigo-600 border-indigo-600" 
                  : "border-transparent hover:text-gray-600 hover:border-gray-300"
              }`}
            >
              REGU PUTRA (Hewan)
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('Putri')}
              className={`inline-flex items-center justify-center p-4 border-b-2 rounded-t-lg group transition-colors ${
                activeTab === 'Putri'
                  ? "text-indigo-600 border-indigo-600" 
                  : "border-transparent hover:text-gray-600 hover:border-gray-300"
              }`}
            >
              REGU PUTRI (Bunga)
            </button>
          </li>
        </ul>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm h-64 animate-pulse p-4 flex flex-col">
              <div className="h-6 bg-gray-200 dark:bg-slate-800 rounded w-1/2 mb-4"></div>
              <div className="space-y-2 flex-grow">
                <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {currentReguList.map(reguName => {
            const membersInRegu = filteredAnggota.filter(a => a.namaRegu === reguName);
            const isFull = membersInRegu.length >= 10;

            return (
              <div key={reguName} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
                {/* Card Header */}
                <div className={`p-4 border-b flex justify-between items-center ${activeTab === 'Putra' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30' : 'bg-pink-50 dark:bg-pink-900/20 border-pink-100 dark:border-pink-900/30'}`}>
                  <div>
                    <h3 className={`text-lg font-bold ${activeTab === 'Putra' ? 'text-amber-800 dark:text-amber-400' : 'text-pink-800 dark:text-pink-400'}`}>
                      REGU {reguName}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                      {membersInRegu.length} / 10 Anggota
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenModal(reguName)}
                    disabled={isFull}
                    className="p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-slate-300"
                    title={isFull ? "Regu Penuh" : "Tambah Anggota"}
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>

                {/* Card Body (Table) */}
                <div className="flex-grow p-0">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 bg-gray-50 dark:bg-slate-800/50 uppercase border-b dark:border-slate-800">
                      <tr>
                        <th className="px-4 py-2 w-10 text-center">No</th>
                        <th className="px-4 py-2">Nama</th>
                        <th className="px-4 py-2 w-16">Kelas</th>
                        <th className="px-4 py-2 w-12 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                      {membersInRegu.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-gray-400 dark:text-slate-500 italic">
                            Belum ada anggota
                          </td>
                        </tr>
                      ) : (
                        membersInRegu.map((member, index) => (
                          <tr key={member._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                            <td className="px-4 py-2.5 text-center text-gray-500">{index + 1}</td>
                            <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-slate-200">{member.nama}</td>
                            <td className="px-4 py-2.5 text-gray-600 dark:text-slate-400">{member.kelas}</td>
                            <td className="px-4 py-2.5 text-center">
                              <button 
                                onClick={() => handleRemoveMember(member._id, member.nama)}
                                className="text-red-400 hover:text-red-600 transition-colors p-1"
                                title="Keluarkan"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                      
                      {/* Pad empty rows to keep uniform height if desired, but flexible is usually better */}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Tambah Anggota */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Tambah ke Regu {selectedRegu}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddMember}>
              <div className="p-5 space-y-4">
                
                {availableMembers.length === 0 ? (
                  <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 p-4 rounded-xl flex items-start gap-3">
                    <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
                    <p className="text-sm">
                      Semua anggota {activeTab} sudah memiliki regu, atau belum ada anggota {activeTab} yang terdaftar di sistem.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-slate-300">Pilih Anggota</label>
                    <select 
                      value={selectedAnggotaId}
                      onChange={(e) => setSelectedAnggotaId(e.target.value)}
                      className="bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 outline-none transition-shadow" 
                      required
                    >
                      <option value="" disabled>-- Pilih nama anak --</option>
                      {availableMembers.map(a => (
                        <option key={a._id} value={a._id}>{a.nama} ({a.kelas})</option>
                      ))}
                    </select>
                    <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
                      Hanya menampilkan anak {activeTab} yang belum tergabung dalam regu manapun.
                    </p>
                  </div>
                )}

              </div>
              
              <div className="p-4 border-t dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={availableMembers.length === 0 || isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:bg-indigo-300 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Anggota"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
