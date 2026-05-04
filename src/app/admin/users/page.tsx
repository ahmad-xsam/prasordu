"use client";

import { useState, useEffect } from "react";
import { UserPlus, Shield, User } from "lucide-react";

type UserData = {
  _id: string;
  name: string;
  username: string;
  role: string;
  createdAt: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "USER",
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.message });
      } else {
        setMessage({ type: "success", text: "Pengguna berhasil ditambahkan!" });
        setFormData({ name: "", username: "", password: "", role: "USER" });
        fetchUsers();
      }
    } catch (error) {
      setMessage({ type: "error", text: "Terjadi kesalahan sistem" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kelola Pengguna</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Tambahkan admin atau pengguna baru.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <UserPlus className="h-5 w-5 mr-2 text-primary-600" />
              Tambah Pengguna
            </h2>
            
            {message.text && (
              <div className={`p-3 mb-4 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Peran (Role)</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-primary-600 text-white font-medium py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Simpan
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Daftar Pengguna</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                    <th className="p-4 font-medium text-gray-500 dark:text-gray-400 text-sm">Nama</th>
                    <th className="p-4 font-medium text-gray-500 dark:text-gray-400 text-sm">Username</th>
                    <th className="p-4 font-medium text-gray-500 dark:text-gray-400 text-sm">Role</th>
                    <th className="p-4 font-medium text-gray-500 dark:text-gray-400 text-sm">Terdaftar</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-gray-500">Memuat data...</td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-gray-500">Belum ada pengguna</td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user._id} className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                        <td className="p-4">
                          <div className="flex items-center">
                            <div className={`p-2 rounded-full mr-3 ${user.role === 'ADMIN' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                              {user.role === 'ADMIN' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-600 dark:text-gray-400">{user.username}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'ADMIN' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4 text-gray-500 dark:text-gray-400 text-sm">
                          {new Date(user.createdAt).toLocaleDateString('id-ID')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
