"use client";

import Link from 'next/link';
import { 
  LayoutDashboard, 
  Settings, 
  BookOpen, 
  Activity, 
  Library, 
  UserCheck, 
  Calendar,
  LogOut,
  X
} from 'lucide-react';
import { usePathname } from 'next/navigation';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Administrasi', icon: Settings, path: '/administrasi' },
  { name: 'Materi', icon: BookOpen, path: '/materi' },
  { name: 'Kegiatan', icon: Activity, path: '/kegiatan' },
  { name: 'Buku', icon: Library, path: '/buku' },
  { name: 'Presensi', icon: UserCheck, path: '/presensi' },
  { name: 'Agenda', icon: Calendar, path: '/agenda' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-gray-900/50 backdrop-blur-sm sm:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`fixed left-0 top-0 z-40 h-screen w-64 transition-transform duration-300 ease-in-out bg-white border-r border-gray-200 ${
        isOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
      }`}>
        <div className="flex h-full flex-col overflow-y-auto px-3 py-4">
          <div className="flex items-center justify-between mb-8 px-2">
            <Link href="/" className="flex items-center" onClick={onClose}>
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <span className="self-center whitespace-nowrap text-2xl font-bold text-gray-800">
                Prasordu
              </span>
            </Link>
            <button 
              onClick={onClose}
              className="sm:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <ul className="space-y-2 font-medium flex-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    onClick={onClose}
                    className={`group flex items-center rounded-lg p-3 transition-all ${
                      isActive 
                        ? 'bg-primary-50 text-primary-600' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 transition-colors ${
                      isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-600'
                    }`} />
                    <span className="ms-3">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-auto pt-4 border-t border-gray-100">
            <button className="w-full group flex items-center rounded-lg p-3 text-red-600 hover:bg-red-50 transition-colors">
              <LogOut className="h-5 w-5" />
              <span className="ms-3 font-medium">Keluar</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
