import Link from "next/link";
import { Users, ClipboardCheck, Archive, Wallet, UsersRound } from "lucide-react";

export default function Administrasi() {
  const adminMenus = [
    {
      title: "Data Keanggotaan",
      description: "Kelola data pribadi dan informasi kontak seluruh anggota.",
      icon: Users,
      href: "/administrasi/keanggotaan",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      borderColor: "hover:border-blue-500"
    },
    {
      title: "Daftar Hadir",
      description: "Rekapitulasi absensi harian dan rekam jejak kehadiran.",
      icon: ClipboardCheck,
      href: "/administrasi/kehadiran",
      color: "text-green-600",
      bgColor: "bg-green-100",
      borderColor: "hover:border-green-500"
    },
    {
      title: "Daftar Inventarisasi",
      description: "Pencatatan barang, aset, dan perlengkapan regu.",
      icon: Archive,
      href: "/administrasi/inventarisasi",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      borderColor: "hover:border-orange-500"
    },
    {
      title: "Tabungan Anggota",
      description: "Manajemen keuangan dan pencatatan tabungan rutin.",
      icon: Wallet,
      href: "/administrasi/tabungan",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      borderColor: "hover:border-purple-500"
    },
    {
      title: "Daftar Anggota Regu",
      description: "Struktur organisasi dan pembagian kelompok regu.",
      icon: UsersRound,
      href: "/administrasi/anggota-regu",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      borderColor: "hover:border-indigo-500"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Menu Administrasi</h1>
        <p className="text-gray-500 mt-1">Pilih kategori administrasi yang ingin Anda kelola.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {adminMenus.map((menu, index) => (
          <Link href={menu.href} key={index} className="block group">
            <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 h-full transition-all duration-200 ease-in-out hover:shadow-md ${menu.borderColor}`}>
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${menu.bgColor} ${menu.color} transition-colors`}>
                  <menu.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {menu.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                    {menu.description}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
