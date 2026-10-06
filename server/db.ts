import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  AdminUser,
  PengawasData,
  SekolahData,
  VisiMisiData,
  StrukturOrganisasiData,
  FasilitasData,
  KeunggulanData,
  KepalaSekolahData,
  GuruData,
  PrestasiData,
  BeritaData,
  PengumumanData,
  GaleriData,
  KontakData,
  PengaturanWebsiteData,
  VisitorRecord,
  VisitorStatsSummary,
  VisitorDayStat,
  VisitorTopPage,
  BukuTamuData
} from './types.js';

interface DatabaseSchema {
  admins: AdminUser[];
  pengawas: PengawasData[];
  sekolah: SekolahData[];
  visiMisi: VisiMisiData[];
  strukturOrganisasi: StrukturOrganisasiData[];
  fasilitas: FasilitasData[];
  keunggulan: KeunggulanData[];
  kepalaSekolah: KepalaSekolahData[];
  guru: GuruData[];
  prestasi: PrestasiData[];
  berita: BeritaData[];
  pengumuman: PengumumanData[];
  galeri: GaleriData[];
  kontak: KontakData[];
  pengaturanWebsite: PengaturanWebsiteData[];
  bukuTamu?: BukuTamuData[];
  visitors?: VisitorRecord[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function formatIndonesianDay(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${dayNames[dt.getDay()]}, ${d} ${monthNames[dt.getMonth()]}`;
}

function getPageLabel(path: string): string {
  if (path === '/' || path === '') return 'Beranda Utama';
  if (path === '/profil-pengawas') return 'Profil Pengawas';
  if (path === '/sekolah') return 'Sekolah Binaan';
  if (path.startsWith('/sekolah/')) return 'Detail Sekolah';
  if (path === '/berita') return 'Warta & Pengawasan';
  if (path.startsWith('/berita/')) return 'Detail Berita';
  if (path === '/guru') return 'Direktori Guru';
  if (path === '/prestasi') return 'Prestasi Sekolah';
  if (path === '/galeri') return 'Galeri Dokumentasi';
  if (path === '/kontak') return 'Kontak & Lokasi';
  return path;
}

function generateInitialVisitorData(): VisitorRecord[] {
  const records: VisitorRecord[] = [];
  const now = new Date();
  const pages = ['/', '/profil-pengawas', '/sekolah', '/berita', '/guru', '/prestasi', '/galeri', '/kontak'];

  for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
    const targetDate = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
    const dateStr = targetDate.toISOString().split('T')[0];
    const dailyUniqueCount = 18 + Math.floor(Math.sin(dayOffset * 1.7) * 7 + (dayOffset % 3) * 3);

    for (let v = 0; v < dailyUniqueCount; v++) {
      const visitorId = `vis_seed_${dayOffset}_${v}`;
      const hits = 1 + ((v + dayOffset) % 3);
      for (let h = 0; h < hits; h++) {
        const hour = 7 + ((v * 2 + h * 3) % 14);
        const min = (v * 7 + h * 13) % 60;
        const recordTime = new Date(targetDate);
        recordTime.setHours(hour, min, (v * 11) % 60);
        records.push({
          id: `vis-seed-${dayOffset}-${v}-${h}`,
          visitorId,
          path: pages[(v + h) % pages.length],
          timestamp: recordTime.toISOString(),
          date: dateStr
        });
      }
    }
  }
  return records;
}

function getInitialData(): DatabaseSchema {
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('Admin123!', salt);
  const now = new Date().toISOString();
  const schoolId = 'sch-001';

  return {
    admins: [
      {
        id: 'admin-001',
        email: 'admin@pengawassekolah.id',
        passwordHash,
        name: 'Administrator Portal',
        role: 'SUPERADMIN',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'admin-002',
        email: 'yeniariza61@admin.sd.belajar.id',
        passwordHash,
        name: 'Yeni Ariza (Admin Pembina)',
        role: 'SUPERADMIN',
        createdAt: now,
        updatedAt: now
      },
      // 20 Admin Users dengan Akses Terbatas (Visi & Misi, Struktur, Fasilitas, Keunggulan, Guru, Prestasi, Berita)
      {
        id: 'admin-003',
        email: 'admin01@pengawassekolah.id',
        passwordHash,
        name: 'Admin UPT SDN 001 Pantairaja',
        role: 'ADMIN',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'admin-004',
        email: 'admin02@pengawassekolah.id',
        passwordHash,
        name: 'Admin UPT SD Negeri 002 Kampung Pinang',
        role: 'ADMIN',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'admin-005',
        email: 'admin03@pengawassekolah.id',
        passwordHash,
        name: 'Admin UPT SD Negeri 003 Lubuk Sakat',
        role: 'ADMIN',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'admin-006',
        email: 'admin04@pengawassekolah.id',
        passwordHash,
        name: 'Admin UPT SD Negeri 004 Hangtuah',
        role: 'ADMIN',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'admin-007',
        email: 'admin05@pengawassekolah.id',
        passwordHash,
        name: 'Admin UPT SD Negeri 005 Hangtuah',
        role: 'ADMIN',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'admin-008',
        email: 'admin06@pengawassekolah.id',
        passwordHash,
        name: 'Admin UPT SD Negeri 006 Sialang Kubang',
        role: 'ADMIN',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'admin-009',
        email: 'admin07@pengawassekolah.id',
        passwordHash,
        name: 'Admin UPT SD Negeri 007 Hangtuah',
        role: 'ADMIN',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'admin-010',
        email: 'admin08@pengawassekolah.id',
        passwordHash,
        name: 'Admin UPT SD Negeri 008 Hangtuah',
        role: 'ADMIN',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'admin-011',
        email: 'admin09@pengawassekolah.id',
        passwordHash,
        name: 'Admin UPT SD Negeri 009 Sialang Kubang',
        role: 'ADMIN',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'admin-012',
        email: 'admin10@pengawassekolah.id',
        passwordHash,
        name: 'Admin UPT SD Negeri 010 Pantairaja',
        role: 'ADMIN',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'admin-013',
        email: 'admin11@pengawassekolah.id',
        passwordHash,
        name: 'Admin SD IT Mambaul Ulum Sialang Kubang',
        role: 'ADMIN',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'admin-014',
        email: 'admin12@pengawassekolah.id',
        passwordHash,
        name: 'Admin TK Alfalah',
        role: 'ADMIN',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'admin-015',
        email: 'admin13@pengawassekolah.id',
        passwordHash,
        name: 'Admin TK Hangtuah',
        role: 'ADMIN',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'admin-016',
        email: 'admin14@pengawassekolah.id',
        passwordHash,
        name: 'Admin TK Al-Rizky Nusantara',
        role: 'ADMIN',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'admin-017',
        email: 'admin15@pengawassekolah.id',
        passwordHash,
        name: 'Admin TK Islam Terpadu',
        role: 'ADMIN',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'admin-018',
        email: 'admin16@pengawassekolah.id',
        passwordHash,
        name: 'Admin TK An-Nur',
        role: 'ADMIN',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'admin-019',
        email: 'admin17@pengawassekolah.id',
        passwordHash,
        name: 'Admin TK An-Nizam',
        role: 'ADMIN',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'admin-020',
        email: 'admin18@pengawassekolah.id',
        passwordHash,
        name: 'Admin Gugus I Mutu Satuan Pendidikan',
        role: 'ADMIN',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'admin-021',
        email: 'admin19@pengawassekolah.id',
        passwordHash,
        name: 'Admin Gugus II Kurikulum & Supervisi',
        role: 'ADMIN',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'admin-022',
        email: 'admin20@pengawassekolah.id',
        passwordHash,
        name: 'Admin Pengembang Konten Warta & Prestasi',
        role: 'ADMIN',
        createdAt: now,
        updatedAt: now
      }
    ],
    pengawas: [
      {
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
        pengalaman: '1. Guru Kelas SD Negeri (1998 - 2008)\n2. Kepala Sekolah Dasar Inti (2008 - 2017)\n3. Pengawas Sekolah TK/SD (2017 - Sekarang)\n4. Fasilitator Program Sekolah Penggerak Angkatan 2\n5. Narasumber Implementasi Kurikulum Merdeka',
        kompetensi: 'Supervisi Akademik Berdiferensiasi, Supervisi Manajerial Transformatif, Analisis Rapor Pendidikan, Kepemimpinan Pembelajaran, Penguatan Budaya Mutu & Karakter',
        tugasFungsi: 'Melaksanakan tugas pengawasan akademik dan manajerial pada satuan pendidikan yang meliputi perencanaan program tahunan/semester, pelaksanaan pendampingan bermakna, pemantauan 8 Standar Nasional Pendidikan, pembinaan kepala sekolah dan guru, evaluasi mutu, serta fasilitasi peningkatan kapasitas berkelanjutan.',
        peranPengawas: '1. Pendampingan Satuan Pendidikan yang berfokus pada kebutuhan murid\n2. Supervisi Akademik dan Manajerial transformatif\n3. Pemantauan dan Evaluasi implementasi Kurikulum Merdeka\n4. Pembinaan Kepemimpinan Kepala Sekolah yang visioner\n5. Pendampingan Guru dalam diferensiasi dan asesmen autentik\n6. Penguatan Ekosistem dan Mutu Satuan Pendidikan berkelanjutan',
        createdAt: now,
        updatedAt: now
      }
    ],
    pengaturanWebsite: [
      {
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
        logo: '/logo-kampar.png',
        favicon: '/logo-kampar.png',
        deskripsi: 'Portal resmi pendampingan, informasi, dan pembinaan mutu pendidikan satuan TK/SD untuk mewujudkan pembelajaran yang berpusat pada murid.',
        footer: '  2026 Portal Pengawas Sekolah. Informasi, Pendampingan, Dokumentasi dan Pengembangan Mutu Satuan Pendidikan. Pengawas Sekolah TK/SD.',
        facebook: 'https://facebook.com',
        instagram: 'https://instagram.com',
        youtube: 'https://youtube.com',
        tiktok: '',
        mapsUrl: 'https://maps.google.com/?q=Tapung+Hilir+Kampar',
        latitude: 0.6931,
        longitude: 101.2185,
        updatedAt: now
      }
    ],
    sekolah: [
      {
        id: schoolId,
        nama: 'UPT SD Negeri 009 Sialang Kubang',
        npsn: '10400512',
        jenjang: 'SD',
        status: 'Negeri',
        alamat: 'Jl. Poros Desa Sialang Kubang, RT 04 / RW 02',
        desaKelurahan: 'Sialang Kubang',
        kecamatan: 'Tapung Hilir',
        kabupaten: 'Kampar',
        provinsi: 'Riau',
        foto: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=800',
        latitude: 0.6931,
        longitude: 101.2185,
        mapsUrl: 'https://maps.google.com/?q=Sialang+Kubang',
        kepalaSekolahNama: 'Drs. Supriyanto, M.Si.',
        jumlahGuru: 16,
        jumlahSiswa: 285,
        telepon: '081267890123',
        email: 'sdn009sialangkubang@sch.id',
        website: 'https://sdn009sialangkubang.sch.id',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'sch-002',
        nama: 'UPT SD Negeri 004 Kota Baru',
        npsn: '10400518',
        jenjang: 'SD',
        status: 'Negeri',
        alamat: 'Jl. Melati No. 12 Desa Kota Baru',
        desaKelurahan: 'Kota Baru',
        kecamatan: 'Tapung Hilir',
        kabupaten: 'Kampar',
        provinsi: 'Riau',
        foto: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&q=80&w=800',
        latitude: 0.7012,
        longitude: 101.2341,
        mapsUrl: 'https://maps.google.com/?q=Kota+Baru+Tapung',
        kepalaSekolahNama: 'Hj. Siti Rahmah, S.Pd., M.Pd.',
        jumlahGuru: 14,
        jumlahSiswa: 240,
        telepon: '081398765432',
        email: 'sdn004kotabaru@sch.id',
        website: '',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'sch-003',
        nama: 'TK Negeri Pembina Tapung Hilir',
        npsn: '10499021',
        jenjang: 'TK',
        status: 'Negeri',
        alamat: 'Jl. Pendidikan Terpadu No. 01',
        desaKelurahan: 'Cinta Damai',
        kecamatan: 'Tapung Hilir',
        kabupaten: 'Kampar',
        provinsi: 'Riau',
        foto: 'https://images.unsplash.com/photo-1587691592099-24045742c181?auto=format&fit=crop&q=80&w=800',
        latitude: 0.6845,
        longitude: 101.2110,
        mapsUrl: 'https://maps.google.com/?q=Tapung+Hilir',
        kepalaSekolahNama: 'Sri Wahyuni, S.Pd.Aud.',
        jumlahGuru: 8,
        jumlahSiswa: 110,
        telepon: '085278123490',
        email: 'tknpembinatapung@gmail.com',
        website: '',
        createdAt: now,
        updatedAt: now
      }
    ],
    visiMisi: [
      {
        id: 'vm-001',
        sekolahId: schoolId,
        visi: 'Terwujudnya peserta didik yang beriman, bertakwa, berakhlak mulia, cerdas, terampil, dan berwawasan lingkungan menuju Profil Pelajar Pancasila yang tangguh.',
        misi: '1. Mengembangkan ekosistem religius, toleran, dan santun dalam kehidupan sekolah.\n2. Melaksanakan pembelajaran berdiferensiasi yang memerdekakan potensi minat dan bakat murid.\n3. Meningkatkan kecakapan literasi membaca dan numerasi bernalar kritis secara kontinu.\n4. Menerapkan budaya peduli lingkungan, hemat energi, dan pengolahan sampah mandiri.',
        tujuan: 'Menghasilkan lulusan yang berkepribadian kokoh, mandiri, siap beradaptasi di era digital, dan mencintai lingkungan hidup.',
        programUnggulan: '1. Program Sahabat Buku (Literasi Harian 15 Menit)\n2. Gerakan Numerasi Ceria Berbasis Media Lokal\n3. Adiwiyata Berkelanjutan & Kebun Bibit Siswa\n4. Pembiasaan Karakter Mulia & Sholat Dhuha Terpimpin',
        createdAt: now,
        updatedAt: now
      }
    ],
    strukturOrganisasi: [
      {
        id: 'so-001',
        sekolahId: schoolId,
        nama: 'Drs. Supriyanto, M.Si.',
        jabatan: 'Kepala Satuan Pendidikan',
        bagian: 'Pimpinan Satuan Pendidikan',
        foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        urutan: 1,
        keterangan: 'Bertanggung jawab penuh atas manajemen mutu dan supervisi sekolah',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'so-002',
        sekolahId: schoolId,
        nama: 'Nurul Hidayati, S.Pd.',
        jabatan: 'Wakil Kepala Sekolah / Kurikulum',
        bagian: 'Bidang Akademik & Kurikulum',
        foto: '',
        urutan: 2,
        keterangan: 'Koordinator kurikulum dan perencanaan pembelajaran',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'so-003',
        sekolahId: schoolId,
        nama: 'Bambang Irawan, S.Pd.SD.',
        jabatan: 'Koordinator Kesiswaan & Ekstrakurikuler',
        bagian: 'Bidang Kesiswaan',
        foto: '',
        urutan: 3,
        keterangan: 'Pengembangan minat bakat serta kedisiplinan murid',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'so-004',
        sekolahId: schoolId,
        nama: 'H. Sudarsono, S.E.',
        jabatan: 'Ketua Komite Sekolah',
        bagian: 'Kemitraan & Peran Serta Masyarakat',
        foto: '',
        urutan: 4,
        keterangan: 'Menjembatani aspirasi orang tua murid dan masyarakat',
        createdAt: now,
        updatedAt: now
      }
    ],
    fasilitas: [
      {
        id: 'fas-001',
        sekolahId: schoolId,
        nama: 'Perpustakaan Ramah Anak',
        deskripsi: 'Ruang baca berkarpet dengan ribuan buku cerita berjenjang, ensiklopedia edukasi, dan proyektor presentasi.',
        foto: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=800',
        kondisi: 'Baik',
        jumlah: 1,
        unit: 'Ruang',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'fas-002',
        sekolahId: schoolId,
        nama: 'Ruang Kelas Representatif Ber-AC',
        deskripsi: 'Ruang belajar yang nyaman dengan ventilasi memadai, smartboard, dan pojok literasi tiap kelas.',
        foto: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=800',
        kondisi: 'Baik',
        jumlah: 12,
        unit: 'Ruang',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'fas-003',
        sekolahId: schoolId,
        nama: 'Laboratorium Komputer & Chromebook',
        deskripsi: 'Dilengkapi 30 unit Chromebook bantuan pemerintah untuk pelaksanaan Asesmen Nasional Berbasis Komputer (ANBK).',
        foto: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800',
        kondisi: 'Baik',
        jumlah: 1,
        unit: 'Ruang',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'fas-004',
        sekolahId: schoolId,
        nama: 'Lapangan Olahraga Serbaguna',
        deskripsi: 'Lapangan semen untuk kegiatan senam pagi, upacara bendera, futsal, dan bulu tangkis.',
        foto: '',
        kondisi: 'Baik',
        jumlah: 1,
        unit: 'Lapangan',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'fas-005',
        sekolahId: schoolId,
        nama: 'UKS dan Ruang Bimbingan',
        deskripsi: 'Fasilitas kesehatan pertolongan pertama bekerjasama dengan Puskesmas Tapung Hilir.',
        foto: '',
        kondisi: 'Baik',
        jumlah: 1,
        unit: 'Ruang',
        createdAt: now,
        updatedAt: now
      }
    ],
    keunggulan: [
      {
        id: 'keu-001',
        sekolahId: schoolId,
        judul: 'Pelopor Sekolah Penggerak Mandiri',
        kategori: 'Akademik',
        deskripsi: 'Penerapan Kurikulum Merdeka secara menyeluruh dengan penguatan Modul Projek Penguatan Profil Pelajar Pancasila (P5) berbasis kearifan lokal kelapa sawit & seni Melayu.',
        icon: 'Award',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'keu-002',
        sekolahId: schoolId,
        judul: 'Budaya Literasi Digital & Pojok Baca Nyaman',
        kategori: 'Literasi',
        deskripsi: 'Setiap ruang kelas memiliki pojok baca kaya teks dan kegiatan apresiasi literasi mingguan untuk menumbuhkan kecintaan membaca sejak dini.',
        icon: 'BookOpen',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'keu-003',
        sekolahId: schoolId,
        judul: 'Sekolah Ramah Anak & Zero Bullying',
        kategori: 'Karakter',
        deskripsi: 'Mekanisme pendampingan psikososial murid, komitmen anti-perundungan terpadu, dan lingkungan bermain yang aman dan inklusif.',
        icon: 'ShieldCheck',
        createdAt: now,
        updatedAt: now
      }
    ],
    kepalaSekolah: [
      {
        id: 'ks-001',
        sekolahId: schoolId,
        nama: 'Drs. Supriyanto, M.Si.',
        nip: '19700415 199403 1 003',
        periode: '2021 - Sekarang',
        status: 'Aktif',
        foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        keterangan: 'Kepala Sekolah Penggerak Angkatan II',
        sambutan: 'Assalamu alaikum Warahmatullahi Wabarakatuh.\n\nSelamat datang di Portal Resmi Informasi Satuan Pendidikan kami. Kehadiran portal ini di bawah bimbingan Pengawas Sekolah Pembina merupakan langkah nyata keterbukaan informasi dan akuntabilitas mutu publik. Kami bertekad mewujudkan satuan pendidikan yang ramah, berkarakter, dan senantiasa berorientasi pada kemajuan anak didik kami.',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'ks-002',
        sekolahId: schoolId,
        nama: 'H. Marjohan, S.Pd.',
        nip: '19620108 198303 1 005',
        periode: '2014 - 2021',
        status: 'Purna Bakti',
        foto: '',
        keterangan: 'Peletak dasar pengembangan fasilitas gedung sekolah dan perpustakaan',
        sambutan: '',
        createdAt: now,
        updatedAt: now
      }
    ],
    guru: [
      {
        id: 'guru-001',
        sekolahId: schoolId,
        nama: 'Nurul Hidayati, S.Pd.',
        nip: '19820510 200902 2 007',
        nuptk: '4534760662210082',
        jabatan: 'Guru Kelas V / Koordinator Kurikulum',
        mapel: 'Guru Kelas SD',
        pendidikan: 'S1 PGSD Universitas Riau',
        statusKepegawaian: 'PNS',
        email: 'nurul.hidayati@sekolah.id',
        foto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
        tampilkanPublik: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'guru-002',
        sekolahId: schoolId,
        nama: 'Bambang Irawan, S.Pd.SD.',
        nip: '19880320 201101 1 009',
        nuptk: '1245766667130103',
        jabatan: 'Guru PJOK & Pembina Pramuka',
        mapel: 'Pendidikan Jasmani, Olahraga dan Kesehatan',
        pendidikan: 'S1 Penjaskesrek Universitas Negeri Padang',
        statusKepegawaian: 'PPPK',
        email: 'bambang.irawan@sekolah.id',
        foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
        tampilkanPublik: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'guru-003',
        sekolahId: schoolId,
        nama: 'Dewi Lestari, S.Pd.I.',
        nip: '19921104 202012 2 015',
        nuptk: '7823901123456781',
        jabatan: 'Guru Pendidikan Agama Islam',
        mapel: 'PAI & Budi Pekerti',
        pendidikan: 'S1 PAI UIN Suska Riau',
        statusKepegawaian: 'PPPK',
        email: 'dewi.lestari@sekolah.id',
        foto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
        tampilkanPublik: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'guru-004',
        sekolahId: schoolId,
        nama: 'Rian Syahputra, S.Kom.',
        nip: '',
        nuptk: '9012345678901234',
        jabatan: 'Tenaga Administrasi & Operator Data Pokok Pendidikan',
        mapel: 'Operator Dapodik / TIK',
        pendidikan: 'S1 Sistem Informasi',
        statusKepegawaian: 'Honorer Sekolah',
        email: 'rian.ops@sekolah.id',
        foto: '',
        tampilkanPublik: true,
        createdAt: now,
        updatedAt: now
      }
    ],
    prestasi: [
      {
        id: 'pres-001',
        sekolahId: schoolId,
        namaPrestasi: 'Juara 1 Lomba Budaya Mutu & Literasi Sekolah Dasar',
        tingkat: 'Kabupaten',
        tahun: 2025,
        bidang: 'Literasi & Manajemen Perpustakaan',
        peraih: 'Tim Pengembang Literasi UPT SD Negeri 009 Sialang Kubang',
        keterangan: 'Penilaian portofolio pojok baca digital, jurnal membaca siswa, dan keterlibatan komite sekolah.',
        foto: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&q=80&w=800',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'pres-002',
        sekolahId: schoolId,
        namaPrestasi: 'Medali Emas Olimpiade Sains Nasional (OSN) Bidang Matematika',
        tingkat: 'Kabupaten',
        tahun: 2025,
        bidang: 'Akademik / Sains',
        peraih: 'Muhammad Fadhil Ramadhan (Kelas V)',
        keterangan: 'Meraih skor tertinggi seleksi OSN tingkat kabupaten dan berhak mewakili ke tingkat Provinsi Riau.',
        foto: 'https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?auto=format&fit=crop&q=80&w=800',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'pres-003',
        sekolahId: 'sch-002',
        namaPrestasi: 'Juara 2 Festival Lomba Seni Siswa Nasional (FLS2N) Tari Kreasi',
        tingkat: 'Kecamatan',
        tahun: 2024,
        bidang: 'Seni & Budaya',
        peraih: 'Grup Tari Siswi Kelas IV & V',
        keterangan: 'Membawakan tarian kreasi Zapin Melayu Riau kontemporer.',
        foto: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800',
        createdAt: now,
        updatedAt: now
      }
    ],
    berita: [
      {
        id: 'berita-001',
        sekolahId: schoolId,
        judul: 'Supervisi Klinis & Pendampingan Implementasi Asesmen Berkelanjutan',
        slug: 'supervisi-klinis-pendampingan-asesmen-berkelanjutan',
        thumbnail: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800',
        ringkasan: 'Pengawas Sekolah Pembina melaksanakan supervisi klinis tatap muka di UPT SDN 009 Sialang Kubang guna memastikan diferensiasi asesmen berjalan efektif.',
        konten: 'Dalam rangka menjaga dan meningkatkan mutu satuan pendidikan binaan, Pengawas Sekolah TK/SD Bapak H. Ahmad Syafii, M.Pd. menggelar kegiatan supervisi klinis dan pendampingan terpadu di UPT SD Negeri 009 Sialang Kubang.\n\nFokus kegiatan meliputi observasi pembelajaran di ruang kelas, bedah perangkat ajar dan instrumen asesmen diagnostik, serta diskusi reflektif bersama dewan guru. Dalam arahannya, pengawas menegaskan pentingnya menempatkan kebutuhan perkembangan murid sebagai acuan utama dalam merancang strategi mengajar.\n\nKepala Sekolah Drs. Supriyanto, M.Si. menyambut positif pendampingan ini yang dinilai sangat menguatkan guru dalam menghadirkan suasana kelas yang inklusif dan memotivasi belajar.',
        penulis: 'H. Ahmad Syafii, M.Pd.',
        tanggal: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        kategori: 'Pendampingan',
        statusPublish: true,
        featured: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'berita-002',
        sekolahId: 'sch-002',
        judul: 'Pemberdayaan Komunitas Belajar Guru (Kombel) Antar-Satuan Pendidikan Binaan',
        slug: 'pemberdayaan-komunitas-belajar-guru-binaan',
        thumbnail: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800',
        ringkasan: 'Optimalisasi peran Komunitas Belajar dalam sekolah untuk menelaah rapor pendidikan dan merumuskan benahi kurikulum merdeka.',
        konten: 'Pengawas Sekolah memfasilitasi pertemuan Komunitas Belajar (Kombel) gabungan pendidik tingkat dasar. Pertemuan ini difokuskan pada pembedahan data indikator Literasi dan Iklim Keamanan Satuan Pendidikan yang tercantum pada Rapor Pendidikan Kemendikbudristek.\n\nMelalui wadah Kombel, para guru saling bertukar modul praktik baik, mendiskusikan penanganan kendala membaca siswa di fase awal, serta merancang proyek P5 yang aplikatif dengan kearifan lokal daerah.',
        penulis: 'Tim Pengawas Mutu',
        tanggal: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        kategori: 'Pengawasan',
        statusPublish: true,
        featured: false,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'berita-003',
        sekolahId: 'sch-003',
        judul: 'Transisi PAUD ke SD yang Menyenangkan: Menghapus Beban Calistung Kaku',
        slug: 'transisi-paud-ke-sd-yang-menyenangkan',
        thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800',
        ringkasan: 'Penyamaan persepsi antara pendidik TK dan guru kelas awal SD guna memastikan masa transisi fondasi anak usia dini berjalan ramah dan bahagia.',
        konten: 'Pengawas Sekolah menyelenggarakan lokakarya mini keselarasan pembelajaran usia dini di TK Negeri Pembina Tapung Hilir. Forum ini menggarisbawahi larangan tes calistung kaku dalam penerimaan peserta didik baru serta mendorong penguatan 6 kemampuan fondasi anak usia dini.',
        penulis: 'H. Ahmad Syafii, M.Pd.',
        tanggal: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        kategori: 'Pendidikan',
        statusPublish: true,
        featured: false,
        createdAt: now,
        updatedAt: now
      }
    ],
    pengumuman: [
      {
        id: 'peng-001',
        judul: 'Penyusunan dan Pengunggahan Dokumen KOSP Semester Genap Tahun Ajaran 2026/2027',
        isi: 'Kepada seluruh Kepala Satuan Pendidikan jenjang TK dan SD se-Kecamatan Tapung Hilir binaan, dimohon untuk mengumpulkan draf Kurikulum Operasional Satuan Pendidikan (KOSP) hasil revisi bersama tim pengembang kurikulum paling lambat tanggal 15 bulan depan untuk ditelaah dan divalidasi oleh Pengawas Pembina.',
        tanggal: new Date().toISOString(),
        prioritas: 'Mendesak',
        statusPublish: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'peng-002',
        judul: 'Jadwal Pendampingan Asesmen Bakat Minat dan Penguatan Rapor Pendidikan',
        isi: 'Kunjungan berkala pengawas pembina ke satuan pendidikan akan dilaksanakan sesuai jadwal terlampir. Pihak sekolah dipersilakan menyiapkan data capaian literasi murid dan rekapitulasi keikutsertaan pelatihan mandiri PMM.',
        tanggal: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        prioritas: 'Penting',
        statusPublish: true,
        createdAt: now,
        updatedAt: now
      }
    ],
    galeri: [
      {
        id: 'gal-001',
        sekolahId: schoolId,
        judul: 'Dokumentasi Kunjungan Supervisi Manajerial di SDN 009 Sialang Kubang',
        kategori: 'Supervisi',
        jenis: 'FOTO',
        url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800',
        deskripsi: 'Sesi telaah administrasi sekolah dan diskusi bersama kepala sekolah mengenai rencana kerja tahunan.',
        tanggal: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'gal-002',
        sekolahId: schoolId,
        judul: 'Apresiasi Pojok Baca Siswa dan Kunjungan Perpustakaan Ramah Anak',
        kategori: 'Kegiatan Siswa',
        jenis: 'FOTO',
        url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800',
        deskripsi: 'Pengawas berinteraksi langsung dengan murid kelas IV saat jam literasi pagi.',
        tanggal: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'gal-003',
        sekolahId: 'sch-003',
        judul: 'Fasilitasi Workshop Peningkatan Kompetensi Guru TK Pembina',
        kategori: 'Workshop',
        jenis: 'FOTO',
        url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800',
        deskripsi: 'Penguatan metode belajar sambil bermain pada anak usia dini bersama ibu-ibu pendidik TK.',
        tanggal: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'gal-004',
        sekolahId: schoolId,
        judul: 'Video Profil Pembelajaran Berdiferensiasi Satuan Pendidikan Binaan',
        kategori: 'Pendampingan',
        jenis: 'VIDEO',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        deskripsi: 'Dokumentasi video singkat praktik baik implementasi Kurikulum Merdeka.',
        tanggal: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: now,
        updatedAt: now
      }
    ],
    kontak: [
      {
        id: 'knt-001',
        nama: 'Ahmad Faisal',
        email: 'faisal.kampar@gmail.com',
        telepon: '081234567891',
        subjek: 'Konsultasi Jadwal Supervisi Mandiri',
        pesan: 'Mohon arahan Bapak Pengawas terkait persiapan instrumen observasi guru kelas 1 untuk kurikulum merdeka.',
        status: 'Dibaca',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    bukuTamu: getDefaultBukuTamu(),
    visitors: generateInitialVisitorData()
  };
}

function getDefaultBukuTamu(): BukuTamuData[] {
  const now = new Date();
  return [
    {
      id: 'bt-001',
      nama: 'H. Muhammad Syarif, M.Pd.',
      jabatan: 'Koordinator Pengawas Sekolah',
      instansi: 'Dinas Pendidikan Kepemudaan dan Olahraga Kab. Kampar',
      masukan: 'Portal pengawas ini sangat inspiratif, inovatif, dan memudahkan pemantauan mutu sekolah binaan secara transparan dan akuntabel. Terus tingkatkan!',
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 - 3 * 3600 * 1000).toISOString()
    },
    {
      id: 'bt-002',
      nama: 'Dra. Hj. Ratna Juwita',
      jabatan: 'Pengawas Ahli Madya TK/SD',
      instansi: 'Disdikpora Kabupaten Kampar',
      masukan: 'Sangat mengapresiasi ketersediaan data profil satuan pendidikan, data kepala sekolah, dan dewan guru yang terintegrasi dengan baik.',
      createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000 - 5 * 3600 * 1000).toISOString()
    },
    {
      id: 'bt-003',
      nama: 'Surono, S.Pd.',
      jabatan: 'Kepala Satuan Pendidikan',
      instansi: 'UPT SD Negeri 004 Hangtuah',
      masukan: 'Terima kasih atas bimbingan dan pendampingan berkelanjutan dari Pengawas Pembina. Informasi program sekolah binaan sangat membantu kami di lapangan.',
      createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000 - 1 * 3600 * 1000).toISOString()
    }
  ];
}

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    ensureDataDirectory();
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        let changed = false;
        if (!parsed.visitors || !Array.isArray(parsed.visitors) || parsed.visitors.length === 0) {
          parsed.visitors = generateInitialVisitorData();
          changed = true;
        }
        if (!parsed.bukuTamu || !Array.isArray(parsed.bukuTamu)) {
          parsed.bukuTamu = getDefaultBukuTamu();
          changed = true;
        }

        // Auto-normalize and sync Kepala Sekolah photos and names to Sekolah
        if (parsed.kepalaSekolah && Array.isArray(parsed.kepalaSekolah) && parsed.sekolah && Array.isArray(parsed.sekolah)) {
          for (const ks of parsed.kepalaSekolah) {
            const rawPhoto = (ks as any).fotoUrl || ks.foto || '';
            const isUpload = rawPhoto && typeof rawPhoto === 'string' && rawPhoto.startsWith('/uploads/');
            const uploadExists = isUpload ? fs.existsSync(path.join(process.cwd(), 'public', rawPhoto)) : false;

            if (uploadExists) {
              ks.foto = rawPhoto;
              (ks as any).fotoUrl = rawPhoto;
            } else if (isUpload && (rawPhoto.includes('Gemini_Generated_Image') || rawPhoto.includes('ChatGPT_Image'))) {
              // Check if alternative fotoUrl exists
              const altPhoto = (ks as any).fotoUrl;
              if (altPhoto && altPhoto.startsWith('/uploads/') && fs.existsSync(path.join(process.cwd(), 'public', altPhoto))) {
                ks.foto = altPhoto;
                (ks as any).fotoUrl = altPhoto;
              } else {
                ks.foto = '';
                (ks as any).fotoUrl = '';
              }
            } else if (rawPhoto && !isUpload) {
              ks.foto = rawPhoto;
              (ks as any).fotoUrl = rawPhoto;
            }

            // Sync active kepala sekolah to its matching school
            if (ks.status === 'Aktif' || ks.status === 'aktif' || !ks.status) {
              const schIdx = parsed.sekolah.findIndex((s: any) => s.id === ks.sekolahId);
              if (schIdx !== -1) {
                if (ks.foto) {
                  parsed.sekolah[schIdx].kepalaSekolahFoto = ks.foto;
                  parsed.sekolah[schIdx].fotoKepalaSekolah = ks.foto;
                }
                if (ks.nama) {
                  parsed.sekolah[schIdx].kepalaSekolahNama = ks.nama;
                }
              }
            }
          }
          changed = true;
        }

        // Auto-normalize Berita photos so thumbnail, gambarUrl, and gambar always stay synchronized
        if (parsed.berita && Array.isArray(parsed.berita)) {
          for (const b of parsed.berita) {
            const photo = b.gambarUrl || b.gambar || b.thumbnail || (b as any).foto || '';
            if (photo) {
              b.thumbnail = photo;
              b.gambarUrl = photo;
              b.gambar = photo;
              changed = true;
            }
          }
        }

        // Ensure all 22 admin users (Superadmin & 20 Level Admin) are loaded and available
        if (!parsed.admins || parsed.admins.length < 22) {
          const init = getInitialData();
          if (!parsed.admins) parsed.admins = [];
          for (const defAdmin of init.admins) {
            const exists = parsed.admins.some((a: any) => a.email.toLowerCase() === defAdmin.email.toLowerCase());
            if (!exists) {
              parsed.admins.push(defAdmin);
              changed = true;
            }
          }
        }

        if (changed) {
          this.persist(parsed);
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error loading database file, initializing fresh data:', e);
    }
    const init = getInitialData();
    this.persist(init);
    return init;
  }

  private persist(dataToSave?: DatabaseSchema) {
    try {
      ensureDataDirectory();
      const payload = dataToSave || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error persisting database:', e);
    }
  }

  public getRaw(): DatabaseSchema {
    return this.data;
  }

  // --- ADMIN ---
  public getAdmins(): Omit<AdminUser, 'passwordHash'>[] {
    return this.data.admins.map(({ passwordHash, ...rest }) => rest);
  }

  public findAdminByEmail(email: string): AdminUser | undefined {
    return this.data.admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
  }

  public findAdminById(id: string): AdminUser | undefined {
    return this.data.admins.find((a) => a.id === id);
  }

  public createAdmin(item: { email: string; name: string; role: string; passwordHash: string }): AdminUser {
    const now = new Date().toISOString();
    const newAdmin: AdminUser = {
      id: 'admin-' + Date.now().toString().slice(-6),
      email: item.email.trim().toLowerCase(),
      name: item.name.trim(),
      role: item.role.toUpperCase(),
      passwordHash: item.passwordHash,
      createdAt: now,
      updatedAt: now
    };
    this.data.admins.push(newAdmin);
    this.persist();
    return newAdmin;
  }

  public updateAdmin(id: string, updates: Partial<AdminUser>): AdminUser | null {
    const idx = this.data.admins.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    this.data.admins[idx] = {
      ...this.data.admins[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.admins[idx];
  }

  public deleteAdmin(id: string): boolean {
    const idx = this.data.admins.findIndex((a) => a.id === id);
    if (idx === -1) return false;
    this.data.admins.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- PENGAWAS ---
  public getPengawas(): PengawasData {
    if (!this.data.pengawas || this.data.pengawas.length === 0) {
      const init = getInitialData();
      this.data.pengawas = init.pengawas;
      this.persist();
    }
    return this.data.pengawas[0];
  }

  public updatePengawas(updates: Partial<PengawasData>): PengawasData {
    const current = this.getPengawas();
    const updatedPengawas = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.data.pengawas[0] = updatedPengawas;

    // Automatically sync with Website Settings so Pengawas Pembina is always consistent across the entire portal
    const settings = this.getSettings();
    const fullNameWithDegree = updatedPengawas.nama
      ? (updatedPengawas.gelar ? `${updatedPengawas.nama}, ${updatedPengawas.gelar}` : updatedPengawas.nama)
      : settings.namaPengawas;

    this.data.pengaturanWebsite[0] = {
      ...settings,
      namaPengawas: fullNameWithDegree,
      nipPengawas: updatedPengawas.nip || settings.nipPengawas,
      fotoPengawas: updatedPengawas.foto || settings.fotoPengawas,
      jabatan: updatedPengawas.jabatan || settings.jabatan,
      kecamatan: updatedPengawas.kecamatan || settings.kecamatan,
      kabupaten: updatedPengawas.kabupaten || settings.kabupaten,
      provinsi: updatedPengawas.provinsi || settings.provinsi,
      email: updatedPengawas.email || settings.email,
      telepon: updatedPengawas.noHp || settings.telepon,
      whatsapp: (updatedPengawas.noHp || settings.telepon || '').replace(/[^0-9]/g, ''),
      updatedAt: new Date().toISOString()
    };

    this.persist();
    return this.data.pengawas[0];
  }

  // --- PENGATURAN WEBSITE ---
  public getSettings(): PengaturanWebsiteData {
    if (!this.data.pengaturanWebsite || this.data.pengaturanWebsite.length === 0) {
      const init = getInitialData();
      this.data.pengaturanWebsite = init.pengaturanWebsite;
      this.persist();
    }
    const s = this.data.pengaturanWebsite[0];
    return {
      ...s,
      namaWebsite: s.namaWebsite || s.namaPortal,
      namaPortal: s.namaPortal || s.namaWebsite || 'PORTAL PENGAWAS SEKOLAH',
      tagline: s.tagline || s.subjudul,
      subjudul: s.subjudul || s.tagline || 'Informasi, Pendampingan, Dokumentasi dan Pengembangan Mutu Satuan Pendidikan',
      deskripsiSingkat: s.deskripsiSingkat || s.deskripsi,
      deskripsi: s.deskripsi || s.deskripsiSingkat || '',
      logoUrl: s.logoUrl || s.logo,
      logo: s.logo || s.logoUrl || '',
      alamatKantor: s.alamatKantor || s.alamat,
      alamat: s.alamat || s.alamatKantor || '',
      emailPengawas: s.emailPengawas || s.email,
      email: s.email || s.emailPengawas || '',
      nomorTelepon: s.nomorTelepon || s.telepon,
      telepon: s.telepon || s.nomorTelepon || '',
      nomorWhatsApp: s.nomorWhatsApp || s.whatsapp,
      whatsapp: s.whatsapp || s.nomorWhatsApp || '',
      facebookUrl: s.facebookUrl || s.facebook,
      facebook: s.facebook || s.facebookUrl || '',
      instagramUrl: s.instagramUrl || s.instagram,
      instagram: s.instagram || s.instagramUrl || '',
      youtubeUrl: s.youtubeUrl || s.youtube,
      youtube: s.youtube || s.youtubeUrl || '',
      heroImageUrl: s.heroImageUrl || (s as any).bannerUrl || '',
      bannerUrl: (s as any).bannerUrl || s.heroImageUrl || '',
      showBukuTamu: s.showBukuTamu !== undefined ? s.showBukuTamu : true,
      showStats: s.showStats !== undefined ? s.showStats : true,
      jamKerja: s.jamKerja || 'Senin - Jumat: 07.30 - 16.00 WIB'
    };
  }

  public updateSettings(updates: Partial<PengaturanWebsiteData> & Record<string, any>): PengaturanWebsiteData {
    const current = this.getSettings();

    const namaPortal = updates.namaPortal || updates.namaWebsite || current.namaPortal;
    const subjudul = updates.subjudul || updates.tagline || current.subjudul;
    const deskripsi = updates.deskripsi || updates.deskripsiSingkat || current.deskripsi;
    const logo = updates.logo || updates.logoUrl || current.logo;
    const alamat = updates.alamat || updates.alamatKantor || current.alamat;
    const email = updates.email || updates.emailPengawas || current.email;
    const telepon = updates.telepon || updates.nomorTelepon || current.telepon;
    const rawWa = updates.whatsapp || updates.nomorWhatsApp || current.whatsapp || '';
    const whatsapp = rawWa.replace(/[^0-9]/g, '');
    const facebook = updates.facebook || updates.facebookUrl || current.facebook;
    const instagram = updates.instagram || updates.instagramUrl || current.instagram;
    const youtube = updates.youtube || updates.youtubeUrl || current.youtube;
    const heroImageUrl = updates.heroImageUrl !== undefined ? updates.heroImageUrl : (updates.bannerUrl !== undefined ? updates.bannerUrl : (current.heroImageUrl || (current as any).bannerUrl || ''));
    const bannerUrl = updates.bannerUrl !== undefined ? updates.bannerUrl : (updates.heroImageUrl !== undefined ? updates.heroImageUrl : ((current as any).bannerUrl || current.heroImageUrl || ''));

    const merged: PengaturanWebsiteData = {
      ...current,
      ...updates,
      namaPortal,
      namaWebsite: namaPortal,
      subjudul,
      tagline: subjudul,
      deskripsi,
      deskripsiSingkat: deskripsi,
      logo,
      logoUrl: logo,
      alamat,
      alamatKantor: alamat,
      email,
      emailPengawas: email,
      telepon,
      nomorTelepon: telepon,
      whatsapp,
      nomorWhatsApp: whatsapp,
      facebook,
      facebookUrl: facebook,
      instagram,
      instagramUrl: instagram,
      youtube,
      youtubeUrl: youtube,
      heroImageUrl,
      bannerUrl,
      showBukuTamu: updates.showBukuTamu !== undefined ? updates.showBukuTamu : current.showBukuTamu,
      showStats: updates.showStats !== undefined ? updates.showStats : current.showStats,
      jamKerja: updates.jamKerja || current.jamKerja || 'Senin - Jumat: 07.30 - 16.00 WIB',
      updatedAt: new Date().toISOString()
    };

    this.data.pengaturanWebsite[0] = merged;

    // If pengawas details were edited in settings, sync back to Profil Pengawas automatically
    const currentPengawas = this.getPengawas();
    this.data.pengawas[0] = {
      ...currentPengawas,
      nama: updates.namaPengawas || currentPengawas.nama,
      nip: updates.nipPengawas || currentPengawas.nip,
      foto: updates.fotoPengawas || currentPengawas.foto,
      jabatan: updates.jabatan || currentPengawas.jabatan,
      kecamatan: updates.kecamatan || currentPengawas.kecamatan,
      kabupaten: updates.kabupaten || currentPengawas.kabupaten,
      provinsi: updates.provinsi || currentPengawas.provinsi,
      email: email || currentPengawas.email,
      noHp: telepon || currentPengawas.noHp,
      updatedAt: new Date().toISOString()
    };

    this.persist();
    return this.getSettings();
  }

  // --- SEKOLAH ---
  public getSchools(query?: { search?: string; jenjang?: string; status?: string }): SekolahData[] {
    let list = this.data.sekolah.map((s) => {
      // Auto-compute actual jumlahGuru from linked guru table
      const actualGuruCount = this.data.guru.filter((g) => g.sekolahId === s.id).length;
      
      // Auto-resolve active kepalaSekolah nama and foto
      let currentKepsek = s.kepalaSekolahNama;
      let currentKepsekFoto = s.kepalaSekolahFoto || s.fotoKepalaSekolah || '';

      const activeKs =
        this.data.kepalaSekolah.find(
          (ks) => ks.sekolahId === s.id && (ks.status === 'Aktif' || ks.status === 'aktif' || !ks.status)
        ) || this.data.kepalaSekolah.find((ks) => ks.sekolahId === s.id);

      if (activeKs) {
        if (!currentKepsek || currentKepsek.trim() === '') currentKepsek = activeKs.nama;
        const photo = (activeKs as any).fotoUrl || activeKs.foto || '';
        if (photo) currentKepsekFoto = photo;
      }

      return {
        ...s,
        jumlahGuru: actualGuruCount > 0 ? actualGuruCount : s.jumlahGuru,
        kepalaSekolahNama: currentKepsek,
        kepalaSekolahFoto: currentKepsekFoto,
        fotoKepalaSekolah: currentKepsekFoto
      };
    });

    if (query?.jenjang && query.jenjang !== 'SEMUA') {
      list = list.filter((s) => s.jenjang.toUpperCase() === query.jenjang?.toUpperCase());
    }
    if (query?.status && query.status !== 'SEMUA') {
      list = list.filter((s) => s.status.toLowerCase() === query.status?.toLowerCase());
    }
    if (query?.search) {
      const q = query.search.toLowerCase();
      list = list.filter(
        (s) =>
          s.nama.toLowerCase().includes(q) ||
          s.npsn.includes(q) ||
          s.kecamatan.toLowerCase().includes(q) ||
          (s.kepalaSekolahNama && s.kepalaSekolahNama.toLowerCase().includes(q))
      );
    }
    return list;
  }

  public getSchoolById(id: string): (SekolahData & {
    visiMisi?: VisiMisiData;
    strukturOrganisasi?: StrukturOrganisasiData[];
    fasilitas?: FasilitasData[];
    keunggulan?: KeunggulanData[];
    kepalaSekolah?: KepalaSekolahData[];
    guru?: GuruData[];
    prestasi?: PrestasiData[];
    berita?: BeritaData[];
    galeri?: GaleriData[];
  }) | null {
    const sch = this.data.sekolah.find((s) => s.id === id);
    if (!sch) return null;

    const visiMisi = this.data.visiMisi.find((vm) => vm.sekolahId === id);
    const strukturOrganisasi = this.data.strukturOrganisasi
      .filter((so) => so.sekolahId === id)
      .sort((a, b) => a.urutan - b.urutan);
    const fasilitas = this.data.fasilitas.filter((f) => f.sekolahId === id);
    const keunggulan = this.data.keunggulan.filter((k) => k.sekolahId === id);
    const kepalaSekolah = this.data.kepalaSekolah.filter((ks) => ks.sekolahId === id);
    const guru = this.data.guru.filter((g) => g.sekolahId === id);
    const prestasi = this.data.prestasi.filter((p) => p.sekolahId === id);
    const berita = this.data.berita.filter((b) => b.sekolahId === id);
    const galeri = this.data.galeri.filter((g) => g.sekolahId === id);

    // Auto-resolve active kepala sekolah name & photo
    let activeKepsekNama = sch.kepalaSekolahNama;
    let activeKepsekFoto = sch.kepalaSekolahFoto || sch.fotoKepalaSekolah || '';
    const activeKsObj =
      kepalaSekolah.find((ks) => ks.status === 'Aktif' || ks.status === 'aktif' || !ks.status) ||
      kepalaSekolah[0];
    if (activeKsObj) {
      if (!activeKepsekNama || activeKepsekNama.trim() === '') activeKepsekNama = activeKsObj.nama;
      const photo = (activeKsObj as any).fotoUrl || activeKsObj.foto || '';
      if (photo) activeKepsekFoto = photo;
    }

    return {
      ...sch,
      kepalaSekolahNama: activeKepsekNama,
      kepalaSekolahFoto: activeKepsekFoto,
      fotoKepalaSekolah: activeKepsekFoto,
      jumlahGuru: guru.length > 0 ? guru.length : sch.jumlahGuru,
      visiMisi,
      strukturOrganisasi,
      fasilitas,
      keunggulan,
      kepalaSekolah,
      guru,
      prestasi,
      berita,
      galeri
    };
  }

  public createSchool(item: Omit<SekolahData, 'id' | 'createdAt' | 'updatedAt'>): SekolahData {
    const now = new Date().toISOString();
    const newSchool: SekolahData = {
      ...item,
      id: 'sch-' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    this.data.sekolah.push(newSchool);

    // Auto-create active Kepala Sekolah record if kepalaSekolahNama is filled
    if (item.kepalaSekolahNama && item.kepalaSekolahNama.trim()) {
      this.data.kepalaSekolah.push({
        id: 'ks-' + Date.now(),
        sekolahId: newSchool.id,
        nama: item.kepalaSekolahNama.trim(),
        periode: '2022 - Sekarang',
        status: 'Aktif',
        keterangan: 'Kepala Satuan Pendidikan',
        foto: '',
        sambutan: '',
        createdAt: now,
        updatedAt: now
      });
    }

    this.persist();
    return newSchool;
  }

  public createBulkSekolah(items: Omit<SekolahData, 'id' | 'createdAt' | 'updatedAt'>[]): SekolahData[] {
    const now = new Date().toISOString();
    const createdList: SekolahData[] = items.map((item, index) => {
      const schId = 'sch-' + Date.now() + '-' + index + '-' + Math.round(Math.random() * 1000);
      if (item.kepalaSekolahNama && item.kepalaSekolahNama.trim()) {
        this.data.kepalaSekolah.push({
          id: 'ks-' + Date.now() + '-' + index,
          sekolahId: schId,
          nama: item.kepalaSekolahNama.trim(),
          periode: '2022 - Sekarang',
          status: 'Aktif',
          keterangan: 'Kepala Satuan Pendidikan',
          foto: '',
          sambutan: '',
          createdAt: now,
          updatedAt: now
        });
      }
      return {
        ...item,
        id: schId,
        createdAt: now,
        updatedAt: now
      };
    });
    this.data.sekolah.push(...createdList);
    this.persist();
    return createdList;
  }

  public updateSchool(id: string, updates: Partial<SekolahData>): SekolahData | null {
    const idx = this.data.sekolah.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    const now = new Date().toISOString();
    this.data.sekolah[idx] = {
      ...this.data.sekolah[idx],
      ...updates,
      updatedAt: now
    };

    // Auto-sync kepala sekolah if kepalaSekolahNama changed
    if (updates.kepalaSekolahNama && updates.kepalaSekolahNama.trim()) {
      const activeKs = this.data.kepalaSekolah.find(
        (ks) => ks.sekolahId === id && (ks.status === 'Aktif' || !ks.status)
      );
      if (activeKs) {
        activeKs.nama = updates.kepalaSekolahNama.trim();
        activeKs.updatedAt = now;
      } else {
        this.data.kepalaSekolah.push({
          id: 'ks-' + Date.now(),
          sekolahId: id,
          nama: updates.kepalaSekolahNama.trim(),
          periode: '2022 - Sekarang',
          status: 'Aktif',
          keterangan: 'Kepala Satuan Pendidikan',
          foto: '',
          sambutan: '',
          createdAt: now,
          updatedAt: now
        });
      }
    }

    this.persist();
    return this.data.sekolah[idx];
  }

  public deleteSchool(id: string): boolean {
    const idx = this.data.sekolah.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    this.data.sekolah.splice(idx, 1);
    // Cascade delete relations
    this.data.visiMisi = this.data.visiMisi.filter((x) => x.sekolahId !== id);
    this.data.strukturOrganisasi = this.data.strukturOrganisasi.filter((x) => x.sekolahId !== id);
    this.data.fasilitas = this.data.fasilitas.filter((x) => x.sekolahId !== id);
    this.data.keunggulan = this.data.keunggulan.filter((x) => x.sekolahId !== id);
    this.data.kepalaSekolah = this.data.kepalaSekolah.filter((x) => x.sekolahId !== id);
    this.data.guru = this.data.guru.filter((x) => x.sekolahId !== id);
    this.data.prestasi = this.data.prestasi.filter((x) => x.sekolahId !== id);
    this.data.galeri = this.data.galeri.filter((x) => x.sekolahId !== id);
    this.data.berita = this.data.berita.filter((x) => x.sekolahId !== id);
    this.persist();
    return true;
  }

  // --- VISI MISI ---
  public getVisiMisi(sekolahId: string): VisiMisiData | null {
    return this.data.visiMisi.find((vm) => vm.sekolahId === sekolahId) || null;
  }

  public upsertVisiMisi(sekolahId: string, payload: Partial<VisiMisiData>): VisiMisiData {
    const now = new Date().toISOString();
    const idx = this.data.visiMisi.findIndex((vm) => vm.sekolahId === sekolahId);
    if (idx !== -1) {
      this.data.visiMisi[idx] = {
        ...this.data.visiMisi[idx],
        ...payload,
        updatedAt: now
      };
      this.persist();
      return this.data.visiMisi[idx];
    } else {
      const newItem: VisiMisiData = {
        id: 'vm-' + Date.now(),
        sekolahId,
        visi: payload.visi || '',
        misi: payload.misi || '',
        tujuan: payload.tujuan || '',
        programUnggulan: payload.programUnggulan || '',
        createdAt: now,
        updatedAt: now
      };
      this.data.visiMisi.push(newItem);
      this.persist();
      return newItem;
    }
  }

  // --- STRUKTUR ORGANISASI ---
  public getStruktur(sekolahId?: string): StrukturOrganisasiData[] {
    let list = this.data.strukturOrganisasi;
    if (sekolahId) list = list.filter((s) => s.sekolahId === sekolahId);
    return list.sort((a, b) => a.urutan - b.urutan);
  }

  public createStruktur(item: Omit<StrukturOrganisasiData, 'id' | 'createdAt' | 'updatedAt'>): StrukturOrganisasiData {
    const now = new Date().toISOString();
    const newItem: StrukturOrganisasiData = {
      ...item,
      id: 'so-' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    this.data.strukturOrganisasi.push(newItem);
    this.persist();
    return newItem;
  }

  public updateStruktur(id: string, updates: Partial<StrukturOrganisasiData>): StrukturOrganisasiData | null {
    const idx = this.data.strukturOrganisasi.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    this.data.strukturOrganisasi[idx] = {
      ...this.data.strukturOrganisasi[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.strukturOrganisasi[idx];
  }

  public deleteStruktur(id: string): boolean {
    const idx = this.data.strukturOrganisasi.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    this.data.strukturOrganisasi.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- FASILITAS ---
  public getFasilitas(sekolahId?: string): FasilitasData[] {
    if (sekolahId) return this.data.fasilitas.filter((f) => f.sekolahId === sekolahId);
    return this.data.fasilitas;
  }

  public createFasilitas(item: Omit<FasilitasData, 'id' | 'createdAt' | 'updatedAt'>): FasilitasData {
    const now = new Date().toISOString();
    const newItem: FasilitasData = {
      ...item,
      id: 'fas-' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    this.data.fasilitas.push(newItem);
    this.persist();
    return newItem;
  }

  public updateFasilitas(id: string, updates: Partial<FasilitasData>): FasilitasData | null {
    const idx = this.data.fasilitas.findIndex((f) => f.id === id);
    if (idx === -1) return null;
    this.data.fasilitas[idx] = {
      ...this.data.fasilitas[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.fasilitas[idx];
  }

  public deleteFasilitas(id: string): boolean {
    const idx = this.data.fasilitas.findIndex((f) => f.id === id);
    if (idx === -1) return false;
    this.data.fasilitas.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- KEUNGGULAN ---
  public getKeunggulan(sekolahId?: string): KeunggulanData[] {
    if (sekolahId) return this.data.keunggulan.filter((k) => k.sekolahId === sekolahId);
    return this.data.keunggulan;
  }

  public createKeunggulan(item: Omit<KeunggulanData, 'id' | 'createdAt' | 'updatedAt'>): KeunggulanData {
    const now = new Date().toISOString();
    const newItem: KeunggulanData = {
      ...item,
      id: 'keu-' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    this.data.keunggulan.push(newItem);
    this.persist();
    return newItem;
  }

  public updateKeunggulan(id: string, updates: Partial<KeunggulanData>): KeunggulanData | null {
    const idx = this.data.keunggulan.findIndex((k) => k.id === id);
    if (idx === -1) return null;
    this.data.keunggulan[idx] = {
      ...this.data.keunggulan[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.keunggulan[idx];
  }

  public deleteKeunggulan(id: string): boolean {
    const idx = this.data.keunggulan.findIndex((k) => k.id === id);
    if (idx === -1) return false;
    this.data.keunggulan.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- KEPALA SEKOLAH ---
  public getKepalaSekolah(sekolahId?: string): KepalaSekolahData[] {
    if (this.data.sekolah && this.data.sekolah.length > 0) {
      let changed = false;
      for (const sch of this.data.sekolah) {
        if (sch.kepalaSekolahNama && sch.kepalaSekolahNama.trim()) {
          const exists = this.data.kepalaSekolah.some((ks) => ks.sekolahId === sch.id);
          if (!exists) {
            this.data.kepalaSekolah.push({
              id: 'ks-sch-' + sch.id,
              sekolahId: sch.id,
              nama: sch.kepalaSekolahNama.trim(),
              nip: '',
              periode: '2022 - Sekarang',
              status: 'Aktif',
              foto: '',
              keterangan: 'Kepala Satuan Pendidikan ' + sch.nama,
              sambutan: '',
              createdAt: sch.createdAt || new Date().toISOString(),
              updatedAt: sch.updatedAt || new Date().toISOString()
            });
            changed = true;
          }
        }
      }
      if (changed) {
        this.persist();
      }
    }
    if (sekolahId) return this.data.kepalaSekolah.filter((ks) => ks.sekolahId === sekolahId);
    return this.data.kepalaSekolah;
  }

  public createKepalaSekolah(item: Omit<KepalaSekolahData, 'id' | 'createdAt' | 'updatedAt'> & { fotoUrl?: string }): KepalaSekolahData {
    const now = new Date().toISOString();
    const photo = item.fotoUrl || item.foto || '';
    const newItem: KepalaSekolahData = {
      ...item,
      foto: photo,
      id: 'ks-' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    (newItem as any).fotoUrl = photo;
    this.data.kepalaSekolah.push(newItem);

    // Auto-sync to school kepalaSekolahNama and foto if active
    if (newItem.status === 'Aktif' || newItem.status === 'aktif' || !newItem.status) {
      const schIdx = this.data.sekolah.findIndex((s) => s.id === newItem.sekolahId);
      if (schIdx !== -1) {
        this.data.sekolah[schIdx].kepalaSekolahNama = newItem.nama;
        this.data.sekolah[schIdx].kepalaSekolahFoto = photo;
        this.data.sekolah[schIdx].fotoKepalaSekolah = photo;
        this.data.sekolah[schIdx].updatedAt = now;
      }
    }
    this.persist();
    return newItem;
  }

  public createBulkKepalaSekolah(items: (Omit<KepalaSekolahData, 'id' | 'createdAt' | 'updatedAt'> & { fotoUrl?: string })[]): KepalaSekolahData[] {
    const now = new Date().toISOString();
    const createdList: KepalaSekolahData[] = items.map((item, idx) => {
      const photo = item.fotoUrl || item.foto || '';
      const ksItem = {
        ...item,
        foto: photo,
        id: 'ks-' + Date.now() + '-' + idx + '-' + Math.random().toString(36).substring(2, 7),
        createdAt: now,
        updatedAt: now
      };
      (ksItem as any).fotoUrl = photo;
      if (ksItem.status === 'Aktif' || ksItem.status === 'aktif' || !ksItem.status) {
        const schIdx = this.data.sekolah.findIndex((s) => s.id === ksItem.sekolahId);
        if (schIdx !== -1) {
          this.data.sekolah[schIdx].kepalaSekolahNama = ksItem.nama;
          this.data.sekolah[schIdx].kepalaSekolahFoto = photo;
          this.data.sekolah[schIdx].fotoKepalaSekolah = photo;
          this.data.sekolah[schIdx].updatedAt = now;
        }
      }
      return ksItem;
    });
    this.data.kepalaSekolah.push(...createdList);
    this.persist();
    return createdList;
  }

  public updateKepalaSekolah(id: string, updates: Partial<KepalaSekolahData> & { fotoUrl?: string }): KepalaSekolahData | null {
    const idx = this.data.kepalaSekolah.findIndex((ks) => ks.id === id);
    if (idx === -1) return null;
    const now = new Date().toISOString();
    const photo = (updates.fotoUrl !== undefined && updates.fotoUrl !== '')
      ? updates.fotoUrl
      : (updates.foto !== undefined && updates.foto !== ''
        ? updates.foto
        : (updates.fotoUrl !== undefined ? updates.fotoUrl : (updates.foto !== undefined ? updates.foto : (this.data.kepalaSekolah[idx] as any).fotoUrl || this.data.kepalaSekolah[idx].foto || '')));

    this.data.kepalaSekolah[idx] = {
      ...this.data.kepalaSekolah[idx],
      ...updates,
      foto: photo,
      fotoUrl: photo,
      updatedAt: now
    };

    // Auto-sync to school kepalaSekolahNama and foto if active
    const updated = this.data.kepalaSekolah[idx];
    if (updated.status === 'Aktif' || updated.status === 'aktif' || !updated.status) {
      const schIdx = this.data.sekolah.findIndex((s) => s.id === updated.sekolahId);
      if (schIdx !== -1) {
        this.data.sekolah[schIdx].kepalaSekolahNama = updated.nama;
        this.data.sekolah[schIdx].kepalaSekolahFoto = photo;
        this.data.sekolah[schIdx].fotoKepalaSekolah = photo;
        this.data.sekolah[schIdx].updatedAt = now;
      }
    }

    this.persist();
    return this.data.kepalaSekolah[idx];
  }

  public deleteKepalaSekolah(id: string): boolean {
    const idx = this.data.kepalaSekolah.findIndex((ks) => ks.id === id);
    if (idx === -1) return false;
    this.data.kepalaSekolah.splice(idx, 1);
    this.persist();
    return true;
  }

  public syncSchoolTeacherCount(sekolahId: string) {
    const schIdx = this.data.sekolah.findIndex((s) => s.id === sekolahId);
    if (schIdx !== -1) {
      const count = this.data.guru.filter((g) => g.sekolahId === sekolahId).length;
      this.data.sekolah[schIdx].jumlahGuru = count;
      this.data.sekolah[schIdx].updatedAt = new Date().toISOString();
    }
  }

  // --- GURU ---
  public getGuru(params?: {
    sekolahId?: string;
    search?: string;
    statusKepegawaian?: string;
    tampilkanPublikOnly?: boolean;
    page?: number;
    limit?: number;
  }): { data: GuruData[]; total: number; page: number; limit: number; totalPages: number } {
    let list = [...this.data.guru];
    if (params?.sekolahId) list = list.filter((g) => g.sekolahId === params.sekolahId);
    if (params?.tampilkanPublikOnly) list = list.filter((g) => g.tampilkanPublik !== false);
    if (params?.statusKepegawaian && params.statusKepegawaian !== 'SEMUA') {
      list = list.filter((g) => g.statusKepegawaian?.toUpperCase() === params.statusKepegawaian?.toUpperCase());
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (g) =>
          g.nama.toLowerCase().includes(q) ||
          g.jabatan.toLowerCase().includes(q) ||
          (g.mapel && g.mapel.toLowerCase().includes(q)) ||
          (g.nip && g.nip.includes(q)) ||
          (g.nuptk && g.nuptk.includes(q))
      );
    }

    const total = list.length;
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    return {
      data: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1
    };
  }

  public createGuru(item: Omit<GuruData, 'id' | 'createdAt' | 'updatedAt'>): GuruData {
    const now = new Date().toISOString();
    const newItem: GuruData = {
      ...item,
      id: 'guru-' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    this.data.guru.push(newItem);
    this.persist();
    if (newItem.sekolahId) this.syncSchoolTeacherCount(newItem.sekolahId);
    return newItem;
  }

  public createBulkGuru(items: Omit<GuruData, 'id' | 'createdAt' | 'updatedAt'>[]): GuruData[] {
    const now = new Date().toISOString();
    const affectedSchoolIds = new Set<string>();
    const createdList: GuruData[] = items.map((item, index) => {
      if (item.sekolahId) affectedSchoolIds.add(item.sekolahId);
      return {
        ...item,
        id: 'guru-' + Date.now() + '-' + index + '-' + Math.round(Math.random() * 1000),
        createdAt: now,
        updatedAt: now
      };
    });
    this.data.guru.push(...createdList);
    this.persist();
    affectedSchoolIds.forEach((sid) => this.syncSchoolTeacherCount(sid));
    return createdList;
  }

  public updateGuru(id: string, updates: Partial<GuruData>): GuruData | null {
    const idx = this.data.guru.findIndex((g) => g.id === id);
    if (idx === -1) return null;
    const oldSekolahId = this.data.guru[idx].sekolahId;
    this.data.guru[idx] = {
      ...this.data.guru[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    if (oldSekolahId) this.syncSchoolTeacherCount(oldSekolahId);
    if (updates.sekolahId && updates.sekolahId !== oldSekolahId) {
      this.syncSchoolTeacherCount(updates.sekolahId);
    }
    return this.data.guru[idx];
  }

  public deleteGuru(id: string): boolean {
    const idx = this.data.guru.findIndex((g) => g.id === id);
    if (idx === -1) return false;
    const sekolahId = this.data.guru[idx].sekolahId;
    this.data.guru.splice(idx, 1);
    this.persist();
    if (sekolahId) this.syncSchoolTeacherCount(sekolahId);
    return true;
  }

  // --- PRESTASI ---
  public getPrestasi(params?: { sekolahId?: string; tingkat?: string; search?: string }): (PrestasiData & { sekolahNama?: string })[] {
    let list = this.data.prestasi.map((p) => {
      const sch = this.data.sekolah.find((s) => s.id === p.sekolahId);
      return { ...p, sekolahNama: sch ? sch.nama : 'Umum / Pengawas' };
    });

    if (params?.sekolahId) list = list.filter((p) => p.sekolahId === params.sekolahId);
    if (params?.tingkat && params.tingkat !== 'SEMUA') {
      list = list.filter((p) => p.tingkat.toLowerCase() === params.tingkat?.toLowerCase());
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.namaPrestasi.toLowerCase().includes(q) ||
          p.bidang.toLowerCase().includes(q) ||
          p.peraih.toLowerCase().includes(q) ||
          (p.sekolahNama && p.sekolahNama.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => b.tahun - a.tahun);
  }

  public createPrestasi(item: Omit<PrestasiData, 'id' | 'createdAt' | 'updatedAt'>): PrestasiData {
    const now = new Date().toISOString();
    const newItem: PrestasiData = {
      ...item,
      id: 'pres-' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    this.data.prestasi.push(newItem);
    this.persist();
    return newItem;
  }

  public createBulkPrestasi(items: Omit<PrestasiData, 'id' | 'createdAt' | 'updatedAt'>[]): PrestasiData[] {
    const now = new Date().toISOString();
    const createdList: PrestasiData[] = items.map((item, index) => ({
      ...item,
      id: 'pres-' + Date.now() + '-' + index + '-' + Math.round(Math.random() * 1000),
      createdAt: now,
      updatedAt: now
    }));
    this.data.prestasi.push(...createdList);
    this.persist();
    return createdList;
  }

  public updatePrestasi(id: string, updates: Partial<PrestasiData>): PrestasiData | null {
    const idx = this.data.prestasi.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.data.prestasi[idx] = {
      ...this.data.prestasi[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.prestasi[idx];
  }

  public deletePrestasi(id: string): boolean {
    const idx = this.data.prestasi.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    this.data.prestasi.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- BERITA ---
  public getBerita(params?: {
    sekolahId?: string;
    kategori?: string;
    search?: string;
    publishOnly?: boolean;
    featuredOnly?: boolean;
  }): (BeritaData & { sekolahNama?: string })[] {
    let list = this.data.berita.map((b) => {
      const sch = this.data.sekolah.find((s) => s.id === b.sekolahId);
      const photo = b.gambarUrl || (b as any).gambar || b.thumbnail || (b as any).foto || '';
      return {
        ...b,
        thumbnail: photo,
        gambarUrl: photo,
        gambar: photo,
        sekolahNama: sch ? sch.nama : 'Pengawas'
      };
    });

    if (params?.publishOnly) list = list.filter((b) => b.statusPublish);
    if (params?.featuredOnly) list = list.filter((b) => b.featured);
    if (params?.sekolahId) list = list.filter((b) => b.sekolahId === params.sekolahId);
    if (params?.kategori && params.kategori !== 'SEMUA') {
      list = list.filter((b) => b.kategori.toLowerCase() === params.kategori?.toLowerCase());
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (b) =>
          b.judul.toLowerCase().includes(q) ||
          b.ringkasan.toLowerCase().includes(q) ||
          b.konten.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  }

  public getBeritaBySlug(slug: string): (BeritaData & { sekolahNama?: string }) | null {
    const b = this.data.berita.find((item) => item.slug === slug);
    if (!b) return null;
    const sch = this.data.sekolah.find((s) => s.id === b.sekolahId);
    const photo = b.gambarUrl || (b as any).gambar || b.thumbnail || (b as any).foto || '';
    return {
      ...b,
      thumbnail: photo,
      gambarUrl: photo,
      gambar: photo,
      sekolahNama: sch ? sch.nama : 'Pengawas'
    };
  }

  public createBerita(item: Omit<BeritaData, 'id' | 'createdAt' | 'updatedAt'>): BeritaData {
    const now = new Date().toISOString();
    const photo = item.gambarUrl || (item as any).gambar || item.thumbnail || (item as any).foto || '';
    const newItem: BeritaData = {
      ...item,
      thumbnail: photo,
      gambarUrl: photo,
      gambar: photo,
      id: 'berita-' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    this.data.berita.push(newItem);
    this.persist();
    return newItem;
  }

  public updateBerita(id: string, updates: Partial<BeritaData>): BeritaData | null {
    const idx = this.data.berita.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    const current = this.data.berita[idx];
    const incomingPhoto = updates.gambarUrl !== undefined
      ? updates.gambarUrl
      : (updates as any).gambar !== undefined
        ? (updates as any).gambar
        : updates.thumbnail !== undefined
          ? updates.thumbnail
          : undefined;
    const photo = incomingPhoto !== undefined
      ? incomingPhoto
      : (current.gambarUrl || (current as any).gambar || current.thumbnail || (current as any).foto || '');

    this.data.berita[idx] = {
      ...this.data.berita[idx],
      ...updates,
      thumbnail: photo,
      gambarUrl: photo,
      gambar: photo,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.berita[idx];
  }

  public deleteBerita(id: string): boolean {
    const idx = this.data.berita.findIndex((b) => b.id === id);
    if (idx === -1) return false;
    this.data.berita.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- PENGUMUMAN ---
  public getPengumuman(publishOnly = false): PengumumanData[] {
    let list = [...this.data.pengumuman];
    if (publishOnly) list = list.filter((p) => p.statusPublish);
    return list.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  }

  public createPengumuman(item: Omit<PengumumanData, 'id' | 'createdAt' | 'updatedAt'>): PengumumanData {
    const now = new Date().toISOString();
    const newItem: PengumumanData = {
      ...item,
      id: 'peng-' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    this.data.pengumuman.push(newItem);
    this.persist();
    return newItem;
  }

  public updatePengumuman(id: string, updates: Partial<PengumumanData>): PengumumanData | null {
    const idx = this.data.pengumuman.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.data.pengumuman[idx] = {
      ...this.data.pengumuman[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.pengumuman[idx];
  }

  public deletePengumuman(id: string): boolean {
    const idx = this.data.pengumuman.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    this.data.pengumuman.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- GALERI ---
  public getGaleri(params?: { sekolahId?: string; kategori?: string; jenis?: string }): (GaleriData & { sekolahNama?: string })[] {
    let list = this.data.galeri.map((g) => {
      const sch = this.data.sekolah.find((s) => s.id === g.sekolahId);
      return { ...g, sekolahNama: sch ? sch.nama : 'Umum' };
    });

    if (params?.sekolahId) list = list.filter((g) => g.sekolahId === params.sekolahId);
    if (params?.kategori && params.kategori !== 'SEMUA') {
      list = list.filter((g) => g.kategori.toLowerCase() === params.kategori?.toLowerCase());
    }
    if (params?.jenis && params.jenis !== 'SEMUA') {
      list = list.filter((g) => g.jenis.toUpperCase() === params.jenis?.toUpperCase());
    }
    return list.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  }

  public createGaleri(item: Omit<GaleriData, 'id' | 'createdAt' | 'updatedAt'>): GaleriData {
    const now = new Date().toISOString();
    const newItem: GaleriData = {
      ...item,
      id: 'gal-' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    this.data.galeri.push(newItem);
    this.persist();
    return newItem;
  }

  public updateGaleri(id: string, updates: Partial<GaleriData>): GaleriData | null {
    const idx = this.data.galeri.findIndex((g) => g.id === id);
    if (idx === -1) return null;
    this.data.galeri[idx] = {
      ...this.data.galeri[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.galeri[idx];
  }

  public deleteGaleri(id: string): boolean {
    const idx = this.data.galeri.findIndex((g) => g.id === id);
    if (idx === -1) return false;
    this.data.galeri.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- KONTAK ---
  public getKontak(): KontakData[] {
    return [...this.data.kontak].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createKontak(item: Omit<KontakData, 'id' | 'createdAt' | 'updatedAt'>): KontakData {
    const now = new Date().toISOString();
    const newItem: KontakData = {
      ...item,
      id: 'knt-' + Date.now(),
      status: 'Baru',
      createdAt: now,
      updatedAt: now
    };
    this.data.kontak.push(newItem);
    this.persist();
    return newItem;
  }

  public updateKontak(id: string, updates: Partial<KontakData>): KontakData | null {
    const idx = this.data.kontak.findIndex((k) => k.id === id);
    if (idx === -1) return null;
    this.data.kontak[idx] = {
      ...this.data.kontak[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.kontak[idx];
  }

  public deleteKontak(id: string): boolean {
    const idx = this.data.kontak.findIndex((k) => k.id === id);
    if (idx === -1) return false;
    this.data.kontak.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- DASHBOARD STATS ---
  public getDashboardStats() {
    const totalSekolah = this.data.sekolah.length;
    const totalKepalaSekolah = this.data.kepalaSekolah.length;
    const totalGuru = this.data.guru.length;
    const totalPrestasi = this.data.prestasi.length;
    const totalBerita = this.data.berita.length;
    const totalGaleri = this.data.galeri.length;
    const totalPengumuman = this.data.pengumuman.length;
    const totalKontakBaru = this.data.kontak.filter((k) => k.status === 'Baru').length;

    // Aggregate student count
    const totalSiswa = this.data.sekolah.reduce((acc, s) => acc + (s.jumlahSiswa || 0), 0);

    // Distribution by jenjang
    const sekolahJenjang = {
      SD: this.data.sekolah.filter((s) => s.jenjang.toUpperCase() === 'SD').length,
      TK: this.data.sekolah.filter((s) => s.jenjang.toUpperCase() === 'TK').length,
      Lainnya: this.data.sekolah.filter((s) => !['SD', 'TK'].includes(s.jenjang.toUpperCase())).length
    };

    // Distribution by status kepegawaian guru
    const guruStatus = {
      PNS: this.data.guru.filter((g) => g.statusKepegawaian === 'PNS').length,
      PPPK: this.data.guru.filter((g) => g.statusKepegawaian === 'PPPK').length,
      Honorer: this.data.guru.filter((g) => g.statusKepegawaian?.toLowerCase().includes('honorer')).length,
      Lainnya: this.data.guru.filter((g) => !['PNS', 'PPPK'].includes(g.statusKepegawaian || '') && !g.statusKepegawaian?.toLowerCase().includes('honorer')).length
    };

    return {
      totalSekolah,
      totalKepalaSekolah,
      totalGuru,
      totalSiswa,
      totalPrestasi,
      totalBerita,
      totalGaleri,
      totalPengumuman,
      totalKontakBaru,
      sekolahJenjang,
      guruStatus,
      recentBerita: this.data.berita.slice(0, 5),
      recentPrestasi: this.data.prestasi.slice(0, 5),
      visitors: this.getVisitorStats()
    };
  }

  // --- VISITORS TRACKING ---
  public recordVisit(params: { visitorId: string; path: string; referrer?: string; userAgent?: string }) {
    if (!this.data.visitors) {
      this.data.visitors = [];
    }
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    const newRecord: VisitorRecord = {
      id: `vis-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      visitorId: params.visitorId || `anon-${Math.random().toString(36).substring(2, 9)}`,
      path: params.path || '/',
      referrer: params.referrer,
      userAgent: params.userAgent,
      timestamp: now.toISOString(),
      date: dateStr
    };

    this.data.visitors.push(newRecord);
    if (this.data.visitors.length > 5000) {
      this.data.visitors = this.data.visitors.slice(-5000);
    }
    this.persist();

    const todayVisitors = new Set(
      this.data.visitors.filter((r) => r.date === dateStr).map((r) => r.visitorId)
    ).size;
    const totalVisitors = new Set(this.data.visitors.map((r) => r.visitorId)).size;

    return {
      success: true,
      totalVisitors,
      todayVisitors
    };
  }

