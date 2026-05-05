"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Search, Download } from "lucide-react";
import { useSession } from "next-auth/react";
import * as XLSX from "xlsx-js-style";

type Anggota = {
  _id: string;
  nta?: string;
  nama: string;
  jenisKelamin: 'Putra' | 'Putri';
  tempatLahir: string;
  tanggalLahir: string;
  agama: string;
  kelas: string;
  jabatan: string;
  namaOrangtua: string;
  pekerjaanOrangtua: string;
  alamat: string;
  tanggalMasuk: string;
  keterangan?: string;
};

export default function Keanggotaan() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  const [data, setData] = useState<Anggota[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const initialFormData = {
    _id: "",
    nta: "",
    nama: "",
    jenisKelamin: "Putra",
    tempatLahir: "",
    tanggalLahir: "",
    agama: "Islam",
    kelas: "",
    jabatan: "",
    namaOrangtua: "",
    pekerjaanOrangtua: "",
    alamat: "",
    tanggalMasuk: new Date().toISOString().split('T')[0],
    keterangan: "",
  };

  const [formData, setFormData] = useState(initialFormData);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (anggota: Anggota) => {
    setIsEditMode(true);
    setFormData({
      _id: anggota._id,
      nta: anggota.nta || "",
      nama: anggota.nama,
      jenisKelamin: anggota.jenisKelamin || "Putra",
      tempatLahir: anggota.tempatLahir || "",
      tanggalLahir: anggota.tanggalLahir ? new Date(anggota.tanggalLahir).toISOString().split('T')[0] : "",
      agama: anggota.agama || "Islam",
      kelas: anggota.kelas,
      jabatan: anggota.jabatan,
      namaOrangtua: anggota.namaOrangtua || "",
      pekerjaanOrangtua: anggota.pekerjaanOrangtua || "",
      alamat: anggota.alamat || "",
      tanggalMasuk: anggota.tanggalMasuk ? new Date(anggota.tanggalMasuk).toISOString().split('T')[0] : "",
      keterangan: anggota.keterangan || "",
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

  const exportToExcel = (anggotaList: Anggota[], title: string, filename: string) => {
    const wb = XLSX.utils.book_new();

    // 1. Create headers
    // Title rows
    const wsData = [
      [{ v: "DAFTAR INDUK ANGGOTA GUGUS DEPAN", s: { font: { bold: true }, alignment: { horizontal: "center" } } }],
      [{ v: "GERAKAN PRAMUKA SMPN 2 SOREANG", s: { font: { bold: true }, alignment: { horizontal: "center" } } }],
      [],
    ];

    // Header styling
    const headerStyle = {
      font: { bold: true },
      alignment: { horizontal: "center", vertical: "center" },
      fill: { fgColor: { rgb: "FF0000" } }, // Red background
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" }
      }
    };

    // Table Header Row 1 (Merges)
    const headerRow1 = [
      { v: "NO", s: headerStyle },
      { v: "NTA", s: headerStyle },
      { v: "NAMA LENGKAP", s: headerStyle },
      { v: "TEMPAT TANGGAL LAHIR", s: headerStyle },
      { v: "", s: headerStyle },
      { v: "", s: headerStyle },
      { v: "", s: headerStyle },
      { v: "AGAMA", s: headerStyle },
      { v: "Orangtua/ Wali", s: headerStyle },
      { v: "Pekerjaan Orangtua/wali", s: headerStyle },
      { v: "Alamat", s: headerStyle },
      { v: "Tanggal Masuk", s: headerStyle },
      { v: "Keterangan", s: headerStyle },
    ];
    wsData.push(headerRow1);

    // Table Header Row 2 (Sub-headers for Tempat Tanggal Lahir)
    const headerRow2 = [
      { v: "", s: headerStyle },
      { v: "", s: headerStyle },
      { v: "", s: headerStyle },
      { v: "Tempat", s: headerStyle },
      { v: "Tgl", s: headerStyle },
      { v: "Bulan", s: headerStyle },
      { v: "Tahun", s: headerStyle },
      { v: "", s: headerStyle },
      { v: "", s: headerStyle },
      { v: "", s: headerStyle },
      { v: "", s: headerStyle },
      { v: "", s: headerStyle },
      { v: "", s: headerStyle },
    ];
    wsData.push(headerRow2);

    // Data style
    const dataStyle = {
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" }
      }
    };
    
    const centerDataStyle = {
      ...dataStyle,
      alignment: { horizontal: "center" }
    };

    // Data rows
    anggotaList.forEach((anggota, index) => {
      const tanggalLahir = anggota.tanggalLahir ? new Date(anggota.tanggalLahir) : null;
      let tgl = "", bln = "", thn = "";
      if (tanggalLahir) {
        tgl = tanggalLahir.getDate().toString();
        // Month names in Indonesian
        const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        bln = monthNames[tanggalLahir.getMonth()];
        thn = tanggalLahir.getFullYear().toString();
      }

      const tanggalMasukFormatted = anggota.tanggalMasuk ? new Date(anggota.tanggalMasuk).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }) : "";

      wsData.push([
        { v: index + 1, s: centerDataStyle },
        { v: anggota.nta || "", s: centerDataStyle },
        { v: anggota.nama, s: dataStyle },
        { v: anggota.tempatLahir || "", s: dataStyle },
        { v: tgl, s: centerDataStyle },
        { v: bln, s: centerDataStyle },
        { v: thn, s: centerDataStyle },
        { v: anggota.agama || "", s: centerDataStyle },
        { v: anggota.namaOrangtua || "", s: dataStyle },
        { v: anggota.pekerjaanOrangtua || "", s: dataStyle },
        { v: anggota.alamat || "", s: dataStyle },
        { v: tanggalMasukFormatted, s: centerDataStyle },
        { v: anggota.keterangan || "", s: dataStyle },
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Merges
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 12 } }, // Title 1
      { s: { r: 1, c: 0 }, e: { r: 1, c: 12 } }, // Title 2
      { s: { r: 3, c: 0 }, e: { r: 4, c: 0 } }, // NO
      { s: { r: 3, c: 1 }, e: { r: 4, c: 1 } }, // NTA
      { s: { r: 3, c: 2 }, e: { r: 4, c: 2 } }, // NAMA LENGKAP
      { s: { r: 3, c: 3 }, e: { r: 3, c: 6 } }, // TEMPAT TANGGAL LAHIR
      { s: { r: 3, c: 7 }, e: { r: 4, c: 7 } }, // AGAMA
      { s: { r: 3, c: 8 }, e: { r: 4, c: 8 } }, // Orangtua/ Wali
      { s: { r: 3, c: 9 }, e: { r: 4, c: 9 } }, // Pekerjaan Orangtua/wali
      { s: { r: 3, c: 10 }, e: { r: 4, c: 10 } }, // Alamat
      { s: { r: 3, c: 11 }, e: { r: 4, c: 11 } }, // Tanggal Masuk
      { s: { r: 3, c: 12 }, e: { r: 4, c: 12 } }, // Keterangan
    ];

    // Column widths
    ws['!cols'] = [
      { wch: 5 },  // NO
      { wch: 15 }, // NTA
      { wch: 30 }, // NAMA LENGKAP
      { wch: 15 }, // Tempat
      { wch: 5 },  // Tgl
      { wch: 12 }, // Bulan
      { wch: 8 },  // Tahun
      { wch: 12 }, // AGAMA
      { wch: 20 }, // Orangtua/ Wali
      { wch: 20 }, // Pekerjaan
      { wch: 30 }, // Alamat
      { wch: 20 }, // Tanggal Masuk
      { wch: 15 }, // Keterangan
    ];

    // Add signature area
    const rowOffset = wsData.length + 3;
    XLSX.utils.sheet_add_aoa(ws, [
      [title === 'Putri' ? "Pembina Putri," : "Pembina Putra,", "", "", "", "", "", "", "", "Pratama " + title + ","],
      [],
      [],
      [],
      [".....................................", "", "", "", "", "", "", "", "....................................."]
    ], { origin: -1 });


    XLSX.utils.book_append_sheet(wb, ws, `Data Anggota ${title}`);
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const filteredData = data.filter(item => 
    item.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const anggotaPutra = filteredData.filter(item => item.jenisKelamin === 'Putra' || !item.jenisKelamin); // fallback default Putra if undefined
  const anggotaPutri = filteredData.filter(item => item.jenisKelamin === 'Putri');

  const TableAnggota = ({ title, anggotaList }: { title: string, anggotaList: Anggota[] }) => (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Data Anggota {title}</h2>
        <button 
          onClick={() => exportToExcel(anggotaList, title, `Data_Anggota_${title}`)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded shadow-sm transition-colors text-sm font-medium"
        >
          <Download className="h-4 w-4" />
          Export Excel {title}
        </button>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-slate-400">
            <thead className="text-xs text-gray-700 dark:text-slate-300 uppercase bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th scope="col" className="px-4 py-3">No</th>
                <th scope="col" className="px-4 py-3">NTA</th>
                <th scope="col" className="px-4 py-3">Nama Lengkap</th>
                <th scope="col" className="px-4 py-3">Tempat, Tanggal Lahir</th>
                <th scope="col" className="px-4 py-3">Kelas / Jabatan</th>
                <th scope="col" className="px-4 py-3">Agama</th>
                <th scope="col" className="px-4 py-3">Alamat</th>
                <th scope="col" className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse border-b">
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-4"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    <td className="px-4 py-3"><div className="h-8 bg-gray-100 rounded w-16 mx-auto"></div></td>
                  </tr>
                ))
              ) : anggotaList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                    Belum ada data anggota {title}.
                  </td>
                </tr>
              ) : (
                anggotaList.map((item, index) => (
                  <tr key={item._id} className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{index + 1}</td>
                    <td className="px-4 py-3">{item.nta || '-'}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{item.nama}</td>
                    <td className="px-4 py-3">
                      {item.tempatLahir}, {item.tanggalLahir ? new Date(item.tanggalLahir).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className="w-max bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
                          {item.kelas}
                        </span>
                        <span className="text-xs text-gray-500">{item.jabatan}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{item.agama}</td>
                    <td className="px-4 py-3 truncate max-w-[150px]" title={item.alamat}>{item.alamat}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => openEditModal(item)} className="text-amber-500 hover:text-amber-600 transition-colors" title="Edit">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-600 transition-colors" title="Hapus">
                          <Trash2 className="h-4 w-4" />
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
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <img src="/logo_prasordu.png?v=2" alt="Logo" className="h-10 w-auto" />
            Data Keanggotaan
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Kelola daftar anggota, klasifikasi Putra/Putri, dan administrasi.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 outline-none" 
              placeholder="Cari nama anggota..." 
            />
          </div>
          <button 
            onClick={openAddModal}
            className="flex justify-center items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors font-medium whitespace-nowrap"
          >
            <Plus className="h-5 w-5" />
            Tambah Anggota
          </button>
        </div>
      </div>

      <TableAnggota title="Putra" anggotaList={anggotaPutra} />
      <TableAnggota title="Putri" anggotaList={anggotaPutri} />

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-3xl my-8 overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {isEditMode ? "Edit Anggota" : "Tambah Anggota Baru"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Informasi Dasar */}
                <div className="space-y-4 md:col-span-2">
                  <h4 className="font-semibold text-gray-700 dark:text-slate-300 border-b dark:border-slate-800 pb-2">Informasi Dasar</h4>
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-slate-300">NTA (Nomor Tanda Anggota)</label>
                  <input type="text" name="nta" value={formData.nta} onChange={handleInputChange} className="input-field" placeholder="Opsional" />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-slate-300">Nama Lengkap *</label>
                  <input type="text" name="nama" value={formData.nama} onChange={handleInputChange} className="input-field" required placeholder="Masukkan nama lengkap" />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-slate-300">Jenis Kelamin *</label>
                  <select name="jenisKelamin" value={formData.jenisKelamin} onChange={handleInputChange} className="input-field" required>
                    <option value="Putra">Putra</option>
                    <option value="Putri">Putri</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-slate-300">Agama *</label>
                  <select name="agama" value={formData.agama} onChange={handleInputChange} className="input-field" required>
                    <option value="Islam">Islam</option>
                    <option value="Kristen Protestan">Kristen Protestan</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Konghucu">Konghucu</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-slate-300">Tempat Lahir *</label>
                  <input type="text" name="tempatLahir" value={formData.tempatLahir} onChange={handleInputChange} className="input-field" required placeholder="Kota tempat lahir" />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-slate-300">Tanggal Lahir *</label>
                  <input type="date" name="tanggalLahir" value={formData.tanggalLahir} onChange={handleInputChange} className="input-field" required />
                </div>

                {/* Kepramukaan */}
                <div className="space-y-4 md:col-span-2 mt-4">
                  <h4 className="font-semibold text-gray-700 dark:text-slate-300 border-b dark:border-slate-800 pb-2">Data Kepramukaan</h4>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-slate-300">Kelas *</label>
                  <input type="text" name="kelas" value={formData.kelas} onChange={handleInputChange} className="input-field" required placeholder="Contoh: VII A" />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-slate-300">Jabatan *</label>
                  <input type="text" name="jabatan" value={formData.jabatan} onChange={handleInputChange} className="input-field" required placeholder="Contoh: Ketua Regu, Anggota" />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-slate-300">Tanggal Masuk *</label>
                  <input type="date" name="tanggalMasuk" value={formData.tanggalMasuk} onChange={handleInputChange} className="input-field" required />
                </div>

                {/* Informasi Tambahan */}
                <div className="space-y-4 md:col-span-2 mt-4">
                  <h4 className="font-semibold text-gray-700 dark:text-slate-300 border-b dark:border-slate-800 pb-2">Informasi Tambahan</h4>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-slate-300">Nama Orangtua / Wali *</label>
                  <input type="text" name="namaOrangtua" value={formData.namaOrangtua} onChange={handleInputChange} className="input-field" required placeholder="Nama Ayah/Ibu/Wali" />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-slate-300">Pekerjaan Orangtua / Wali *</label>
                  <input type="text" name="pekerjaanOrangtua" value={formData.pekerjaanOrangtua} onChange={handleInputChange} className="input-field" required placeholder="Pekerjaan" />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-slate-300">Alamat Lengkap *</label>
                  <textarea name="alamat" value={formData.alamat} onChange={handleInputChange} className="input-field min-h-[80px]" required placeholder="Alamat tempat tinggal"></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-slate-300">Keterangan Tambahan</label>
                  <textarea name="keterangan" value={formData.keterangan} onChange={handleInputChange} className="input-field min-h-[60px]" placeholder="Opsional"></textarea>
                </div>
              </div>
              
              {/* CSS Class helper for inputs inside this component */}
              <style jsx>{`
                .input-field {
                  @apply bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none;
                }
              `}</style>
              
            </form>
            
            <div className="p-4 border-t dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 flex justify-end gap-3 sticky bottom-0">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                Batal
              </button>
              <button 
                onClick={handleSubmit}
                type="submit" 
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
              >
                {isEditMode ? "Simpan Perubahan" : "Tambah Data"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
