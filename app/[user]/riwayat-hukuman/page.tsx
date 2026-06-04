"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Gift, Clock, CheckCircle2, Hourglass, Loader2 } from 'lucide-react';
import { supabase } from '../../../utils/supabase';

export default function PunishmentHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const user = params.user as string;

  if (user !== 'ridwan' && user !== 'anna') {
    return <div className="p-8 text-center">Profil tidak ditemukan.</div>;
  }

  const isRidwan = user === 'ridwan';
  
  const theme = {
    bg: isRidwan ? 'bg-blue-50' : 'bg-pink-50',
    card: 'bg-white',
    border: isRidwan ? 'border-blue-200' : 'border-pink-200',
    text: isRidwan ? 'text-blue-700' : 'text-pink-700',
    accent: isRidwan ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700',
    name: isRidwan ? 'Ridwan' : 'Anna',
  };

  const [punishments, setPunishments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPunishmentHistory();
  }, [user]);

  const fetchPunishmentHistory = async () => {
    setIsLoading(true);
    const CapitalizedName = isRidwan ? 'Ridwan' : 'Anna';
    
    const { data: profile } = await supabase.from('profiles').select('id').eq('name', CapitalizedName).single();

    if (profile) {
      // Ambil data hukuman yang berstatus 'done'
      const { data: history } = await supabase
        .from('gacha_history')
        .select('*')
        .eq('profile_id', profile.id)
        .eq('status', 'done')
        .order('completed_at', { ascending: false });

      if (history) setPunishments(history);
    }
    setIsLoading(false);
  };

  // Fungsi Kalkulator Durasi
  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return "Waktu tidak valid";
    
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const diffMs = endTime - startTime;
    
    const diffMins = Math.floor(diffMs / 60000);
    const days = Math.floor(diffMins / 1440);
    const hours = Math.floor((diffMins % 1440) / 60);
    const mins = diffMins % 60;

    if (days > 0) return `${days} Hari, ${hours} Jam`;
    if (hours > 0) return `${hours} Jam, ${mins} Menit`;
    if (mins === 0) return `Kurang dari 1 Menit`;
    return `${mins} Menit`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }) + ' WIB';
  };

  return (
    <main className={`min-h-screen ${theme.bg} p-6 md:p-12 font-sans pb-20`}>
      <div className="max-w-md mx-auto flex items-center justify-between mb-8">
        <button onClick={() => router.back()} className="p-2 bg-white/60 rounded-full shadow-sm hover:scale-105 transition-transform">
          <ArrowLeft className="text-slate-600" />
        </button>
        <div className={`px-4 py-1.5 rounded-full bg-white/80 shadow-sm font-bold flex items-center gap-2 ${theme.text}`}>
          <Gift size={18} />
          Riwayat Hukuman
        </div>
      </div>

      <div className="max-w-md mx-auto flex flex-col gap-6">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-10 text-slate-500">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p className="font-medium">Memuat data...</p>
          </div>
        )}

        {!isLoading && punishments.length === 0 && (
          <div className="text-center py-10 bg-white/50 rounded-[2rem] border-2 border-dashed border-slate-300 text-slate-500">
            <p className="font-medium">Belum ada hukuman yang diselesaikan.</p>
          </div>
        )}

        {!isLoading && punishments.map((item, index) => (
          <motion.div 
            key={item.id}
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: index * 0.1 }}
            className={`p-5 rounded-3xl border-2 ${theme.border} ${theme.card} shadow-sm relative`}
          >
            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-100">
              <div className={`p-2 rounded-full bg-green-100 text-green-600`}>
                <CheckCircle2 size={24} />
              </div>
              <h3 className="font-extrabold text-slate-700 leading-tight">
                {item.penalty_result}
              </h3>
            </div>

            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl">
                <span className="flex items-center gap-2 text-slate-500 font-medium">
                  <Gift size={14} /> Didapat Tgl
                </span>
                <span className="font-bold text-slate-700">{formatDate(item.created_at)}</span>
              </div>
              
              <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl">
                <span className="flex items-center gap-2 text-slate-500 font-medium">
                  <CheckCircle2 size={14} /> Selesai Tgl
                </span>
                <span className="font-bold text-green-600">{formatDate(item.completed_at)}</span>
              </div>

              <div className={`flex items-center justify-between p-2 rounded-xl ${theme.accent} bg-opacity-50 mt-1 border border-dashed ${theme.border}`}>
                <span className="flex items-center gap-2 font-bold">
                  <Hourglass size={14} /> Durasi Penundaan
                </span>
                <span className="font-extrabold">
                  {calculateDuration(item.created_at, item.completed_at)}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
