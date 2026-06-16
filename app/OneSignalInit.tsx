"use client";

import { useEffect, useRef } from "react";
import OneSignal from "react-onesignal";
import { usePathname } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// Mengaktifkan koneksi ke Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function OneSignalInit() {
  const initialized = useRef(false);
  const pathname = usePathname(); // Alat untuk membaca URL (contoh: /ridwan/dashboard)

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const runOneSignal = async () => {
      // 1. Matikan OneSignal di localhost agar tidak error layar merah
      if (
        typeof window !== "undefined" &&
        window.location.hostname === "localhost"
      ) {
        console.log("🛠️ OneSignal sengaja dimatikan di localhost");
        return;
      }

      try {
        // 2. Nyalakan Radar OneSignal
        await OneSignal.init({
          appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID as string,
          allowLocalhostAsSecureOrigin: true,
        });

        OneSignal.Slidedown.promptPush();

        // ==========================================
        // 🚀 FASE 7: JEMBATAN KE SUPABASE
        // ==========================================

        // Ambil nama dari URL (misal: "/ridwan/dashboard" akan menghasilkan "ridwan")
        const currentUser = pathname.split("/")[1];

        // Mengecek apakah yang buka benar-benar URL Ridwan atau Anna
        if (currentUser === "ridwan" || currentUser === "anna") {
          // Ambil ID perangkat dari OneSignal
          const onesignalId = OneSignal.User.PushSubscription.id;

          if (onesignalId) {
            // Tulis ID tersebut ke tabel "profiles"
            const { error } = await supabase
              .from("profiles")
              .update({ onesignal_id: onesignalId })
              .ilike("name", currentUser); // ⚠️ PERHATIKAN BAGIAN INI

            if (error) {
              console.error("Gagal menyimpan ID OneSignal ke Supabase:", error);
            } else {
              console.log(
                `✅ Berhasil! ID OneSignal milik ${currentUser} sudah tersimpan di database.`,
              );
            }
          }
        }
      } catch (error) {
        console.error("Gagal memuat OneSignal:", error);
      }
    };

    runOneSignal();
  }, [pathname]);

  return null;
}
