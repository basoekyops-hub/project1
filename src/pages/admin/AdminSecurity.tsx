import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Crown,
  Shield,
  Key,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  X,
  AlertTriangle,
  Lock,
  Mail,
  User,
  RefreshCw,
  Info
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface AdminAccount {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AdminSecurityProps {
  onNotify?: (type: 'success' | 'error' | 'info', message: string) => void;
  onShowToast?: (msg: string, type: 'success' | 'error') => void;
}

export const AdminSecurity: React.FC<AdminSecurityProps> = ({ onNotify, onShowToast }) => {
  const { admin: currentUser } = useAuth();
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'SUPERADMIN' | 'ADMIN'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminAccount | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'ADMIN',
    password: ''
  });

  const notify = (type: 'success' | 'error' | 'info', message: string) => {
    if (onNotify) onNotify(type, message);
    if (onShowToast) onShowToast(message, type === 'error' ? 'error' : 'success');
  };

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const data = await api.getAdmins();
      setAdmins(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load admins:', err);
      notify('error', 'Gagal memuat daftar pengguna admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleOpenAdd = () => {
    setEditingAdmin(null);
    setFormData({
      name: '',
      email: '',
      role: 'ADMIN',
      password: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (adm: AdminAccount) => {
    setEditingAdmin(adm);
    setFormData({
      name: adm.name,
      email: adm.email,
      role: adm.role,
      password: '' // Kosong jika tidak ingin ganti password
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      notify('error', 'Nama dan Email wajib diisi.');
      return;
    }

    if (!editingAdmin && (!formData.password || formData.password.length < 6)) {
      notify('error', 'Kata sandi minimal 6 karakter.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingAdmin) {
        await api.updateAdmin(editingAdmin.id, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          ...(formData.password ? { password: formData.password } : {})
        });
        notify('success', `Akun admin ${formData.name} berhasil diperbarui.`);
      } else {
        await api.createAdmin({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          password: formData.password
        });
        notify('success', `Akun admin baru ${formData.name} berhasil dibuat.`);
      }
      setIsModalOpen(false);
      loadAdmins();
    } catch (err: any) {
      notify('error', err?.message || 'Gagal menyimpan data akun admin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (adm: AdminAccount) => {
    if (adm.email === 'admin@pengawassekolah.id') {
      notify('error', 'Akun Superadmin Utama tidak dapat dihapus.');
      return;
    }
    if (currentUser?.id === adm.id) {
      notify('error', 'Anda tidak dapat menghapus akun Anda sendiri saat sedang login.');
      return;
    }

    if (!window.confirm(`Yakin ingin menghapus akun ${adm.name} (${adm.email})?`)) {
      return;
    }

    try {
      await api.deleteAdmin(adm.id);
      notify('success', `Akun ${adm.name} berhasil dihapus.`);
      loadAdmins();
    } catch (err: any) {
      notify('error', err?.message || 'Gagal menghapus akun admin.');
    }
  };

  const filteredAdmins = admins.filter((a) => {
    const matchSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase());
    const matchRole =
      roleFilter === 'ALL' || a.role.toUpperCase() === roleFilter;
    return matchSearch && matchRole;
  });

  const totalSuperadmins = admins.filter(
    (a) => a.role.toUpperCase() === 'SUPERADMIN'
  ).length;
  const totalAdmins = admins.filter(
    (a) => a.role.toUpperCase() === 'ADMIN'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Manajemen Pengguna & Level Admin
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola hak akses berjenjang: Level Superadmin (Akses Semua) & Level Admin (20 User Binaan)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadAdmins}
            disabled={loading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer disabled:opacity-50"
            title="Segarkan daftar admin"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition shadow-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Admin Baru</span>
          </button>
        </div>
      </div>

      {/* Role Level Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Akun Terdaftar
            </span>
            <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
              {admins.length}
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {admins.length} <span className="text-sm font-medium text-slate-400">Pengguna</span>
          </div>
          <p className="text-xs text-slate-500">
            Seluruh akun terdaftar yang memiliki kredensial login ke panel administrasi.
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white p-5 rounded-2xl border border-amber-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-600" />
              <span>Level Superadmin</span>
            </span>
            <span className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {totalSuperadmins}
            </span>
          </div>
          <div className="text-3xl font-extrabold text-amber-900 tracking-tight">
            {totalSuperadmins} <span className="text-sm font-semibold text-amber-700">Akun</span>
          </div>
          <p className="text-xs text-amber-900/80">
            <strong>Akses Penuh:</strong> Pengawas, Sekolah, Kepsek, Berita, Guru, Pengaturan Website, Backup & Restore, serta Kelola Akun.
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-white p-5 rounded-2xl border border-blue-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Level Admin (20 Akun)</span>
            </span>
            <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {totalAdmins}
            </span>
          </div>
          <div className="text-3xl font-extrabold text-blue-900 tracking-tight">
            {totalAdmins} <span className="text-sm font-semibold text-blue-700">Akun</span>
          </div>
          <p className="text-xs text-blue-900/80">
            <strong>Akses Khusus 7 Modul:</strong> Visi & Misi, Struktur Organisasi, Fasilitas, Keunggulan, Data Guru, Prestasi, dan Berita.
          </p>
        </div>
      </div>

      {/* Permissions Breakdown Banner */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <h3 className="font-bold text-sm text-slate-100">
            Ketentuan Hak Akses & Pembagian Wewenang Berdasarkan Tingkatan Level:
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1.5">
            <span className="font-bold text-amber-300 flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-amber-400" /> 1. Level Superadmin (Akses Semua)
            </span>
            <p className="text-slate-300 leading-relaxed">
              Memiliki wewenang mutlak atas seluruh menu (18 menu), termasuk identitas Pengawas, data Sekolah Binaan, Pengumuman, Galeri, Kontak, Buku Tamu, Pengaturan Website, Backup & Restore, serta penambahan/pengubahan akun admin.
            </p>
          </div>
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1.5">
            <span className="font-bold text-blue-300 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-blue-400" /> 2. Level Admin (20 User Binaan)
            </span>
            <p className="text-slate-300 leading-relaxed">
              Dikhususkan untuk operator dan perwakilan sekolah binaan dengan hak akses mengelola 7 modul: <strong>Visi & Misi Sekolah, Struktur Organisasi, Fasilitas Sekolah, Keunggulan Sekolah, Data Guru, Prestasi Sekolah, dan Berita</strong>. Menu konfigurasi sistem otomatis disembunyikan.
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama admin atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setRoleFilter('ALL')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              roleFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Semua ({admins.length})
          </button>
          <button
            onClick={() => setRoleFilter('SUPERADMIN')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              roleFilter === 'SUPERADMIN'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Superadmin ({totalSuperadmins})
          </button>
          <button
            onClick={() => setRoleFilter('ADMIN')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              roleFilter === 'ADMIN'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Level Admin ({totalAdmins})
          </button>
        </div>
      </div>

      {/* Admin Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
            <span>Memuat data pengguna admin...</span>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            <User className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">Tidak ada akun admin yang sesuai.</p>
            <p className="text-xs text-slate-400 mt-1">Ubah kata kunci pencarian atau filter role.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-4">Nama & Akun Email</th>
                  <th className="py-3.5 px-4">Tingkat / Level</th>
                  <th className="py-3.5 px-4">Hak Akses Modul</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAdmins.map((adm, idx) => {
                  const isSuper = adm.role.toUpperCase() === 'SUPERADMIN';
                  const isCurrent = currentUser?.id === adm.id;

                  return (
                    <tr
                      key={adm.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isCurrent ? 'bg-indigo-50/30' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                        {idx + 1}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                              isSuper
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {isSuper ? <Crown className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{adm.name}</span>
                              {isCurrent && (
                                <span className="text-[10px] font-bold px-2 py-0.2 bg-emerald-100 text-emerald-800 rounded-full">
                                  Akun Anda
                                </span>
                              )}
                            </div>
                            <div className="text-slate-500 font-mono text-[11px] flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{adm.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${
                            isSuper
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-blue-50 text-blue-800 border-blue-300'
                          }`}
                        >
                          {isSuper ? <Crown className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                          <span>{isSuper ? 'SUPERADMIN' : 'ADMIN'}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        {isSuper ? (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                            Akses Penuh (Semua 18 Modul)
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 font-medium">
                              Visi & Misi
                            </span>
                            <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 font-medium">
                              Struktur
                            </span>
                            <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 font-medium">
                              Fasilitas
                            </span>
                            <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 font-medium">
                              Keunggulan
                            </span>
                            <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 font-medium">
                              Guru
                            </span>
                            <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 font-medium">
                              Prestasi
                            </span>
                            <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 font-medium">
                              Berita
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Aktif</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(adm)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                            title="Edit akun & reset kata sandi"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {adm.email !== 'admin@pengawassekolah.id' && !isCurrent && (
                            <button
                              onClick={() => handleDelete(adm)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Hapus akun admin"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add / Edit Admin */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <span>{editingAdmin ? 'Edit Pengguna Admin' : 'Tambah Pengguna Admin Baru'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap Administrator *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Admin UPT SDN 001 Pantairaja"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat Email Login *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="adminXX@pengawassekolah.id"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tingkatan Level Akun *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ADMIN">Level Admin (Akses Visi Misi, Guru, Berita, Fasilitas, Prestasi)</option>
                  <option value="SUPERADMIN">Level Superadmin (Akses Semua Menu & Pengaturan)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  {formData.role === 'SUPERADMIN'
                    ? 'Superadmin dapat mengelola profil pengawas, sekolah binaan, pengaturan website, backup, dan manajemen admin.'
                    : 'Level Admin hanya dapat mengelola 7 modul operasional sekolah yang ditentukan.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {editingAdmin ? 'Kata Sandi Baru (Kosongkan jika tidak diubah)' : 'Kata Sandi Awal *'}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingAdmin ? 'Biarkan kosong jika tidak diganti' : 'Minimal 6 karakter (Default: Admin123!)'}
                    required={!editingAdmin}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center space-x-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Akun'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
