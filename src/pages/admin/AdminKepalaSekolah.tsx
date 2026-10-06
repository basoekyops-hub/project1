import React, { useState, useEffect } from 'react';
import { Crown, Plus, Edit2, Trash2, X, School, Search, CheckCircle2, User, FileSpreadsheet, AlertTriangle, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import { School as SchoolType, KepalaSekolah } from '../../types';
import { ImageUpload } from '../../components/common/ImageUpload';
import { DocumentImportModal } from '../../components/common/DocumentImportModal';
import { DocumentAutofillButton } from '../../components/common/DocumentAutofillButton';

interface AdminKepalaSekolahProps {
  onNotify: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const AdminKepalaSekolah: React.FC<AdminKepalaSekolahProps> = ({ onNotify }) => {
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [kepalaSekolahList, setKepalaSekolahList] = useState<KepalaSekolah[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KepalaSekolah | null>(null);

  const [formData, setFormData] = useState({
    sekolahId: '',
    nama: '',
    gelar: '',
    nip: '',
    periode: '',
    status: 'aktif',
    fotoUrl: '',
    sambutan: '',
    riwayatPendidikan: '',
    pesanInspiratif: '',
  });

  useEffect(() => {
    loadSchools();
  }, []);

  useEffect(() => {
    loadKepalaSekolah();
  }, [selectedSchoolId]);

  const loadSchools = async () => {
    try {
      const data = await api.getSchools();
      setSchools(data);
    } catch {
      onNotify('error', 'Gagal memuat daftar sekolah');
    }
  };

  const loadKepalaSekolah = async () => {
    try {
      setIsLoading(true);
      const data = await api.getKepalaSekolah(selectedSchoolId ? { sekolahId: selectedSchoolId } : undefined);
      setKepalaSekolahList(data);
    } catch {
      onNotify('error', 'Gagal memuat data kepala sekolah');
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
      periode: `${new Date().getFullYear()} - Sekarang`,
      status: 'aktif',
      fotoUrl: '',
      sambutan: '',
      riwayatPendidikan: '',
      pesanInspiratif: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: KepalaSekolah) => {
    setEditingItem(item);
    setFormData({
      sekolahId: item.sekolahId,
      nama: item.nama,
      gelar: item.gelar || '',
      nip: item.nip || '',
      periode: item.periode || '',
      status: item.status || 'aktif',
      fotoUrl: item.fotoUrl || item.foto || '',
      sambutan: item.sambutan || '',
      riwayatPendidikan: item.riwayatPendidikan || '',
      pesanInspiratif: item.pesanInspiratif || '',
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
      const payload = {
        ...formData,
        foto: formData.fotoUrl,
        fotoUrl: formData.fotoUrl
      };
      if (editingItem) {
        await api.updateKepalaSekolah(editingItem.id, payload);
        onNotify('success', 'Data Kepala Sekolah berhasil diperbarui');
      } else {
        await api.createKepalaSekolah(payload);
        onNotify('success', 'Data Kepala Sekolah berhasil ditambahkan');
      }
      setIsModalOpen(false);
      loadKepalaSekolah();
    } catch {
      onNotify('error', 'Gagal menyimpan data Kepala Sekolah');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus data Kepala Sekolah ini?')) return;
    try {
      await api.deleteKepalaSekolah(id);
      onNotify('success', 'Data Kepala Sekolah berhasil dihapus');
      loadKepalaSekolah();
    } catch {
      onNotify('error', 'Gagal menghapus data Kepala Sekolah');
    }
  };

  const filteredList = kepalaSekolahList.filter((item) => {
    const matchesSearch =
      item.nama.toLowerCase().includes(search.toLowerCase()) ||
      (item.nip && item.nip.includes(search)) ||
      (item.periode && item.periode.toLowerCase().includes(search.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-500" />
            Manajemen Kepala Sekolah
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Kelola data Kepala Sekolah, riwayat kepemimpinan, dan sambutan di sekolah binaan
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
            Tambah Kepala Sekolah
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, NIP, atau periode..."
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
        <div className="py-12 text-center text-slate-500 text-sm">Memuat data kepala sekolah...</div>
      ) : filteredList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <Crown className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-800 text-base">Belum Ada Data Kepala Sekolah</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Silakan tambahkan data Kepala Sekolah secara manual atau import berkas Excel/dokumen.
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
                  <div className="flex items-start gap-3.5 mb-4">
                    <img
                      src={
                        item.fotoUrl ||
                        item.foto ||
                        'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80'
                      }
                      alt={item.nama}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 bg-slate-100 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.status === 'aktif'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.status === 'aktif' ? 'Kepsek Aktif' : 'Mantan Kepsek'}
                        </span>
                        {item.periode && (
                          <span className="text-[10px] text-slate-400 font-medium">{item.periode}</span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 text-base mt-1 truncate">
                        {item.nama}
                        {item.gelar ? `, ${item.gelar}` : ''}
                      </h3>
                      <p className="text-xs text-slate-500 truncate">
                        {school ? school.nama : 'Sekolah tidak terdata'}
                      </p>
                    </div>
                  </div>

                  {item.nip && (
                    <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg mb-3">
                      <span className="font-medium text-slate-700">NIP:</span> {item.nip}
                    </div>
                  )}

                  {item.pesanInspiratif && (
                    <p className="text-xs text-slate-600 italic line-clamp-2 mb-3">
                      "{item.pesanInspiratif}"
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
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

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">
                {editingItem ? 'Edit Kepala Sekolah' : 'Tambah Kepala Sekolah'}
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
                  entityType="kepalaSekolah"
                  onExtracted={(extracted) => {
                    setFormData((prev) => ({
                      ...prev,
                      nama: extracted.nama || prev.nama,
                      nip: extracted.nip || prev.nip,
                      gelar: extracted.gelar || prev.gelar,
                      sambutan: extracted.isi || prev.sambutan,
                    }));
                    onNotify('info', 'Data berhasil diekstrak dari dokumen');
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sekolah Binaan *
                </label>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Contoh: Dra. Hj. Siti Aminah"
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
                    placeholder="Contoh: M.Pd"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">NIP</label>
                  <input
                    type="text"
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="197508..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Periode</label>
                  <input
                    type="text"
                    value={formData.periode}
                    onChange={(e) => setFormData({ ...formData, periode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="2020 - Sekarang"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="aktif">Aktif Menjabat</option>
                    <option value="mantan">Mantan Kepala Sekolah</option>
                  </select>
                </div>
              </div>

              <ImageUpload
                label="Foto Kepala Sekolah"
                value={formData.fotoUrl}
                onChange={(url) => setFormData({ ...formData, fotoUrl: url })}
                category="kepala-sekolah"
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pesan Inspiratif / Motto
                </label>
                <input
                  type="text"
                  value={formData.pesanInspiratif}
                  onChange={(e) => setFormData({ ...formData, pesanInspiratif: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Mendidik dengan hati, menginspirasi dengan karya"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sambutan Kepala Sekolah
                </label>
                <textarea
                  rows={4}
                  value={formData.sambutan}
                  onChange={(e) => setFormData({ ...formData, sambutan: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Kata sambutan kepala sekolah untuk portal informasi..."
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
                  {editingItem ? 'Simpan Perubahan' : 'Tambahkan'}
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
          defaultEntityType="kepalaSekolah"
          schools={schools}
          onImportSuccess={() => {
            loadKepalaSekolah();
            onNotify('success', 'Data Kepala Sekolah berhasil diimport');
          }}
        />
      )}
    </div>
  );
};
