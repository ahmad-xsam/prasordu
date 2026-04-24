"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, CalendarCheck, Download } from "lucide-react";
import * as XLSX from "xlsx-js-style";

type Anggota = {
  _id: string;
  nama: string;
  kelas: string;
};

type Kehadiran = {
  _id: string;
  tanggal: string;
  anggotaId: Anggota; // Populated from API
  status: string;
  semester: number;
};

export default function DaftarHadir() {
  const [activeSemester, setActiveSemester] = useState<number>(1);
  const [dataKehadiran, setDataKehadiran] = useState<Kehadiran[]>([]);
  const [anggotaList, setAnggotaList] = useState<Anggota[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [formData, setFormData] = useState({
    _id: "",
    tanggal: new Date().toISOString().split('T')[0],
    anggotaId: "",
    status: "HADIR",
    semester: 1,
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

  useEffect(() => {
    fetchAnggota();
  }, []);

  useEffect(() => {
    fetchKehadiran(activeSemester);
  }, [activeSemester]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({ 
      _id: "", 
      tanggal: new Date().toISOString().split('T')[0], 
      anggotaId: anggotaList.length > 0 ? anggotaList[0]._id : "", 
      status: "HADIR",
      semester: activeSemester 
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
      // Ensure semester is sent as number
      const bodyData = isEditMode 
        ? { ...formData, semester: Number(formData.semester) } 
        : { ...submitData, semester: Number(submitData.semester) };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });
      const result = await res.json();
      if (result.success) {
        setIsModalOpen(false);
        fetchKehadiran(activeSemester);
      } else {
        alert("Gagal menyimpan data presensi");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data presensi ini?")) return;
    
    try {
      const res = await fetch(`/api/kehadiran/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        fetchKehadiran(activeSemester);
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

    // Prepare the Array of Arrays (AoA) for the Excel sheet
    const aoa: any[][] = [];

    // Title Rows
    aoa.push(["DAFTAR HADIR EKSTRAKURIKULER PRAMUKA", "", "", "", "", ""]);
    aoa.push(["SMP NEGERI 2 SOREANG", "", "", "", "", ""]);
    aoa.push(["TAHUN PELAJARAN ...........", "", "", "", "", ""]);
    aoa.push([]); // Empty Row
    aoa.push([`SEMESTER ${activeSemester}`, "", "", "", "", ""]);
    aoa.push([]); // Empty Row

    // Table Headers
    const headers = ["No", "Tanggal", "Nama Anggota", "Kelas", "Presensi", "Tanda Tangan"];
    aoa.push(headers);

    // Data Rows
    dataKehadiran.forEach((item, index) => {
      const tanggal = new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      const nama = item.anggotaId ? item.anggotaId.nama : "Anggota Dihapus";
      const kelas = item.anggotaId ? item.anggotaId.kelas : "-";
      
      aoa.push([index + 1, tanggal, nama, kelas, item.status, ""]);
    });

    // Empty rows after data
    aoa.push([]);
    aoa.push([]);

    // Signature Block
    aoa.push(["Pembina Gudep", "", "", "", "Pratama Putra,", ""]);
    aoa.push(["04-000,", "", "", "", "", ""]);
    aoa.push([]);
    aoa.push([]);
    aoa.push(["Ahmad Samsudin, S.T.", "", "", "", "____________________", ""]);
    aoa.push([]);
    aoa.push(["*) Daftar Hadir ini menggunakan Aplikasi Prasordu", "", "", "", "", ""]);

    // Create workbook and worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(aoa);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Presensi");

    // Merges
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, // Title 1
      { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } }, // Title 2
      { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } }, // Title 3
      { s: { r: 4, c: 0 }, e: { r: 4, c: 1 } }, // Semester Box
    ];

    // Styles
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

    // Apply styles to Titles
    for (let r = 0; r <= 2; r++) {
      const cellRef = XLSX.utils.encode_cell({ r, c: 0 });
      if (!worksheet[cellRef]) worksheet[cellRef] = { t: 's', v: '' };
      worksheet[cellRef].s = centerBoldStyle;
    }

    // Apply styles to Semester Box
    for (let c = 0; c <= 1; c++) {
       const cellRef = XLSX.utils.encode_cell({ r: 4, c });
       if (!worksheet[cellRef]) worksheet[cellRef] = { t: 's', v: '' };
       worksheet[cellRef].s = { font: { bold: true }, border: borderAll };
    }

    // Apply styles to Headers
    for (let c = 0; c < 6; c++) {
      const cellRef = XLSX.utils.encode_cell({ r: 6, c });
      if (worksheet[cellRef]) worksheet[cellRef].s = headerStyle;
    }

    // Apply styles to Data rows
    for (let r = 7; r < 7 + dataKehadiran.length; r++) {
      for (let c = 0; c < 6; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c });
        if (!worksheet[cellRef]) worksheet[cellRef] = { t: 's', v: '' }; // Ensure empty cells exist for borders
        
        let align = "center";
        if (c === 2) align = "left"; // Nama Anggota
        
        worksheet[cellRef].s = {
          alignment: { horizontal: align, vertical: "center" },
          border: borderAll
        };
      }
    }

    // Set Column Widths
    worksheet['!cols'] = [
      { wch: 5 },  // No
      { wch: 20 }, // Tanggal
      { wch: 30 }, // Nama Anggota
      { wch: 15 }, // Kelas
      { wch: 15 }, // Presensi
      { wch: 20 }  // Tanda Tangan
    ];

    XLSX.writeFile(workbook, `Daftar_Hadir_Semester_${activeSemester}.xlsx`);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Hadir</h1>
          <p className="text-gray-500 mt-1">Kelola presensi anggota per semester.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white border border-green-600 px-4 py-2 rounded-lg shadow-sm transition-colors font-medium"
          >
            <Download className="h-5 w-5" />
            Export Excel
          </button>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors font-medium"
          >
            <CalendarCheck className="h-5 w-5" />
            Input Kehadiran
          </button>
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

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th scope="col" className="px-6 py-4">Tanggal</th>
                <th scope="col" className="px-6 py-4">Nama Anggota</th>
                <th scope="col" className="px-6 py-4">Kelas</th>
                <th scope="col" className="px-6 py-4">Presensi</th>
                <th scope="col" className="px-6 py-4 text-center">Aksi</th>
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
                    <td className="px-6 py-4"><div className="h-8 bg-gray-100 rounded w-16 mx-auto"></div></td>
                  </tr>
                ))
              ) : dataKehadiran.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Belum ada data kehadiran untuk Semester {activeSemester}.
                  </td>
                </tr>
              ) : (
                dataKehadiran.map((item) => (
                  <tr key={item._id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {new Date(item.tanggal).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
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
                {isEditMode ? "Edit Presensi" : "Input Kehadiran"}
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
                <label className="block mb-2 text-sm font-medium text-gray-900">Semester</label>
                <select 
                  name="semester" 
                  value={formData.semester} 
                  onChange={handleInputChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none" 
                >
                  <option value={1}>Semester 1</option>
                  <option value={2}>Semester 2</option>
                </select>
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">Tanggal Kehadiran</label>
                <input 
                  type="date" 
                  name="tanggal" 
                  value={formData.tanggal} 
                  onChange={handleInputChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none" 
                  required 
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">Nama Anggota</label>
                <select 
                  name="anggotaId" 
                  value={formData.anggotaId} 
                  onChange={handleInputChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none" 
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
                  <p className="mt-1 text-xs text-red-500">Anda belum memiliki data anggota. Silakan tambahkan di menu Keanggotaan.</p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">Presensi</label>
                <select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleInputChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none font-medium" 
                >
                  <option value="HADIR">HADIR</option>
                  <option value="SAKIT">SAKIT</option>
                  <option value="IZIN">IZIN</option>
                  <option value="ALPA">ALPA</option>
                </select>
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
                  disabled={anggotaList.length === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed"
                >
                  {isEditMode ? "Simpan Perubahan" : "Simpan Kehadiran"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
