"use client";

import { useState, useEffect } from 'react';
import { Compass, Calendar as CalendarIcon, Clock as ClockIcon, Navigation, CloudSun, MapPin } from 'lucide-react';

export default function DashboardWidgets() {
  const [time, setTime] = useState<Date | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  
  // Weather state
  const [weather, setWeather] = useState<{temp: number, desc: string} | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);

    // Compass Orientation Handler
    const handleOrientation = (event: any) => {
      let compassHeading = null;
      if (event.webkitCompassHeading) {
        compassHeading = event.webkitCompassHeading;
      } else if (event.alpha !== null) {
        compassHeading = Math.abs(event.alpha - 360);
      }
      if (compassHeading !== null) {
        setHeading(compassHeading);
      }
    };

    if (typeof window !== 'undefined' && window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    // Weather Fetcher
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const data = await res.json();
        if (data.current_weather) {
          // Open-Meteo weather codes to simple descriptions
          const code = data.current_weather.weathercode;
          let desc = "Cerah";
          if (code >= 1 && code <= 3) desc = "Berawan";
          if (code >= 51 && code <= 67) desc = "Hujan Ringan";
          if (code >= 80 && code <= 82) desc = "Hujan Deras";
          if (code >= 95) desc = "Badai Petir";
          
          setWeather({
            temp: Math.round(data.current_weather.temperature),
            desc
          });
        }
      } catch (e) {
        console.error("Gagal memuat cuaca", e);
      } finally {
        setWeatherLoading(false);
      }
    };

    // Get Location for weather (fallback to Jakarta if denied)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(-6.2088, 106.8456) // Fallback Jakarta
      );
    } else {
      fetchWeather(-6.2088, 106.8456);
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
      setPermissionGranted(true);
    }
  };

  if (!time) return null;

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  const dayName = days[time.getDay()];
  const date = time.getDate();
  const monthName = months[time.getMonth()];
  const year = time.getFullYear();

  const formattedTime = time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const hour = time.getHours();
  const greeting = hour < 12 ? 'Pagi' : hour < 15 ? 'Siang' : hour < 18 ? 'Sore' : 'Malam';

  // Array of degrees for the compass dial
  const dialTicks = Array.from({ length: 12 }).map((_, i) => i * 30);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
      
      {/* 1. Jam Widget */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <ClockIcon size={80} />
        </div>
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            <p className="text-indigo-100 font-medium tracking-wider uppercase text-sm mb-1">Waktu Saat Ini</p>
            <h3 className="text-5xl font-bold tracking-tight mb-2 drop-shadow-md">{formattedTime}</h3>
          </div>
          <p className="text-lg text-indigo-50 font-medium mt-4">Selamat {greeting}!</p>
        </div>
      </div>

      {/* 2. Kalender & Cuaca Widget */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-0 flex group hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden">
        {/* Calendar Left Part */}
        <div className="w-1/2 p-6 flex flex-col items-center justify-center border-r border-gray-100 bg-gray-50/50">
          <p className="text-red-500 font-bold uppercase text-sm">{dayName}</p>
          <p className="text-6xl font-black text-gray-800 my-1">{date}</p>
          <p className="text-sm font-semibold text-gray-600">{monthName} {year}</p>
        </div>
        
        {/* Weather Right Part */}
        <div className="w-1/2 p-5 flex flex-col justify-center">
          <div className="flex items-center text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
            <CloudSun size={14} className="mr-1.5" /> Info Cuaca
          </div>
          
          {weatherLoading ? (
            <div className="animate-pulse flex flex-col gap-2">
              <div className="h-8 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          ) : weather ? (
            <div>
              <h3 className="text-4xl font-bold text-gray-800 mb-1">{weather.temp}°C</h3>
              <p className="text-sm font-medium text-blue-600 bg-blue-50 inline-block px-2 py-0.5 rounded-md">
                {weather.desc}
              </p>
            </div>
          ) : (
             <p className="text-xs text-gray-400">Gagal memuat cuaca</p>
          )}
          
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-[10px] text-gray-400">
             <MapPin size={10} className="mr-1" /> Berdasarkan Lokasi Anda
          </div>
        </div>
      </div>

      {/* 3. Kompas Widget */}
      <div 
        className="bg-gradient-to-tr from-gray-900 to-gray-800 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden flex flex-col items-center justify-between cursor-pointer hover:shadow-xl transition-shadow"
        onClick={requestCompassPermission}
      >
        <div className="w-full flex justify-between items-start mb-2">
          <div>
            <p className="text-gray-400 font-medium tracking-wider uppercase text-xs mb-1">Arah Kompas</p>
            <h3 className="text-3xl font-bold text-primary-400">
              {heading !== null ? `${Math.round(heading)}°` : '--°'}
            </h3>
          </div>
          <Compass className="text-gray-600" size={24} />
        </div>
        
        <div className="relative mt-2 flex items-center justify-center">
          {/* Static Direction Indicator Line (Lubber Line) */}
          <div className="absolute top-[-10px] z-20 flex flex-col items-center">
             <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-red-500"></div>
          </div>

          {/* Rotating Compass Dial */}
          <div 
            className="relative w-40 h-40 rounded-full border-[6px] border-gray-700 flex items-center justify-center bg-gray-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] transition-transform duration-200 ease-out"
            style={{ transform: `rotate(${heading !== null ? -heading : 0}deg)` }}
          >
            {/* Cardinal Directions */}
            <div className="absolute top-1 text-red-500 font-bold text-sm">U</div>
            <div className="absolute right-1 text-gray-400 font-bold text-sm">T</div>
            <div className="absolute bottom-1 text-gray-400 font-bold text-sm">S</div>
            <div className="absolute left-1 text-gray-400 font-bold text-sm">B</div>
            
            {/* Degree Ticks */}
            {dialTicks.map(deg => (
              <div 
                key={deg} 
                className="absolute w-full h-full flex justify-center"
                style={{ transform: `rotate(${deg}deg)` }}
              >
                <div className={`w-0.5 ${deg % 90 === 0 ? 'h-0' : 'h-2'} bg-gray-500 mt-1`}></div>
                {deg % 90 !== 0 && (
                   <span className="absolute top-3 text-[8px] text-gray-500 font-mono">{deg}</span>
                )}
              </div>
            ))}
            
            {/* Center Pin */}
            <div className="w-3 h-3 bg-gray-900 rounded-full border-2 border-gray-600 z-10 absolute"></div>
            
            {/* Fixed Needle inside the rotating dial (Wait, if the dial rotates, the needle inside it would rotate too. 
                Instead, we want the dial to rotate and the needle to stay pointing UP, OR the needle is painted on the dial pointing North.) */}
            <div className="absolute w-1 h-32 flex flex-col justify-between items-center py-4">
              <div className="w-1 h-12 bg-red-500 rounded-t-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
              <div className="w-1 h-12 bg-white rounded-b-full"></div>
            </div>
          </div>
        </div>
        
        {heading === null && (
          <p className="text-[10px] text-gray-500 text-center mt-3 absolute bottom-2 w-full left-0">
            Tap area ini untuk akses sensor arah
          </p>
        )}
      </div>

    </div>
  );
}
