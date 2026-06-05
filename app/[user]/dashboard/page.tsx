"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Utensils,
  Moon,
  BookOpen,
  Droplets,
  HeartHandshake,
  AlertCircle,
  ArrowLeft,
  Clock,
  CalendarDays,
  Dices,
  Gift,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "../../../utils/supabase";

const WHEEL_ITEMS = [
  {
    id: 0,
    short: "Minuman 🧋",
    full: "Traktir Minuman Favorit 🧋 (Matcha/Kopi)",
  },
  {
    id: 1,
    short: "Masakin 🍳",
    full: "Masakin Makanan 🍳 (Indomie Jumbo juga boleh!)",
  },
  {
    id: 2,
    short: "Top-Up 🎮",
    full: "Top-Up In-Game 🎮 (Genshin/Valorant/PGR)",
  },
  {
    id: 3,
    short: "Makanan 🥐",
    full: "Traktir Makanan Favorit 🥐 (Roti/Camilan)",
  },
  { id: 4, short: "Nurut 👑", full: "Nurut 1 Permintaan 👑 (Tanpa protes!)" },
  { id: 5, short: "ToD 🎭", full: "Truth or Dare 🎭" },
  {
    id: 6,
    short: "Nobar 🎬",
    full: "Nobar Tanpa Protes 🎬 (Anime/Film pilihan pasangan)",
  },
  {
    id: 7,
    short: "Foto Aib 📸",
    full: "Foto Aib 📸 (Pakai filter konyol & jadikan PP)",
  },
  {
    id: 8,
    short: "VN Request 🎙️",
    full: "Voice Note Sesuai Request 🎙️ (Gombal/Nyanyi)",
  },
  {
    id: 9,
    short: "Rambutan 👁️",
    full: "Menatap Foto Rambutan / Jarum 👁️💧 (10 menit non-stop!)",
  },
  {
    id: 10,
    short: "Nggak Jadi 🃏",
    full: "Nggak Jadi 🃏 (Kupon Sakti)",
  },
];

const WHEEL_COLORS = ["#EF4444", "#3B82F6", "#10B981", "#F59E0B"];
const SEGMENT_ANGLE = 360 / WHEEL_ITEMS.length;

