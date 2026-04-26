"use client";

import { useState, useEffect } from 'react';
import { Compass, Calendar as CalendarIcon, Clock as ClockIcon, Navigation } from 'lucide-react';

export default function DashboardWidgets() {
  const [time, setTime] = useState<Date | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);

    // Compass Orientation Handler
    const handleOrientation = (event: any) => {
      let compassHeading = null;
      if (event.webkitCompassHeading) {
        // iOS
        compassHeading = event.webkitCompassHeading;
      } else if (event.alpha !== null) {
        // Android
        compassHeading = Math.abs(event.alpha - 360);
      }
      if (compassHeading !== null) {
        setHeading(compassHeading);
      }
    };

    if (typeof window !== 'undefined' && window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      clearInterval(timer);
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleOrientation, true);
      }
    };
  }, []);

  const requestCompassPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission();
        if (permissionState === 'granted') {
          setPermissionGranted(true);
        } else {
          setPermissionGranted(false);
          alert('Izin akses sensor ditolak.');
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      // Non iOS 13+ devices don't need explicit permission
      setPermissionGranted(true);
    }
  };

  if (!time) return null; // Avoid hydration mismatch

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  const dayName = days[time.getDay()];
  const date = time.getDate();
  const monthName = months[time.getMonth()];
  const year = time.getFullYear();

  const formattedTime = time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const hour = time.getHours();
  const greeting = hour < 12 ? 'Pagi' : hour < 15 ? 'Siang' : hour < 18 ? 'Sore' : 'Malam';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
      
      {/* 1. Jam Widget (Apple/Android style) */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <ClockIcon size={80} />
        </div>
        <div className="relative z-10">
          <p className="text-indigo-100 font-medium tracking-wider uppercase text-sm mb-1">Waktu Saat Ini</p>
          <h3 className="text-5xl font-bold tracking-tight mb-2 drop-shadow-md">{formattedTime}</h3>
          <p className="text-lg text-indigo-50 font-medium">Selamat {greeting}!</p>
        </div>
      </div>

      {/* 2. Kalender Widget */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center group hover:shadow-md hover:-translate-y-1 transition-all duration-300">
        <div className="w-1/3 flex flex-col items-center justify-center border-r border-gray-100 pr-4">
          <p className="text-red-500 font-bold uppercase text-sm">{dayName}</p>
          <p className="text-5xl font-black text-gray-800">{date}</p>
        </div>
        <div className="w-2/3 pl-6">
          <h3 className="text-xl font-bold text-gray-800 mb-1">{monthName} {year}</h3>
          <p className="text-sm text-gray-500 flex items-center">
            <CalendarIcon size={14} className="mr-1.5" /> Agenda Hari Ini
          </p>
          <div className="mt-3 flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full ${i === 0 ? 'bg-primary-500' : 'bg-gray-100'}`}></div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Kompas Widget */}
      <div 
        className="bg-gradient-to-tr from-gray-900 to-gray-800 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden flex flex-col justify-between cursor-pointer hover:shadow-xl transition-shadow"
        onClick={requestCompassPermission}
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-400 font-medium tracking-wider uppercase text-xs mb-1">Arah Kompas</p>
            <h3 className="text-3xl font-bold">
              {heading !== null ? `${Math.round(heading)}°` : '--°'}
            </h3>
          </div>
          <div className="h-10 w-10 bg-gray-700/50 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Compass className="text-primary-400" size={24} />
          </div>
        </div>
        
        <div className="flex justify-center mt-4">
          <div className="relative w-32 h-32 rounded-full border-4 border-gray-700 flex items-center justify-center bg-gray-800 shadow-inner">
            {/* North Indicator */}
            <div className="absolute top-2 text-red-500 font-bold text-xs">U</div>
            <div className="absolute right-2 text-gray-400 font-bold text-xs">T</div>
            <div className="absolute bottom-2 text-gray-400 font-bold text-xs">S</div>
            <div className="absolute left-2 text-gray-400 font-bold text-xs">B</div>
            
            <div 
              className="transition-transform duration-200 ease-out flex items-center justify-center"
              style={{ transform: `rotate(${heading !== null ? -heading : 45}deg)` }}
            >
              <Navigation className="text-red-500 fill-red-500 transform -rotate-45 drop-shadow-lg scale-150" />
            </div>
          </div>
        </div>
        
        {heading === null && (
          <p className="text-[10px] text-gray-500 text-center mt-2 absolute bottom-2 w-full left-0">
            Tap untuk akses sensor arah
          </p>
        )}
      </div>

    </div>
  );
}
