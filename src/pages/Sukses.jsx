import { useNavigate, useLocation } from "react-router-dom";

function Sukses() {
  const navigate = useNavigate();
  const location = useLocation();
  const kode = location.state?.kode || "ORD-XXXX";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-5 text-center">
      {/* Centang sukses */}
      <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mb-5">
        <div className="w-16 h-16 rounded-full bg-success flex items-center justify-center text-white text-4xl animate-pulse">
          ✓
        </div>
      </div>

      <h1 className="text-2xl font-extrabold text-ink">Pesanan Berhasil!</h1>
      <p className="text-gray-500 mt-2 max-w-xs">
        Pesananmu sudah diteruskan ke penjual dan sedang diproses.
      </p>

      <div className="mt-4 bg-white rounded-2xl shadow-sm px-6 py-3">
        <p className="text-xs text-gray-400">Nomor Pesanan</p>
        <p className="font-bold text-brand text-lg">#{kode}</p>
      </div>

      <div className="mt-8 w-full max-w-xs space-y-3">
        <button
          onClick={() => navigate("/pesanan", { state: { kode } })}
          className="w-full bg-brand hover:bg-brand-dark text-white rounded-2xl py-4 font-bold shadow-md transition"
        >
          Lacak Pesanan
        </button>
        <button
          onClick={() => navigate("/")}
          className="w-full bg-white text-ink rounded-2xl py-4 font-semibold shadow-sm hover:bg-gray-50 transition"
        >
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
}

export default Sukses;