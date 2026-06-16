import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Koneksi ke Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function GET() {
  try {
    // 1. Cari siapa saja di database yang sudah mengaktifkan notifikasi (onesignal_id tidak kosong)
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("name, onesignal_id, penalty_points")
      .not("onesignal_id", "is", null);

    if (error) throw error;

    // 2. Kirim notifikasi ke masing-masing orang yang ditemukan
    for (const profile of profiles) {
      const message = `Halo ${profile.name}! Jangan lupa cek MyAIRI. Poin hukumanmu saat ini: ${profile.penalty_points} poin. 🚨`;

      await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Menggunakan REST API Key untuk memberi izin tembak notifikasi
          Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
        },
        body: JSON.stringify({
          app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
          include_subscription_ids: [profile.onesignal_id], // Tembak tepat sasaran ke ID ini
          headings: { en: "Tagihan Hukuman MyAIRI!" },
          contents: { en: message },
          // Jika notifikasinya diklik, akan langsung membuka dashboard masing-masing!
          url: `https://myairi.vercel.app/${profile.name.toLowerCase()}/dashboard`,
        }),
      });
    }

    // Jika sukses, kembalikan pesan ini ke layar
    return NextResponse.json({
      success: true,
      message: "Postman: Notifikasi berhasil disebar!",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Gagal mengirim notifikasi" },
      { status: 500 },
    );
  }
}