  public getVisitorStats(): VisitorStatsSummary {
    const list = this.data.visitors || [];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const allVisitorIds = new Set(list.map((r) => r.visitorId));
    const totalVisitors = allVisitorIds.size;
    const totalPageViews = list.length;

    const todayRecords = list.filter((r) => r.date === todayStr);
    const todayVisitors = new Set(todayRecords.map((r) => r.visitorId)).size;
    const todayPageViews = todayRecords.length;

    const sevenDaysAgoTime = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgoTime = now.getTime() - 30 * 24 * 60 * 60 * 1000;
    const fifteenMinsAgoTime = now.getTime() - 15 * 60 * 1000;

    const weekVisitors = new Set(
      list.filter((r) => new Date(r.timestamp).getTime() >= sevenDaysAgoTime).map((r) => r.visitorId)
    ).size;

    const monthVisitors = new Set(
      list.filter((r) => new Date(r.timestamp).getTime() >= thirtyDaysAgoTime).map((r) => r.visitorId)
    ).size;

    const activeNow = Math.max(1, new Set(
      list.filter((r) => new Date(r.timestamp).getTime() >= fifteenMinsAgoTime).map((r) => r.visitorId)
    ).size);

    const recentDays: VisitorDayStat[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateString = d.toISOString().split('T')[0];
      const dayRecs = list.filter((r) => r.date === dateString);
      const dayUniqueVisitors = new Set(dayRecs.map((r) => r.visitorId)).size;
      recentDays.push({
        date: dateString,
        label: formatIndonesianDay(dateString),
        visitors: dayUniqueVisitors,
        pageViews: dayRecs.length
      });
    }

    const pageCounts: Record<string, number> = {};
    for (const rec of list) {
      const p = rec.path || '/';
      pageCounts[p] = (pageCounts[p] || 0) + 1;
    }

    const topPages: VisitorTopPage[] = Object.entries(pageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([path, views]) => ({
        path,
        label: getPageLabel(path),
        views
      }));

    return {
      totalVisitors,
      totalPageViews,
      todayVisitors,
      todayPageViews,
      weekVisitors,
      monthVisitors,
      activeNow,
      recentDays,
      topPages
    };
  }

