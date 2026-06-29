import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Inbox, UtensilsCrossed, Star, User } from "lucide-react";

function MitraNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const menu = [
    { path: "/mitra/dashboard", label: "Home", Icon: LayoutDashboard },
    { path: "/mitra/pesanan", label: "Pesanan", Icon: Inbox },
    { path: "/mitra/menu", label: "Menu", Icon: UtensilsCrossed },
    { path: "/mitra/ulasan", label: "Ulasan", Icon: Star },
    { path: "/mitra/profil", label: "Profil", Icon: User },
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
              className={`flex-1 py-2.5 flex flex-col items-center gap-1 transition ${
                aktif ? "text-accent" : "text-gray-400"
              }`}
            >
              <Ikon size={21} strokeWidth={aktif ? 2.5 : 2} />
              <span className={`text-[11px] ${aktif ? "font-bold" : "font-medium"}`}>{m.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default MitraNav;