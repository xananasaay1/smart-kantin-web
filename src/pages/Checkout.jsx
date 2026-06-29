import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { ArrowLeft, ArrowRight, Store, Zap, CalendarClock, Smartphone, Check } from "lucide-react";

function formatRupiah(angka) {
  return "Rp " + angka.toLocaleString("id-ID");
}

function Checkout() {
  const navigate = useNavigate();
  const { items, stanAktif, totalHarga, totalItem } = useCart();

  const [metodeAmbil, setMetodeAmbil] = useState("sekarang");
  const [jamAmbil, setJamAmbil] = useState("12:30");

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-5">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-300">
          <Store size={36} strokeWidth={1.5} />
        </div>
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
          className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition flex items-center justify-center text-white shrink-0"
          aria-label="Kembali"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </button>
        <h1 className="text-white text-xl font-extrabold">Checkout</h1>
      </header>

      {/* INFO WARUNG */}
      <section className="px-5 mt-5">
        <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cream flex items-center justify-center text-2xl shrink-0 overflow-hidden">
            {stanAktif?.foto_url ? (
              <img src={stanAktif.foto_url} alt={stanAktif.nama} className="w-full h-full object-cover" />
            ) : (
              stanAktif?.emoji || <Store size={22} className="text-gray-400" strokeWidth={2} />
            )}
          </div>
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
            className={`w-full text-left rounded-2xl p-4 shadow-sm border-2 transition flex items-center gap-3 ${
              metodeAmbil === "sekarang" ? "border-brand bg-red-50/50" : "border-transparent bg-white"
            }`}
          >
            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              metodeAmbil === "sekarang" ? "border-brand" : "border-gray-300"
            }`}>
              {metodeAmbil === "sekarang" && <span className="w-2.5 h-2.5 rounded-full bg-brand"></span>}
            </span>
            <div className="flex-1">
              <p className="font-semibold text-ink flex items-center gap-1.5">
                <Zap size={16} className="text-accent" fill="currentColor" strokeWidth={1.5} /> Ambil Sekarang
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Pesanan disiapkan secepatnya</p>
            </div>
          </button>

          {/* Pre-Order */}
          <button
            onClick={() => setMetodeAmbil("preorder")}
            className={`w-full text-left rounded-2xl p-4 shadow-sm border-2 transition flex items-center gap-3 ${
              metodeAmbil === "preorder" ? "border-brand bg-red-50/50" : "border-transparent bg-white"
            }`}
          >
            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              metodeAmbil === "preorder" ? "border-brand" : "border-gray-300"
            }`}>
              {metodeAmbil === "preorder" && <span className="w-2.5 h-2.5 rounded-full bg-brand"></span>}
            </span>
            <div className="flex-1">
              <p className="font-semibold text-ink flex items-center gap-1.5">
                <CalendarClock size={16} className="text-accent" strokeWidth={2} /> Pre-Order
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Pilih jam pengambilan, makanan baru dibuat saat mendekati waktu</p>
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
          <span className="text-brand"><Smartphone size={24} strokeWidth={2} /></span>
          <div className="flex-1">
            <p className="font-semibold text-ink">QRIS</p>
            <p className="text-xs text-gray-400">Bayar dulu, lalu pesanan langsung diproses</p>
          </div>
          <span className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center">
            <Check size={15} strokeWidth={3} />
          </span>
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
          className="w-full bg-brand hover:bg-brand-dark text-white rounded-2xl py-4 font-bold shadow-md active:scale-[0.99] transition flex items-center justify-center gap-2"
        >
          Lanjut ke Pembayaran
          <ArrowRight size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

export default Checkout;