import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Globe,
  Shield,
  Phone,
  Mail,
  MapPin,
  Database,
  HardDrive,
  Key,
  CheckCircle2,
  Share2,
  Layers,
  Sparkles,
  ExternalLink,
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { ImageUpload } from '../../components/common/ImageUpload';
import { BackupModal } from '../../components/common/BackupModal';
import { api } from '../../services/api';

interface AdminPengaturanProps {
  onNotify?: (type: 'success' | 'error' | 'info', message: string) => void;
  onShowToast?: (msg: string, type: 'success' | 'error') => void;
}

export const AdminPengaturan: React.FC<AdminPengaturanProps> = ({ onNotify, onShowToast }) => {
  const { settings, updateSettings, reloadSettings } = useSettings();
  const { admin } = useAuth();
  const userRole = (admin?.role || '').toUpperCase();
  const isSuperAdmin = userRole === 'SUPERADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'SUPER ADMIN';

  const [activeTab, setActiveTab] = useState<'umum' | 'kontak' | 'sosial' | 'keamanan'>(
    isSuperAdmin ? 'umum' : 'keamanan'
  );
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const notify = (type: 'success' | 'error' | 'info', message: string) => {
    if (onNotify) onNotify(type, message);
    if (onShowToast) onShowToast(message, type === 'error' ? 'error' : 'success');
  };

  const [formData, setFormData] = useState({
    // Identitas
    namaWebsite: '',
    tagline: '',
    deskripsiSingkat: '',
    jenjang: 'TK / SD',
    logoUrl: '',
    heroImageUrl: '',
    primaryColor: '#4f46e5',
    // Wilayah
    kecamatan: '',
    kabupaten: '',
    provinsi: '',
    // Kontak & Lokasi
    alamatKantor: '',
    emailPengawas: '',
    nomorTelepon: '',
    nomorWhatsApp: '',
    jamKerja: '',
    mapsUrl: '',
    // Media Sosial
    facebookUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
    // Fitur Portal
    showBukuTamu: true,
    showStats: true,
    footer: ''
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        namaWebsite: settings.namaWebsite || settings.namaPortal || 'PORTAL PENGAWAS SEKOLAH',
        tagline: settings.tagline || settings.subjudul || 'Informasi, Pendampingan, Dokumentasi dan Pengembangan Mutu Satuan Pendidikan',
        deskripsiSingkat: settings.deskripsiSingkat || settings.deskripsi || 'Portal resmi pendampingan, informasi, dan pembinaan mutu pendidikan satuan TK/SD.',
        jenjang: settings.jenjang || 'TK / SD',
        logoUrl: settings.logoUrl || settings.logo || '',
        heroImageUrl: settings.heroImageUrl || (settings as any).bannerUrl || '',
        primaryColor: settings.primaryColor || '#4f46e5',
        kecamatan: settings.kecamatan || 'Tapung Hilir',
        kabupaten: settings.kabupaten || 'Kampar',
        provinsi: settings.provinsi || 'Riau',
        alamatKantor: settings.alamatKantor || settings.alamat || 'Jl. Jenderal Sudirman No. 45, Kompleks Dinas Pendidikan',
        emailPengawas: settings.emailPengawas || settings.email || 'digitalpengawas@gmail.com',
        nomorTelepon: settings.nomorTelepon || settings.telepon || '+62 812-7654-3210',
        nomorWhatsApp: settings.nomorWhatsApp || settings.whatsapp || '6281276543210',
        jamKerja: settings.jamKerja || 'Senin - Jumat: 07.30 - 16.00 WIB',
        mapsUrl: settings.mapsUrl || 'https://maps.google.com/?q=Tapung+Hilir+Kampar',
        facebookUrl: settings.facebookUrl || settings.facebook || 'https://facebook.com',
        instagramUrl: settings.instagramUrl || settings.instagram || 'https://instagram.com',
        youtubeUrl: settings.youtubeUrl || settings.youtube || 'https://youtube.com',
        showBukuTamu: settings.showBukuTamu !== undefined ? settings.showBukuTamu : true,
        showStats: settings.showStats !== undefined ? settings.showStats : true,
        footer: settings.footer || '© 2026 Portal Pengawas Sekolah. Informasi, Pendampingan, Dokumentasi dan Pengembangan Mutu Satuan Pendidikan. Pengawas Sekolah TK/SD.'
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        // Canonical bindings
        namaPortal: formData.namaWebsite,
        subjudul: formData.tagline,
        deskripsi: formData.deskripsiSingkat,
        logo: formData.logoUrl,
        alamat: formData.alamatKantor,
        email: formData.emailPengawas,
        telepon: formData.nomorTelepon,
        whatsapp: formData.nomorWhatsApp.replace(/[^0-9]/g, ''),
        facebook: formData.facebookUrl,
        instagram: formData.instagramUrl,
        youtube: formData.youtubeUrl,
        heroImageUrl: formData.heroImageUrl,
        bannerUrl: formData.heroImageUrl
      };
      await updateSettings(payload);
      await reloadSettings();
      notify('success', 'Pengaturan website berhasil disimpan dan diperbarui di seluruh portal!');
    } catch (err: any) {
      console.error('Failed to update settings:', err);
      notify('error', err?.message || 'Gagal menyimpan pengaturan website.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      notify('error', 'Konfirmasi kata sandi baru tidak cocok.');
      return;
    }
    if (newPassword.length < 6) {
      notify('error', 'Kata sandi baru minimal 6 karakter.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.changePassword(oldPassword, newPassword);
      notify('success', 'Kata sandi administrator berhasil diperbarui.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      notify('error', err?.message || err?.response?.data?.error || 'Gagal mengubah kata sandi.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-600" />
            Pengaturan Website & Portal
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi identitas portal, kontak dinas pengawas, branding visual, tautan media sosial, serta manajemen kata sandi dan cadangan basis data.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsBackupModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 transition shadow-xs cursor-pointer"
            title="Buka Pusat Cadangan & Pemulihan Data"
          >
            <HardDrive className="w-4 h-4 text-emerald-200" />
            <span>Backup & Restore Data</span>
          </button>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto pb-px">
        {isSuperAdmin && (
          <>
            <button
              onClick={() => setActiveTab('umum')}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center space-x-2 shrink-0 ${
                activeTab === 'umum'
                  ? 'border-indigo-600 text-indigo-700 bg-white shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Identitas & Tampilan Utama</span>
            </button>
            <button
              onClick={() => setActiveTab('kontak')}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center space-x-2 shrink-0 ${
                activeTab === 'kontak'
                  ? 'border-indigo-600 text-indigo-700 bg-white shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>Kontak & Wilayah Pembinaan</span>
            </button>
            <button
              onClick={() => setActiveTab('sosial')}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center space-x-2 shrink-0 ${
                activeTab === 'sosial'
                  ? 'border-indigo-600 text-indigo-700 bg-white shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>Media Sosial & Fitur Portal</span>
            </button>
          </>
        )}
        <button
          onClick={() => setActiveTab('keamanan')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center space-x-2 shrink-0 ${
            activeTab === 'keamanan'
              ? 'border-indigo-600 text-indigo-700 bg-white shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Keamanan & Sandi Akun</span>
        </button>
      </div>

      {/* Tab 1: Identitas & Tampilan Utama */}
      {activeTab === 'umum' && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-600" />
                Identitas Portal & Visual Branding
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Nama website, slogan, dan logo yang tampil di bilah navigasi (Navbar), header, dan footer portal publik.
              </p>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Judul / Nama Resmi Website Portal *
              </label>
              <input
                type="text"
                value={formData.namaWebsite}
                onChange={(e) => setFormData({ ...formData, namaWebsite: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Contoh: PORTAL PENGAWAS SEKOLAH"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Slogan / Tagline Pembinaan *
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Membina, Menginspirasi, dan Mengakselerasi Mutu Pendidikan"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Jenjang Satuan Pendidikan Binaan
              </label>
              <input
                type="text"
                value={formData.jenjang}
                onChange={(e) => setFormData({ ...formData, jenjang: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Contoh: TK / SD atau SMP / SMA"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Deskripsi Singkat Portal
              </label>
              <textarea
                rows={3}
                value={formData.deskripsiSingkat}
                onChange={(e) => setFormData({ ...formData, deskripsiSingkat: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Tuliskan deskripsi profil dan peruntukan portal pembinaan mutu ini..."
              />
            </div>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
              <ImageUpload
                label="Logo Instansi / Lambang Daerah"
                value={formData.logoUrl}
                onChange={(url) => setFormData({ ...formData, logoUrl: url })}
                category="pengaturan"
              />

              <ImageUpload
                label="Foto Banner Utama (Hero Image Beranda)"
                value={formData.heroImageUrl}
                onChange={(url) => setFormData({ ...formData, heroImageUrl: url })}
                category="pengaturan"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center space-x-1.5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Kontak & Wilayah Pembinaan */}
      {activeTab === 'kontak' && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Phone className="w-4 h-4 text-indigo-600" />
                Alamat Kantor & Wilayah Kepengawasan
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Informasi korespondensi, kontak konsultasi WhatsApp, email resmi, dan tautan peta lokasi kantor.
              </p>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kecamatan Wilayah Binaan
              </label>
              <input
                type="text"
                value={formData.kecamatan}
                onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Contoh: Tapung Hilir"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kabupaten / Kota
              </label>
              <input
                type="text"
                value={formData.kabupaten}
                onChange={(e) => setFormData({ ...formData, kabupaten: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Contoh: Kampar"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Provinsi
              </label>
              <input
                type="text"
                value={formData.provinsi}
                onChange={(e) => setFormData({ ...formData, provinsi: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Contoh: Riau"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Alamat Kantor Korwil / Dinas Pendidikan *
              </label>
              <input
                type="text"
                value={formData.alamatKantor}
                onChange={(e) => setFormData({ ...formData, alamatKantor: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Alamat lengkap gedung kantor pengawas atau korwil"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Resmi Pengawas *
              </label>
              <input
                type="email"
                value={formData.emailPengawas}
                onChange={(e) => setFormData({ ...formData, emailPengawas: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="pengawas@dinas.go.id"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nomor WhatsApp Konsultasi
              </label>
              <input
                type="text"
                value={formData.nomorWhatsApp}
                onChange={(e) => setFormData({ ...formData, nomorWhatsApp: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="6281276543210"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Format internasional: 628...</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nomor Telepon Kantor
              </label>
              <input
                type="text"
                value={formData.nomorTelepon}
                onChange={(e) => setFormData({ ...formData, nomorTelepon: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="+62 812-7654-3210"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Jam Layanan / Konsultasi
              </label>
              <input
                type="text"
                value={formData.jamKerja}
                onChange={(e) => setFormData({ ...formData, jamKerja: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Senin - Jumat: 07.30 - 16.00 WIB"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tautan Google Maps Lokasi Kantor
              </label>
              <input
                type="text"
                value={formData.mapsUrl}
                onChange={(e) => setFormData({ ...formData, mapsUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://maps.google.com/?q=..."
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center space-x-1.5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Media Sosial & Fitur Portal */}
      {activeTab === 'sosial' && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Share2 className="w-4 h-4 text-indigo-600" />
                Tautan Media Sosial & Modul Fitur
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Konfigurasi tautan saluran resmi informasi serta pengaktifan modul interaktif publik.
              </p>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tautan Facebook
              </label>
              <input
                type="text"
                value={formData.facebookUrl}
                onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://facebook.com/..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tautan Instagram
              </label>
              <input
                type="text"
                value={formData.instagramUrl}
                onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://instagram.com/..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tautan Channel YouTube
              </label>
              <input
                type="text"
                value={formData.youtubeUrl}
                onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://youtube.com/@..."
              />
            </div>

            <div className="md:col-span-3 pt-3 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Teks Hak Cipta Footer (Copyright)
              </label>
              <input
                type="text"
                value={formData.footer}
                onChange={(e) => setFormData({ ...formData, footer: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="© 2026 Portal Pengawas Sekolah..."
              />
            </div>

            <div className="md:col-span-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                <span>Saklar Fitur & Tampilan Publik</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-slate-200/70 cursor-pointer hover:border-indigo-300 transition">
                  <input
                    type="checkbox"
                    checked={formData.showBukuTamu}
                    onChange={(e) => setFormData({ ...formData, showBukuTamu: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="font-bold text-xs text-slate-800 block">Modul Buku Tamu Digital</span>
                    <span className="text-[11px] text-slate-500 block">Izinkan pengunjung mengisi masukan atau kesan di halaman Buku Tamu</span>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-slate-200/70 cursor-pointer hover:border-indigo-300 transition">
                  <input
                    type="checkbox"
                    checked={formData.showStats}
                    onChange={(e) => setFormData({ ...formData, showStats: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="font-bold text-xs text-slate-800 block">Statistik Pengunjung Footer</span>
                    <span className="text-[11px] text-slate-500 block">Tampilkan widget pelacak pengunjung real-time pada bagian footer portal</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center space-x-1.5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 4: Keamanan Akun & Sandi Admin */}
      {activeTab === 'keamanan' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <form onSubmit={handleChangePassword} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Key className="w-4 h-4 text-indigo-600" />
                  Ganti Kata Sandi Administrator
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Perbarui kata sandi login panel admin demi keamanan akses sistem portal kepengawasan.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kata Sandi Lama *
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Masukkan kata sandi saat ini"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kata Sandi Baru *
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Minimal 6 karakter"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Konfirmasi Kata Sandi Baru *
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ulangi kata sandi baru"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="inline-flex items-center space-x-1.5 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>{isChangingPassword ? 'Memperbarui...' : 'Perbarui Kata Sandi'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Side Info Card */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-xs space-y-4">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Status Sistem & Keamanan
              </h4>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span>Basis Data Engine:</span>
                  <span className="font-semibold text-white">Hybrid Cloud / Local JSON</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span>Enkripsi Sandi:</span>
                  <span className="font-semibold text-emerald-400">BCrypt Salted Hash</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span>Sesi Otentikasi:</span>
                  <span className="font-semibold text-emerald-400">JWT Token Aman</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>Pencadangan Data:</span>
                  <span className="font-semibold text-white">JSON Snapshot Terverifikasi</span>
                </div>
              </div>
              <button
                onClick={() => setIsBackupModalOpen(true)}
                className="w-full mt-2 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 border border-white/20 transition cursor-pointer"
              >
                <HardDrive className="w-4 h-4 text-amber-300" />
                <span>Buka Backup Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backup Modal */}
      {isBackupModalOpen && (
        <BackupModal
          isOpen={isBackupModalOpen}
          onClose={() => setIsBackupModalOpen(false)}
          onRestoreSuccess={() => {
            reloadSettings();
            notify('success', 'Data website berhasil dipulihkan secara menyeluruh!');
          }}
        />
      )}
    </div>
  );
};