const conicString = WHEEL_ITEMS.map((_, i) => {
  const start = i * SEGMENT_ANGLE;
  const end = (i + 1) * SEGMENT_ANGLE;
  return `${WHEEL_COLORS[i % WHEEL_COLORS.length]} ${start}deg ${end}deg`;
}).join(", ");

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const user = params.user as string;

  if (user !== "ridwan" && user !== "anna") {
    return <div className="p-8 text-center">Profil tidak ditemukan.</div>;
  }

  const isRidwan = user === "ridwan";

  const theme = {
    bg: isRidwan ? "bg-blue-50" : "bg-pink-50",
    card: isRidwan ? "bg-blue-100" : "bg-pink-100",
    border: isRidwan ? "border-blue-300" : "border-pink-300",
    text: isRidwan ? "text-blue-700" : "text-pink-700",
    iconBg: isRidwan
      ? "bg-blue-200 text-blue-600"
      : "bg-pink-200 text-pink-600",
    activeBtn: isRidwan ? "bg-blue-500 text-white" : "bg-pink-500 text-white",
    inactiveBtn: isRidwan
      ? "bg-white text-slate-500 hover:bg-blue-50"
      : "bg-white text-slate-500 hover:bg-pink-50",
    name: isRidwan ? "Ridwan" : "Anna",
    avatar: isRidwan ? "👦🏻" : "👧🏻",
    gachaBtn: isRidwan
      ? "bg-blue-600 hover:bg-blue-700"
      : "bg-pink-600 hover:bg-pink-700",
  };

  const [presence, setPresence] = useState<any>({
    hadir: null,
    makan: null,
    tidur: null,
    belajar: null,
    mandi: null,
  });

  const [currentDate, setCurrentDate] = useState("");
  const [penaltyPoints, setPenaltyPoints] = useState(0);
  const [profileId, setProfileId] = useState<string | null>(null);

  const [activePunishments, setActivePunishments] = useState<
    { id: string; text: string }[]
  >([]);

  const [showGacha, setShowGacha] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [gachaResult, setGachaResult] = useState<string | null>(null);
  const [wheelRotation, setWheelRotation] = useState(0);

  // Mengambil tanggal hari ini format WIB (YYYY-MM-DD)
  const getWIBDateString = () => {
    const now = new Date();
    const wibTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    return wibTime.toISOString().split("T")[0];
  };

  useEffect(() => {
    const today = new Date();
    setCurrentDate(
      today.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    );
    fetchProfileAndData();
  }, [user]);

  const fetchProfileAndData = async () => {
    const CapitalizedName = isRidwan ? "Ridwan" : "Anna";
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("name", CapitalizedName)
      .single();

    if (profileData) {
      setProfileId(profileData.id);

      const todayString = getWIBDateString();
      let currentPoints = profileData.penalty_points;
      let dbLastCheck = profileData.last_check_date;

      // --- KOREKSI SISTEM PENGHITUNG HUKUMAN OTOMATIS ---
      if (!dbLastCheck) {
        // Jika user baru pertama kali terdaftar, tandai hari ini sebagai awal pengecekan
        await supabase
          .from("profiles")
          .update({ last_check_date: todayString })
          .eq("id", profileData.id);
      } else if (dbLastCheck !== todayString) {
        // Jika hari berganti (misal terakhir cek 4 Juni, dan hari ini sudah 5 Juni)
        const datesToCheck = [];
        let loopDateStr = dbLastCheck;

        // Loop mengumpulkan semua tanggal yang perlu dievaluasi (termasuk kemarin)
        while (loopDateStr !== todayString) {
          datesToCheck.push(loopDateStr);

          // Maju 1 hari secara aman
          const d = new Date(loopDateStr);
          d.setDate(d.getDate() + 1);
          loopDateStr = d.toISOString().split("T")[0];
        }

        if (datesToCheck.length > 0) {
          // Ambil riwayat presensi nyata yang berhasil dilakukan di hari-hari tersebut
          const { data: pastPresences } = await supabase
            .from("daily_presence")
            .select("date_only")
            .eq("profile_id", profileData.id)
            .in("date_only", datesToCheck);

          // Kalkulasi matematika: (Total Hari Terlewat * 5 Kewajiban) - Jumlah klik asli yang ada di DB
          const totalRequired = datesToCheck.length * 5;
          const totalDone = pastPresences ? pastPresences.length : 0;
          const pointsToAdd = totalRequired - totalDone;

          if (pointsToAdd > 0) {
            currentPoints += pointsToAdd;
          }

          // Sinkronisasikan poin penalti baru ke Supabase & kunci tanggal evaluasi hari ini
          await supabase
            .from("profiles")
            .update({
              penalty_points: currentPoints,
              last_check_date: todayString,
            })
            .eq("id", profileData.id);
        }
      }
      // --- AKHIR SISTEM PENGHITUNG ---

      setPenaltyPoints(currentPoints);

      // Trigger Gacha Wheel meledak di layar jika akumulasi poin >= 5
      if (currentPoints >= 5) setShowGacha(true);

      const { data: pendingGachas } = await supabase
        .from("gacha_history")
        .select("id, penalty_result")
        .eq("profile_id", profileData.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (pendingGachas && pendingGachas.length > 0) {
        const formattedPunishments = pendingGachas.map((item: any) => ({
          id: item.id,
          text: item.penalty_result,
        }));
        setActivePunishments(formattedPunishments);
      }

      const { data: presenceData } = await supabase
        .from("daily_presence")
        .select("activity_type, logged_at")
        .eq("profile_id", profileData.id)
        .eq("date_only", todayString);

      if (presenceData) {
        const currentPresence: any = {
          hadir: null,
          makan: null,
          tidur: null,
          belajar: null,
          mandi: null,
        };
        presenceData.forEach((log) => {
          const time = new Date(log.logged_at).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          });
          currentPresence[log.activity_type] = `${time} WIB`;
        });
        setPresence(currentPresence);
      }
    }
  };

  const handlePresence = async (activity: keyof typeof presence) => {
    if (!profileId) return;
    const now = new Date();
    const timeString = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setPresence((prev: any) => ({ ...prev, [activity]: `${timeString} WIB` }));

    const todayString = getWIBDateString();
    await supabase.from("daily_presence").insert([
      {
        profile_id: profileId,
        activity_type: activity,
        date_only: todayString,
      },
    ]);
  };

  const handleSpinGacha = async () => {
    if (isSpinning || !profileId) return;
    setIsSpinning(true);

    const winnerIndex = Math.floor(Math.random() * WHEEL_ITEMS.length);
    const sliceCenter = (winnerIndex + 0.5) * SEGMENT_ANGLE;
    let targetRotation = 90 - sliceCenter;
    if (targetRotation < 0) targetRotation += 360;

    const currentMod = wheelRotation % 360;
    let diff = targetRotation - currentMod;
    if (diff < 0) diff += 360;

    const finalRotation = wheelRotation + 3600 + diff;
    setWheelRotation(finalRotation);

    setTimeout(async () => {
      const resultText = WHEEL_ITEMS[winnerIndex].full;
      setGachaResult(resultText);
      setIsSpinning(false);

      const { data: newGacha } = await supabase
        .from("gacha_history")
        .insert([
          {
            profile_id: profileId,
            penalty_result: resultText,
            status: "pending",
          },
        ])
        .select("id")
        .single();

      if (newGacha) {
        setActivePunishments((prev) => [
          { id: newGacha.id, text: resultText },
          ...prev,
        ]);
      }

      const newPoints = penaltyPoints - 5;
      await supabase
        .from("profiles")
        .update({ penalty_points: newPoints })
        .eq("id", profileId);
      setPenaltyPoints(newPoints);
    }, 5000);
  };

  const handleCompletePunishment = async (punishmentId: string) => {
    setActivePunishments((prev) => prev.filter((p) => p.id !== punishmentId));
    await supabase
      .from("gacha_history")
      .update({
        status: "done",
        completed_at: new Date().toISOString(),
      })
      .eq("id", punishmentId);
  };

  const closeGacha = () => {
    setShowGacha(false);
    setGachaResult(null);
  };

  const activities = [
    { id: "makan", label: "Makan", icon: <Utensils size={24} /> },
    { id: "tidur", label: "Tidur", icon: <Moon size={24} /> },
    { id: "belajar", label: "Belajar", icon: <BookOpen size={24} /> },
    { id: "mandi", label: "Mandi", icon: <Droplets size={24} /> },
  ] as const;

  return (
    <main
      className={`min-h-screen ${theme.bg} p-6 md:p-12 transition-colors duration-500 font-sans pb-20 relative overflow-hidden`}
    >
      <AnimatePresence>
        {showGacha && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-slate-800 p-8 rounded-[2rem] max-w-sm w-full text-center shadow-2xl border-4 border-slate-700 flex flex-col items-center overflow-hidden"
            >
              <h2 className="text-2xl font-extrabold text-white mb-6">
                Waktunya Gacha!
              </h2>

              <div className="relative w-64 h-64 mb-8">
                <div className="absolute top-1/2 -right-6 -translate-y-1/2 w-0 h-0 border-t-[16px] border-b-[16px] border-r-[24px] border-t-transparent border-b-transparent border-r-yellow-400 z-30 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]"></div>

                <motion.div
                  animate={{ rotate: wheelRotation }}
                  transition={{ duration: 5, ease: "circOut" }}
                  className="w-full h-full rounded-full border-4 border-slate-900 shadow-2xl overflow-hidden relative"
                  style={{ background: `conic-gradient(${conicString})` }}
                >
                  {WHEEL_ITEMS.map((item, i) => {
                    const textRotation = (i + 0.5) * SEGMENT_ANGLE - 90;
                    return (
                      <div
                        key={item.id}
                        className="absolute top-1/2 left-1/2 w-1/2 origin-left flex items-center justify-end pr-4 text-white font-extrabold text-[10px] md:text-xs drop-shadow-md"
                        style={{
                          transform: `translateY(-50%) rotate(${textRotation}deg)`,
                        }}
                      >
                        {item.short}
                      </div>
                    );
                  })}
                </motion.div>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full z-20 shadow-md border-4 border-slate-900"></div>
              </div>

              {gachaResult ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full"
                >
                  <p className="text-sm text-slate-300 font-medium mb-2">
                    Kamu mendapatkan hukuman:
                  </p>
                  <div
                    className={`p-4 rounded-xl font-bold text-lg bg-white ${theme.text} border-2 ${theme.border} mb-6 shadow-[0_0_15px_rgba(255,255,255,0.2)]`}
                  >
                    {gachaResult}
                  </div>
                  <button
                    onClick={closeGacha}
                    className="w-full py-4 rounded-xl bg-slate-600 text-white font-bold hover:bg-slate-500 transition-colors"
                  >
                    Tutup Layar
                  </button>
                </motion.div>
              ) : (
                <button
                  onClick={handleSpinGacha}
                  disabled={isSpinning}
                  className={`w-full py-4 rounded-xl font-bold text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all ${isSpinning ? "bg-slate-600 cursor-not-allowed" : `${theme.gachaBtn} hover:scale-105 active:scale-95`}`}
                >
                  {isSpinning ? "Sedang Mengundi..." : "Putar Roda Sekarang!"}
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-md mx-auto flex items-center justify-between mb-6">
        <button
          onClick={() => router.push("/")}
          className="p-2 bg-white/60 rounded-full shadow-sm hover:scale-105 transition-transform"
        >
          <ArrowLeft className="text-slate-600" />
        </button>
        <div
          className={`px-4 py-1.5 rounded-full bg-white/80 shadow-sm font-bold flex items-center gap-2 ${theme.text}`}
        >
          <AlertCircle size={18} />
          Poin: <span className="text-xl">{penaltyPoints}/5</span>
        </div>
      </div>

      <div className="max-w-md mx-auto flex flex-col gap-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`p-6 rounded-[2rem] border-4 ${theme.border} ${theme.card} shadow-lg text-center relative overflow-hidden flex flex-col items-center`}
        >
          <div className="text-5xl mb-3">{theme.avatar}</div>
          <h2 className={`text-2xl font-extrabold ${theme.text} mb-2`}>
            Halo, {theme.name}!
          </h2>
          <div className="flex items-center gap-1 text-slate-600 text-sm font-medium bg-white/50 px-3 py-1 rounded-full">
            <Clock size={14} />
            {currentDate || "Memuat..."}
          </div>
        </motion.div>

        <AnimatePresence>
          {activePunishments.map((punishment) => (
            <motion.div
              key={punishment.id}
              initial={{ height: 0, opacity: 0, scale: 0.9 }}
              animate={{ height: "auto", opacity: 1, scale: 1 }}
              exit={{ height: 0, opacity: 0, scale: 0.9 }}
              className="overflow-hidden"
            >
              <div className="bg-red-50 border-2 border-red-200 p-5 rounded-[2rem] shadow-sm relative flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-red-600 font-bold mb-1">
                    <Flame size={20} className="animate-pulse" />
                    Utang Hukuman!
                  </div>
                </div>
                <p className="font-semibold text-slate-700 bg-white p-3 rounded-xl border border-red-100">
                  {punishment.text}
                </p>
                <button
                  onClick={() => handleCompletePunishment(punishment.id)}
                  className="mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold transition-colors shadow-sm"
                >
                  <CheckCircle2 size={20} />
                  Sudah Dilakukan
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: presence.hadir ? 1 : 1.02 }}
          whileTap={{ scale: presence.hadir ? 1 : 0.95 }}
          onClick={() => handlePresence("hadir")}
          disabled={!!presence.hadir}
          className={`w-full py-5 rounded-[2rem] border-4 flex flex-col items-center justify-center gap-2 text-lg font-bold shadow-md transition-all
            ${presence.hadir ? `${theme.activeBtn} border-transparent opacity-90 cursor-not-allowed` : `${theme.inactiveBtn} ${theme.border}`}
          `}
        >
          <div className="flex items-center gap-3">
            <HeartHandshake size={28} />
            {presence.hadir ? "Sudah Hadir! 💖" : "Klik Presensi Kehadiran"}
          </div>
          {presence.hadir && (
            <span className="text-sm font-normal bg-black/10 px-3 py-1 rounded-full">
              Tercatat jam {presence.hadir}
            </span>
          )}
        </motion.button>

        <div className="grid grid-cols-2 gap-4">
          {activities.map((item, index) => {
            const timeLogged = presence[item.id as keyof typeof presence];
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: timeLogged ? 1 : 1.05 }}
                whileTap={{ scale: timeLogged ? 1 : 0.95 }}
                onClick={() => handlePresence(item.id as keyof typeof presence)}
                disabled={!!timeLogged}
                className={`flex flex-col items-center justify-center p-6 rounded-[2rem] border-4 shadow-sm transition-all relative
                  ${timeLogged ? `${theme.activeBtn} border-transparent cursor-not-allowed` : `${theme.inactiveBtn} ${theme.border}`}
                `}
              >
                <div
                  className={`p-3 rounded-full mb-2 ${timeLogged ? "bg-white/20" : theme.iconBg}`}
                >
                  {item.icon}
                </div>
                <span className="font-bold">{item.label}</span>
                {timeLogged ? (
                  <span className="text-[11px] mt-2 font-medium bg-black/10 px-2 py-0.5 rounded-full">
                    {timeLogged}
                  </span>
                ) : (
                  <span className="text-[11px] mt-2 text-transparent">_</span>
                )}
              </motion.button>
            );
          })}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push(`/${user}/riwayat`)}
          className={`w-full mt-4 py-4 rounded-[2rem] border-2 border-dashed ${theme.border} bg-white/50 flex items-center justify-center gap-2 font-bold text-slate-600 hover:bg-white transition-colors shadow-sm`}
        >
          <CalendarDays size={20} />
          Lihat Riwayat Presensi
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push(`/${user}/riwayat-hukuman`)}
          className={`w-full py-4 rounded-[2rem] border-2 border-dashed ${theme.border} bg-white/50 flex items-center justify-center gap-2 font-bold text-slate-600 hover:bg-white transition-colors shadow-sm`}
        >
          <Gift size={20} />
          Lihat Riwayat Hukuman
        </motion.button>
      </div>
    </main>
  );
}
