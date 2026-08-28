"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { usePathname } from "next/navigation";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  if (pathname === '/login' || pathname === '/register' || pathname === '/' || pathname.startsWith('/play') || pathname.startsWith('/belajar')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300 print:bg-white print:p-0 print:m-0">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className="sm:ml-64 flex flex-col min-h-screen print:ml-0 print:p-0 print:w-full print:block">
        <Header onMenuClick={toggleSidebar} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 print:p-0 print:m-0 print:w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
