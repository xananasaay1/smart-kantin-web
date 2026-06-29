import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import MitraNav from "../components/MitraNav";
import { Bell, Inbox, StickyNote, X, Check, Clock, Zap, CalendarClock, Receipt, ChevronRight, AlertTriangle, Flame } from "lucide-react";

function formatRupiah(angka) {
  return "Rp " + angka.toLocaleString("id-ID");
}

// Ubah "15:00" / "15.00" → menit total hari ini
function jamKeMenit(jam) {
  if (!jam) return null;
  const bersih = jam.replace(".", ":");
  const [j, m] = bersih.split(":").map(Number);
  if (isNaN(j) || isNaN(m)) return null;
  return j * 60 + m;
}

// Hitung selisih menit dari sekarang ke jam ambil (positif = masih akan datang)
function menitMenujuAmbil(jamAmbil, waktuSekarang) {
  const target = jamKeMenit(jamAmbil);
  if (target === null) return null;
  const skrg = new Date(waktuSekarang);
  const menitSkrg = skrg.getHours() * 60 + skrg.getMinutes();
  return target - menitSkrg;
}

// Teks hitung mundur ramah
function teksMundur(selisihMenit) {
  if (selisihMenit === null) return "";
  if (selisihMenit <= 0) return "Waktu ambil sudah tiba";
  const jam = Math.floor(selisihMenit / 60);
  const menit = selisihMenit % 60;
  if (jam > 0) return `Ambil dalam ${jam} jam ${menit} menit`;
  return `Ambil dalam ${menit} menit`;
}

const AMBANG_AWAL = 60; // menit — kalau jam ambil masih > 60 menit lagi, dianggap "terlalu awal"

