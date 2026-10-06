import React, { useState, useEffect } from 'react';
import { Trophy, Plus, Edit2, Trash2, X, School, Search, Calendar, FileSpreadsheet, Award } from 'lucide-react';
import { api } from '../../services/api';
import { School as SchoolType, Prestasi } from '../../types';
import { ImageUpload } from '../../components/common/ImageUpload';
import { DocumentImportModal } from '../../components/common/DocumentImportModal';
import { DocumentAutofillButton } from '../../components/common/DocumentAutofillButton';

interface AdminPrestasiProps {
  onNotify: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const AdminPrestasi: React.FC<AdminPrestasiProps> = ({ onNotify }) => {
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [prestasiList, setPrestasiList] = useState<Prestasi[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Prestasi | null>(null);

  const [formData, setFormData] = useState({
    sekolahId: '',
    judul: '',
    kategori: 'Akademik',
    tingkat: 'Kabupaten/Kota',
    peringkat: 'Juara 1',
    tahun: new Date().getFullYear(),
    namaPeraih: '',
    deskripsi: '',
    fotoUrl: '',
  });

  useEffect(() => {
    loadSchools();
  }, []);

  useEffect(() => {
    loadPrestasi();
  }, [selectedSchoolId]);

  const loadSchools = async () => {
    try {
      const data = await api.getSchools();
      setSchools(data);
    } catch {
      onNotify('error', 'Gagal memuat daftar sekolah');
    }
  };

  const loadPrestasi = async () => {
    try {
      setIsLoading(true);
      const data = await api.getPrestasi(selectedSchoolId ? { sekolahId: selectedSchoolId } : undefined);
      setPrestasiList(data);
    } catch {
      onNotify('error', 'Gagal memuat data prestasi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      sekolahId: selectedSchoolId || (schools.length > 0 ? schools[0].id : ''),
      judul: '',
      kategori: 'Akademik',
      tingkat: 'Kabupaten/Kota',
      peringkat: 'Juara 1',
      tahun: new Date().getFullYear(),
      namaPeraih: '',
      deskripsi: '',
      fotoUrl: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Prestasi) => {
    setEditingItem(item);
    setFormData({
      sekolahId: item.sekolahId || '',
      judul: item.judul || item.namaPrestasi || '',
      kategori: item.kategori || item.bidang || 'Akademik',
      tingkat: item.tingkat,
      peringkat: item.peringkat || '',
      tahun: item.tahun,
      namaPeraih: item.namaPeraih || item.peraih || '',
      deskripsi: item.deskripsi || item.keterangan || '',
      fotoUrl: item.fotoUrl || item.foto || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sekolahId || !formData.judul) {
      onNotify('error', 'Judul dan Sekolah wajib diisi');
      return;
    }

    try {
      if (editingItem) {
        await api.updatePrestasi(editingItem.id, formData);
        onNotify('success', 'Data Prestasi berhasil diperbarui');
      } else {
        await api.createPrestasi(formData);
        onNotify('success', 'Data Prestasi berhasil ditambahkan');
      }
      setIsModalOpen(false);
      loadPrestasi();
    } catch {
      onNotify('error', 'Gagal menyimpan data Prestasi');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus prestasi ini?')) return;
    try {
      await api.deletePrestasi(id);
      onNotify('success', 'Prestasi berhasil dihapus');
      loadPrestasi();
    } catch {
      onNotify('error', 'Gagal menghapus prestasi');
    }
  };

  const filteredList = prestasiList.filter((item) => {
    const judul = item.judul || item.namaPrestasi || '';
    const peraih = item.namaPeraih || item.peraih || '';
    const kategori = item.kategori || item.bidang || '';
    const matchesSearch =
      judul.toLowerCase().includes(search.toLowerCase()) ||
      peraih.toLowerCase().includes(search.toLowerCase()) ||
      kategori.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            Manajemen Prestasi Sekolah
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Catat penghargaan akademik, non-akademik, seni, dan olahraga satuan pendidikan binaan
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm flex items-center gap-2 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Import Excel
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm flex items-center gap-2 transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Tambah Prestasi
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari judul prestasi atau nama peraih..."
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
          <option value="">Semua Sekolah Binaan</option>
          {schools.map((school) => (
            <option key={school.id} value={school.id}>
              {school.nama}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-slate-500 text-sm">Memuat data prestasi...</div>
      ) : filteredList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-800 text-base">Belum Ada Data Prestasi</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Silakan tambahkan prestasi atau import berkas Excel untuk menampilkan rekam jejak capaian siswa & sekolah.
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
                {item.fotoUrl || item.foto ? (
                  <div className="h-40 overflow-hidden bg-slate-100">
                    <img
                      src={item.fotoUrl || item.foto}
                      alt={item.judul || item.namaPrestasi || 'Prestasi'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : null}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        {item.tingkat}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {item.kategori || item.bidang || 'Prestasi'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium ml-auto">
                        Tahun {item.tahun}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base mb-1 line-clamp-2">
                      {item.judul || item.namaPrestasi}
                    </h3>

                    {item.peringkat && (
                      <p className="text-xs font-semibold text-amber-600 flex items-center gap-1 mb-2">
                        <Award className="w-3.5 h-3.5" />
                        {item.peringkat}
                      </p>
                    )}

                    {(item.namaPeraih || item.peraih) && (
                      <p className="text-xs text-slate-600 mb-2">
                        <span className="text-slate-400">Peraih:</span> {item.namaPeraih || item.peraih}
                      </p>
                    )}

                    <p className="text-xs text-slate-400">
                      {school ? school.nama : 'Sekolah'}
                    </p>
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
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">
                {editingItem ? 'Edit Prestasi' : 'Tambah Prestasi'}
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
                  entityType="prestasi"
                  onExtracted={(extracted) => {
                    setFormData((prev) => ({
                      ...prev,
                      judul: extracted.judul || prev.judul,
                      peringkat: extracted.peringkat || prev.peringkat,
                      namaPeraih: extracted.namaPeraih || prev.namaPeraih,
                      tingkat: extracted.tingkat || prev.tingkat,
                      deskripsi: extracted.deskripsi || prev.deskripsi,
                    }));
                    onNotify('info', 'Data berhasil diekstrak');
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sekolah *</label>
                <select
                  value={formData.sekolahId}
                  onChange={(e) => setFormData({ ...formData, sekolahId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Pilih Sekolah</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Prestasi / Lomba *</label>
                <input
                  type="text"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Contoh: Juara 1 Olimpiade Sains Nasional SD"
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
                    <option value="Akademik">Akademik</option>
                    <option value="Non-Akademik">Non-Akademik</option>
                    <option value="Seni & Budaya">Seni & Budaya</option>
                    <option value="Olahraga">Olahraga</option>
                    <option value="Keagamaan">Keagamaan</option>
                    <option value="Inovasi">Inovasi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tingkat</label>
                  <select
                    value={formData.tingkat}
                    onChange={(e) => setFormData({ ...formData, tingkat: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Kecamatan">Kecamatan</option>
                    <option value="Kabupaten/Kota">Kabupaten/Kota</option>
                    <option value="Provinsi">Provinsi</option>
                    <option value="Nasional">Nasional</option>
                    <option value="Internasional">Internasional</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Peringkat / Capaian</label>
                  <input
                    type="text"
                    value={formData.peringkat}
                    onChange={(e) => setFormData({ ...formData, peringkat: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Juara 1 / Medali Emas"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tahun</label>
                  <input
                    type="number"
                    value={formData.tahun}
                    onChange={(e) => setFormData({ ...formData, tahun: parseInt(e.target.value) || 2025 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Peraih (Siswa/Tim)</label>
                <input
                  type="text"
                  value={formData.namaPeraih}
                  onChange={(e) => setFormData({ ...formData, namaPeraih: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ahmad Fauzan & Tim Robotik"
                />
              </div>

              <ImageUpload
                label="Foto Dokumentasi Prestasi"
                value={formData.fotoUrl}
                onChange={(url) => setFormData({ ...formData, fotoUrl: url })}
                category="prestasi"
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Keterangan / Deskripsi</label>
                <textarea
                  rows={3}
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Rincian lomba, penyelenggara, dan penghargaan yang diperoleh..."
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
                  {editingItem ? 'Simpan' : 'Tambahkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <DocumentImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          defaultEntityType="prestasi"
          schools={schools}
          onImportSuccess={() => {
            loadPrestasi();
            onNotify('success', 'Data Prestasi berhasil diimport');
          }}
        />
      )}
    </div>
  );
};
