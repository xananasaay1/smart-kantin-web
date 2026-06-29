import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { ArrowLeft, Timer, RefreshCw, Lock, ShieldCheck, Check, X, ScanLine, Loader } from "lucide-react";

function formatRupiah(angka) {
  return "Rp " + angka.toLocaleString("id-ID");
}

// Buat pola QR acak (simulasi visual) — berubah tiap generate ulang
function buatPolaQR(seed) {
  const pola = [];
  for (let i = 0; i < 625; i++) {
    const nilai = (i * 9301 + seed * 49297 + 233280) % 100;
    pola.push(nilai % 2 === 0);
  }
  return pola;
}

// Cek apakah sel (baris r, kolom c) bagian dari finder pattern (3 kotak sudut khas QR)
function adaFinder(r, c) {
  const di = (br, bc) => br >= 0 && br < 7 && bc >= 0 && bc < 7;
  // kiri-atas, kanan-atas, kiri-bawah
  if (di(r, c)) return true;            // kiri atas (0-6, 0-6)
  if (di(r, c - 18)) return true;       // kanan atas (kolom 18-24)
  if (di(r - 18, c)) return true;       // kiri bawah (baris 18-24)
  return false;
}

function Pembayaran() {
  const navigate = useNavigate();
  const location = useLocation();
  const { stanAktif, totalHarga, totalItem, buatPesanan } = useCart();

  const metodeAmbil = location.state?.metodeAmbil || "sekarang";
  const jamAmbil = location.state?.jamAmbil || null;

  const [detik, setDetik] = useState(30);
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 10000));
  const [hangus, setHangus] = useState(false);
  const [popupVerif, setPopupVerif] = useState(false);
  const [statusVerif, setStatusVerif] = useState("memilih");

  useEffect(() => {
    if (hangus) return;
    if (detik <= 0) {
      setHangus(true);
      return;
    }
    const timer = setInterval(() => {
      setDetik((d) => d - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [detik, hangus]);

  function generateUlang() {
    setSeed(Math.floor(Math.random() * 10000));
    setDetik(30);
    setHangus(false);
  }

  function formatWaktu(total) {
    const menit = Math.floor(total / 60);
    const sisa = total % 60;
    return `${menit}:${String(sisa).padStart(2, "0")}`;
  }

  if (!stanAktif) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-5">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-300">
          <ScanLine size={36} strokeWidth={1.5} />
        </div>
        <p className="text-gray-600 font-medium">Tidak ada pembayaran aktif</p>
        <button onClick={() => navigate("/")} className="mt-2 bg-brand text-white px-5 py-2 rounded-xl font-semibold">
          Kembali
        </button>
      </div>
    );
  }

  function konfirmasiBayar() {
    if (hangus) return;
    setStatusVerif("memilih");
    setPopupVerif(true);
  }

  async function verifikasiBerhasil() {
    setStatusVerif("loading");
    const pesanan = await buatPesanan({
      metodeAmbil,
      jamAmbil,
      metodeBayar: "qris",
    });
    if (pesanan) {
      navigate("/sukses", { state: { kode: pesanan.kode } });
    } else {
      setPopupVerif(false);
      alert("Maaf, terjadi kesalahan. Coba lagi.");
    }
  }

  function verifikasiGagal() {
    setStatusVerif("gagal");
  }

  const pola = buatPolaQR(seed);
  // NMID palsu (khas QRIS) berdasarkan id warung — konsisten
  const nmid = "ID" + String(1000000000000 + (stanAktif.id * 73529)).slice(0, 13);

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
        <h1 className="text-white text-xl font-extrabold">Pembayaran QRIS</h1>
      </header>

      <section className="px-5 mt-6">
        <div className="bg-white rounded-3xl shadow-md overflow-hidden">
          {/* HEADER QRIS (gaya khas, tanpa jiplak logo resmi) */}
          <div className="bg-gradient-to-r from-[#D32F2F] via-[#C2185B] to-[#1565C0] px-5 py-3 flex items-center justify-between">
            <span className="text-white font-extrabold text-xl italic tracking-tight">QRIS</span>
            <span className="text-white/90 text-[11px] font-medium text-right leading-tight">
              Satu QR<br />untuk semua
            </span>
          </div>

          <div className="p-6 text-center">
            {/* Info merchant */}
            <p className="font-extrabold text-ink text-lg">{stanAktif.nama}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">NMID: {nmid}</p>
            <p className="text-[11px] text-gray-400">Smart Kantin • Surabaya</p>

            <p className="text-brand font-extrabold text-3xl mt-3">{formatRupiah(totalHarga)}</p>

            {/* QR + overlay hangus */}
            <div className="mt-4 mx-auto w-60 h-60 bg-white rounded-2xl border-2 border-gray-100 p-3 flex items-center justify-center relative">
              <div className={`relative grid grid-cols-[repeat(25,1fr)] gap-0 w-full h-full ${hangus ? "blur-sm opacity-30" : ""}`}>
                {pola.map((isi, i) => {
                  const r = Math.floor(i / 25);
                  const c = i % 25;
                  // sel finder pattern digambar terpisah (di bawah), jadi di sini kosongkan
                  if (adaFinder(r, c)) return <div key={i}></div>;
                  return <div key={i} className={isi ? "bg-ink" : "bg-transparent"}></div>;
                })}

                {/* 3 finder pattern (kotak sudut khas QR) */}
                <FinderPattern posisi="top-0 left-0" />
                <FinderPattern posisi="top-0 right-0" />
                <FinderPattern posisi="bottom-0 left-0" />

                {/* Logo merchant di tengah */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-lg shadow flex items-center justify-center border-2 border-gray-100 overflow-hidden">
                  {stanAktif.foto_url ? (
                    <img src={stanAktif.foto_url} alt={stanAktif.nama} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">{stanAktif.emoji || "🏪"}</span>
                  )}
                </div>
              </div>

              {hangus && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 rounded-2xl">
                  <Timer size={36} className="text-gray-500 mb-2" strokeWidth={2} />
                  <p className="font-bold text-ink text-sm">QR Kedaluwarsa</p>
                  <button
                    onClick={generateUlang}
                    className="mt-3 bg-brand text-white px-4 py-2 rounded-xl text-sm font-bold shadow hover:bg-brand-dark active:scale-95 transition flex items-center gap-1.5"
                  >
                    <RefreshCw size={15} strokeWidth={2.5} /> Buat QR Baru
                  </button>
                </div>
              )}
            </div>

            {/* Timer */}
            {!hangus && (
              <div className="mt-4 inline-flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-full text-accent">
                <Timer size={16} strokeWidth={2} />
                <span className="text-sm font-bold">Berlaku {formatWaktu(detik)}</span>
              </div>
            )}

            <p className="text-xs text-gray-400 mt-3">
              Scan dengan aplikasi e-wallet / m-banking
            </p>
            <div className="mt-1 inline-flex items-center gap-1 text-xs text-gray-400">
              <Lock size={12} strokeWidth={2} /> Pembayaran disimulasikan untuk demo
            </div>
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
          disabled={hangus}
          className="w-full bg-success hover:bg-green-700 text-white rounded-2xl py-4 font-bold shadow-md active:scale-[0.99] transition disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {hangus ? (
            "QR Kedaluwarsa — buat QR baru dulu"
          ) : (
            <>
              <Check size={20} strokeWidth={2.5} /> Saya Sudah Bayar
            </>
          )}
        </button>
      </div>

      {/* POPUP VERIFIKASI PEMBAYARAN */}
      {popupVerif && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-5 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">

            {statusVerif === "memilih" && (
              <>
                <div className="w-14 h-14 rounded-full bg-brand/10 flex items-center justify-center text-brand mx-auto mb-3">
                  <ShieldCheck size={28} strokeWidth={2} />
                </div>
                <h3 className="font-bold text-ink text-lg">Verifikasi Pembayaran</h3>
                <p className="text-gray-500 text-sm mt-2">
                  Sistem akan memeriksa apakah pembayaran sebesar <b>{formatRupiah(totalHarga)}</b> sudah diterima.
                </p>
                <div className="flex flex-col gap-2 mt-5">
                  <button
                    onClick={verifikasiBerhasil}
                    className="w-full bg-success text-white py-3 rounded-xl font-bold hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    <Check size={18} strokeWidth={2.5} /> Pembayaran Diterima
                  </button>
                  <button
                    onClick={verifikasiGagal}
                    className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
                  >
                    Simulasikan Gagal
                  </button>
                  <button
                    onClick={() => setPopupVerif(false)}
                    className="w-full text-gray-400 py-2 text-sm hover:text-gray-600 transition"
                  >
                    Batal
                  </button>
                </div>
              </>
            )}

            {statusVerif === "loading" && (
              <>
                <Loader size={48} className="text-success animate-spin mx-auto" strokeWidth={2} />
                <p className="font-bold text-ink mt-4">Memverifikasi pembayaran...</p>
                <p className="text-gray-400 text-sm mt-1">Mohon tunggu sebentar</p>
              </>
            )}

            {statusVerif === "gagal" && (
              <>
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto text-red-500">
                  <X size={32} strokeWidth={2.5} />
                </div>
                <h3 className="font-bold text-red-500 text-lg mt-4">Pembayaran Belum Diterima</h3>
                <p className="text-gray-500 text-sm mt-2">
                  Kami belum menerima pembayaran sebesar <b>{formatRupiah(totalHarga)}</b>. Pastikan kamu sudah menyelesaikan pembayaran, lalu coba lagi.
                </p>
                <div className="flex flex-col gap-2 mt-5">
                  <button
                    onClick={() => setStatusVerif("memilih")}
                    className="w-full bg-brand text-white py-3 rounded-xl font-bold hover:bg-brand-dark transition"
                  >
                    Coba Lagi
                  </button>
                  <button
                    onClick={() => setPopupVerif(false)}
                    className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
                  >
                    Tutup
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

// Komponen finder pattern (kotak sudut khas QR): kotak hitam besar + bingkai putih + kotak hitam kecil
function FinderPattern({ posisi }) {
  return (
    <div className={`absolute ${posisi} w-[28%] h-[28%] flex items-center justify-center`}>
      <div className="w-full h-full bg-ink rounded-[3px] flex items-center justify-center">
        <div className="w-[64%] h-[64%] bg-white rounded-[2px] flex items-center justify-center">
          <div className="w-[58%] h-[58%] bg-ink rounded-[1px]"></div>
        </div>
      </div>
    </div>
  );
}

export default Pembayaran;