  // --- GLOBAL SEARCH ---
  public searchGlobal(q: string) {
    if (!q || q.trim() === '') return { schools: [], news: [], achievements: [], teachers: [], gallery: [] };
    const query = q.toLowerCase();
    const schools = this.data.sekolah.filter(
      (s) =>
        s.nama.toLowerCase().includes(query) ||
        s.npsn.includes(query) ||
        s.kecamatan.toLowerCase().includes(query)
    ).slice(0, 5);

    const news = this.data.berita.filter(
      (b) =>
        b.statusPublish &&
        (b.judul.toLowerCase().includes(query) || b.konten.toLowerCase().includes(query))
    ).slice(0, 5);

    const achievements = this.data.prestasi.filter(
      (p) =>
        p.namaPrestasi.toLowerCase().includes(query) ||
        p.peraih.toLowerCase().includes(query) ||
        p.bidang.toLowerCase().includes(query)
    ).slice(0, 5);

    const teachers = this.data.guru.filter(
      (g) =>
        g.tampilkanPublik &&
        (g.nama.toLowerCase().includes(query) ||
          g.jabatan.toLowerCase().includes(query) ||
          (g.mapel && g.mapel.toLowerCase().includes(query)))
    ).slice(0, 5);

    const gallery = this.data.galeri.filter(
      (g) =>
        g.judul.toLowerCase().includes(query) ||
        (g.deskripsi && g.deskripsi.toLowerCase().includes(query))
    ).slice(0, 5);

    return {
      schools,
      news,
      achievements,
      teachers,
      gallery
    };
  }

