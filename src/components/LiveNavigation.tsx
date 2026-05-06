"use client";

import { useState, useEffect } from 'react';
import { Compass, MapPin, Cloud, Sun, CloudRain, Wind } from 'lucide-react';

export default function LiveNavigation() {
  const [heading, setHeading] = useState<number | null>(null);
  const [location, setLocation] = useState<{ lat: number, lon: number } | null>(null);
  const [locationName, setLocationName] = useState<string>("Mencari Lokasi...");
  const [weather, setWeather] = useState<{ temp: number, code: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needPermission, setNeedPermission] = useState(false);

  // 1. Get Compass (DeviceOrientation)
  const initCompass = () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
        .then((permissionState: string) => {
          if (permissionState === 'granted') {
            setNeedPermission(false);
            window.addEventListener('deviceorientation', handleOrientation, true);
          } else {
            setError("Izin kompas ditolak.");
          }
        })
        .catch(console.error);
    } else {
      // Non iOS 13+ devices
      setNeedPermission(false);
      window.addEventListener('deviceorientationabsolute', handleOrientation, true) || 
      window.addEventListener('deviceorientation', handleOrientation, true);
    }
  };

  const handleOrientation = (event: any) => {
    let compassHeading = null;
    if (event.webkitCompassHeading) {
      // Apple
      compassHeading = event.webkitCompassHeading;
    } else if (event.alpha !== null) {
      // Android / webkit absolute
      compassHeading = 360 - event.alpha;
    }
    if (compassHeading !== null) {
      setHeading(Math.round(compassHeading));
    }
  };

  // Check if we need permission button (iOS)
  useEffect(() => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      setNeedPermission(true);
    } else {
      initCompass();
    }
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
      window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
    };
  }, []);

  // 2. Get Geolocation & Weather
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setLocation({ lat, lon });

          // Fetch Location Name (Reverse Geocoding OpenStreetMap Nominatim)
          try {
            const locRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`);
            const locData = await locRes.json();
            if (locData && locData.address) {
              const city = locData.address.city || locData.address.town || locData.address.county || "Area Tidak Diketahui";
              const state = locData.address.state || "";
              setLocationName(`${city}, ${state}`);
            } else {
                setLocationName("Lokasi Ditemukan");
            }
          } catch (e) {
            console.error(e);
            setLocationName("Lokasi Ditemukan");
          }

          // Fetch Weather (Open-Meteo)
          try {
            const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
            const weatherData = await weatherRes.json();
            if (weatherData && weatherData.current_weather) {
              setWeather({
                temp: Math.round(weatherData.current_weather.temperature),
                code: weatherData.current_weather.weathercode
              });
            }
          } catch (e) {
            console.error(e);
          }
        },
        (err) => {
          setError("Gagal mendapatkan lokasi. Aktifkan GPS.");
          setLocationName("Lokasi Tidak Tersedia");
        }
      );
    } else {
      setError("Browser tidak mendukung Geolocation.");
    }
  }, []);

  // Helper for weather icon
  const getWeatherIcon = (code: number) => {
    if (code === 0) return <Sun className="text-yellow-400" size={28} />;
    if (code >= 1 && code <= 3) return <Cloud className="text-gray-300" size={28} />;
    if (code >= 51 && code <= 67) return <CloudRain className="text-blue-400" size={28} />;
    if (code >= 71 && code <= 77) return <Wind className="text-cyan-200" size={28} />;
    if (code >= 80 && code <= 99) return <CloudRain className="text-indigo-400" size={28} />;
    return <Cloud className="text-gray-400" size={28} />;
  };

  const getCompassDirection = (deg: number) => {
    if (deg >= 337.5 || deg < 22.5) return 'Utara';
    if (deg >= 22.5 && deg < 67.5) return 'Timur Laut';
    if (deg >= 67.5 && deg < 112.5) return 'Timur';
    if (deg >= 112.5 && deg < 157.5) return 'Tenggara';
    if (deg >= 157.5 && deg < 202.5) return 'Selatan';
    if (deg >= 202.5 && deg < 247.5) return 'Barat Daya';
    if (deg >= 247.5 && deg < 292.5) return 'Barat';
    if (deg >= 292.5 && deg < 337.5) return 'Barat Laut';
    return '';
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-[#1a0b2e] to-[#0a0014] rounded-2xl relative overflow-hidden border border-purple-500/30 shadow-[0_0_20px_rgba(204,255,0,0.1)] flex flex-col items-center justify-center min-h-[250px] p-6 text-white group">
      
      {/* Background Radar Effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="absolute w-[150px] h-[150px] border border-[#ccff00] rounded-full"></div>
        <div className="absolute w-[250px] h-[250px] border border-purple-500/30 rounded-full"></div>
        <div className="absolute w-[150px] h-[150px] border-t-2 border-r-2 border-[#ccff00] rounded-full animate-[spin_4s_linear_infinite]"></div>
      </div>

      {needPermission ? (
        <div className="z-10 flex flex-col items-center text-center">
          <Compass size={48} className="text-purple-400 mb-4 animate-pulse" />
          <p className="text-xs text-purple-200 mb-4 px-4">Aktifkan sensor kompas untuk mengkalibrasi arah.</p>
          <button 
            onClick={initCompass}
            className="px-4 py-2 bg-[#ccff00] text-[#0a0014] rounded-lg font-bold shadow-[0_0_15px_rgba(204,255,0,0.4)] text-sm uppercase tracking-wide"
          >
            Aktifkan Kompas
          </button>
        </div>
      ) : (
        <div className="z-10 w-full flex flex-col items-center h-full justify-between">
          
          <div className="text-center mb-2">
            <h3 className="text-4xl font-black text-[#ccff00] tracking-wider drop-shadow-[0_0_10px_rgba(204,255,0,0.6)]">
              {heading !== null ? `${heading}°` : '--°'}
            </h3>
            <p className="text-xs font-bold text-purple-300 uppercase tracking-widest mt-1">
              {heading !== null ? getCompassDirection(heading) : 'Kalibrasi Sensor...'}
            </p>
          </div>

          {/* Compass Dial */}
          <div className="relative w-24 h-24 mb-4 mt-2">
            <div 
              className="absolute inset-0 border-2 border-purple-500/50 rounded-full shadow-[0_0_15px_rgba(138,43,226,0.2)] transition-transform duration-300 ease-out flex items-center justify-center bg-[#0a0014]/50 backdrop-blur-sm"
              style={{ transform: `rotate(-${heading || 0}deg)` }}
            >
              <div className="absolute top-1 text-[#ccff00] font-bold text-xs drop-shadow-[0_0_5px_rgba(204,255,0,0.8)]">N</div>
              <div className="absolute bottom-1 text-purple-400 font-bold text-xs">S</div>
              <div className="absolute right-1 text-purple-400 font-bold text-xs">E</div>
              <div className="absolute left-1 text-purple-400 font-bold text-xs">W</div>
              {/* Arrow pointing North */}
              <div className="w-1 h-8 bg-gradient-to-t from-transparent to-[#ccff00] absolute top-3 rounded-full"></div>
            </div>
            
            {/* Center Pin */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#ccff00] rounded-full shadow-[0_0_8px_rgba(204,255,0,1)] z-10"></div>
          </div>
          
          {/* Location & Weather */}
          <div className="w-full flex items-center justify-between border-t border-purple-800/80 pt-3 px-2">
            <div className="flex flex-col items-start w-[60%]">
              <div className="flex items-center gap-1 mb-1">
                <MapPin size={12} className="text-[#ccff00]" />
                <span className="text-[10px] text-purple-400 uppercase tracking-wider">Lokasi</span>
              </div>
              <p className="text-xs font-bold text-white line-clamp-1 truncate w-full" title={locationName}>{locationName}</p>
            </div>
            
            <div className="flex flex-col items-end w-[35%]">
               <div className="flex items-center gap-1 mb-1">
                <Cloud size={12} className="text-[#ccff00]" />
                <span className="text-[10px] text-purple-400 uppercase tracking-wider">Cuaca</span>
              </div>
              <div className="flex items-center gap-1">
                {weather ? getWeatherIcon(weather.code) : <span className="text-xs text-purple-400">...</span>}
                <p className="text-sm font-bold text-[#ccff00]">{weather ? `${weather.temp}°` : '--'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {error && !needPermission && (
         <div className="absolute top-0 left-0 w-full text-center text-[10px] text-red-400 bg-red-900/50 py-1 font-medium z-20">
           {error}
         </div>
      )}
    </div>
  );
}
