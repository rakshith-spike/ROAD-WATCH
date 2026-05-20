import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../providers/AuthProvider";

export default function LogoutPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    logout();
    navigate("/auth", { replace: true });
  }, [logout, navigate]);

  return null;
}
