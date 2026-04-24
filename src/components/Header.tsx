"use client";

import { Bell, Search, User, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8">
      <div className="flex flex-1 items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 focus:outline-none sm:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="w-full max-w-md hidden sm:block">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-10 pr-3 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 outline-none transition-shadow"
              placeholder="Cari materi, tugas..."
            />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="sm:hidden rounded-full p-2 text-gray-400 hover:bg-gray-100">
          <Search className="h-6 w-6" />
        </button>
        <button className="relative rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors">
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>
          <Bell className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-700">
            <User className="h-5 w-5" />
          </div>
          <div className="hidden flex-col md:flex">
            <span className="text-sm font-semibold text-gray-700">Siswa Prasordu</span>
            <span className="text-xs text-gray-500">Online</span>
          </div>
        </div>
      </div>
    </header>
  );
}
