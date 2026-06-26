import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Sedang cek status login
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-10 h-10 border-4 border-accent/30 border-t-accent rounded-full animate-spin"></span>
      </div>
    );
  }

  // Belum login → tendang ke halaman login mitra
  if (!user) {
    return <Navigate to="/mitra" replace />;
  }

  // Sudah login → tampilkan halaman
  return children;
}

export default ProtectedRoute;