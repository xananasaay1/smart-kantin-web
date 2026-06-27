import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";

function CustomerNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItem } = useCart();

  const menu = [
    { path: "/", label: "Home", icon: "🏠" },
    { path: "/pesanan-saya", label: "Pesanan", icon: "🧾" },
    { path: "/keranjang", label: "Keranjang", icon: "🛒", badge: totalItem },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-40">
      <div className="flex justify-around max-w-lg mx-auto">
        {menu.map((m) => {
          const aktif = location.pathname === m.path;
          return (
            <button
              key={m.path}
              onClick={() => navigate(m.path)}
              className={`flex-1 py-3 flex flex-col items-center gap-1 transition relative ${
                aktif ? "text-brand" : "text-gray-400"
              }`}
            >
              <span className="text-xl relative">
                {m.icon}
                {/* Badge jumlah keranjang */}
                {m.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-brand text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {m.badge}
                  </span>
                )}
              </span>
              <span className={`text-xs ${aktif ? "font-bold" : ""}`}>{m.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default CustomerNav;