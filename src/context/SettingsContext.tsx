import React, { createContext, useContext, useState, useEffect } from 'react';
import { WebsiteSettings, PengawasProfile } from '../types';
import { api } from '../services/api';

interface SettingsContextType {
  settings: WebsiteSettings | null;
  pengawas: PengawasProfile | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  refreshPengawas: () => Promise<void>;
  updateSettings: (data: any) => Promise<any>;
  reloadSettings: () => Promise<void>;
}

const defaultSettings: WebsiteSettings = {
  id: 'default',
  namaPortal: 'PORTAL PENGAWAS SEKOLAH',
  subjudul: 'Informasi, Pendampingan, Dokumentasi dan Pengembangan Mutu Satuan Pendidikan',
  namaPengawas: 'H. Ahmad Syafii, M.Pd.',
  fotoPengawas: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600',
  nipPengawas: '19750812 200003 1 004',
  jabatan: 'Pengawas Sekolah Madya TK/SD',
  jenjang: 'TK / SD',
  kecamatan: 'Tapung Hilir',
  kabupaten: 'Kampar',
  provinsi: 'Riau',
  email: 'digitalpengawas@gmail.com',
  telepon: '+62 812-7654-3210',
  whatsapp: '6281276543210',
  alamat: 'Jl. Jenderal Sudirman No. 45, Kompleks Dinas Pendidikan',
  logo: '',
  favicon: '',
  deskripsi: 'Portal resmi pendampingan, informasi, dan pembinaan mutu pendidikan satuan TK/SD.',
  footer: '  2026 Portal Pengawas Sekolah. Informasi, Pendampingan, Dokumentasi dan Pengembangan Mutu Satuan Pendidikan. Pengawas Sekolah TK/SD.',
  facebook: 'https://facebook.com',
  instagram: 'https://instagram.com',
  youtube: 'https://youtube.com',
  mapsUrl: 'https://maps.google.com/?q=Tapung+Hilir+Kampar',
  latitude: 0.6931,
  longitude: 101.2185
};

const defaultPengawas: PengawasProfile = {
  id: 'pengawas-001',
  nama: 'H. Ahmad Syafii, M.Pd.',
  gelar: 'M.Pd.',
  nip: '19750812 200003 1 004',
  pangkatGolongan: 'Pembina Tk. I / IV b',
  jabatan: 'Pengawas Sekolah Madya',
  wilayahKerja: 'Kecamatan Tapung Hilir, Wilayah Binaan I',
  kecamatan: 'Tapung Hilir',
  kabupaten: 'Kampar',
  provinsi: 'Riau',
  email: 'digitalpengawas@gmail.com',
  noHp: '+62 812-7654-3210',
  foto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600',
  riwayatPendidikan: 'S1 Pendidikan Guru Sekolah Dasar (Universitas Riau)\nS2 Manajemen Pendidikan (Universitas Negeri Padang)',
  pengalaman: '1. Guru Kelas SD Negeri (1998 - 2008)\n2. Kepala Sekolah Dasar Inti (2008 - 2017)\n3. Pengawas Sekolah TK/SD (2017 - Sekarang)',
  kompetensi: 'Supervisi Akademik, Supervisi Manajerial, Evaluasi Mutu Pendidikan, Asesmen Pembelajaran, Kepemimpinan Perubahan',
  tugasFungsi: 'Melaksanakan tugas pengawasan akademik dan manajerial pada satuan pendidikan yang meliputi perencanaan program, pelaksanaan pendampingan bermakna, pemantauan 8 Standar Nasional Pendidikan, pembinaan kepala sekolah dan guru, serta evaluasi mutu.',
  peranPengawas: '1. Pendampingan Satuan Pendidikan\n2. Supervisi Akademik & Manajerial\n3. Pemantauan & Evaluasi Mutu\n4. Pembinaan Kepala Sekolah\n5. Pendampingan Guru\n6. Pengembangan Mutu Sekolah'
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<WebsiteSettings | null>(defaultSettings);
  const [pengawas, setPengawas] = useState<PengawasProfile | null>(defaultPengawas);
  const [loading, setLoading] = useState(true);

  const refreshSettings = async () => {
    try {
      const data = await api.getSettings();
      if (data && data.namaPortal) {
        setSettings(data);
      }
    } catch (e) {
      console.warn('Failed to load settings:', e);
    }
  };

  const refreshPengawas = async () => {
    try {
      const data = await api.getPengawas();
      if (data && data.nama) {
        setPengawas(data);
      }
    } catch (e) {
      console.warn('Failed to load pengawas:', e);
    }
  };

  useEffect(() => {
    Promise.all([refreshSettings(), refreshPengawas()]).finally(() => {
      setLoading(false);
    });
  }, []);

  const updateSettings = async (data: any) => {
    try {
      const updated = await api.updateSettings(data);
      if (updated) setSettings(updated);
      return updated;
    } catch (e) {
      console.warn('Failed to update settings:', e);
      throw e;
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings: settings || defaultSettings,
        pengawas: pengawas || defaultPengawas,
        loading,
        refreshSettings,
        refreshPengawas,
        updateSettings,
        reloadSettings: refreshSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
