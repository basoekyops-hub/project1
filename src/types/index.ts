export interface PengawasProfile {
  id: string;
  nama: string;
  gelar: string;
  nip: string;
  pangkatGolongan: string;
  jabatan: string;
  wilayahKerja: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  email: string;
  noHp: string;
  foto: string;
  riwayatPendidikan: string;
  pengalaman: string;
  kompetensi: string;
  tugasFungsi: string;
  peranPengawas: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WebsiteSettings {
  id: string;
  namaPortal: string;
  subjudul: string;
  namaPengawas: string;
  fotoPengawas: string;
  nipPengawas: string;
  jabatan: string;
  jenjang: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  email: string;
  telepon: string;
  whatsapp: string;
  alamat: string;
  logo: string;
  favicon: string;
  deskripsi: string;
  footer: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  mapsUrl?: string;
  latitude?: number;
  longitude?: number;
  updatedAt?: string;

  // Additional aliases for compatibility
  namaWebsite?: string;
  tagline?: string;
  deskripsiSingkat?: string;
  logoUrl?: string;
  heroImageUrl?: string;
  bannerUrl?: string;
  primaryColor?: string;
  alamatKantor?: string;
  emailPengawas?: string;
  nomorTelepon?: string;
  nomorWhatsApp?: string;
  jamKerja?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  showBukuTamu?: boolean;
  showStats?: boolean;
}

export interface School {
  id: string;
  nama: string;
  npsn: string;
  jenjang: string;
  status: string;
  alamat: string;
  desaKelurahan?: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  foto?: string;
  latitude?: number;
  longitude?: number;
  mapsUrl?: string;
  akreditasi?: string;
  kepalaSekolahNama?: string;
  kepalaSekolahFoto?: string;
  fotoKepalaSekolah?: string;
  jumlahGuru?: number;
  jumlahSiswa?: number;
  telepon?: string;
  email?: string;
  website?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VisiMisi {
  id?: string;
  sekolahId: string;
  visi: string;
  misi: string;
  tujuan: string;
  programUnggulan: string;
}

export interface StrukturOrganisasi {
  id: string;
  sekolahId: string;
  nama: string;
  jabatan: string;
  bagian?: string;
  foto?: string;
  urutan: number;
  keterangan?: string;
}

export interface Fasilitas {
  id: string;
  sekolahId: string;
  nama: string;
  deskripsi?: string;
  foto?: string;
  kondisi?: string;
  jumlah: number;
  unit: string;
}

export interface Keunggulan {
  id: string;
  sekolahId: string;
  judul: string;
  kategori: string;
  deskripsi: string;
  icon?: string;
}

export interface KepalaSekolah {
  id: string;
  sekolahId: string;
  nama: string;
  gelar?: string;
  nip?: string;
  periode: string;
  status: string;
  foto?: string;
  fotoUrl?: string;
  keterangan?: string;
  sambutan?: string;
  riwayatPendidikan?: string;
  pesanInspiratif?: string;
}

export interface Guru {
  id: string;
  sekolahId: string;
  nama: string;
  gelar?: string;
  nip?: string;
  nuptk?: string;
  jabatan: string;
  mapel?: string;
  mataPelajaran?: string;
  pendidikan?: string;
  statusKepegawaian?: string;
  email?: string;
  foto?: string;
  fotoUrl?: string;
  tampilkanPublik?: boolean;
}

export interface Prestasi {
  id: string;
  sekolahId?: string;
  sekolahNama?: string;
  namaPrestasi?: string;
  judul?: string;
  tingkat: string;
  tahun: number;
  bidang?: string;
  kategori?: string;
  peraih?: string;
  namaPeraih?: string;
  peringkat?: string;
  keterangan?: string;
  deskripsi?: string;
  foto?: string;
  fotoUrl?: string;
}

export const KATEGORI_BERITA = [
  'APK Digital',
  'Pengawasan',
  'Pendampingan',
  'Sekolah',
  'Pendidikan',
  'Pengumuman',
  'Kegiatan',
  'Prestasi'
] as const;

export type KategoriBerita = (typeof KATEGORI_BERITA)[number] | string;

export interface Berita {
  id: string;
  sekolahId?: string;
  sekolahNama?: string;
  judul: string;
  slug?: string;
  thumbnail?: string;
  gambarUrl?: string;
  gambar?: string;
  foto?: string;
  fotoUrl?: string;
  ringkasan?: string;
  konten: string;
  penulis: string;
  tanggal: string;
  kategori: string;
  statusPublish?: boolean;
  featured?: boolean;
  tags?: string[];
}

export interface Pengumuman {
  id: string;
  judul: string;
  isi?: string;
  konten?: string;
  tanggal: string;
  prioritas?: 'Normal' | 'Penting' | 'Mendesak' | string;
  statusPublish?: boolean;
  lampiranUrl?: string;
  sekolahId?: string;
  tipe?: string;
  berlakuSampai?: string;
  fileUrl?: string;
}

export interface Galeri {
  id: string;
  sekolahId?: string;
  sekolahNama?: string;
  judul: string;
  kategori: string;
  jenis?: 'FOTO' | 'VIDEO' | string;
  tipe?: string;
  url: string;
  thumbnailUrl?: string;
  deskripsi?: string;
  keterangan?: string;
  tanggal: string;
}

export interface Kontak {
  id: string;
  nama: string;
  email: string;
  telepon?: string;
  subjek: string;
  pesan: string;
  status: string;
  createdAt: string;
}

export interface VisitorDayStat {
  date: string;
  label: string;
  visitors: number;
  pageViews: number;
}

export interface VisitorTopPage {
  path: string;
  label: string;
  views: number;
}

export interface VisitorStatsSummary {
  totalVisitors: number;
  totalPageViews: number;
  todayVisitors: number;
  todayPageViews: number;
  weekVisitors: number;
  monthVisitors: number;
  activeNow: number;
  recentDays: VisitorDayStat[];
  topPages: VisitorTopPage[];
}

export interface DashboardStats {
  totalSekolah: number;
  totalKepalaSekolah: number;
  totalGuru: number;
  totalSiswa: number;
  totalPrestasi: number;
  totalBerita: number;
  totalGaleri: number;
  totalPengumuman: number;
  totalKontakBaru: number;
  sekolahJenjang: {
    SD: number;
    TK: number;
    Lainnya: number;
  };
  guruStatus: {
    PNS: number;
    PPPK: number;
    Honorer: number;
    Lainnya: number;
  };
  recentBerita: Berita[];
  recentPrestasi: Prestasi[];
  visitors?: VisitorStatsSummary;
}

export interface AdminAuth {
  token: string;
  admin: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface BukuTamu {
  id: string;
  nama: string;
  jabatan?: string;
  instansi: string;
  masukan?: string;
  keperluan?: string;
  pesan?: string;
  telepon?: string;
  email?: string;
  tanggal?: string;
  createdAt: string;
}
