import { BookOpen, Users, Award, Clock } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Selamat datang kembali, Siswa! 👋</h1>
          <p className="text-gray-500 mt-1">Berikut adalah ringkasan aktivitas belajarmu hari ini.</p>
        </div>
        <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors font-medium">
          Mulai Belajar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Kelas Aktif', value: '4', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100' },
          { title: 'Tugas Selesai', value: '12', icon: Award, color: 'text-green-600', bg: 'bg-green-100' },
          { title: 'Presensi', value: '98%', icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
          { title: 'Jam Belajar', value: '32j', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Materi Terbaru</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center p-4 border border-gray-100 rounded-lg hover:border-primary-500 transition-colors cursor-pointer group">
                <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-primary-50 transition-colors">
                  <BookOpen className="h-6 w-6 text-gray-500 group-hover:text-primary-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-md font-semibold text-gray-800">Pemrograman Web Lanjut</h4>
                  <p className="text-sm text-gray-500">Pertemuan ke-{item + 4}: React Hooks</p>
                </div>
                <button className="text-primary-600 text-sm font-medium hover:underline">
                  Lihat
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Agenda Hari Ini</h2>
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            {['08:00', '10:30', '13:00'].map((time, i) => (
              <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-4 h-4 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-primary-500 text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded border border-slate-200 shadow-sm ml-4 md:ml-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-slate-900">Kelas Online</span>
                    <span className="text-xs font-medium text-slate-500">{time}</span>
                  </div>
                  <div className="text-slate-500 text-xs">Materi {i+1}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
