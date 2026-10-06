import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Plus, Edit2, Trash2, X, School, Search, Calendar, Video } from 'lucide-react';
import { api } from '../../services/api';
import { School as SchoolType, Galeri } from '../../types';
import { ImageUpload } from '../../components/common/ImageUpload';

interface AdminGaleriProps {
  onNotify: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const AdminGaleri: React.FC<AdminGaleriProps> = ({ onNotify }) => {
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [galeriList, setGaleriList] = useState<Galeri[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Galeri | null>(null);

  const [formData, setFormData] = useState({
    sekolahId: '',
    judul: '',
    kategori: 'Kegiatan Sekolah',
    tipe: 'foto',
    url: '',
    thumbnailUrl: '',
    keterangan: '',
  });

  useEffect(() => {
    loadSchools();
  }, []);

  useEffect(() => {
    loadGaleri();
  }, [selectedSchoolId]);

  const loadSchools = async () => {
    try {
      const data = await api.getSchools();
      setSchools(data);
    } catch {
      onNotify('error', 'Gagal memuat daftar sekolah');
    }
  };

  const loadGaleri = async () => {
    try {
      setIsLoading(true);
      const data = await api.getGaleri(selectedSchoolId ? { sekolahId: selectedSchoolId } : undefined);
      setGaleriList(data);
    } catch {
      onNotify('error', 'Gagal memuat galeri');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      sekolahId: selectedSchoolId || '',
      judul: '',
      kategori: 'Kegiatan Sekolah',
      tipe: 'foto',
      url: '',
      thumbnailUrl: '',
      keterangan: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Galeri) => {
    setEditingItem(item);
    setFormData({
      sekolahId: item.sekolahId || '',
      judul: item.judul,
      kategori: item.kategori,
      tipe: item.tipe || (item.jenis?.toLowerCase() === 'video' ? 'video' : 'foto'),
      url: item.url,
      thumbnailUrl: item.thumbnailUrl || '',
      keterangan: item.keterangan || item.deskripsi || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.judul || !formData.url) {
      onNotify('error', 'Judul dan URL Foto/Media wajib diisi');
      return;
    }

    const payload = {
      ...formData,
      sekolahId: formData.sekolahId || undefined,
    };

    try {
      if (editingItem) {
        await api.updateGaleri(editingItem.id, payload);
        onNotify('success', 'Galeri berhasil diperbarui');
      } else {
        await api.createGaleri(payload);
        onNotify('success', 'Media berhasil ditambahkan ke galeri');
      }
      setIsModalOpen(false);
      loadGaleri();
    } catch {
      onNotify('error', 'Gagal menyimpan media galeri');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus foto/media ini?')) return;
    try {
      await api.deleteGaleri(id);
      onNotify('success', 'Media galeri berhasil dihapus');
      loadGaleri();
    } catch {
      onNotify('error', 'Gagal menghapus media galeri');
    }
  };

  const filteredList = galeriList.filter((item) => {
    const matchesSearch =
      item.judul.toLowerCase().includes(search.toLowerCase()) ||
      item.kategori.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-indigo-600" />
            Manajemen Galeri Dokumentasi
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Arsip foto dan video dokumentasi kegiatan pengawasan, kunjungan sekolah, & inovasi
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm flex items-center gap-2 transition shadow-xs self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Unggah Foto/Media
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari dokumentasi berdasarkan judul..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={selectedSchoolId}
          onChange={(e) => setSelectedSchoolId(e.target.value)}
          className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[200px]"
        >
          <option value="">Semua (Pengawas & Seluruh Sekolah)</option>
          <option value="pengawas-only">Khusus Foto Kegiatan Pengawas</option>
          {schools.map((school) => (
            <option key={school.id} value={school.id}>
              {school.nama}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-slate-500 text-sm">Memuat galeri...</div>
      ) : filteredList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-800 text-base">Belum Ada Foto Dokumentasi</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Unggah foto dokumentasi kegiatan sekolah atau pembinaan di sini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredList.map((item) => {
            const school = schools.find((s) => s.id === item.sekolahId);
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs group flex flex-col justify-between hover:shadow-md transition"
              >
                <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                  <img
                    src={item.url}
                    alt={item.judul}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/70 text-white backdrop-blur-xs">
                      {item.kategori}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm line-clamp-1 mb-1">
                      {item.judul}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {school ? school.nama : 'Kegiatan Pengawas'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-1.5 mt-2.5">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">
                {editingItem ? 'Edit Media Galeri' : 'Tambah Media Galeri'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sekolah / Asal Kegiatan
                </label>
                <select
                  value={formData.sekolahId}
                  onChange={(e) => setFormData({ ...formData, sekolahId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Khusus Dokumentasi Pengawas (Portal Utama)</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Judul Foto / Dokumentasi *
                </label>
                <input
                  type="text"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Contoh: Supervisi Pembelajaran Berdiferensiasi"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Kegiatan Sekolah">Kegiatan Sekolah</option>
                    <option value="Supervisi & Pendampingan">Supervisi & Pendampingan</option>
                    <option value="Fasilitas & Sarpras">Fasilitas & Sarpras</option>
                    <option value="Upacara & Peringatan">Upacara & Peringatan</option>
                    <option value="Ekstrakurikuler">Ekstrakurikuler</option>
                    <option value="Prestasi">Prestasi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tipe Media</label>
                  <select
                    value={formData.tipe}
                    onChange={(e) => setFormData({ ...formData, tipe: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="foto">Foto</option>
                    <option value="video">Video</option>
                  </select>
                </div>
              </div>

              <ImageUpload
                label="Unggah Berkas Foto / Gambar"
                value={formData.url}
                onChange={(url) => setFormData({ ...formData, url })}
                category="galeri"
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan Singkat
                </label>
                <textarea
                  rows={3}
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Ceritakan momen dalam dokumentasi ini..."
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
                >
                  {editingItem ? 'Simpan' : 'Simpan ke Galeri'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
