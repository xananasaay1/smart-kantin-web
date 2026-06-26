import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";

function formatRupiah(angka) {
  return "Rp " + angka.toLocaleString("id-ID");
}

function Pembayaran() {
  const navigate = useNavigate();
  const location = useLocation();
  const { stanAktif, totalHarga, totalItem, buatPesanan } = useCart();

  // Ambil pilihan dari halaman Checkout
  const metodeAmbil = location.state?.metodeAmbil || "sekarang";
  const jamAmbil = location.state?.jamAmbil || null;

  const [memproses, setMemproses] = useState(false);

  // Kalau halaman dibuka tanpa data, kembali ke home
  if (!stanAktif) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-5">
        <p className="text-5xl">🧾</p>
        <p className="text-gray-600 font-medium">Tidak ada pembayaran aktif</p>
        <button onClick={() => navigate("/")} className="mt-2 bg-brand text-white px-5 py-2 rounded-xl font-semibold">
          Kembali
        </button>
      </div>
    );
  }

  async function konfirmasiBayar() {
    setMemproses(true);
    const pesanan = await buatPesanan({
      metodeAmbil,
      jamAmbil,
      metodeBayar: "qris",
    });
    if (pesanan) {
      navigate("/sukses", { state: { kode: pesanan.kode } });
    } else {
      setMemproses(false);
      alert("Maaf, terjadi kesalahan. Coba lagi.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <header className="bg-brand px-5 pt-10 pb-6 rounded-b-3xl shadow-lg flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center text-white text-xl">←</button>
        <h1 className="text-white text-xl font-extrabold">Pembayaran QRIS</h1>
      </header>

      <section className="px-5 mt-6">
        <div className="bg-white rounded-3xl shadow-md p-6 text-center">
          <p className="text-sm text-gray-500">Bayar ke</p>
          <p className="font-bold text-ink text-lg">{stanAktif.nama}</p>
          <p className="text-brand font-extrabold text-2xl mt-1">{formatRupiah(totalHarga)}</p>

          {/* Kode QR simulasi (pola kotak-kotak) */}
          <div className="mt-5 mx-auto w-56 h-56 bg-white rounded-2xl border-2 border-gray-100 p-3 flex items-center justify-center">
            <div className="grid grid-cols-8 gap-1 w-full h-full">
              {Array.from({ length: 64 }).map((_, i) => {
                const isi = (i * 7 + (i % 5) * 3) % 3 === 0;
                return (
                  <div
                    key={i}
                    className={isi ? "bg-ink rounded-sm" : "bg-transparent"}
                  ></div>
                );
              })}
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-4">
            Scan dengan aplikasi e-wallet / m-banking
          </p>
          <div className="mt-2 inline-flex items-center gap-1 text-xs text-gray-400">
            <span>🔒</span> Pembayaran disimulasikan untuk demo
          </div>
        </div>

        {/* Info pesanan */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mt-4 flex justify-between items-center">
          <span className="text-sm text-gray-500">{totalItem} item</span>
          <span className="font-bold text-ink">{formatRupiah(totalHarga)}</span>
        </div>
      </section>

      {/* TOMBOL: sudah bayar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-xl">
        <button
          onClick={konfirmasiBayar}
          disabled={memproses}
          className="w-full bg-success hover:bg-green-700 text-white rounded-2xl py-4 font-bold shadow-md transition disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {memproses ? (
            <>
              <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
              Memverifikasi pembayaran...
            </>
          ) : (
            "Saya Sudah Bayar ✓"
          )}
        </button>
      </div>
    </div>
  );
}

export default Pembayaran;