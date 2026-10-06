import React, { useState } from 'react';
import {
  LayoutDashboard,
  User,
  School,
  FileText,
  Network,
  Building,
  Award,
  Crown,
  Users,
  Trophy,
  BookOpen,
  BellRing,
  Image as ImageIcon,
  MessageSquare,
  Settings,
  ShieldCheck,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
  Database,
  BookMarked
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { BackupModal } from '../../components/common/BackupModal';

interface AdminLayoutProps {
  currentSection?: string;
  currentTab?: string;
  onSelectSection?: (section: string) => void;
  onSelectTab?: (tab: string) => void;
  onNavigatePublic?: (path: string) => void;
  onNavigateToPublic?: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentSection,
  currentTab,
  onSelectSection,
  onSelectTab,
  onNavigatePublic,
  onNavigateToPublic,
  children
}) => {
  const activeSection = currentTab || currentSection || 'dashboard';
  const handleSelectSection = (s: string) => {
    if (onSelectTab) onSelectTab(s);
    if (onSelectSection) onSelectSection(s);
  };
  const handleNavigatePublic = (p: string) => {
    if (onNavigateToPublic) onNavigateToPublic();
    if (onNavigatePublic) onNavigatePublic(p);
  };
  const { admin, logout } = useAuth();
  const { settings } = useSettings();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  const userRole = (admin?.role || '').toUpperCase();
  const isSuperAdmin = userRole === 'SUPERADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'SUPER ADMIN';

  // Level admin khusus: Visi & Misi, Struktur Organisasi, Fasilitas, Keunggulan, Data guru, Prestasi, Berita
  const allowedAdminTabs = ['dashboard', 'visimisi', 'struktur', 'fasilitas', 'keunggulan', 'guru', 'prestasi', 'berita'];

  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pengawas', label: 'Profil Pengawas', icon: User },
    { id: 'sekolah', label: 'Sekolah Binaan', icon: School },
    { id: 'visimisi', label: 'Visi & Misi Sekolah', icon: FileText },
    { id: 'struktur', label: 'Struktur Organisasi', icon: Network },
    { id: 'fasilitas', label: 'Fasilitas Sekolah', icon: Building },
    { id: 'keunggulan', label: 'Keunggulan Sekolah', icon: Award },
    { id: 'kepalaSekolah', label: 'Daftar Kepala Sekolah', icon: Crown },
    { id: 'guru', label: 'Data Guru', icon: Users },
    { id: 'prestasi', label: 'Prestasi Sekolah', icon: Trophy },
    { id: 'berita', label: 'Berita', icon: BookOpen },
    { id: 'pengumuman', label: 'Pengumuman', icon: BellRing },
    { id: 'galeri', label: 'Galeri Media', icon: ImageIcon },
    { id: 'kontak', label: 'Pesan Kontak', icon: MessageSquare },
    { id: 'bukuTamu', label: 'Buku Tamu', icon: BookMarked },
    { id: 'settings', label: 'Pengaturan Website', icon: Settings },
    { id: 'backup', label: 'Backup & Restore', icon: Database },
    { id: 'security', label: 'Manajemen Admin', icon: ShieldCheck }
  ];

  const menuItems = isSuperAdmin 
    ? allMenuItems 
    : allMenuItems.filter((item) => allowedAdminTabs.includes(item.id));

  const handleSelect = (id: string) => {
    if (id === 'backup') {
      setIsBackupOpen(true);
      setSidebarOpen(false);
      return;
    }
    handleSelectSection(id);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800">
        <div className="px-4 sm:px-6 flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 flex items-center justify-center shrink-0">
                <img
                  src={settings?.logo || '/logo-kampar.png'}
                  alt="Logo Kabupaten Kampar"
                  className="max-h-8 max-w-8 w-auto h-auto object-contain"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.onerror = null;
                    target.src = '/logo-kampar.png';
                  }}
                />
              </div>
              <div>
                <span className="font-extrabold text-sm block tracking-tight">
                  PANEL ADMINISTRATOR
                </span>
                <span className="text-[10px] text-blue-300 block -mt-0.5">
                  {settings?.namaPortal || 'Portal Pengawas Sekolah'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            {isSuperAdmin && (
              <button
                onClick={() => setIsBackupOpen(true)}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-amber-300 hover:text-amber-100 bg-amber-950/70 hover:bg-amber-900/90 px-3 py-1.5 rounded-lg border border-amber-800/80 transition-colors cursor-pointer"
                title="Ambil dan unduh cadangan database website"
              >
                <Database className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Backup Data</span>
              </button>
            )}

            <button
              onClick={() => handleNavigatePublic('/')}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors cursor-pointer"
            >
              <span>Lihat Website Publik</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <div className="hidden sm:flex items-center space-x-2 pl-3 border-l border-slate-800 text-xs">
              <span className={`w-2 h-2 rounded-full ${isSuperAdmin ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
              <span className="text-slate-200 font-medium">{admin?.name || 'Administrator'}</span>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                  isSuperAdmin
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                    : 'bg-blue-500/20 text-blue-300 border-blue-400/40'
                }`}
              >
                {isSuperAdmin ? 'SUPERADMIN' : 'ADMIN'}
              </span>
            </div>

            <button
              onClick={logout}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-rose-300 hover:text-rose-100 bg-rose-950/60 hover:bg-rose-900/80 px-3 py-1.5 rounded-lg border border-rose-800/80 transition-colors cursor-pointer"
              title="Keluar"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 border-r border-slate-800 transform lg:static lg:translate-x-0 transition-transform duration-200 ease-in-out flex flex-col pt-16 lg:pt-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-3 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Menu Pengelolaan
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-none">
            {menuItems.map((item) => {
              const active =
                activeSection === item.id ||
                (item.id === 'settings' && (activeSection === 'pengaturan' || activeSection === 'settings')) ||
                (item.id === 'security' && activeSection === 'security') ||
                (item.id === 'kepalaSekolah' && (activeSection === 'kepsek' || activeSection === 'kepalaSekolah')) ||
                (item.id === 'bukuTamu' && (activeSection === 'bukutamu' || activeSection === 'bukuTamu')) ||
                (item.id === 'kontak' && activeSection === 'kontak');
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${active ? 'text-amber-300' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {active && <ChevronRight className="w-3.5 h-3.5 text-blue-200" />}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
            <span className="block text-[11px] text-slate-300 font-bold">
              {isSuperAdmin ? 'Level: Superadmin (Akses Semua)' : 'Level: Admin (20 Akun Binaan)'}
            </span>
            <span className="block text-[10px] text-slate-400 mt-0.5">
              {isSuperAdmin ? 'Pengawasan, Sekolah & Sistem' : 'Visi Misi, Guru, Berita & Fasilitas'}
            </span>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Global Backup Modal Accessible from Anywhere in Admin */}
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        onShowToast={(msg, type) => {
          // Native toast fallback or dispatch
          console.log(`[Backup ${type}]: ${msg}`);
        }}
      />
    </div>
  );
};
