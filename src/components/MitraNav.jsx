import { useNavigate, useLocation } from "react-router-dom";

function MitraNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const menu = [
    { path: "/mitra/dashboard", label: "Home", icon: "🏠" },
    { path: "/mitra/pesanan", label: "Pesanan", icon: "📥" },
    { path: "/mitra/menu", label: "Menu", icon: "🍽️" },
    { path: "/mitra/ulasan", label: "Ulasan", icon: "⭐" },
    { path: "/mitra/profil", label: "Profil", icon: "👤" },
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
              className={`flex-1 py-2.5 flex flex-col items-center gap-1 transition ${
                aktif ? "text-accent" : "text-gray-400"
              }`}
            >
              <span className="text-xl">{m.icon}</span>
              <span className={`text-[11px] ${aktif ? "font-bold" : ""}`}>{m.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default MitraNav;