import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import Home from "./pages/Home";
import DetailStan from "./pages/DetailStan";
import Keranjang from "./pages/Keranjang";
import Pembayaran from "./pages/Pembayaran";
import Sukses from "./pages/Sukses";
import Checkout from "./pages/Checkout";
import { AuthProvider } from "./context/AuthContext";
import MitraLogin from "./pages/MitraLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import MitraDashboard from "./pages/MitraDashboard";
import MitraPesanan from "./pages/MitraPesanan";
import MitraUlasan from "./pages/MitraUlasan";
import PesananSaya from "./pages/PesananSaya";
import Rating from "./pages/Rating";
import MitraMenu from "./pages/MitraMenu";
import MitraProfil from "./pages/MitraProfil";
import MitraDaftar from "./pages/MitraDaftar";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/stan/:id" element={<DetailStan />} />
            <Route path="/keranjang" element={<Keranjang />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/pembayaran" element={<Pembayaran />} />
            <Route path="/sukses" element={<Sukses />} />
            <Route path="/pesanan-saya" element={<PesananSaya />} />
            <Route path="/pesanan" element={<PesananSaya />} />
            <Route path="/rating" element={<Rating />} />
            <Route path="/mitra" element={<MitraLogin />} />
            <Route path="/mitra/daftar" element={<MitraDaftar />} />
            <Route path="/mitra/dashboard" element={<ProtectedRoute><MitraDashboard /></ProtectedRoute>} />
            <Route path="/mitra/pesanan" element={<ProtectedRoute><MitraPesanan /></ProtectedRoute>} />
            <Route path="/mitra/ulasan" element={<ProtectedRoute><MitraUlasan /></ProtectedRoute>} />
            <Route path="/mitra/menu" element={<ProtectedRoute><MitraMenu /></ProtectedRoute>} />
            <Route path="/mitra/profil" element={<ProtectedRoute><MitraProfil /></ProtectedRoute>} />
            <Route path="*" element={<Home />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;