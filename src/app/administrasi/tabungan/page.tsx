"use client";

import { useState, useEffect } from "react";
import { Wallet, Edit, Trash2, X, Download } from "lucide-react";
import * as XLSX from "xlsx-js-style";
import { useSession } from "next-auth/react";

type Anggota = {
  _id: string;
  nama: string;
  kelas: string;
};

type Kehadiran = {
  _id: string;
  tanggal: string;
  anggotaId: Anggota | null;
  status: string;
  semester: number;
  jumlahNabung: number;
};

export default function TabunganAnggota() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  const [activeSemester, setActiveSemester] = useState<number>(1);
  const [dataKehadiran, setDataKehadiran] = useState<Kehadiran[]>([]);
  const [anggotaList, setAnggotaList] = useState<Anggota[]>([]);
  const [totalTabunganMap, setTotalTabunganMap] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [formData, setFormData] = useState({
    _id: "",
    tanggal: new Date().toISOString().split('T')[0],
    anggotaId: "",
    status: "HADIR",
    semester: 1,
    jumlahNabung: 0,
  });

  const fetchAnggota = async () => {
    try {
      const res = await fetch("/api/anggota");
      const result = await res.json();
      if (result.success) {
        setAnggotaList(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch anggota:", error);
    }
  };

  const fetchKehadiran = async (semester: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/kehadiran?semester=${semester}`);
      const result = await res.json();
      if (result.success) {
        setDataKehadiran(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch kehadiran:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTotalTabungan = async () => {
    try {
      const res = await fetch("/api/tabungan/total");
      const result = await res.json();
      if (result.success) {
        setTotalTabunganMap(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch total tabungan:", error);
    }
  };

  useEffect(() => {
    fetchAnggota();
    fetchTotalTabungan();
  }, []);

  useEffect(() => {
    fetchKehadiran(activeSemester);
  }, [activeSemester]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: name === "jumlahNabung" ? (value === "" ? 0 : Number(value)) : value 
    });
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({ 
      _id: "", 
      tanggal: new Date().toISOString().split('T')[0], 
      anggotaId: anggotaList.length > 0 ? anggotaList[0]._id : "", 
      status: "HADIR",
      semester: activeSemester,
      jumlahNabung: 0
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: Kehadiran) => {
    setIsEditMode(true);
    setFormData({
      _id: item._id,
      tanggal: new Date(item.tanggal).toISOString().split('T')[0],
      anggotaId: item.anggotaId?._id || "",
      status: item.status,
      semester: item.semester,
      jumlahNabung: item.jumlahNabung || 0,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = isEditMode ? `/api/kehadiran/${formData._id}` : "/api/kehadiran";
    const method = isEditMode ? "PUT" : "POST";

    if (!formData.anggotaId) {
      alert("Silakan pilih anggota terlebih dahulu.");
      return;
    }

    try {
      const { _id, ...submitData } = formData;
      const bodyData = isEditMode 
        ? { ...formData, semester: Number(formData.semester), jumlahNabung: Number(formData.jumlahNabung) } 
        : { ...submitData, semester: Number(submitData.semester), jumlahNabung: Number(submitData.jumlahNabung) };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });
      const result = await res.json();
      if (result.success) {
        setIsModalOpen(false);
        fetchKehadiran(activeSemester);
        fetchTotalTabungan(); // Refresh totals
      } else {
        alert(`Gagal menyimpan data: ${result.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;
    
    try {
      const res = await fetch(`/api/kehadiran/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        fetchKehadiran(activeSemester);
        fetchTotalTabungan(); // Refresh totals
      } else {
        alert("Gagal menghapus data");
      }
    } catch (error) {
      console.error("Error deleting data:", error);
    }
  };

  const exportToExcel = () => {
    if (dataKehadiran.length === 0) {
      alert("Tidak ada data untuk diexport");
      return;
    }

    const aoa: any[][] = [];

    aoa.push(["REKAPITULASI TABUNGAN ANGGOTA GUGUS DEPAN", "", "", "", "", ""]);
    aoa.push(["GERAKAN PRAMUKA SMP NEGERI 2 SOREANG", "", "", "", "", ""]);
    aoa.push([]); 
    aoa.push([`SEMESTER ${activeSemester}`, "", "", "", "", ""]);
    aoa.push([]);

    const headers = ["No", "Tanggal", "Nama Anggota", "Kelas", "Presensi", "Jumlah Nabung", "Total Nabung"];
    aoa.push(headers);

    let grandTotalCurrent = 0;

    dataKehadiran.forEach((item, index) => {
      const tanggal = new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      const nama = item.anggotaId ? item.anggotaId.nama : "Anggota Dihapus";
      const kelas = item.anggotaId ? item.anggotaId.kelas : "-";
      const jumlah = item.jumlahNabung || 0;
      const totalSemua = item.anggotaId ? (totalTabunganMap[item.anggotaId._id] || 0) : 0;
      
      grandTotalCurrent += jumlah;

      aoa.push([index + 1, tanggal, nama, kelas, item.status, jumlah, totalSemua]);
    });

    aoa.push([]);
    aoa.push(["", "", "", "", "Total Transaksi Hari Ini", grandTotalCurrent, ""]);
    aoa.push([]);
    
    aoa.push(["Pembina Gudep", "", "", "", "Pratama Putra,", ""]);
    aoa.push(["04-000,", "", "", "", "", ""]);
    aoa.push([]);
    aoa.push([]);
    aoa.push(["Ahmad Samsudin, S.T.", "", "", "", "____________________", ""]);

    const worksheet = XLSX.utils.aoa_to_sheet(aoa);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Tabungan");

    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }, 
      { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } }, 
      { s: { r: 3, c: 0 }, e: { r: 3, c: 1 } }, 
    ];

    const borderAll = {
      top: { style: "thin", color: { auto: 1 } },
      bottom: { style: "thin", color: { auto: 1 } },
      left: { style: "thin", color: { auto: 1 } },
      right: { style: "thin", color: { auto: 1 } }
    };

    const headerStyle = {
      font: { bold: true },
      fill: { fgColor: { rgb: "FF0000" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: borderAll
    };

    const centerBoldStyle = { font: { bold: true }, alignment: { horizontal: "center", vertical: "center" } };

    // Titles
    for (let r = 0; r <= 1; r++) {
      const cellRef = XLSX.utils.encode_cell({ r, c: 0 });
      if (!worksheet[cellRef]) worksheet[cellRef] = { t: 's', v: '' };
      worksheet[cellRef].s = centerBoldStyle;
    }

    // Semester Box
    for (let c = 0; c <= 1; c++) {
       const cellRef = XLSX.utils.encode_cell({ r: 3, c });
       if (!worksheet[cellRef]) worksheet[cellRef] = { t: 's', v: '' };
       worksheet[cellRef].s = { font: { bold: true }, border: borderAll };
    }

    // Headers
    for (let c = 0; c < 7; c++) {
      const cellRef = XLSX.utils.encode_cell({ r: 5, c });
      if (worksheet[cellRef]) worksheet[cellRef].s = headerStyle;
    }

    // Data rows
    for (let r = 6; r < 6 + dataKehadiran.length; r++) {
      for (let c = 0; c < 7; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c });
        if (!worksheet[cellRef]) worksheet[cellRef] = { t: 's', v: '' }; 
        
        let align = "center";
        let format = undefined;
        if (c === 2) align = "left"; 
        if (c === 5 || c === 6) { align = "right"; format = '"Rp"#,##0'; } // Currency
        
        worksheet[cellRef].s = {
          alignment: { horizontal: align, vertical: "center" },
          border: borderAll,
          numFmt: format
        };
      }
    }

    worksheet['!cols'] = [
      { wch: 5 },  
      { wch: 20 }, 
      { wch: 30 }, 
      { wch: 15 }, 
      { wch: 15 }, 
      { wch: 20 }, 
      { wch: 20 }  
    ];

    XLSX.writeFile(workbook, `Tabungan_Anggota_Semester_${activeSemester}.xlsx`);
  };

  const getStatusBadgeColor = (status: string) => {
    switch(status) {
      case 'HADIR': return 'bg-green-100 text-green-800';
      case 'SAKIT': return 'bg-blue-100 text-blue-800';
      case 'IZIN': return 'bg-amber-100 text-amber-800';
      case 'ALPA': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <Wallet className="h-6 w-6" />
            </div>
            Tabungan Anggota
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Manajemen keuangan dan pencatatan tabungan rutin.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <>
              <button 
                onClick={exportToExcel}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white border border-green-600 px-4 py-2 rounded-xl shadow-sm transition-colors font-medium"
              >
                <Download className="h-5 w-5" />
                Export Excel
              </button>
              <button 
                onClick={openAddModal}
                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl shadow-sm transition-colors font-medium"
              >
                <Wallet className="h-5 w-5" />
                Input Tabungan
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500">
          <li className="mr-2">
            <button
              onClick={() => setActiveSemester(1)}
              className={`inline-flex items-center justify-center p-4 border-b-2 rounded-t-lg group transition-colors ${
                activeSemester === 1 
                  ? "text-primary-600 border-primary-600" 
                  : "border-transparent hover:text-gray-600 hover:border-gray-300"
              }`}
            >
              SEMESTER 1
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveSemester(2)}
              className={`inline-flex items-center justify-center p-4 border-b-2 rounded-t-lg group transition-colors ${
                activeSemester === 2 
                  ? "text-primary-600 border-primary-600" 
                  : "border-transparent hover:text-gray-600 hover:border-gray-300"
              }`}
            >
              SEMESTER 2
            </button>
          </li>
        </ul>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-slate-400">
            <thead className="text-xs text-gray-700 dark:text-slate-300 uppercase bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th scope="col" className="px-6 py-4">Tanggal Nabung</th>
                <th scope="col" className="px-6 py-4">Nama Anggota</th>
                <th scope="col" className="px-6 py-4">Kelas</th>
                <th scope="col" className="px-6 py-4">Presensi</th>
                <th scope="col" className="px-6 py-4 text-right">Jumlah Nabung</th>
                <th scope="col" className="px-6 py-4 text-right">Total Nabung</th>
                {isAdmin && <th scope="col" className="px-6 py-4 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse border-b">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-48"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-40"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24 ml-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28 ml-auto"></div></td>
                    {isAdmin && <td className="px-6 py-4"><div className="h-8 bg-gray-100 rounded w-16 mx-auto"></div></td>}
                  </tr>
                ))
              ) : dataKehadiran.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="px-6 py-8 text-center text-gray-500">
                    Belum ada data tabungan untuk Semester {activeSemester}.
                  </td>
                </tr>
              ) : (
                dataKehadiran.map((item) => {
                  const jumlah = item.jumlahNabung || 0;
                  const total = item.anggotaId ? (totalTabunganMap[item.anggotaId._id] || 0) : 0;
                  return (
                  <tr key={item._id} className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      {new Date(item.tanggal).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {item.anggotaId ? item.anggotaId.nama : "Anggota Dihapus"}
                    </td>
                    <td className="px-6 py-4">
                      {item.anggotaId ? item.anggotaId.kelas : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusBadgeColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-green-600 dark:text-green-400">
                      {formatRupiah(jumlah)}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                      {formatRupiah(total)}
                    </td>
                    {isAdmin && (
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
                    )}
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {isEditMode ? "Edit Tabungan" : "Input Tabungan"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-slate-300">Semester</label>
                    <select 
                      name="semester" 
                      value={formData.semester} 
                      onChange={handleInputChange}
                      className="input-field" 
                    >
                      <option value={1}>Semester 1</option>
                      <option value={2}>Semester 2</option>
                    </select>
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-slate-300">Tanggal Nabung</label>
                    <input 
                      type="date" 
                      name="tanggal" 
                      value={formData.tanggal} 
                      onChange={handleInputChange}
                      className="input-field" 
                      required 
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-slate-300">Nama Anggota</label>
                    <select 
                      name="anggotaId" 
                      value={formData.anggotaId} 
                      onChange={handleInputChange}
                      className="input-field" 
                      required
                    >
                      <option value="" disabled>-- Pilih Anggota --</option>
                      {anggotaList.map(anggota => (
                        <option key={anggota._id} value={anggota._id}>
                          {anggota.nama} ({anggota.kelas})
                        </option>
                      ))}
                    </select>
                    {anggotaList.length === 0 && (
                      <p className="mt-1 text-xs text-red-500">Anda belum memiliki data anggota.</p>
                    )}
                  </div>

                  <div className="col-span-1">
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-slate-300">Presensi</label>
                    <select 
                      name="status" 
                      value={formData.status} 
                      onChange={handleInputChange}
                      className="input-field font-medium" 
                    >
                      <option value="HADIR">HADIR</option>
                      <option value="SAKIT">SAKIT</option>
                      <option value="IZIN">IZIN</option>
                      <option value="ALPA">ALPA</option>
                    </select>
                  </div>

                  <div className="col-span-1">
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-slate-300">Jumlah Nabung (Rp)</label>
                    <input 
                      type="number" 
                      name="jumlahNabung" 
                      value={formData.jumlahNabung} 
                      onChange={handleInputChange}
                      className="input-field font-bold text-green-600 dark:text-green-500" 
                      min="0"
                      step="500"
                    />
                  </div>
                </div>

                <style jsx>{`
                  .input-field {
                    @apply bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none transition-shadow;
                  }
                `}</style>
              </div>
              
              <div className="p-4 border-t dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 flex justify-end gap-3 sticky bottom-0">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={anggotaList.length === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  {isEditMode ? "Simpan Perubahan" : "Simpan Tabungan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
