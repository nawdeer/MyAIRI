"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Utensils,
  Moon,
  BookOpen,
  Droplets,
  HeartHandshake,
  Loader2,
} from "lucide-react";
import { supabase } from "../../../utils/supabase";

export default function HistoryPage() {
  const params = useParams();
  const router = useRouter();
  const user = params.user as string;

  if (user !== "ridwan" && user !== "anna") {
    return <div className="p-8 text-center">Profil tidak ditemukan.</div>;
  }

  const isRidwan = user === "ridwan";

  const theme = {
    bg: isRidwan ? "bg-blue-50" : "bg-pink-50",
    card: "bg-white",
    border: isRidwan ? "border-blue-200" : "border-pink-200",
    text: isRidwan ? "text-blue-700" : "text-pink-700",
    accent: isRidwan
      ? "bg-blue-100 text-blue-700"
      : "bg-pink-100 text-pink-700",
    name: isRidwan ? "Ridwan" : "Anna",
  };

  // State untuk menyimpan data yang ditarik dari Supabase
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    setIsLoading(true);
    const CapitalizedName = isRidwan ? "Ridwan" : "Anna";

    // 1. Ambil ID Profil
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("name", CapitalizedName)
      .single();

    if (profile) {
      // 2. Ambil semua riwayat presensi berdasarkan ID, urutkan dari yang terbaru
      const { data: logs } = await supabase
        .from("daily_presence")
        .select("*")
        .eq("profile_id", profile.id)
        .order("date_only", { ascending: false })
        .order("logged_at", { ascending: false });

      if (logs) {
        // 3. Logika Pengelompokan (Grouping) data berdasarkan tanggal
        const groupedData = logs.reduce((acc: any, log) => {
          const date = log.date_only; // Contoh: '2026-06-04'

          if (!acc[date]) {
            // Ubah format tanggal menjadi bahasa Indonesia
            const dateObj = new Date(date);
            const dateStr = dateObj.toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            });

            // Siapkan template kosong untuk hari tersebut
            acc[date] = {
              date: dateStr,
              logs: {
                hadir: null,
                makan: null,
                tidur: null,
                belajar: null,
                mandi: null,
              },
            };
          }

          // Isi jam presensi ke dalam kategori yang tepat
          const timeString = new Date(log.logged_at).toLocaleTimeString(
            "id-ID",
            {
              hour: "2-digit",
              minute: "2-digit",
            },
          );
          acc[date].logs[log.activity_type] = `${timeString} WIB`;

          return acc;
        }, {});

        // Ubah dari format Object ke Array agar bisa di-map di UI
        setHistoryData(Object.values(groupedData));
      }
    }
    setIsLoading(false);
  };

  const activities = [
    { id: "hadir", label: "Kehadiran", icon: <HeartHandshake size={16} /> },
    { id: "makan", label: "Makan", icon: <Utensils size={16} /> },
    { id: "tidur", label: "Tidur", icon: <Moon size={16} /> },
    { id: "belajar", label: "Belajar", icon: <BookOpen size={16} /> },
    { id: "mandi", label: "Mandi", icon: <Droplets size={16} /> },
  ] as const;

  return (
    <main className={`min-h-screen ${theme.bg} p-6 md:p-12 font-sans pb-20`}>
      <div className="max-w-md mx-auto flex items-center justify-between mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 bg-white/60 rounded-full shadow-sm hover:scale-105 transition-transform"
        >
          <ArrowLeft className="text-slate-600" />
        </button>
        <div
          className={`px-4 py-1.5 rounded-full bg-white/80 shadow-sm font-bold flex items-center gap-2 ${theme.text}`}
        >
          <CalendarDays size={18} />
          Riwayat {theme.name}
        </div>
      </div>

      <div className="max-w-md mx-auto flex flex-col gap-6">
        {/* Tampilan saat data sedang ditarik dari database */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-10 text-slate-500">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p className="font-medium">Memuat riwayat...</p>
          </div>
        )}

        {/* Tampilan jika belum ada data sama sekali */}
        {!isLoading && historyData.length === 0 && (
          <div className="text-center py-10 bg-white/50 rounded-[2rem] border-2 border-dashed border-slate-300 text-slate-500">
            <p className="font-medium">
              Belum ada riwayat presensi yang tercatat.
            </p>
          </div>
        )}

        {/* Tampilan Riwayat Asli */}
        {!isLoading &&
          historyData.map((day, index) => {
            const missedCount = Object.values(day.logs).filter(
              (time) => time === null,
            ).length;

            return (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`p-5 rounded-3xl border-2 ${theme.border} ${theme.card} shadow-sm relative`}
              >
                <div className="flex justify-between items-center mb-4 border-b pb-3 border-slate-100">
                  <span className="font-extrabold text-slate-700">
                    {day.date}
                  </span>
                  {missedCount > 0 ? (
                    <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-1 rounded-full">
                      +{missedCount} Poin Hukuman
                    </span>
                  ) : (
                    <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Sempurna ✨
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  {activities.map((act) => {
                    const timeLogged =
                      day.logs[act.id as keyof typeof day.logs];
                    const isMissed = timeLogged === null;

                    return (
                      <div
                        key={act.id}
                        className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-full ${isMissed ? "bg-red-100 text-red-500" : theme.accent}`}
                          >
                            {act.icon}
                          </div>
                          <span
                            className={`font-semibold ${isMissed ? "text-slate-400 line-through" : "text-slate-700"}`}
                          >
                            {act.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isMissed ? (
                            <>
                              <span className="text-xs font-bold text-red-500">
                                Terlewat
                              </span>
                              <XCircle size={18} className="text-red-500" />
                            </>
                          ) : (
                            <>
                              <span className="text-xs font-bold text-slate-600">
                                {timeLogged as string}
                              </span>
                              <CheckCircle2
                                size={18}
                                className="text-green-500"
                              />
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
      </div>
    </main>
  );
}
