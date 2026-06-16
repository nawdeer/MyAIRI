import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tipe = searchParams.get("tipe");
    const targetUser = searchParams.get("user"); // Parameter baru untuk target individu

    let heading = "";
    let message = "";

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

    // Mengatur logika query: Filter user jika parameter 'user' ada, jika tidak, ambil semua
    let query = supabase.from("profiles").select("name, onesignal_id");

    if (targetUser) {
      query = query.ilike("name", targetUser);
    } else {
      query = query.not("onesignal_id", "is", null);
    }

    const { data: profiles, error } = await query;

    if (error) throw error;

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({
        success: false,
        error: "Tidak ada user yang ditemukan di database.",
      });
    }

    const logPenyebaran = [];

    for (const profile of profiles) {
      const response = await fetch(
        "https://onesignal.com/api/v1/notifications",
        {
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
        },
      );

      const responseData = await response.json();
      logPenyebaran.push({
        target: profile.name,
        status_pengiriman: response.ok
          ? "Berhasil dikirim ke OneSignal"
          : "Ditolak oleh OneSignal",
        detail_dari_onesignal: responseData,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Proses tipe [${tipe}] untuk ${targetUser || "semua orang"} selesai.`,
      laporan_lengkap: logPenyebaran,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
