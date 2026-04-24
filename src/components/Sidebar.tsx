import Link from 'next/link';
import { 
  LayoutDashboard, 
  Settings, 
  BookOpen, 
  Activity, 
  Library, 
  UserCheck, 
  Calendar,
  LogOut
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Administrasi', icon: Settings, path: '/administrasi' },
  { name: 'Materi', icon: BookOpen, path: '/materi' },
  { name: 'Kegiatan', icon: Activity, path: '/kegiatan' },
  { name: 'Buku', icon: Library, path: '/buku' },
  { name: 'Presensi', icon: UserCheck, path: '/presensi' },
  { name: 'Agenda', icon: Calendar, path: '/agenda' },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 -translate-x-full transition-transform sm:translate-x-0 bg-white border-r border-gray-200">
      <div className="flex h-full flex-col overflow-y-auto px-3 py-4">
        <Link href="/" className="mb-8 flex items-center ps-2.5">
          <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <span className="self-center whitespace-nowrap text-2xl font-bold text-gray-800">
            Prasordu
          </span>
        </Link>
        <ul className="space-y-2 font-medium flex-1">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.path}
                className="group flex items-center rounded-lg p-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
              >
                <item.icon className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                <span className="ms-3">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-auto">
          <button className="w-full group flex items-center rounded-lg p-2 text-red-600 hover:bg-red-50 transition-colors">
            <LogOut className="h-5 w-5" />
            <span className="ms-3 font-medium">Keluar</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
