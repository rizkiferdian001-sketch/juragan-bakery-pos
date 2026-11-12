import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // 1. Jika belum login sama sekali -> lempar ke /login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Jika role tidak diizinkan masuk rute ini -> tendang ke halaman asalnya
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to={user.role === "admin" ? "/admin/dashboard" : "/kasir"}
        replace
      />
    );
  }

  return <Outlet />;
}
