"use client"; // Wajib ditambahkan karena kita menggunakan animasi di sisi klien (browser)

import Link from "next/link";
import { Heart, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function SplashPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 overflow-hidden relative">
      {/* Dekorasi Animasi Mengambang di Background */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="absolute top-24 left-10 md:left-32 text-pink-300 opacity-60"
      >
        <Sparkles size={40} />
      </motion.div>
      <motion.div
        animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        className="absolute bottom-24 right-10 md:right-32 text-blue-300 opacity-60"
      >
        <Sparkles size={40} />
      </motion.div>

      {/* Header dengan Animasi Jantung Berdetak */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
        className="text-center mb-12 z-10"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-2 flex items-center justify-center gap-3">
          MyAIRI
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <Heart className="text-pink-500 fill-pink-500" size={36} />
          </motion.div>
        </h1>
        <p className="text-slate-500 font-medium text-sm md:text-base">
          Siapa yang mau presensi hari ini? ✨
        </p>
      </motion.div>

      {/* Container Kartu: Mobile-First (flex-col), Tablet/Desktop (md:flex-row) */}
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-sm md:max-w-2xl justify-center z-10">
        {/* Kartu Profil Ridwan */}
        <Link
          href="/ridwan/dashboard"
          className="w-full md:w-1/2 cursor-pointer focus:outline-none"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: 0.1,
            }}
            className="flex flex-col items-center justify-center p-8 bg-blue-100/90 backdrop-blur-sm rounded-[2rem] border-[5px] border-blue-200 hover:border-blue-400 transition-colors shadow-xl"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-24 h-24 bg-blue-200 rounded-full mb-4 flex items-center justify-center text-5xl shadow-inner"
            >
              👦🏻
            </motion.div>
            <h2 className="text-2xl font-bold text-blue-700">Ridwan</h2>
          </motion.div>
        </Link>

        {/* Kartu Profil Anna */}
        <Link
          href="/anna/dashboard"
          className="w-full md:w-1/2 cursor-pointer focus:outline-none"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: 0.2,
            }}
            className="flex flex-col items-center justify-center p-8 bg-pink-100/90 backdrop-blur-sm rounded-[2rem] border-[5px] border-pink-200 hover:border-pink-400 transition-colors shadow-xl"
          >
            <motion.div
              whileHover={{ rotate: -360 }}
              transition={{ duration: 0.5 }}
              className="w-24 h-24 bg-pink-200 rounded-full mb-4 flex items-center justify-center text-5xl shadow-inner"
            >
              👧🏻
            </motion.div>
            <h2 className="text-2xl font-bold text-pink-700">Anna</h2>
          </motion.div>
        </Link>
      </div>
    </main>
  );
}
