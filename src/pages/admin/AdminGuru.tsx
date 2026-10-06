import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, X, School, Search, CheckCircle2, User, FileSpreadsheet } from 'lucide-react';
import { api } from '../../services/api';
import { School as SchoolType, Guru } from '../../types';
import { ImageUpload } from '../../components/common/ImageUpload';
import { DocumentImportModal } from '../../components/common/DocumentImportModal';
import { DocumentAutofillButton } from '../../components/common/DocumentAutofillButton';

interface AdminGuruProps {
  onNotify: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const AdminGuru: React.FC<AdminGuruProps> = ({ onNotify }) => {
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Guru | null>(null);

  const [formData, setFormData] = useState({
    sekolahId: '',
    nama: '',
    gelar: '',
    nip: '',
    mataPelajaran: '',
    jabatan: 'Guru Kelas',
    statusKepegawaian: 'PNS',
    fotoUrl: '',
    email: '',
  });

  useEffect(() => {
    loadSchools();
  }, []);

  useEffect(() => {
    loadGuru();
  }, [selectedSchoolId]);

  const loadSchools = async () => {
    try {
      const data = await api.getSchools();
      setSchools(data);
    } catch {
      onNotify('error', 'Gagal memuat daftar sekolah');
    }
  };

  const loadGuru = async () => {
    try {
      setIsLoading(true);
      const data = await api.getGuru(selectedSchoolId ? { sekolahId: selectedSchoolId } : undefined);
      setGuruList(data);
    } catch {
      onNotify('error', 'Gagal memuat data guru & tenaga kependidikan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      sekolahId: selectedSchoolId || (schools.length > 0 ? schools[0].id : ''),
      nama: '',
      gelar: '',
      nip: '',
      mataPelajaran: '',
      jabatan: 'Guru Kelas',
      statusKepegawaian: 'PNS',
      fotoUrl: '',
      email: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Guru) => {
    setEditingItem(item);
    setFormData({
      sekolahId: item.sekolahId,
      nama: item.nama,
      gelar: item.gelar || '',
      nip: item.nip || '',
      mataPelajaran: item.mataPelajaran || '',
      jabatan: item.jabatan || 'Guru Kelas',
      statusKepegawaian: item.statusKepegawaian || 'PNS',
      fotoUrl: item.fotoUrl || '',
      email: item.email || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sekolahId || !formData.nama) {
      onNotify('error', 'Nama dan Sekolah wajib diisi');
      return;
    }

    try {
      if (editingItem) {
        await api.updateGuru(editingItem.id, formData);
        onNotify('success', 'Data Guru berhasil diperbarui');
      } else {
        await api.createGuru(formData);
        onNotify('success', 'Data Guru berhasil ditambahkan');
      }
      setIsModalOpen(false);
      loadGuru();
    } catch {
      onNotify('error', 'Gagal menyimpan data Guru');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus data Guru ini?')) return;
    try {
      await api.deleteGuru(id);
      onNotify('success', 'Data Guru berhasil dihapus');
      loadGuru();
    } catch {
      onNotify('error', 'Gagal menghapus data Guru');
    }
  };

  const filteredList = guruList.filter((item) => {
    const matchesSearch =
      item.nama.toLowerCase().includes(search.toLowerCase()) ||
      (item.nip && item.nip.includes(search)) ||
      (item.mataPelajaran && item.mataPelajaran.toLowerCase().includes(search.toLowerCase())) ||
      (item.jabatan && item.jabatan.toLowerCase().includes(search.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            Manajemen Guru & Tenaga Kependidikan
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Kelola data pendidik, mata pelajaran, dan status kepegawaian pada tiap sekolah
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
            Tambah Guru/Staf
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari guru, NIP, mapel, atau jabatan..."
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
        <div className="py-12 text-center text-slate-500 text-sm">Memuat data guru...</div>
      ) : filteredList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-800 text-base">Belum Ada Data Pendidik</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Silakan tambahkan data guru secara manual atau import berkas Excel daftar guru sekolah.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((item) => {
            const school = schools.find((s) => s.id === item.sekolahId);
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-start gap-3.5 mb-3">
                    <img
                      src={
                        item.fotoUrl ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                      }
                      alt={item.nama}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-100 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                        {item.statusKepegawaian || 'PNS'}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base mt-1 truncate">
                        {item.nama}
                        {item.gelar ? `, ${item.gelar}` : ''}
                      </h3>
                      <p className="text-xs text-indigo-600 font-medium truncate">
                        {item.jabatan || 'Guru'} {item.mataPelajaran ? `• ${item.mataPelajaran}` : ''}
                      </p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {school ? school.nama : 'Sekolah'}
                      </p>
                    </div>
                  </div>

                  {item.nip && (
                    <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg mb-2">
                      <span className="font-medium text-slate-600">NIP:</span> {item.nip}
                    </div>
                  )}
                  {item.email && (
                    <div className="text-xs text-slate-400 truncate">
                      {item.email}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 mt-3">
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
                {editingItem ? 'Edit Pendidik' : 'Tambah Pendidik / Guru'}
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
                  entityType="guru"
                  onExtracted={(extracted) => {
                    setFormData((prev) => ({
                      ...prev,
                      nama: extracted.nama || prev.nama,
                      nip: extracted.nip || prev.nip,
                      gelar: extracted.gelar || prev.gelar,
                      mataPelajaran: extracted.mapel || prev.mataPelajaran,
                      jabatan: extracted.jabatan || prev.jabatan,
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama *</label>
                  <input
                    type="text"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Nama Lengkap"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gelar</label>
                  <input
                    type="text"
                    value={formData.gelar}
                    onChange={(e) => setFormData({ ...formData, gelar: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="S.Pd, M.Pd"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">NIP</label>
                  <input
                    type="text"
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="1980..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jabatan</label>
                  <input
                    type="text"
                    value={formData.jabatan}
                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Guru Kelas / Wali Kelas"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mata Pelajaran
                  </label>
                  <input
                    type="text"
                    value={formData.mataPelajaran}
                    onChange={(e) => setFormData({ ...formData, mataPelajaran: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Matematika / Tematik"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.statusKepegawaian}
                    onChange={(e) => setFormData({ ...formData, statusKepegawaian: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="PNS">PNS</option>
                    <option value="PPPK">PPPK</option>
                    <option value="GTT / Honorer">GTT / Honorer</option>
                    <option value="Guru Tetap Yayasan">Guru Tetap Yayasan</option>
                  </select>
                </div>
              </div>

              <ImageUpload
                label="Foto Guru"
                value={formData.fotoUrl}
                onChange={(url) => setFormData({ ...formData, fotoUrl: url })}
                category="guru"
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="guru@sekolah.id"
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
          defaultEntityType="guru"
          schools={schools}
          onImportSuccess={() => {
            loadGuru();
            onNotify('success', 'Data Guru berhasil diimport');
          }}
        />
      )}
    </div>
  );
};
