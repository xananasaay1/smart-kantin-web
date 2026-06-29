import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Home, ReceiptText, ShoppingCart } from "lucide-react";

function CustomerNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItem } = useCart();

  const menu = [
    { path: "/", label: "Home", Icon: Home },
    { path: "/pesanan-saya", label: "Pesanan", Icon: ReceiptText },
    { path: "/keranjang", label: "Keranjang", Icon: ShoppingCart, badge: totalItem },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-40">
      <div className="flex justify-around max-w-lg mx-auto">
        {menu.map((m) => {
          const aktif = location.pathname === m.path;
          const Ikon = m.Icon;
          return (
            <button
              key={m.path}
              onClick={() => navigate(m.path)}
              className={`flex-1 py-2.5 flex flex-col items-center gap-1 transition relative ${
                aktif ? "text-brand" : "text-gray-400"
              }`}
            >
              <span className="relative">
                <Ikon size={22} strokeWidth={aktif ? 2.5 : 2} />
                {/* Badge jumlah keranjang */}
                {m.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-brand text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                    {m.badge}
                  </span>
                )}
              </span>
              <span className={`text-[11px] ${aktif ? "font-bold" : "font-medium"}`}>{m.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default CustomerNav;