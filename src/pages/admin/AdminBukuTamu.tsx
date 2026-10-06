import React, { useState, useEffect } from 'react';
import { BookMarked, Search, Trash2, Calendar, User, Clock, Building2, Briefcase, RefreshCw, MessageSquare } from 'lucide-react';
import { api } from '../../services/api';
import { BukuTamu } from '../../types';

interface AdminBukuTamuProps {
  onNotify: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const AdminBukuTamu: React.FC<AdminBukuTamuProps> = ({ onNotify }) => {
  const [bukuTamuList, setBukuTamuList] = useState<BukuTamu[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBukuTamu();
  }, []);

  const loadBukuTamu = async () => {
    try {
      setIsLoading(true);
      const data = await api.getBukuTamu();
      setBukuTamuList(data);
    } catch {
      onNotify('error', 'Gagal memuat daftar buku tamu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus entri buku tamu ini?')) return;
    try {
      await api.deleteBukuTamu(id);
      onNotify('success', 'Catatan buku tamu berhasil dihapus');
      loadBukuTamu();
    } catch {
      onNotify('error', 'Gagal menghapus entri');
    }
  };

  const filteredList = bukuTamuList.filter((item) => {
    const keperluan = item.keperluan || item.masukan || '';
    const pesan = item.pesan || item.masukan || '';
    return (
      item.nama.toLowerCase().includes(search.toLowerCase()) ||
      item.instansi.toLowerCase().includes(search.toLowerCase()) ||
      keperluan.toLowerCase().includes(search.toLowerCase()) ||
      pesan.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookMarked className="w-6 h-6 text-indigo-600" />
            Buku Tamu Digital & Presensi Kunjungan
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Data pengunjung, konsultasi pengawas, serta kunjungan dinas satuan pendidikan
          </p>
        </div>
        <button
          onClick={loadBukuTamu}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm flex items-center gap-2 transition self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Segarkan Data
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Cari berdasarkan nama tamu, instansi, atau keperluan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-slate-500 text-sm">Memuat catatan buku tamu...</div>
      ) : filteredList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <BookMarked className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-800 text-base">Belum Ada Catatan Buku Tamu</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Setiap tamu atau warga sekolah yang mengisi formulir Buku Tamu di portal akan tercatat di sini.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Waktu</th>
                  <th className="px-6 py-4">Nama Tamu & Jabatan</th>
                  <th className="px-6 py-4">Instansi / Asal</th>
                  <th className="px-6 py-4">Kontak</th>
                  <th className="px-6 py-4">Keperluan & Pesan</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 font-medium text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(item.tanggal || item.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(item.tanggal || item.createdAt).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{item.nama}</div>
                      <div className="text-xs text-slate-500">{item.jabatan || 'Pengunjung'}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {item.instansi}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {item.telepon && <div className="text-slate-700">{item.telepon}</div>}
                      {item.email && <div className="text-slate-400">{item.email}</div>}
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 mb-1">
                        {item.keperluan || item.masukan || 'Konsultasi'}
                      </span>
                      {(item.pesan || item.masukan) && (
                        <p className="text-xs text-slate-500 line-clamp-2 italic">
                          "{item.pesan || item.masukan}"
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Hapus entri"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
