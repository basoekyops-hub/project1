import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit2, Trash2, X, School, Search, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { School as SchoolType, Berita, KATEGORI_BERITA } from '../../types';
import { ImageUpload } from '../../components/common/ImageUpload';
import { DocumentAutofillButton } from '../../components/common/DocumentAutofillButton';

interface AdminBeritaProps {
  onNotify: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const AdminBerita: React.FC<AdminBeritaProps> = ({ onNotify }) => {
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [beritaList, setBeritaList] = useState<Berita[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('SEMUA');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Berita | null>(null);

  const [formData, setFormData] = useState({
    sekolahId: '',
    judul: '',
    ringkasan: '',
    konten: '',
    kategori: KATEGORI_BERITA[0] as string,
    penulis: 'Humas / Pengawas',
    gambarUrl: '',
    tags: 'pendampingan, kegiatan',
  });

  useEffect(() => {
    loadSchools();
  }, []);

  useEffect(() => {
    loadBerita();
  }, [selectedSchoolId]);

  const loadSchools = async () => {
    try {
      const data = await api.getSchools();
      setSchools(data);
    } catch {
      onNotify('error', 'Gagal memuat daftar sekolah');
    }
  };

  const loadBerita = async () => {
    try {
      setIsLoading(true);
      const data = await api.getBerita(selectedSchoolId ? { sekolahId: selectedSchoolId } : undefined);
      setBeritaList(data);
    } catch {
      onNotify('error', 'Gagal memuat daftar berita');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      sekolahId: selectedSchoolId || '',
      judul: '',
      ringkasan: '',
      konten: '',
      kategori: KATEGORI_BERITA[0],
      penulis: 'Humas / Pengawas',
      gambarUrl: '',
      tags: 'pendampingan, kegiatan',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Berita) => {
    setEditingItem(item);
    const photo = item.gambarUrl || item.thumbnail || (item as any).gambar || (item as any).foto || (item as any).fotoUrl || '';
    setFormData({
      sekolahId: item.sekolahId || '',
      judul: item.judul,
      ringkasan: item.ringkasan || '',
      konten: item.konten,
      kategori: item.kategori,
      penulis: item.penulis,
      gambarUrl: photo,
      tags: item.tags ? item.tags.join(', ') : '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.judul || !formData.konten) {
      onNotify('error', 'Judul dan Konten berita wajib diisi');
      return;
    }

    const photo = formData.gambarUrl.trim();
    const payload = {
      ...formData,
      gambarUrl: photo,
      thumbnail: photo,
      gambar: photo,
      foto: photo,
      fotoUrl: photo,
      sekolahId: formData.sekolahId || undefined,
      tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };

    try {
      if (editingItem) {
        await api.updateBerita(editingItem.id, payload);
        onNotify('success', 'Berita berhasil diperbarui');
      } else {
        await api.createBerita(payload);
        onNotify('success', 'Berita berhasil diterbitkan');
      }
      setIsModalOpen(false);
      loadBerita();
    } catch {
      onNotify('error', 'Gagal menyimpan berita');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus berita ini?')) return;
    try {
      await api.deleteBerita(id);
      onNotify('success', 'Berita berhasil dihapus');
      loadBerita();
    } catch {
      onNotify('error', 'Gagal menghapus berita');
    }
  };

  const filteredList = beritaList.filter((item) => {
    const matchesSearch =
      item.judul.toLowerCase().includes(search.toLowerCase()) ||
      item.kategori.toLowerCase().includes(search.toLowerCase()) ||
      item.konten.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'SEMUA' || item.kategori === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            Manajemen Berita & Artikel
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Publikasikan kabar supervisi, pendampingan sekolah, dan artikel inovasi pembelajaran
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm flex items-center gap-2 transition shadow-xs self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tulis Berita Baru
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berita berdasarkan judul atau kata kunci..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="SEMUA">Semua Kategori</option>
          {KATEGORI_BERITA.map((kat) => (
            <option key={kat} value={kat}>
              {kat}
            </option>
          ))}
        </select>
        <select
          value={selectedSchoolId}
          onChange={(e) => setSelectedSchoolId(e.target.value)}
          className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[200px]"
        >
          <option value="">Semua (Pengawas & Seluruh Sekolah)</option>
          <option value="pengawas-only">Khusus Berita Pengawas</option>
          {schools.map((school) => (
            <option key={school.id} value={school.id}>
              {school.nama}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-slate-500 text-sm">Memuat data berita...</div>
      ) : filteredList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-800 text-base">Belum Ada Berita</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Mulai menulis warta pendampingan dan berita kegiatan sekolah binaan Anda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((item) => {
            const school = schools.find((s) => s.id === item.sekolahId);
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs flex flex-col justify-between hover:shadow-md transition"
              >
                {(item.gambarUrl || item.thumbnail || (item as any).gambar || (item as any).foto || (item as any).fotoUrl) && (
                  <div className="h-44 overflow-hidden bg-slate-100">
                    <img
                      src={item.gambarUrl || item.thumbnail || (item as any).gambar || (item as any).foto || (item as any).fotoUrl}
                      alt={item.judul}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800';
                      }}
                    />
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                        {item.kategori}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium ml-auto flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.tanggal).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base mb-1.5 line-clamp-2">
                      {item.judul}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                      {item.ringkasan || item.konten}
                    </p>

                    <div className="text-xs text-slate-400">
                      Penulis: <span className="text-slate-600 font-medium">{item.penulis}</span>
                      {school && <span> • {school.nama}</span>}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 mt-4">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
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
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">
                {editingItem ? 'Edit Berita' : 'Tulis Berita Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div className="flex justify-end">
                <DocumentAutofillButton
                  entityType="berita"
                  onExtracted={(extracted) => {
                    setFormData((prev) => ({
                      ...prev,
                      judul: extracted.judul || prev.judul,
                      konten: extracted.isi || prev.konten,
                      ringkasan: extracted.ringkasan || prev.ringkasan,
                    }));
                    onNotify('info', 'Data berhasil diekstrak');
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori Berita / Satuan Terkait
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {KATEGORI_BERITA.map((kat) => (
                      <option key={kat} value={kat}>
                        {kat}
                      </option>
                    ))}
                  </select>

                  <select
                    value={formData.sekolahId}
                    onChange={(e) => setFormData({ ...formData, sekolahId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Khusus Berita Pengawas (Portal Utama)</option>
                    {schools.map((school) => (
                      <option key={school.id} value={school.id}>
                        Terkait: {school.nama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Berita *</label>
                <input
                  type="text"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Judul artikel atau berita pendampingan..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Penulis</label>
                  <input
                    type="text"
                    value={formData.penulis}
                    onChange={(e) => setFormData({ ...formData, penulis: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Tim Pengawas / Nama Penulis"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tag / Kata Kunci</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="kurikulum, merdeka, pendampingan"
                  />
                </div>
              </div>

              <ImageUpload
                label="Gambar Utama Berita"
                value={formData.gambarUrl}
                onChange={(url) => setFormData({ ...formData, gambarUrl: url })}
                category="berita"
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ringkasan Singkat</label>
                <textarea
                  rows={2}
                  value={formData.ringkasan}
                  onChange={(e) => setFormData({ ...formData, ringkasan: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Ringkasan 1-2 kalimat untuk kartu berita..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Isi Lengkap Berita *</label>
                <textarea
                  rows={8}
                  value={formData.konten}
                  onChange={(e) => setFormData({ ...formData, konten: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs leading-relaxed"
                  placeholder="Tuliskan isi berita, liputan kegiatan, atau artikel selengkapnya di sini..."
                  required
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
                  {editingItem ? 'Simpan Perubahan' : 'Terbitkan Berita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
