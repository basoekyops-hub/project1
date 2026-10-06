import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Toast, ToastMessage } from './components/common/Toast';
import { LightboxModal } from './components/common/LightboxModal';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';

// Public Pages
import { Home } from './pages/public/Home';
import { ProfilPengawas } from './pages/public/ProfilPengawas';
import { SekolahList } from './pages/public/SekolahList';
import { SekolahDetail } from './pages/public/SekolahDetail';
import { BeritaList } from './pages/public/BeritaList';
import { BeritaDetail } from './pages/public/BeritaDetail';
import { GaleriList } from './pages/public/GaleriList';
import { PrestasiList } from './pages/public/PrestasiList';
import { KepalaSekolahList } from './pages/public/KepalaSekolahList';
import { GuruList } from './pages/public/GuruList';
import { KontakLokasi } from './pages/public/KontakLokasi';
import { BukuTamuPage } from './pages/public/BukuTamuPage';

// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminPengawas } from './pages/admin/AdminPengawas';
import { AdminSekolah } from './pages/admin/AdminSekolah';
import { AdminVisiMisi } from './pages/admin/AdminVisiMisi';
import { AdminStruktur } from './pages/admin/AdminStruktur';
import { AdminFasilitas } from './pages/admin/AdminFasilitas';
import { AdminKeunggulan } from './pages/admin/AdminKeunggulan';
import { AdminKepalaSekolah } from './pages/admin/AdminKepalaSekolah';
import { AdminGuru } from './pages/admin/AdminGuru';
import { AdminPrestasi } from './pages/admin/AdminPrestasi';
import { AdminBerita } from './pages/admin/AdminBerita';
import { AdminPengumuman } from './pages/admin/AdminPengumuman';
import { AdminGaleri } from './pages/admin/AdminGaleri';
import { AdminBukuTamu } from './pages/admin/AdminBukuTamu';
import { AdminPengaturan } from './pages/admin/AdminPengaturan';
import { AdminKontak } from './pages/admin/AdminKontak';
import { AdminSecurity } from './pages/admin/AdminSecurity';
import { Galeri } from './types';

