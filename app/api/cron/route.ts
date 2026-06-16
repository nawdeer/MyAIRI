import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function GET(req: Request) {
  try {
    // Menangkap parameter dari URL, contoh: /api/cron?tipe=sarapan
    const { searchParams } = new URL(req.url);
    const tipe = searchParams.get("tipe");

    let heading = "";
    let message = "";

    // Menentukan isi pesan berdasarkan tipe jadwal
    switch (tipe) {
      case "kehadiran":
        heading = "Absen Pagi Dulu! ☀️";
        message =
          "Selamat pagi! Jangan lupa klik tombol Kehadiran (Hadir) untuk memulai harimu ya.";
        break;
      case "sarapan":
        heading = "Pagi-pagi Wajib Isi Bensin! 🌅";
        message =
          "Jangan lupa sarapan ya. Kalau buru-buru, seenggaknya ngemil roti atau minum teh dulu sebelum mulai hari!";
        break;
      case "makansiang":
        heading = "Waktunya Istirahat & Makan Siang! ☀️";
        message = "Ayo istirahat sebentar. Udah waktunya makan siang nih!";
        break;
      case "mandi":
        heading = "Udah Bau Asem Tuh! 🧼";
        message =
          "Yuk mandi dulu biar seger lagi badannya. Habis itu baru lanjut aktivitas!";
        break;
      case "makanmalam":
        heading = "Jangan Lupa Makan Malam! 🌙";
        message =
          "Perut udah keroncongan tuh. Kalau males masak, beli keluar atau beli online, bikin Indomie Jumbo juga boleh kok. Yuk makan!";
        break;
      case "belajar":
        heading = "Waktunya Produktif! 💻";
        message =
          "Ayo buka laptop atau bukunya. Sedikit demi sedikit lama-lama jadi bukit. Semangat belajarnya!";
        break;
      case "tidur":
        heading = "Udah Malam, Jangan Begadang! 💤";
        message =
          "Udah jam setengah 12 malam nih. HP-nya ditaruh dulu, yuk istirahat biar besok paginya fresh. Klik presensi tidur sekarang!";
        break;
      default:
        return NextResponse.json(
          { success: false, error: "Tipe notifikasi tidak valid" },
          { status: 400 },
        );
    }

    // Ambil data user yang punya ID OneSignal
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("name, onesignal_id")
      .not("onesignal_id", "is", null);

    if (error) throw error;

    // CATATAN UNTUK NANTI:
    // Logika "Cek jumlah klik" (makan < 1, dll) akan kita tambahkan setelah
    // kita membuat tabel database untuk riwayat presensi harian di tahap Frontend.
    // Sementara ini, kita biarkan apinya mengirim pesan dulu sesuai jam.

    // Tembakkan notifikasi
    for (const profile of profiles) {
      await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
        },
        body: JSON.stringify({
          app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
          include_subscription_ids: [profile.onesignal_id],
          headings: { en: heading },
          contents: { en: message },
          url: `https://myairi.vercel.app/${profile.name.toLowerCase()}/dashboard`,
        }),
      });
    }

    return NextResponse.json({
      success: true,
      message: `Notifikasi ${tipe} berhasil disebar!`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Gagal mengirim notifikasi" },
      { status: 500 },
    );
  }
}
