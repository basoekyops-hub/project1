import React, { useState, useEffect } from 'react';
import { BellRing, Plus, Edit2, Trash2, X, School, Search, Calendar, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { School as SchoolType, Pengumuman } from '../../types';
import { DocumentAutofillButton } from '../../components/common/DocumentAutofillButton';

interface AdminPengumumanProps {
  onNotify: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const AdminPengumuman: React.FC<AdminPengumumanProps> = ({ onNotify }) => {
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [pengumumanList, setPengumumanList] = useState<Pengumuman[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Pengumuman | null>(null);

  const [formData, setFormData] = useState({
    sekolahId: '',
    judul: '',
    konten: '',
    tipe: 'info',
    berlakuSampai: '',
    fileUrl: '',
  });

  useEffect(() => {
    loadSchools();
  }, []);

  useEffect(() => {
    loadPengumuman();
  }, [selectedSchoolId]);

  const loadSchools = async () => {
    try {
      const data = await api.getSchools();
      setSchools(data);
    } catch {
      onNotify('error', 'Gagal memuat daftar sekolah');
    }
  };

  const loadPengumuman = async () => {
    try {
      setIsLoading(true);
      const data = await api.getPengumuman(selectedSchoolId ? { sekolahId: selectedSchoolId } : undefined);
      setPengumumanList(data);
    } catch {
      onNotify('error', 'Gagal memuat daftar pengumuman');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      sekolahId: selectedSchoolId || '',
      judul: '',
      konten: '',
      tipe: 'info',
      berlakuSampai: '',
      fileUrl: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Pengumuman) => {
    setEditingItem(item);
    setFormData({
      sekolahId: item.sekolahId || '',
      judul: item.judul,
      konten: item.konten || item.isi || '',
      tipe: item.tipe || 'info',
      berlakuSampai: item.berlakuSampai || '',
      fileUrl: item.fileUrl || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.judul || !formData.konten) {
      onNotify('error', 'Judul dan Konten pengumuman wajib diisi');
      return;
    }

    const payload = {
      ...formData,
      sekolahId: formData.sekolahId || undefined,
    };

    try {
      if (editingItem) {
        await api.updatePengumuman(editingItem.id, payload);
        onNotify('success', 'Pengumuman berhasil diperbarui');
      } else {
        await api.createPengumuman(payload);
        onNotify('success', 'Pengumuman berhasil diterbitkan');
      }
      setIsModalOpen(false);
      loadPengumuman();
    } catch {
      onNotify('error', 'Gagal menyimpan pengumuman');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus pengumuman ini?')) return;
    try {
      await api.deletePengumuman(id);
      onNotify('success', 'Pengumuman berhasil dihapus');
      loadPengumuman();
    } catch {
      onNotify('error', 'Gagal menghapus pengumuman');
    }
  };

  const filteredList = pengumumanList.filter((item) => {
    const konten = item.konten || item.isi || '';
    const matchesSearch =
      item.judul.toLowerCase().includes(search.toLowerCase()) ||
      konten.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BellRing className="w-6 h-6 text-amber-500" />
            Manajemen Pengumuman & Edaran
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Siarkan edaran dinas, instruksi supervisi, dan pemberitahuan penting bagi sekolah
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm flex items-center gap-2 transition shadow-xs self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Buat Pengumuman Baru
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari pengumuman..."
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
          <option value="pengawas-only">Khusus Edaran Pengawas</option>
          {schools.map((school) => (
            <option key={school.id} value={school.id}>
              {school.nama}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-slate-500 text-sm">Memuat data pengumuman...</div>
      ) : filteredList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <BellRing className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-800 text-base">Belum Ada Pengumuman</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Terbitkan surat edaran atau instruksi pembinaan satuan pendidikan di sini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map((item) => {
            const school = schools.find((s) => s.id === item.sekolahId);
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.tipe === 'penting'
                          ? 'bg-rose-100 text-rose-700'
                          : item.tipe === 'peringatan'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {item.tipe ? item.tipe.toUpperCase() : 'INFO'}
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

                  <h3 className="font-bold text-slate-900 text-base mb-1.5">{item.judul}</h3>
                  <p className="text-xs text-slate-600 whitespace-pre-line line-clamp-3 mb-3">
                    {item.konten}
                  </p>

                  <div className="text-xs text-slate-400">
                    Tujuan: <span className="text-slate-600 font-medium">{school ? school.nama : 'Umum / Semua Sekolah'}</span>
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
                {editingItem ? 'Edit Pengumuman' : 'Buat Pengumuman'}
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
                  entityType="pengumuman"
                  onExtracted={(extracted) => {
                    setFormData((prev) => ({
                      ...prev,
                      judul: extracted.judul || prev.judul,
                      konten: extracted.isi || prev.konten,
                    }));
                    onNotify('info', 'Data berhasil diekstrak');
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tingkat Kepentingan
                  </label>
                  <select
                    value={formData.tipe}
                    onChange={(e) => setFormData({ ...formData, tipe: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="info">Informasi Biasa</option>
                    <option value="penting">Sangat Penting / Urgent</option>
                    <option value="peringatan">Peringatan / Batas Waktu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sekolah Tujuan
                  </label>
                  <select
                    value={formData.sekolahId}
                    onChange={(e) => setFormData({ ...formData, sekolahId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Semua Sekolah / Umum</option>
                    {schools.map((school) => (
                      <option key={school.id} value={school.id}>
                        {school.nama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Judul Pengumuman / Edaran *
                </label>
                <input
                  type="text"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Contoh: Jadwal Pelaksanaan Supervisi Akademik Triwulan I"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Isi Surat / Instruksi Pengumuman *
                </label>
                <textarea
                  rows={6}
                  value={formData.konten}
                  onChange={(e) => setFormData({ ...formData, konten: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans leading-relaxed"
                  placeholder="Rincian surat atau instruksi bagi guru/kepala sekolah..."
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
                  {editingItem ? 'Simpan Perubahan' : 'Terbitkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
