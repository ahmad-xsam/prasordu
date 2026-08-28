"use client";

import React from "react";

export interface LaporanItem {
  _id?: string;
  hariTanggal: string;
  uraianKegiatan: string;
  foto1?: string;
  foto2?: string;
  bulan?: string;
  tahunPelajaran?: string;
  urutan?: number;
}

interface LaporanPrintViewProps {
  headerTitle1?: string;
  headerTitle2?: string;
  headerTitle3?: string;
  items: LaporanItem[];
}

export default function LaporanPrintView({
  headerTitle1 = "LAMPIRAN KEGIATAN EKSTRAKURIKULER",
  headerTitle2 = "PRAMUKA BULAN AGUSTUS",
  headerTitle3 = "TAHUN PELAJARAN 2026-2027",
  items,
}: LaporanPrintViewProps) {
  return (
    <div className="laporan-print-container bg-white text-black p-4 sm:p-8 font-serif leading-relaxed">
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 12mm 10mm 12mm 10mm;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
            font-family: "Times New Roman", Times, serif !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .laporan-print-container {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          th, td {
            border: 1.5px solid #000000 !important;
          }
        }
      `}</style>

      {/* Header Laporan */}
      <div className="text-center mb-6 uppercase tracking-wide font-bold">
        <h1 className="text-lg sm:text-xl font-bold tracking-wider mb-1">{headerTitle1}</h1>
        <h2 className="text-base sm:text-lg font-bold tracking-wider mb-1">{headerTitle2}</h2>
        <h3 className="text-base sm:text-lg font-bold tracking-wider">{headerTitle3}</h3>
      </div>

      {/* Tabel Laporan Kegiatan A4 Landscape */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border-2 border-black text-sm text-black">
          <thead>
            <tr className="bg-gray-50 dark:bg-white text-black border-b-2 border-black">
              <th className="border-2 border-black p-2.5 text-center font-bold w-[6%] align-middle">
                No
              </th>
              <th className="border-2 border-black p-2.5 text-center font-bold w-[22%] align-middle">
                Hari, Tanggal
              </th>
              <th className="border-2 border-black p-2.5 text-center font-bold w-[32%] align-middle">
                Uraian Kegiatan
              </th>
              <th className="border-2 border-black p-2.5 text-center font-bold w-[40%] align-middle">
                Dokumentasi
              </th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="border-2 border-black p-6 text-center italic text-gray-500">
                  Belum ada data dokumentasi kegiatan.
                </td>
              </tr>
            ) : (
              items.map((item, idx) => (
                <tr key={item._id || idx} className="align-top border-b-2 border-black">
                  <td className="border-2 border-black p-2.5 text-center font-medium">
                    {idx + 1}.
                  </td>
                  <td className="border-2 border-black p-2.5 font-medium whitespace-pre-wrap">
                    {item.hariTanggal}
                  </td>
                  <td className="border-2 border-black p-2.5 whitespace-pre-wrap leading-relaxed">
                    {item.uraianKegiatan}
                  </td>
                  <td className="border-2 border-black p-2.5">
                    <div className="flex flex-row items-center justify-center gap-2 w-full">
                      {item.foto1 ? (
                        <div className="w-1/2 aspect-[4/3] bg-gray-100 overflow-hidden border border-gray-400 rounded-sm flex items-center justify-center">
                          <img
                            src={item.foto1}
                            alt={`Dokumentasi ${item.hariTanggal} 1`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-1/2 aspect-[4/3] bg-gray-100 border border-dashed border-gray-300 rounded-sm flex items-center justify-center text-xs text-gray-400">
                          (Foto 1)
                        </div>
                      )}

                      {item.foto2 ? (
                        <div className="w-1/2 aspect-[4/3] bg-gray-100 overflow-hidden border border-gray-400 rounded-sm flex items-center justify-center">
                          <img
                            src={item.foto2}
                            alt={`Dokumentasi ${item.hariTanggal} 2`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-1/2 aspect-[4/3] bg-gray-100 border border-dashed border-gray-300 rounded-sm flex items-center justify-center text-xs text-gray-400">
                          (Foto 2)
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
