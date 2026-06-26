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

function App() {
  return (
    <AuthProvider>
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stan/:id" element={<DetailStan />} />
          <Route path="/keranjang" element={<Keranjang />} />
          <Route path="/pembayaran" element={<Pembayaran />} />
          <Route path="/sukses" element={<Sukses />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/mitra" element={<MitraLogin />} />
          <Route path="/mitra/dashboard" element={<ProtectedRoute><MitraDashboard /></ProtectedRoute>} />
          <Route path="/mitra/pesanan" element={<ProtectedRoute><MitraPesanan /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
    </AuthProvider>
  );
}

export default App;