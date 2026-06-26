import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function formatRupiah(angka) {
  return "Rp " + angka.toLocaleString("id-ID");
}

function Checkout() {
  const navigate = useNavigate();
  const { items, stanAktif, totalHarga, totalItem } = useCart();

  const [metodeAmbil, setMetodeAmbil] = useState("sekarang"); // sekarang / preorder
  const [jamAmbil, setJamAmbil] = useState("12:30");

  // Kalau tidak ada item (misal halaman dibuka langsung), tendang ke home
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-5">
        <p className="text-5xl">🛒</p>
        <p className="text-gray-600 font-medium">Belum ada pesanan</p>
        <button onClick={() => navigate("/")} className="mt-2 bg-brand text-white px-5 py-2 rounded-xl font-semibold">
          Mulai Pesan
        </button>
      </div>
    );
  }

  function lanjutBayar() {
    navigate("/pembayaran", { state: { metodeAmbil, jamAmbil } });
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* HEADER */}
      <header className="bg-brand px-5 pt-10 pb-6 rounded-b-3xl shadow-lg flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center text-white text-xl"
        >
          ←
        </button>
        <h1 className="text-white text-xl font-extrabold">Checkout</h1>
      </header>

      {/* INFO WARUNG */}
      <section className="px-5 mt-5">
        <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <span className="text-2xl">🏪</span>
          <div>
            <p className="text-xs text-gray-400">Pesanan dari</p>
            <p className="font-bold text-ink">{stanAktif?.nama}</p>
          </div>
        </div>
      </section>

      {/* METODE PENGAMBILAN */}
      <section className="px-5 mt-5">
        <h2 className="font-bold text-ink mb-3">Metode Pengambilan</h2>
        <div className="space-y-3">
          {/* Ambil Sekarang */}
          <button
            onClick={() => setMetodeAmbil("sekarang")}
            className={`w-full text-left bg-white rounded-2xl p-4 shadow-sm border-2 transition flex items-center gap-3 ${
              metodeAmbil === "sekarang" ? "border-brand" : "border-transparent"
            }`}
          >
            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              metodeAmbil === "sekarang" ? "border-brand" : "border-gray-300"
            }`}>
              {metodeAmbil === "sekarang" && <span className="w-2.5 h-2.5 rounded-full bg-brand"></span>}
            </span>
            <div>
              <p className="font-semibold text-ink">Ambil Sekarang</p>
              <p className="text-xs text-gray-400">Pesanan disiapkan secepatnya</p>
            </div>
          </button>

          {/* Pre-Order */}
          <button
            onClick={() => setMetodeAmbil("preorder")}
            className={`w-full text-left bg-white rounded-2xl p-4 shadow-sm border-2 transition flex items-center gap-3 ${
              metodeAmbil === "preorder" ? "border-brand" : "border-transparent"
            }`}
          >
            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              metodeAmbil === "preorder" ? "border-brand" : "border-gray-300"
            }`}>
              {metodeAmbil === "preorder" && <span className="w-2.5 h-2.5 rounded-full bg-brand"></span>}
            </span>
            <div>
              <p className="font-semibold text-ink">Pre-Order ⭐</p>
              <p className="text-xs text-gray-400">Pilih jam pengambilan, makanan baru dibuat saat mendekati waktu</p>
            </div>
          </button>
        </div>

        {/* Pilih jam (muncul kalau pre-order) */}
        {metodeAmbil === "preorder" && (
          <div className="mt-3 bg-white rounded-2xl p-4 shadow-sm">
            <label className="text-sm font-semibold text-ink">Pilih jam pengambilan</label>
            <input
              type="time"
              value={jamAmbil}
              onChange={(e) => setJamAmbil(e.target.value)}
              className="mt-2 w-full bg-gray-50 rounded-xl p-3 outline-none text-ink font-medium focus:ring-2 focus:ring-brand/30 transition"
            />
          </div>
        )}
      </section>

      {/* METODE PEMBAYARAN (QRIS saja) */}
      <section className="px-5 mt-5">
        <h2 className="font-bold text-ink mb-3">Metode Pembayaran</h2>
        <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-brand flex items-center gap-3">
          <span className="text-2xl">📱</span>
          <div className="flex-1">
            <p className="font-semibold text-ink">QRIS</p>
            <p className="text-xs text-gray-400">Bayar dulu, lalu pesanan langsung diproses</p>
          </div>
          <span className="text-brand font-bold">✓</span>
        </div>
      </section>

      {/* RINGKASAN */}
      <section className="px-5 mt-5">
        <div className="bg-white rounded-2xl p-4 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-400">Ringkasan</p>
            <p className="font-semibold text-ink">{totalItem} item</p>
          </div>
          <p className="font-extrabold text-brand text-lg">{formatRupiah(totalHarga)}</p>
        </div>
      </section>

      {/* TOMBOL BAYAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-xl">
        <button
          onClick={lanjutBayar}
          className="w-full bg-brand hover:bg-brand-dark text-white rounded-2xl py-4 font-bold shadow-md transition"
        >
          Lanjut ke Pembayaran →
        </button>
      </div>
    </div>
  );
}

export default Checkout;