"use client";

import { Bell, Search, User, Menu, Sun, Moon, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const { data: session } = useSession();
  
  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 sm:px-6 lg:px-8">
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
              className="block w-full rounded-full border border-gray-300 bg-gray-50 dark:bg-slate-800 py-2 pl-10 pr-3 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:ring-primary-500 outline-none transition-shadow"
              placeholder="Cari materi, tugas..."
            />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>
        <button className="sm:hidden rounded-full p-2 text-gray-400 hover:bg-gray-100">
          <Search className="h-6 w-6" />
        </button>
        <button className="relative rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors">
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>
          <Bell className="h-6 w-6" />
        </button>
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 border-l border-gray-200 dark:border-slate-700 pl-4 group cursor-pointer"
          title="Klik untuk Logout"
        >
          <div className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors group-hover:bg-red-100 group-hover:text-red-600 dark:group-hover:bg-red-900/30 dark:group-hover:text-red-400 ${isAdmin ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
            {isAdmin ? <Shield size={18} /> : <User size={18} />}
          </div>
          <div className="hidden flex-col md:flex text-left">
            <span className="text-sm font-semibold text-gray-700 dark:text-slate-200 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
              {isAdmin ? 'Admin' : 'Anggota'}
            </span>
            <span className="text-xs text-gray-500 dark:text-slate-400 group-hover:hidden">Online</span>
            <span className="text-xs text-red-500 font-medium hidden group-hover:block">Logout</span>
          </div>
        </button>
      </div>
    </header>
  );
}