  // --- SYSTEM DIAGNOSTICS & STATUS ---
  public getSystemStatus() {
    return {
      mode: 'FIREBASE_FIRESTORE',
      isDemoMode: false,
      isDatabaseConfigured: true,
      databaseType: 'Google Firebase Firestore (Cloud Database)',
      storageType: 'Penyimpanan Berkas Terpadu (/public/uploads)',
      totalSekolah: this.data.sekolah.length,
      totalGuru: this.data.guru.length,
      totalBerita: this.data.berita.length,
      demoNotice: 'Aplikasi terhubung ke database Google Firebase Firestore dan Firebase Authentication. Seluruh data tersimpan aman dan presisten.',
      configurationGuide: {
        databaseUrlGuide: 'DATABASE_URL TIDAK LAGI DIPERLUKAN karena database telah menggunakan Firebase Firestore.',
        jwtSecretGuide: 'JWT_SECRET TIDAK LAGI DIPERLUKAN karena autentikasi dikelola oleh Firebase Authentication.',
        apiUrlGuide: 'Atur variabel API_URL jika frontend di-host di domain terpisah dari backend API.'
      }
    };
  }

  // --- BACKUP & RESTORE DATA DATABASE ---
  public getBackupSummary(): {
    lastUpdated: string;
    fileSizeBytes: number;
    fileSizeKB: string;
    counts: Record<string, number>;
  } {
    let fileSizeBytes = 0;
    try {
      if (fs.existsSync(DB_FILE)) {
        const stat = fs.statSync(DB_FILE);
        fileSizeBytes = stat.size;
      }
    } catch {}

    return {
      lastUpdated: new Date().toISOString(),
      fileSizeBytes,
      fileSizeKB: (fileSizeBytes / 1024).toFixed(2) + ' KB',
      counts: {
        sekolah: this.data.sekolah ? this.data.sekolah.length : 0,
        kepalaSekolah: this.data.kepalaSekolah ? this.data.kepalaSekolah.length : 0,
        guru: this.data.guru ? this.data.guru.length : 0,
        prestasi: this.data.prestasi ? this.data.prestasi.length : 0,
        berita: this.data.berita ? this.data.berita.length : 0,
        galeri: this.data.galeri ? this.data.galeri.length : 0,
        pengumuman: this.data.pengumuman ? this.data.pengumuman.length : 0,
        visiMisi: this.data.visiMisi ? this.data.visiMisi.length : 0,
        fasilitas: this.data.fasilitas ? this.data.fasilitas.length : 0,
        keunggulan: this.data.keunggulan ? this.data.keunggulan.length : 0,
        strukturOrganisasi: this.data.strukturOrganisasi ? this.data.strukturOrganisasi.length : 0,
        kontak: this.data.kontak ? this.data.kontak.length : 0,
        bukuTamu: this.data.bukuTamu ? this.data.bukuTamu.length : 0,
        pengawas: this.data.pengawas ? this.data.pengawas.length : 0,
        pengaturanWebsite: this.data.pengaturanWebsite ? this.data.pengaturanWebsite.length : 0
      }
    };
  }

