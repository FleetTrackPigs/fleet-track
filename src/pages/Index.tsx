
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirigir según el rol del usuario
  if (user?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user?.role === "driver") {
    return <Navigate to="/driver/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

export default Index;
