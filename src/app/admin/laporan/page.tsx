"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Printer, 
  Image as ImageIcon, 
  Upload, 
  Calendar, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Eye,
  X,
  ArrowUp,
  ArrowDown,
  RefreshCw
} from "lucide-react";
import LaporanPrintView, { LaporanItem } from "@/components/LaporanPrintView";

// Helper compression image to base64 canvas
const compressImage = (file: File, maxWidth = 1000, quality = 0.85): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function AdminLaporanPage() {
  const [laporanList, setLaporanList] = useState<LaporanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Custom Header Settings
  const [headerTitle1, setHeaderTitle1] = useState("LAMPIRAN KEGIATAN EKSTRAKURIKULER");
  const [headerTitle2, setHeaderTitle2] = useState("PRAMUKA BULAN AGUSTUS");
  const [headerTitle3, setHeaderTitle3] = useState("TAHUN PELAJARAN 2026-2027");

  // Edit Mode
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form inputs
  const [hariTanggal, setHariTanggal] = useState("");
  const [uraianKegiatan, setUraianKegiatan] = useState("");
  const [foto1, setFoto1] = useState("");
  const [foto2, setFoto2] = useState("");
  const [urutan, setUrutan] = useState(0);

  // Preview / Print Modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const foto1InputRef = useRef<HTMLInputElement>(null);
  const foto2InputRef = useRef<HTMLInputElement>(null);

  const fetchLaporan = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/laporan");
      const data = await res.json();
      if (data.laporan) {
        setLaporanList(data.laporan);
        if (data.laporan.length > 0) {
          setUrutan(data.laporan.length);
        }
      }
    } catch (error) {
      console.error("Gagal mengambil data laporan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporan();
  }, []);

  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, isFoto1: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedBase64 = await compressImage(file, 900, 0.82);
      if (isFoto1) {
        setFoto1(compressedBase64);
      } else {
        setFoto2(compressedBase64);
      }
    } catch (err) {
      console.error("Gagal kompresi foto:", err);
      setMessage({ type: "error", text: "Gagal memproses file foto" });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setHariTanggal("");
    setUraianKegiatan("");
    setFoto1("");
    setFoto2("");
    setUrutan(laporanList.length);
    if (foto1InputRef.current) foto1InputRef.current.value = "";
    if (foto2InputRef.current) foto2InputRef.current.value = "";
  };

  const handleStartEdit = (item: LaporanItem) => {
    if (!item._id) return;
    setEditingId(item._id);
    setHariTanggal(item.hariTanggal);
    setUraianKegiatan(item.uraianKegiatan);
    setFoto1(item.foto1 || "");
    setFoto2(item.foto2 || "");
    setUrutan(item.urutan || 0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hariTanggal || !uraianKegiatan) {
      setMessage({ type: "error", text: "Hari/Tanggal dan Uraian Kegiatan wajib diisi" });
      return;
    }

    setSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const payload = {
        hariTanggal,
        uraianKegiatan,
        foto1,
        foto2,
        bulan: headerTitle2.replace("PRAMUKA BULAN ", ""),
        tahunPelajaran: headerTitle3.replace("TAHUN PELAJARAN ", ""),
        urutan: Number(urutan) || 0,
      };

      let res;
      if (editingId) {
        res = await fetch(`/api/laporan/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/laporan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Terjadi kesalahan" });
      } else {
        setMessage({
          type: "success",
          text: editingId ? "Data kegiatan berhasil diperbarui!" : "Data kegiatan berhasil ditambahkan!",
        });
        resetForm();
        fetchLaporan();
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Gagal menyimpan data laporan" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data kegiatan ini?")) return;

    try {
      const res = await fetch(`/api/laporan/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage({ type: "success", text: "Data kegiatan berhasil dihapus!" });
        fetchLaporan();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Gagal menghapus" });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Terjadi kesalahan sistem" });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Hidden print-only view for direct window.print() */}
      <div className="hidden print:block">
        <LaporanPrintView
          headerTitle1={headerTitle1}
          headerTitle2={headerTitle2}
          headerTitle3={headerTitle3}
          items={laporanList}
        />
      </div>

      {/* Screen Only UI */}
      <div className="no-print space-y-6">
        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="h-7 w-7 text-primary-600" />
              Laporan Dokumentasi Kegiatan
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Input kegiatan ekstrakurikuler, uraian, foto dokumentasi, dan ekspor ke PDF A4 Landscape.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreviewModal(true)}
              className="inline-flex items-center px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
            >
              <Eye className="w-4 h-4 mr-2 text-blue-500" />
              Pratinjau
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-md transition-all transform active:scale-95"
            >
              <Printer className="w-4 h-4 mr-2" />
              CETAK PDF
            </button>
          </div>
        </div>

        {/* Global Alert Message */}
        {message.text && (
          <div
            className={`p-4 rounded-xl flex items-center justify-between border ${
              message.type === "error"
                ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                : "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === "error" ? (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
            <button onClick={() => setMessage({ type: "", text: "" })} className="p-1 hover:opacity-70">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Section: Header Title Settings */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary-600" />
            Pengaturan Header Dokumen Cetak
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Judul Laporan (Baris 1)
              </label>
              <input
                type="text"
                value={headerTitle1}
                onChange={(e) => setHeaderTitle1(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Bulan & Nama Sub-Judul (Baris 2)
              </label>
              <input
                type="text"
                value={headerTitle2}
                onChange={(e) => setHeaderTitle2(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Tahun Pelajaran (Baris 3)
              </label>
              <input
                type="text"
                value={headerTitle3}
                onChange={(e) => setHeaderTitle3(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Main Grid: Form Input + Table List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Input Section (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm space-y-4 sticky top-6">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  {editingId ? (
                    <>
                      <Edit3 className="h-5 w-5 mr-2 text-amber-500" /> Edit Data Kegiatan
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5 mr-2 text-primary-600" /> Input Kegiatan Baru
                    </>
                  )}
                </h2>
                {editingId && (
                  <button
                    onClick={resetForm}
                    className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-600 dark:text-gray-300 rounded-md font-medium"
                  >
                    Batal Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hari, Tanggal <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Contoh: Sabtu, 01 Agustus 2026"
                      required
                      value={hariTanggal}
                      onChange={(e) => setHariTanggal(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Uraian Kegiatan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tuliskan detail uraian kegiatan..."
                    required
                    value={uraianKegiatan}
                    onChange={(e) => setUraianKegiatan(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Foto 1 Input */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Foto Dokumentasi 1
                    </label>
                    <div className="space-y-2">
                      <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg p-2 text-center bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                        {foto1 ? (
                          <div className="relative group">
                            <img src={foto1} alt="Preview Foto 1" className="w-full h-24 object-cover rounded-md" />
                            <button
                              type="button"
                              onClick={() => setFoto1("")}
                              className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center justify-center py-2">
                            <Upload className="w-5 h-5 text-gray-400 mb-1" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">Pilih Foto 1</span>
                            <input
                              ref={foto1InputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFotoUpload(e, true)}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Foto 2 Input */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Foto Dokumentasi 2
                    </label>
                    <div className="space-y-2">
                      <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg p-2 text-center bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                        {foto2 ? (
                          <div className="relative group">
                            <img src={foto2} alt="Preview Foto 2" className="w-full h-24 object-cover rounded-md" />
                            <button
                              type="button"
                              onClick={() => setFoto2("")}
                              className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center justify-center py-2">
                            <Upload className="w-5 h-5 text-gray-400 mb-1" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">Pilih Foto 2</span>
                            <input
                              ref={foto2InputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFotoUpload(e, false)}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Menyimpan...
                    </>
                  ) : editingId ? (
                    <>
                      <Edit3 className="w-4 h-4" /> Update Kegiatan
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Simpan Kegiatan
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Table Preview & Management Section (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Daftar Kegiatan ({laporanList.length})
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Urutan kegiatan yang akan ditampilkan pada dokumen cetak A4.
                  </p>
                </div>
                <button
                  onClick={fetchLaporan}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
                  title="Refresh Data"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400">
                      <th className="p-3 font-medium w-12 text-center">No</th>
                      <th className="p-3 font-medium w-36">Hari, Tanggal</th>
                      <th className="p-3 font-medium">Uraian Kegiatan</th>
                      <th className="p-3 font-medium w-36 text-center">Dokumentasi</th>
                      <th className="p-3 font-medium w-24 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-gray-500">
                          Memuat data laporan...
                        </td>
                      </tr>
                    ) : laporanList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500">
                          Belum ada data kegiatan. Silakan tambahkan kegiatan di form sebelah kiri.
                        </td>
                      </tr>
                    ) : (
                      laporanList.map((item, index) => (
                        <tr
                          key={item._id || index}
                          className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50/80 dark:hover:bg-slate-800/50 transition-colors align-top"
                        >
                          <td className="p-3 text-center font-semibold text-gray-700 dark:text-slate-300">
                            {index + 1}.
                          </td>
                          <td className="p-3 font-medium text-gray-900 dark:text-white">
                            {item.hariTanggal}
                          </td>
                          <td className="p-3 text-gray-600 dark:text-slate-300 whitespace-pre-wrap">
                            {item.uraianKegiatan}
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {item.foto1 ? (
                                <img
                                  src={item.foto1}
                                  alt="Foto 1"
                                  className="w-10 h-10 object-cover rounded border border-gray-200 dark:border-slate-700"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-100 dark:bg-slate-800 rounded border border-dashed border-gray-300 dark:border-slate-700 flex items-center justify-center text-[10px] text-gray-400">
                                  No img
                                </div>
                              )}
                              {item.foto2 ? (
                                <img
                                  src={item.foto2}
                                  alt="Foto 2"
                                  className="w-10 h-10 object-cover rounded border border-gray-200 dark:border-slate-700"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-100 dark:bg-slate-800 rounded border border-dashed border-gray-300 dark:border-slate-700 flex items-center justify-center text-[10px] text-gray-400">
                                  No img
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleStartEdit(item)}
                                className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-md transition-colors"
                                title="Edit"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => item._id && handleDelete(item._id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
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
        </div>
      </div>

      {/* Modal Preview Printable Document A4 Landscape */}
      {showPreviewModal && (
        <div className="no-print print:hidden fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-5xl w-full my-8 overflow-hidden border border-gray-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between bg-gray-50 dark:bg-slate-800">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary-600" /> Pratinjau Dokumen Cetak (A4 Landscape)
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-4 h-4" /> CETAK PDF
                </button>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto bg-gray-200 dark:bg-slate-950 flex justify-center">
              <div className="bg-white text-black shadow-lg rounded-sm w-full max-w-[1000px] border border-gray-300">
                <LaporanPrintView
                  headerTitle1={headerTitle1}
                  headerTitle2={headerTitle2}
                  headerTitle3={headerTitle3}
                  items={laporanList}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