  // --- BUKU TAMU METHODS ---
  public getBukuTamu(): BukuTamuData[] {
    if (!this.data.bukuTamu || !Array.isArray(this.data.bukuTamu)) {
      this.data.bukuTamu = getDefaultBukuTamu();
      this.persist();
    }
    return [...this.data.bukuTamu].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public createBukuTamu(data: {
    nama: string;
    jabatan: string;
    instansi: string;
    masukan: string;
  }): BukuTamuData {
    if (!this.data.bukuTamu) {
      this.data.bukuTamu = [];
    }
    const newItem: BukuTamuData = {
      id: `bt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      nama: data.nama.trim(),
      jabatan: data.jabatan.trim(),
      instansi: data.instansi.trim(),
      masukan: data.masukan.trim(),
      createdAt: new Date().toISOString()
    };
    this.data.bukuTamu.unshift(newItem);
    this.persist();
    return newItem;
  }

  public deleteBukuTamu(id: string): boolean {
    if (!this.data.bukuTamu) return false;
    const initialLen = this.data.bukuTamu.length;
    this.data.bukuTamu = this.data.bukuTamu.filter((b) => b.id !== id);
    if (this.data.bukuTamu.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  public restoreRaw(newData: any): { success: boolean; message: string; counts: Record<string, number> } {
    if (!newData || typeof newData !== 'object') {
      throw new Error('Format data cadangan tidak valid.');
    }
    // Unwrap if wrapped under database / data
    const raw = newData.database || newData.data || newData;
    if (!raw.sekolah && !raw.guru && !raw.pengawas && !raw.berita) {
      throw new Error('Struktur file cadangan tidak dikenali. Pastikan file adalah hasil backup Portal Pengawas.');
    }

    // Safety backup of existing store before restoring
    try {
      if (fs.existsSync(DB_FILE)) {
        const backupFile = path.resolve(process.cwd(), `data/store.backup-before-restore-${Date.now()}.json`);
        fs.copyFileSync(DB_FILE, backupFile);
      }
    } catch (e) {
      console.warn('Gagal membuat arsip cadangan sebelum pemulihan:', e);
    }

    const current = this.data;
    this.data = {
      admins: Array.isArray(raw.admins) && raw.admins.length > 0 ? raw.admins : current.admins,
      pengawas: Array.isArray(raw.pengawas) && raw.pengawas.length > 0 ? raw.pengawas : current.pengawas,
      pengaturanWebsite: Array.isArray(raw.pengaturanWebsite) && raw.pengaturanWebsite.length > 0 ? raw.pengaturanWebsite : current.pengaturanWebsite,
      sekolah: Array.isArray(raw.sekolah) ? raw.sekolah : current.sekolah,
      visiMisi: Array.isArray(raw.visiMisi) ? raw.visiMisi : current.visiMisi,
      strukturOrganisasi: Array.isArray(raw.strukturOrganisasi) ? raw.strukturOrganisasi : current.strukturOrganisasi,
      fasilitas: Array.isArray(raw.fasilitas) ? raw.fasilitas : current.fasilitas,
      keunggulan: Array.isArray(raw.keunggulan) ? raw.keunggulan : current.keunggulan,
      kepalaSekolah: Array.isArray(raw.kepalaSekolah) ? raw.kepalaSekolah : current.kepalaSekolah,
      guru: Array.isArray(raw.guru) ? raw.guru : current.guru,
      prestasi: Array.isArray(raw.prestasi) ? raw.prestasi : current.prestasi,
      berita: Array.isArray(raw.berita) ? raw.berita : current.berita,
      galeri: Array.isArray(raw.galeri) ? raw.galeri : current.galeri,
      pengumuman: Array.isArray(raw.pengumuman) ? raw.pengumuman : current.pengumuman,
      kontak: Array.isArray(raw.kontak) ? raw.kontak : current.kontak,
      bukuTamu: Array.isArray(raw.bukuTamu) ? raw.bukuTamu : current.bukuTamu || [],
      visitors: Array.isArray(raw.visitors) ? raw.visitors : current.visitors
    };
    this.persist();

    return {
      success: true,
      message: 'Database berhasil dipulihkan dari data backup.',
      counts: {
        sekolah: this.data.sekolah.length,
        kepalaSekolah: this.data.kepalaSekolah.length,
        guru: this.data.guru.length,
        prestasi: this.data.prestasi.length,
        berita: this.data.berita.length,
        galeri: this.data.galeri.length,
        pengumuman: this.data.pengumuman.length,
        bukuTamu: this.data.bukuTamu ? this.data.bukuTamu.length : 0
      }
    };
  }
}

export const db = new DatabaseService();