function MitraPesanan() {
  const { stanSaya } = useAuth();
  const [pesanan, setPesanan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("semua");
  const [adaBaru, setAdaBaru] = useState(false);
  const [waktuSekarang, setWaktuSekarang] = useState(Date.now());

  const [detailBuka, setDetailBuka] = useState(null);
  const [itemDetail, setItemDetail] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Popup konfirmasi "siap terlalu awal"
  const [konfirmasiAwal, setKonfirmasiAwal] = useState(null); // { pesanan, sisaMenit }

  // Perbarui waktu tiap menit (untuk hitung mundur)
  useEffect(() => {
    const timer = setInterval(() => setWaktuSekarang(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!stanSaya) return;

    async function ambilPesanan() {
      const { data } = await supabase
        .from("pesanan")
        .select("*")
        .eq("stan_id", stanSaya.id)
        .order("created_at", { ascending: false });
      setPesanan(data || []);
      setLoading(false);
    }
    ambilPesanan();

    const channel = supabase
      .channel("pesanan-masuk")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "pesanan", filter: `stan_id=eq.${stanSaya.id}` },
        (payload) => {
          setPesanan((lama) => [payload.new, ...lama]);
          setAdaBaru(true);
          bunyiNotif();
          setTimeout(() => setAdaBaru(false), 4000);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "pesanan", filter: `stan_id=eq.${stanSaya.id}` },
        (payload) => {
          setPesanan((lama) =>
            lama.map((p) => (p.id === payload.new.id ? payload.new : p))
          );
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [stanSaya]);

  function bunyiNotif() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      // abaikan
    }
  }

  async function bukaDetail(p) {
    setDetailBuka(p);
    setLoadingDetail(true);
    setItemDetail([]);
    const { data } = await supabase
      .from("pesanan_item")
      .select("*")
      .eq("pesanan_id", p.id);
    setItemDetail(data || []);
    setLoadingDetail(false);
  }

  async function ubahStatus(id, statusBaru) {
    await supabase.from("pesanan").update({ status: statusBaru }).eq("id", id);
    setPesanan((lama) =>
      lama.map((p) => (p.id === id ? { ...p, status: statusBaru } : p))
    );
    setDetailBuka((d) => (d && d.id === id ? { ...d, status: statusBaru } : d));
  }

  // Saat mitra klik "Siap Diambil" — cek dulu kalau pre-order & terlalu awal
  function cobaTandaiSiap(p) {
    if (p.metode_ambil === "preorder") {
      const sisa = menitMenujuAmbil(p.jam_ambil, Date.now());
      if (sisa !== null && sisa > AMBANG_AWAL) {
        // terlalu awal → minta konfirmasi
        setKonfirmasiAwal({ pesanan: p, sisaMenit: sisa });
        return;
      }
    }
    // normal → langsung tandai siap
    ubahStatus(p.id, "siap");
  }

  const pesananTersaring = pesanan.filter((p) => {
    if (filter === "semua") return true;
    if (filter === "diproses") return p.status === "diproses";
    if (filter === "selesai") return p.status === "selesai";
    return true;
  });

  const jumlahDiproses = pesanan.filter((p) => p.status === "diproses").length;

  function labelStatus(status) {
    if (status === "diproses") return { teks: "Diproses", warna: "bg-accent/10 text-accent" };
    if (status === "siap") return { teks: "Siap Diambil", warna: "bg-green-100 text-success" };
    if (status === "selesai") return { teks: "Selesai", warna: "bg-gray-100 text-gray-500" };
    if (status === "ditolak") return { teks: "Ditolak", warna: "bg-red-100 text-red-500" };
    return { teks: status, warna: "bg-gray-100 text-gray-600" };
  }

  // Komponen info waktu pre-order (dipakai di kartu & popup)
  function InfoPreOrder({ jamAmbil, ringkas }) {
    const sisa = menitMenujuAmbil(jamAmbil, waktuSekarang);
    const sudahWaktunya = sisa !== null && sisa <= AMBANG_AWAL;
    return (
      <div className={`rounded-lg px-3 py-2 mt-2 flex items-center gap-2 text-xs font-semibold ${
        sudahWaktunya ? "bg-green-50 text-success" : "bg-orange-50 text-accent"
      }`}>
        {sudahWaktunya ? <Flame size={13} strokeWidth={2} /> : <CalendarClock size={13} strokeWidth={2} />}
        <span>
          Pre-Order • ambil {jamAmbil}
          {!ringkas && (
            <>
              {" — "}
              {sudahWaktunya && sisa > 0 ? "Waktunya disiapkan! " : ""}
              {teksMundur(sisa)}
            </>
          )}
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-accent px-5 pt-10 pb-6 rounded-b-3xl shadow-lg">
        <h1 className="text-white text-xl font-extrabold">Pesanan Masuk</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse"></span>
          <span className="text-white/80 text-xs">Terhubung • update otomatis</span>
        </div>
      </header>

      {adaBaru && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-success text-white px-5 py-3 rounded-2xl shadow-xl z-50 text-sm font-bold animate-bounce flex items-center gap-2">
          <Bell size={16} strokeWidth={2.5} /> Pesanan baru masuk!
        </div>
      )}

      <div className="px-5 mt-4 flex gap-2">
        {[
          { id: "semua", label: "Semua" },
          { id: "diproses", label: `Diproses${jumlahDiproses > 0 ? ` (${jumlahDiproses})` : ""}` },
          { id: "selesai", label: "Selesai" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              filter === f.id ? "bg-accent text-white shadow-md" : "bg-white text-gray-500"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <section className="px-5 mt-4 space-y-3">
        {loading ? (
          <p className="text-center text-gray-400 py-10">Memuat...</p>
        ) : pesananTersaring.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-cream flex items-center justify-center mx-auto mb-3 text-gray-300">
              <Inbox size={40} strokeWidth={1.5} />
            </div>
            <p className="text-gray-500 font-medium">Belum ada pesanan</p>
            <p className="text-gray-400 text-sm mt-1">Pesanan baru akan muncul di sini otomatis</p>
          </div>
        ) : (
          pesananTersaring.map((p) => {
            const status = labelStatus(p.status);
            const aktifPreorder = p.metode_ambil === "preorder" && (p.status === "diproses" || p.status === "siap");
            return (
              <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <button onClick={() => bukaDetail(p)} className="w-full text-left">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-ink flex items-center gap-1.5">
                        #{p.kode}
                        <span className="text-[11px] font-medium text-accent bg-accent/10 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                          Detail <ChevronRight size={11} strokeWidth={2.5} />
                        </span>
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(p.created_at).toLocaleString("id-ID", {
                          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${status.warna}`}>
                      {status.teks}
                    </span>
                  </div>

                  {/* Info pre-order dengan hitung mundur */}
                  {aktifPreorder && <InfoPreOrder jamAmbil={p.jam_ambil} ringkas={false} />}

                  {p.catatan && (
                    <p className="text-xs text-gray-500 mt-2 bg-orange-50 rounded-lg px-3 py-2 flex items-start gap-1.5">
                      <StickyNote size={13} className="text-accent mt-0.5 shrink-0" strokeWidth={2} /> {p.catatan}
                    </p>
                  )}
                </button>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="font-bold text-brand">{formatRupiah(p.total)}</span>

                  {p.status === "diproses" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => ubahStatus(p.id, "ditolak")}
                        className="px-3 py-2 rounded-xl text-sm font-semibold text-red-500 border border-red-200 hover:bg-red-50 transition flex items-center gap-1"
                      >
                        <X size={15} strokeWidth={2.5} /> Tolak
                      </button>
                      <button
                        onClick={() => cobaTandaiSiap(p)}
                        className="px-3 py-2 rounded-xl text-sm font-bold text-white bg-success hover:bg-green-700 transition flex items-center gap-1"
                      >
                        <Check size={15} strokeWidth={2.5} /> Siap Diambil
                      </button>
                    </div>
                  )}
                  {p.status === "siap" && (
                    <button
                      onClick={() => ubahStatus(p.id, "selesai")}
                      className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-accent hover:bg-orange-600 transition flex items-center gap-1"
                    >
                      <Check size={15} strokeWidth={2.5} /> Tandai Selesai
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* POPUP DETAIL PESANAN */}
      {detailBuka && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-5" onClick={() => setDetailBuka(null)}>
          <div
            className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                  <Receipt size={18} strokeWidth={2} />
                </div>
                <div>
                  <p className="font-extrabold text-ink leading-tight">#{detailBuka.kode}</p>
                  <p className="text-[11px] text-gray-400">Detail Pesanan</p>
                </div>
              </div>
              <button
                onClick={() => setDetailBuka(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${labelStatus(detailBuka.status).warna}`}>
                  {labelStatus(detailBuka.status).teks}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock size={12} strokeWidth={2} />
                  {new Date(detailBuka.created_at).toLocaleString("id-ID", {
                    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                </span>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                <p className="text-xs text-gray-400 mb-1">Metode Pengambilan</p>
                {detailBuka.metode_ambil === "preorder" ? (
                  <>
                    <p className="font-bold text-ink flex items-center gap-1.5">
                      <CalendarClock size={16} className="text-accent" strokeWidth={2} />
                      Pre-Order — ambil jam {detailBuka.jam_ambil}
                    </p>
                    {(detailBuka.status === "diproses" || detailBuka.status === "siap") && (
                      <InfoPreOrder jamAmbil={detailBuka.jam_ambil} ringkas={false} />
                    )}
                  </>
                ) : (
                  <p className="font-bold text-ink flex items-center gap-1.5">
                    <Zap size={16} className="text-accent" fill="currentColor" strokeWidth={1.5} />
                    Ambil Sekarang
                  </p>
                )}
              </div>

              <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">Item Pesanan</p>
              {loadingDetail ? (
                <div className="flex justify-center py-6">
                  <span className="w-7 h-7 border-[3px] border-accent/30 border-t-accent rounded-full animate-spin"></span>
                </div>
              ) : itemDetail.length === 0 ? (
                <p className="text-center text-gray-400 py-4 text-sm">Tidak ada rincian item</p>
              ) : (
                <div className="space-y-2">
                  {itemDetail.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-cream rounded-xl px-4 py-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="w-7 h-7 rounded-lg bg-accent text-white text-sm font-bold flex items-center justify-center shrink-0">
                          {item.jumlah}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-ink text-sm truncate">{item.nama_menu}</p>
                          <p className="text-xs text-gray-400">{formatRupiah(item.harga)} / item</p>
                        </div>
                      </div>
                      <p className="font-bold text-ink text-sm shrink-0 ml-2">
                        {formatRupiah(item.harga * item.jumlah)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {detailBuka.catatan && (
                <div className="mt-4">
                  <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">Catatan Pelanggan</p>
                  <p className="text-sm text-gray-600 bg-orange-50 rounded-xl px-4 py-3 flex items-start gap-2">
                    <StickyNote size={15} className="text-accent mt-0.5 shrink-0" strokeWidth={2} />
                    {detailBuka.catatan}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-200">
                <span className="font-semibold text-gray-500">Total Pembayaran</span>
                <span className="font-extrabold text-brand text-xl">{formatRupiah(detailBuka.total)}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1 text-right">Metode: {detailBuka.metode_bayar?.toUpperCase() || "QRIS"}</p>

              {detailBuka.status === "diproses" && (
                <div className="flex gap-2 mt-5">
                  <button
                    onClick={() => { ubahStatus(detailBuka.id, "ditolak"); setDetailBuka(null); }}
                    className="flex-1 px-3 py-3 rounded-xl text-sm font-semibold text-red-500 border border-red-200 hover:bg-red-50 transition flex items-center justify-center gap-1"
                  >
                    <X size={16} strokeWidth={2.5} /> Tolak
                  </button>
                  <button
                    onClick={() => { 
                      const p = detailBuka;
                      setDetailBuka(null);
                      cobaTandaiSiap(p);
                    }}
                    className="flex-1 px-3 py-3 rounded-xl text-sm font-bold text-white bg-success hover:bg-green-700 transition flex items-center justify-center gap-1"
                  >
                    <Check size={16} strokeWidth={2.5} /> Siap Diambil
                  </button>
                </div>
              )}
              {detailBuka.status === "siap" && (
                <button
                  onClick={() => { ubahStatus(detailBuka.id, "selesai"); setDetailBuka(null); }}
                  className="w-full mt-5 px-4 py-3 rounded-xl text-sm font-bold text-white bg-accent hover:bg-orange-600 transition flex items-center justify-center gap-1"
                >
                  <Check size={16} strokeWidth={2.5} /> Tandai Selesai
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* POPUP KONFIRMASI: SIAP TERLALU AWAL (pre-order) */}
      {konfirmasiAwal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-5 z-[60]">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-accent mx-auto mb-3">
              <AlertTriangle size={28} strokeWidth={2} />
            </div>
            <h3 className="font-bold text-ink text-lg">Yakin sudah siap?</h3>
            <p className="text-gray-500 text-sm mt-2">
              Pesanan <b>#{konfirmasiAwal.pesanan.kode}</b> ini Pre-Order untuk jam <b>{konfirmasiAwal.pesanan.jam_ambil}</b> — masih{" "}
              <b>{teksMundur(konfirmasiAwal.sisaMenit).replace("Ambil dalam ", "")}</b> lagi. Kalau disiapkan sekarang, makanan mungkin keburu dingin saat diambil.
            </p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setKonfirmasiAwal(null)}
                className="flex-1 bg-gray-100 text-ink py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  ubahStatus(konfirmasiAwal.pesanan.id, "siap");
                  setKonfirmasiAwal(null);
                }}
                className="flex-1 bg-success text-white py-3 rounded-xl font-bold hover:bg-green-700 transition"
              >
                Tetap Siap
              </button>
            </div>
          </div>
        </div>
      )}

      <MitraNav />
    </div>
  );
}

export default MitraPesanan;