import { useNavigate, useLocation } from "react-router-dom";
import { Check, MapPin } from "lucide-react";

function Sukses() {
  const navigate = useNavigate();
  const location = useLocation();
  const kode = location.state?.kode || "ORD-XXXX";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-5 text-center relative overflow-hidden">
      {/* Lingkaran hiasan samar di latar */}
      <div className="absolute top-10 -left-16 w-48 h-48 rounded-full bg-success/5"></div>
      <div className="absolute bottom-20 -right-16 w-56 h-56 rounded-full bg-brand/5"></div>

      <div className="relative flex flex-col items-center">
        {/* Centang sukses dengan cincin ganda */}
        <div className="w-28 h-28 rounded-full bg-success/10 flex items-center justify-center mb-5">
          <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-success flex items-center justify-center text-white shadow-lg">
              <Check size={32} strokeWidth={3} />
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-ink">Pesanan Berhasil!</h1>
        <p className="text-gray-500 mt-2 max-w-xs">
          Pesananmu sudah diteruskan ke penjual dan sedang diproses.
        </p>

        {/* Nomor pesanan lebih menonjol */}
        <div className="mt-5 bg-white rounded-2xl shadow-md px-8 py-4 border border-gray-100">
          <p className="text-xs text-gray-400">Nomor Pesanan</p>
          <p className="font-extrabold text-brand text-2xl tracking-wide mt-0.5">#{kode}</p>
        </div>

        <div className="mt-8 w-full max-w-xs space-y-3">
          <button
            onClick={() => navigate("/pesanan-saya")}
            className="w-full bg-brand hover:bg-brand-dark text-white rounded-2xl py-4 font-bold shadow-md active:scale-[0.99] transition flex items-center justify-center gap-2"
          >
            <MapPin size={20} strokeWidth={2.5} /> Lacak Pesanan
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-white text-ink rounded-2xl py-4 font-semibold shadow-sm hover:bg-gray-50 transition"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sukses;