function MainApp() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { settings } = useSettings();

  // Navigation State
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pageParams, setPageParams] = useState<any>({});
  const [adminTab, setAdminTab] = useState<string>('dashboard');

  // Modals & Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [lightboxItem, setLightboxItem] = useState<Galeri | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Sync with browser URL / history for deep linking if hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash) {
        setCurrentPage('home');
        setPageParams({});
        return;
      }

      const [route, param] = hash.split('/');
      if (route === 'admin') {
        setCurrentPage('admin');
        if (param) setAdminTab(param);
      } else if (route === 'sekolah' && param) {
        setCurrentPage('sekolah-detail');
        setPageParams({ id: param });
      } else if (route === 'berita' && param) {
        setCurrentPage('berita-detail');
        setPageParams({ id: param });
      } else {
        setCurrentPage(route || 'home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (page: string, params: any = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (page === 'home') {
      window.location.hash = '';
    } else if (page === 'sekolah-detail' && params.id) {
      window.location.hash = `sekolah/${params.id}`;
    } else if (page === 'berita-detail' && params.id) {
      window.location.hash = `berita/${params.id}`;
    } else if (page === 'admin') {
      window.location.hash = `admin/${adminTab}`;
    } else {
      window.location.hash = page;
    }
  };

  const handleAdminTabChange = (tab: string) => {
    setAdminTab(tab);
    window.location.hash = `admin/${tab}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handlePublicNavigate = (path: string) => {
    if (!path || path === '/') {
      navigate('home');
      return;
    }
    const clean = path.replace(/^\//, '');
    if (clean.startsWith('sekolah/')) {
      const id = clean.replace('sekolah/', '');
      navigate('sekolah-detail', { id });
    } else if (clean.startsWith('berita/')) {
      const slug = clean.replace('berita/', '');
      navigate('berita-detail', { id: slug, slug });
    } else {
      navigate(clean);
    }
  };

  // If in admin mode
  if (currentPage === 'admin') {
    if (authLoading) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-sm">
          Memeriksa autentikasi administrator...
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <AdminLogin
          onSuccess={() => {
            addToast('success', 'Selamat datang di Panel Admin Pengawas');
            setAdminTab('dashboard');
          }}
          onBackToPublic={() => navigate('home')}
        />
      );
    }

    return (
      <AdminLayout
        currentSection={adminTab}
        currentTab={adminTab}
        onSelectSection={handleAdminTabChange}
        onSelectTab={handleAdminTabChange}
        onNavigatePublic={handlePublicNavigate}
        onNavigateToPublic={() => navigate('home')}
      >
        <Toast toasts={toasts} onClose={removeToast} />
        {adminTab === 'dashboard' && (
          <AdminDashboard
            onSelectSection={handleAdminTabChange}
            onSelectTab={handleAdminTabChange}
            onNavigateToPublic={() => navigate('home')}
            onShowToast={(msg, type) => addToast(type, msg)}
          />
        )}
        {adminTab === 'pengawas' && <AdminPengawas onNotify={addToast} onShowToast={(msg, type) => addToast(type, msg)} />}
        {adminTab === 'sekolah' && <AdminSekolah onNotify={addToast} onShowToast={(msg, type) => addToast(type, msg)} />}
        {adminTab === 'visimisi' && <AdminVisiMisi onNotify={addToast} onShowToast={(msg, type) => addToast(type, msg)} />}
        {adminTab === 'struktur' && <AdminStruktur onNotify={addToast} onShowToast={(msg, type) => addToast(type, msg)} />}
        {adminTab === 'fasilitas' && <AdminFasilitas onNotify={addToast} onShowToast={(msg, type) => addToast(type, msg)} />}
        {adminTab === 'keunggulan' && <AdminKeunggulan onNotify={addToast} onShowToast={(msg, type) => addToast(type, msg)} />}
        {(adminTab === 'kepsek' || adminTab === 'kepalaSekolah') && <AdminKepalaSekolah onNotify={addToast} />}
        {adminTab === 'guru' && <AdminGuru onNotify={addToast} />}
        {adminTab === 'prestasi' && <AdminPrestasi onNotify={addToast} />}
        {adminTab === 'berita' && <AdminBerita onNotify={addToast} />}
        {adminTab === 'pengumuman' && <AdminPengumuman onNotify={addToast} />}
        {adminTab === 'galeri' && <AdminGaleri onNotify={addToast} />}
        {adminTab === 'kontak' && <AdminKontak onNotify={addToast} onShowToast={(msg, type) => addToast(type, msg)} />}
        {(adminTab === 'bukutamu' || adminTab === 'bukuTamu') && <AdminBukuTamu onNotify={addToast} />}
        {(adminTab === 'pengaturan' || adminTab === 'settings') && (
          <AdminPengaturan onNotify={addToast} onShowToast={(msg, type) => addToast(type, msg)} />
        )}
        {adminTab === 'security' && (
          <AdminSecurity onNotify={addToast} onShowToast={(msg, type) => addToast(type, msg)} />
        )}
      </AdminLayout>
    );
  }

  // Public portal view
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased font-sans">
      <Navbar
        currentPath={currentPage === 'home' ? '/' : `/${currentPage}`}
        onNavigate={handlePublicNavigate}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      <main className="flex-1">
        {currentPage === 'home' && (
          <Home
            onNavigate={handlePublicNavigate}
            onOpenLightbox={(item) => setLightboxItem(item)}
          />
        )}

        {currentPage === 'profil-pengawas' && <ProfilPengawas />}

        {currentPage === 'sekolah' && (
          <SekolahList onNavigate={handlePublicNavigate} />
        )}

        {currentPage === 'sekolah-detail' && (
          <SekolahDetail
            schoolId={pageParams.id || ''}
            onNavigate={handlePublicNavigate}
            onOpenLightbox={(item) => setLightboxItem(item)}
          />
        )}

        {currentPage === 'berita' && (
          <BeritaList onNavigate={handlePublicNavigate} />
        )}

        {currentPage === 'berita-detail' && (
          <BeritaDetail
            slug={pageParams.slug || pageParams.id || ''}
            onNavigate={handlePublicNavigate}
          />
        )}

        {currentPage === 'galeri' && (
          <GaleriList onOpenLightbox={(item) => setLightboxItem(item)} />
        )}

        {currentPage === 'prestasi' && <PrestasiList />}

        {currentPage === 'kepala-sekolah' && (
          <KepalaSekolahList onNavigate={handlePublicNavigate} />
        )}

        {currentPage === 'guru' && <GuruList />}

        {currentPage === 'kontak-lokasi' && <KontakLokasi onNotify={addToast} />}

        {currentPage === 'buku-tamu' && <BukuTamuPage onNotify={addToast} />}
      </main>

      <Footer onNavigate={handlePublicNavigate} />

      {/* Global Modals & Notifications */}
      <Toast toasts={toasts} onClose={removeToast} />
      <LightboxModal item={lightboxItem} onClose={() => setLightboxItem(null)} />
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={navigate}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <MainApp />
      </SettingsProvider>
    </AuthProvider>
  );
}
