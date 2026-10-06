import React, { useState, useEffect } from 'react';
import { Network, Plus, Edit2, Trash2, X, School, Users, Crown, Check, CheckCircle2, User } from 'lucide-react';
import { api } from '../../services/api';
import { School as SchoolType, StrukturOrganisasi, Guru } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ImageUpload } from '../../components/common/ImageUpload';
import { DocumentAutofillButton } from '../../components/common/DocumentAutofillButton';

interface AdminStrukturProps {
  onShowToast?: (msg: string, type: 'success' | 'error') => void;
  onNotify?: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const AdminStruktur: React.FC<AdminStrukturProps> = ({ onShowToast = () => {}, onNotify }) => {
  const triggerToast = (msg: string, type: 'success' | 'error' = 'success') => {
    onShowToast(msg, type);
    if (onNotify) onNotify(type, msg);
  };
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [members, setMembers] = useState<StrukturOrganisasi[]>([]);
  const [schoolTeachers, setSchoolTeachers] = useState<Guru[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const currentSchool = schools.find((s) => s.id === selectedSchoolId);

  const [form, setForm] = useState({
    nama: '',
    jabatan: '',
    bagian: '',
    foto: '',
    urutan: 1,
    keterangan: ''
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: ''
  });

  useEffect(() => {
    api.getSchools().then((data) => {
      setSchools(data);
      if (data.length > 0) setSelectedSchoolId(data[0].id);
    });
  }, []);

  const fetchMembers = () => {
    if (!selectedSchoolId) return;
    setLoading(true);
    api.getOrganization(selectedSchoolId)
      .then(setMembers)
      .catch(console.error)
      .finally(() => setLoading(false));

    // Also fetch teachers of this school for quick selection
    api.getTeachers({ sekolahId: selectedSchoolId, limit: 100 })
      .then((res) => setSchoolTeachers(res.data || []))
      .catch(() => setSchoolTeachers([]));
  };

  useEffect(() => {
    fetchMembers();
  }, [selectedSchoolId]);

  const handleOpenAdd = () => {
    setEditingId(null);
    // If it's the first member (Urutan 1), auto-fill with Kepala Sekolah if available
    const isFirstMember = members.length === 0;
    const defaultNama = isFirstMember && currentSchool?.kepalaSekolahNama ? currentSchool.kepalaSekolahNama : '';
    const defaultJabatan = isFirstMember ? 'Kepala Sekolah' : '';
    const defaultBagian = isFirstMember ? 'Pimpinan Satuan Pendidikan' : '';

    setForm({
      nama: defaultNama,
      jabatan: defaultJabatan,
      bagian: defaultBagian,
      foto: '',
      urutan: members.length + 1,
      keterangan: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: StrukturOrganisasi) => {
    setEditingId(m.id);
    setForm({
      nama: m.nama,
      jabatan: m.jabatan,
      bagian: m.bagian || '',
      foto: m.foto || '',
      urutan: m.urutan || 1,
      keterangan: m.keterangan || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama || !form.jabatan) {
      onShowToast('Nama dan Jabatan wajib diisi.', 'error');
      return;
    }
    try {
      if (editingId) {
        await api.updateOrganization(editingId, { ...form, sekolahId: selectedSchoolId });
        onShowToast('Data struktur organisasi diperbarui.', 'success');
      } else {
        await api.createOrganization({ ...form, sekolahId: selectedSchoolId });
        onShowToast('Anggota struktur baru ditambahkan.', 'success');
      }
      setIsModalOpen(false);
      fetchMembers();
    } catch (err: any) {
      onShowToast(err.message || 'Gagal menyimpan data.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await api.deleteOrganization(deleteConfirm.id);
      onShowToast('Data anggota struktur dihapus.', 'success');
      setDeleteConfirm({ isOpen: false, id: '', name: '' });
      fetchMembers();
    } catch (err: any) {
      onShowToast(err.message || 'Gagal menghapus data.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Struktur Organisasi Sekolah</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Atur bagan susunan pimpinan, komite, dan koordinator bidang tiap satuan pendidikan.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          disabled={!selectedSchoolId}
          className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Anggota Struktur</span>
        </button>
      </div>

      {/* Select School */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
        <div className="max-w-md w-full">
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Pilih Satuan Pendidikan:
          </label>
          <select
            value={selectedSchoolId}
            onChange={(e) => setSelectedSchoolId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
          >
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nama}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Connected School Info Summary Banner */}
      {currentSchool && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">{currentSchool.nama}</span>
              <span className="bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded text-[11px]">
                {currentSchool.jenjang} {currentSchool.status}
              </span>
            </div>
            <p className="text-slate-600 text-[11px]">
              NPSN: <span className="font-mono font-semibold">{currentSchool.npsn}</span> • {currentSchool.alamat}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white/90 px-3 py-1.5 rounded-xl border border-blue-200 text-[11px] text-slate-700">
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">Kepala Sekolah:</span>
              <span className="font-bold text-blue-900">{currentSchool.kepalaSekolahNama || 'Belum diisi'}</span>
            </div>
            <div className="bg-white/90 px-3 py-1.5 rounded-xl border border-blue-200 text-[11px] text-slate-700">
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">Dewan Guru:</span>
              <span className="font-bold text-blue-900">{schoolTeachers.length} Guru</span>
            </div>
          </div>
        </div>
      )}

      {/* List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="p-3.5">Urutan</th>
                <th className="p-3.5">Nama Pejabat</th>
                <th className="p-3.5">Jabatan Pokok</th>
                <th className="p-3.5">Bidang / Bagian</th>
                <th className="p-3.5">Keterangan</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    Memuat struktur organisasi...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500">
                    Belum ada bagan struktur untuk sekolah ini.
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold text-slate-400">{m.urutan}</td>
                    <td className="p-3.5 font-bold text-slate-900">{m.nama}</td>
                    <td className="p-3.5 text-blue-700 font-semibold">{m.jabatan}</td>
                    <td className="p-3.5 text-slate-600">{m.bagian || '-'}</td>
                    <td className="p-3.5 text-slate-500 text-xs">{m.keterangan || '-'}</td>
                    <td className="p-3.5 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(m)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ isOpen: true, id: m.id, name: m.nama })}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {editingId ? 'Edit Anggota Struktur' : 'Tambah Anggota Struktur'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-800">Isi Otomatis dari Dokumen</p>
                  <p className="text-[10px] text-slate-500">Unggah berkas Word, Excel, atau PDF struktur organisasi</p>
                </div>
                <DocumentAutofillButton
                  entityType="umum"
                  label="Unggah File"
                  onExtracted={(data) => {
                    setForm((prev) => ({
                      ...prev,
                      nama: data.nama || prev.nama,
                      jabatan: data.jabatan || prev.jabatan,
                      keterangan: data.keterangan || data.rawText?.slice(0, 200) || prev.keterangan
                    }));
                    onShowToast('Informasi anggota berhasil diekstrak dari dokumen', 'success');
                  }}
                />
              </div>

              {/* Quick Auto-fill from Connected School Data */}
              {(currentSchool?.kepalaSekolahNama || schoolTeachers.length > 0) && (
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-900 flex items-center space-x-1">
                      <Crown className="w-3.5 h-3.5 text-amber-500" />
                      <span>Pilih Otomatis dari Tenaga Satuan Pendidikan:</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full">
                      Tanpa Ketik Ulang
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {currentSchool?.kepalaSekolahNama && (
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            nama: currentSchool.kepalaSekolahNama || '',
                            jabatan: 'Kepala Sekolah',
                            bagian: 'Pimpinan Satuan Pendidikan'
                          }))
                        }
                        className="inline-flex items-center space-x-1 bg-white hover:bg-emerald-100/60 text-emerald-900 border border-emerald-300 px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                      >
                        <Crown className="w-3 h-3 text-amber-500" />
                        <span>Isi Kepala Sekolah ({currentSchool.kepalaSekolahNama})</span>
                      </button>
                    )}
                    {schoolTeachers.length > 0 && (
                      <select
                        onChange={(e) => {
                          const t = schoolTeachers.find((tch) => tch.id === e.target.value);
                          if (t) {
                            setForm((prev) => ({
                              ...prev,
                              nama: t.nama,
                              jabatan: t.jabatan || 'Guru Kelas / Koordinator',
                              foto: t.foto || prev.foto
                            }));
                          }
                        }}
                        defaultValue=""
                        className="bg-white border border-emerald-300 text-emerald-900 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                      >
                        <option value="" disabled>
                          -- Pilih dari Dewan Guru ({schoolTeachers.length} orang) --
                        </option>
                        {schoolTeachers.map((tch) => (
                          <option key={tch.id} value={tch.id}>
                            {tch.nama} ({tch.jabatan || 'Guru'})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  placeholder="Nama pejabat"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Jabatan</label>
                  <input
                    type="text"
                    required
                    value={form.jabatan}
                    onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
                    placeholder="Kepala Sekolah / Wakil"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nomor Urut</label>
                  <input
                    type="number"
                    value={form.urutan}
                    onChange={(e) => setForm({ ...form, urutan: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Bidang / Bagian</label>
                <input
                  type="text"
                  value={form.bagian}
                  onChange={(e) => setForm({ ...form, bagian: e.target.value })}
                  placeholder="Bidang Kurikulum / Kesiswaan / Komite"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tugas / Keterangan Singkat</label>
                <input
                  type="text"
                  value={form.keterangan}
                  onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                  placeholder="Deskripsi peran dalam sekolah"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-200/80">
                <ImageUpload
                  label="Foto Personil / Pengurus"
                  value={form.foto}
                  onChange={(url) => setForm({ ...form, foto: url })}
                  helperText="Unggah foto pengurus struktur (format JPG, JPEG, atau PNG, maks 10MB)"
                  aspectRatio="square"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Konfirmasi Hapus"
        message={`Hapus data "${deleteConfirm.name}" dari struktur organisasi?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: '', name: '' })}
      />
    </div>
  );
};
