"use client";

import { useState, useEffect } from "react";
import { Edit, Trash2, X, Plus, Download } from "lucide-react";
import * as XLSX from "xlsx-js-style";

type Inventaris = {
  _id: string;
  namaBarang: string;
  merkType: string;
  kodeBarang: string;
  jumlah: number;
  harga: number;
  pengadaan: string;
  kondisi: string;
};

export default function DaftarInventaris() {
  const [dataInventaris, setDataInventaris] = useState<Inventaris[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [formData, setFormData] = useState({
    _id: "",
    namaBarang: "",
    merkType: "",
    kodeBarang: "",
    jumlah: 0,
    harga: 0,
    pengadaan: "",
    kondisi: "",
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/inventaris");
      const result = await res.json();
      if (result.success) {
        setDataInventaris(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch inventaris:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({
      _id: "",
      namaBarang: "",
      merkType: "",
      kodeBarang: "",
      jumlah: 0,
      harga: 0,
      pengadaan: "",
      kondisi: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: Inventaris) => {
    setIsEditMode(true);
    setFormData({
      _id: item._id,
      namaBarang: item.namaBarang,
      merkType: item.merkType,
      kodeBarang: item.kodeBarang,
      jumlah: item.jumlah,
      harga: item.harga,
      pengadaan: item.pengadaan,
      kondisi: item.kondisi,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = isEditMode ? `/api/inventaris/${formData._id}` : "/api/inventaris";
    const method = isEditMode ? "PUT" : "POST";

    try {
      const { _id, ...submitData } = formData;
      const bodyData = isEditMode 
        ? { ...formData, jumlah: Number(formData.jumlah), harga: Number(formData.harga) }
        : { ...submitData, jumlah: Number(submitData.jumlah), harga: Number(submitData.harga) };

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
        alert("Gagal menyimpan data inventaris");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data inventaris ini?")) return;
    
    try {
      const res = await fetch(`/api/inventaris/${id}`, { method: "DELETE" });
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

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const exportToExcel = () => {
    if (dataInventaris.length === 0) {
      alert("Tidak ada data untuk diexport");
      return;
    }

    const aoa: any[][] = [];

    // Title Row
    aoa.push(["4. Daftar Inventaris Gugusdepan", "", "", "", "", "", "", ""]);
    aoa.push([]);

    // Headers
    const headers = ["No", "Nama Barang", "Merk / Type", "Kode Barang", "Jumlah Barang", "Harga", "Cara / Tgl Pengadaan", "Kondisi / Ket"];
    aoa.push(headers);
    
    // Numbers below headers
    aoa.push([1, 2, 3, 4, 5, 6, 7, 8]);

    // Data Rows
    dataInventaris.forEach((item, index) => {
      aoa.push([
        index + 1,
        item.namaBarang,
        item.merkType,
        item.kodeBarang,
        item.jumlah,
        item.harga,
        item.pengadaan,
        item.kondisi
      ]);
    });

    // Signature Block
    aoa.push([]);
    aoa.push([]);
    aoa.push(["", "", "", "", "", "", "......................, .....................", ""]);
    aoa.push(["", "", "", "", "", "", "Pembina Gugus Depan,", ""]);
    aoa.push([]);
    aoa.push([]);
    aoa.push(["", "", "", "", "", "", "( ..................................... )", ""]);

    const worksheet = XLSX.utils.aoa_to_sheet(aoa);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Daftar Inventaris");

    // Styles
    const borderAll = {
      top: { style: "thin", color: { auto: 1 } },
      bottom: { style: "thin", color: { auto: 1 } },
      left: { style: "thin", color: { auto: 1 } },
      right: { style: "thin", color: { auto: 1 } }
    };

    const boldCenter = {
      font: { bold: true },
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      border: borderAll
    };

    // Apply Styles
    // Title
    const titleRef = XLSX.utils.encode_cell({ r: 0, c: 0 });
    worksheet[titleRef].s = { font: { bold: true, sz: 12 }, alignment: { horizontal: "left" } };

    // Headers & Numbers
    for (let r = 2; r <= 3; r++) {
      for (let c = 0; c < 8; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c });
        if (!worksheet[cellRef]) worksheet[cellRef] = { t: 's', v: '' };
        worksheet[cellRef].s = boldCenter;
      }
    }

    // Data rows
    for (let r = 4; r < 4 + dataInventaris.length; r++) {
      for (let c = 0; c < 8; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c });
        if (!worksheet[cellRef]) worksheet[cellRef] = { t: 's', v: '' };
        
        let align = "center";
        if (c === 1 || c === 2 || c === 3 || c === 6 || c === 7) align = "left"; 
        
        worksheet[cellRef].s = {
          alignment: { horizontal: align, vertical: "center", wrapText: true },
          border: borderAll
        };
      }
    }

    // Signature Block Align Center
    for (let r = 4 + dataInventaris.length + 2; r <= 4 + dataInventaris.length + 6; r++) {
      const cellRef = XLSX.utils.encode_cell({ r, c: 6 });
      if (worksheet[cellRef]) {
        worksheet[cellRef].s = { alignment: { horizontal: "center" } };
      }
    }

    // Merges for signature block to span col 6 & 7 if needed, but we placed it in col 6.
    worksheet['!merges'] = [
      { s: { r: 4 + dataInventaris.length + 2, c: 6 }, e: { r: 4 + dataInventaris.length + 2, c: 7 } },
      { s: { r: 4 + dataInventaris.length + 3, c: 6 }, e: { r: 4 + dataInventaris.length + 3, c: 7 } },
      { s: { r: 4 + dataInventaris.length + 6, c: 6 }, e: { r: 4 + dataInventaris.length + 6, c: 7 } },
    ];

    // Column Widths
    worksheet['!cols'] = [
      { wch: 5 },  // No
      { wch: 25 }, // Nama Barang
      { wch: 20 }, // Merk / Type
      { wch: 15 }, // Kode Barang
      { wch: 15 }, // Jumlah Barang
      { wch: 15 }, // Harga
      { wch: 25 }, // Cara / Tgl Pengadaan
      { wch: 20 }  // Kondisi / Ket
    ];

    XLSX.writeFile(workbook, `Daftar_Inventaris.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Inventaris</h1>
          <p className="text-gray-500 mt-1">Kelola data inventaris gugus depan.</p>
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
            <Plus className="h-5 w-5" />
            Input Inventaris
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th scope="col" className="px-6 py-4">No</th>
                <th scope="col" className="px-6 py-4">Nama Barang</th>
                <th scope="col" className="px-6 py-4">Merk / Type</th>
                <th scope="col" className="px-6 py-4">Kode Barang</th>
                <th scope="col" className="px-6 py-4">Jumlah</th>
                <th scope="col" className="px-6 py-4">Harga</th>
                <th scope="col" className="px-6 py-4">Pengadaan</th>
                <th scope="col" className="px-6 py-4">Kondisi / Ket</th>
                <th scope="col" className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    Memuat data inventaris...
                  </td>
                </tr>
              ) : dataInventaris.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    Belum ada data inventaris.
                  </td>
                </tr>
              ) : (
                dataInventaris.map((item, index) => (
                  <tr key={item._id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{item.namaBarang}</td>
                    <td className="px-6 py-4">{item.merkType}</td>
                    <td className="px-6 py-4 font-mono">{item.kodeBarang}</td>
                    <td className="px-6 py-4">{item.jumlah}</td>
                    <td className="px-6 py-4 font-medium">{formatRupiah(item.harga)}</td>
                    <td className="px-6 py-4">{item.pengadaan}</td>
                    <td className="px-6 py-4">{item.kondisi}</td>
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm overflow-y-auto pt-20 pb-20">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden my-auto">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {isEditMode ? "Edit Inventaris" : "Input Inventaris"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">Nama Barang</label>
                  <input 
                    type="text" 
                    name="namaBarang" 
                    value={formData.namaBarang} 
                    onChange={handleInputChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none" 
                    required 
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">Merk / Type</label>
                  <input 
                    type="text" 
                    name="merkType" 
                    value={formData.merkType} 
                    onChange={handleInputChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none" 
                    required 
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">Kode Barang</label>
                  <input 
                    type="text" 
                    name="kodeBarang" 
                    value={formData.kodeBarang} 
                    onChange={handleInputChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none" 
                    required 
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">Jumlah Barang</label>
                  <input 
                    type="number" 
                    name="jumlah" 
                    value={formData.jumlah} 
                    onChange={handleInputChange}
                    min="0"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none" 
                    required 
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">Harga (Rp)</label>
                  <input 
                    type="number" 
                    name="harga" 
                    value={formData.harga} 
                    onChange={handleInputChange}
                    min="0"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none" 
                    required 
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">Kondisi / Keterangan</label>
                  <input 
                    type="text" 
                    name="kondisi" 
                    value={formData.kondisi} 
                    onChange={handleInputChange}
                    placeholder="Baik / Rusak / Hilang"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none" 
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">Cara / Tanggal Pengadaan</label>
                <input 
                  type="text" 
                  name="pengadaan" 
                  value={formData.pengadaan} 
                  onChange={handleInputChange}
                  placeholder="Misal: Beli Sendiri / 12-08-2023"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none" 
                  required 
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
                  {isEditMode ? "Simpan Perubahan" : "Simpan Inventaris"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
