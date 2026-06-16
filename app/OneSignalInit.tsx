"use client";

import { useEffect, useRef } from "react";
import OneSignal from "react-onesignal";

export default function OneSignalInit() {
  const initialized = useRef(false);

  useEffect(() => {
    // Mencegah OneSignal dijalankan 2x oleh sistem Next.js
    if (initialized.current) return;
    initialized.current = true;

    const runOneSignal = async () => {
      // 👇 TAMBAHAN BARU: Cegah OneSignal jalan di localhost agar tidak error
      if (
        typeof window !== "undefined" &&
        window.location.hostname === "localhost"
      ) {
        console.log("🛠️ OneSignal sengaja dimatikan di localhost");
        return;
      }

      try {
        await OneSignal.init({
          appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID as string,
          allowLocalhostAsSecureOrigin: true,
        });

        // Memunculkan pop-up minta izin notifikasi dari atas layar
        OneSignal.Slidedown.promptPush();
      } catch (error) {
        console.error("Gagal memuat OneSignal:", error);
      }
    };

    runOneSignal();
  }, []);

  return null;
}
