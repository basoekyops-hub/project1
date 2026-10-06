import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Eye,
  Mail,
  Phone,
  Clock,
  Send,
  RefreshCw,
  X,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';

interface KontakItem {
  id: string;
  nama: string;
  email: string;
  telepon?: string;
  subjek: string;
  pesan: string;
  status: string; // 'Baru' | 'Dibaca' | 'Dibalas'
  createdAt: string;
  updatedAt?: string;
}

interface AdminKontakProps {
  onNotify?: (type: 'success' | 'error' | 'info', message: string) => void;
  onShowToast?: (msg: string, type: 'success' | 'error') => void;
}

export const AdminKontak: React.FC<AdminKontakProps> = ({ onNotify, onShowToast }) => {
  const [messages, setMessages] = useState<KontakItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'SEMUA' | 'Baru' | 'Dibaca' | 'Dibalas'>('SEMUA');
  const [selectedMessage, setSelectedMessage] = useState<KontakItem | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<KontakItem | null>(null);

  const triggerToast = (msg: string, type: 'success' | 'error' = 'success') => {
    if (onNotify) onNotify(type, msg);
    if (onShowToast) onShowToast(msg, type);
  };

  const fetchMessages = async () => {
    try {
      const data = await api.getContacts();
      setMessages(data || []);
    } catch (err: any) {
      console.error('Failed to load contacts:', err);
      triggerToast('Gagal memuat pesan masuk.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMessages();
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await api.updateContactStatus(id, newStatus);
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
      );
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage((prev) => prev ? { ...prev, status: newStatus } : null);
      }
      triggerToast(`Status pesan berhasil diubah menjadi "${newStatus}".`, 'success');
    } catch {
      triggerToast('Gagal mengubah status pesan.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await api.deleteContact(deleteCandidate.id);
      setMessages((prev) => prev.filter((m) => m.id !== deleteCandidate.id));
      if (selectedMessage && selectedMessage.id === deleteCandidate.id) {
        setSelectedMessage(null);
      }
      setDeleteCandidate(null);
      triggerToast('Pesan berhasil dihapus.', 'success');
    } catch {
      triggerToast('Gagal menghapus pesan.', 'error');
    }
  };

  const handleOpenDetail = (msg: KontakItem) => {
    setSelectedMessage(msg);
    // Auto mark as Dibaca if currently Baru
    if (msg.status === 'Baru') {
      handleUpdateStatus(msg.id, 'Dibaca');
    }
  };

  const filteredMessages = messages.filter((m) => {
    const matchesSearch =
      m.nama.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.subjek.toLowerCase().includes(search.toLowerCase()) ||
      m.pesan.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'SEMUA' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const countBaru = messages.filter((m) => m.status === 'Baru').length;
  const countDibaca = messages.filter((m) => m.status === 'Dibaca').length;
  const countDibalas = messages.filter((m) => m.status === 'Dibalas').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              Pesan Masuk & Aspirasi Publik
            </h2>
            {countBaru > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 animate-pulse">
                {countBaru} Baru
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Daftar pesan, pertanyaan, dan konsultasi dari masyarakat, kepala sekolah, atau dewan guru melalui portal publik.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Memperbarui...' : 'Segarkan Data'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari pengirim, email, atau isi pesan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setStatusFilter('SEMUA')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
              statusFilter === 'SEMUA'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({messages.length})
          </button>
          <button
            onClick={() => setStatusFilter('Baru')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 flex items-center space-x-1.5 ${
              statusFilter === 'Baru'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Baru ({countBaru})</span>
          </button>
          <button
            onClick={() => setStatusFilter('Dibaca')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 flex items-center space-x-1.5 ${
              statusFilter === 'Dibaca'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>Dibaca ({countDibaca})</span>
          </button>
          <button
            onClick={() => setStatusFilter('Dibalas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 flex items-center space-x-1.5 ${
              statusFilter === 'Dibalas'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Dibalas ({countDibalas})</span>
          </button>
        </div>
      </div>

      {/* Messages List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="text-center py-20 text-slate-400">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-medium">Memuat pesan masuk...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Tidak ada pesan</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {search || statusFilter !== 'SEMUA'
                ? 'Tidak ada pesan yang cocok dengan kriteria pencarian atau filter status.'
                : 'Belum ada pesan atau pertanyaan masuk dari pengunjung portal.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors hover:bg-slate-50/80 cursor-pointer ${
                  msg.status === 'Baru' ? 'bg-blue-50/30 font-medium' : ''
                }`}
                onClick={() => handleOpenDetail(msg)}
              >
                <div className="flex items-start space-x-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      msg.status === 'Baru'
                        ? 'bg-rose-100 text-rose-700'
                        : msg.status === 'Dibalas'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900 truncate">
                        {msg.nama}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          msg.status === 'Baru'
                            ? 'bg-rose-100 text-rose-700'
                            : msg.status === 'Dibalas'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {msg.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 font-semibold truncate mt-0.5">
                      {msg.subjek}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {msg.pesan}
                    </p>
                    <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-1.5">
                      <span>{msg.email}</span>
                      {msg.telepon && <span>• {msg.telepon}</span>}
                      <span>• {new Date(msg.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-center shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleOpenDetail(msg)}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Buka detail pesan"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteCandidate(msg)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Hapus pesan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Message Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-block mb-1.5 ${
                    selectedMessage.status === 'Baru'
                      ? 'bg-rose-100 text-rose-700'
                      : selectedMessage.status === 'Dibalas'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Status: {selectedMessage.status}
                </span>
                <h3 className="font-extrabold text-base text-slate-900">
                  {selectedMessage.subjek}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Pengirim:</span>
                <span className="font-bold text-slate-800">{selectedMessage.nama}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subjek)}`}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  {selectedMessage.email}
                </a>
              </div>
              {selectedMessage.telepon && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Telepon / WhatsApp:</span>
                  <a
                    href={`https://wa.me/${selectedMessage.telepon.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-emerald-600 hover:underline"
                  >
                    {selectedMessage.telepon}
                  </a>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Waktu Dikirim:</span>
                <span className="text-slate-700">
                  {new Date(selectedMessage.createdAt).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Isi Pesan / Pertanyaan
              </label>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                {selectedMessage.pesan}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <span className="text-xs text-slate-500">Tandai:</span>
                <button
                  onClick={() => handleUpdateStatus(selectedMessage.id, 'Dibaca')}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${
                    selectedMessage.status === 'Dibaca'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  Dibaca
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedMessage.id, 'Dibalas')}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${
                    selectedMessage.status === 'Dibalas'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  Dibalas
                </button>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                {selectedMessage.telepon && (
                  <a
                    href={`https://wa.me/${selectedMessage.telepon.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Halo ${selectedMessage.nama}, terima kasih telah menghubungi Portal Pengawas Sekolah perihal "${selectedMessage.subjek}".`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Balas WA</span>
                  </a>
                )}
                <a
                  href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(
                    `Balasan Pengawas: ${selectedMessage.subjek}`
                  )}&body=${encodeURIComponent(
                    `Halo ${selectedMessage.nama},\n\nTerima kasih telah menghubungi Portal Pengawas Sekolah.\n\nMenanggapi pesan Anda perihal:\n"${selectedMessage.pesan}"\n\n`
                  )}`}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl transition"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Balas Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-base text-slate-900">Hapus Pesan Kontak?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Pesan dari <span className="font-semibold text-slate-700">{deleteCandidate.nama}</span> akan dihapus secara permanen dari database.
              </p>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs transition"
              >
                Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
