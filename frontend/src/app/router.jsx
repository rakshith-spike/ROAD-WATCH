import { lazy } from "react";
import { Navigate, createBrowserRouter, useLocation } from "react-router-dom";

import { AppShell } from "../components/layout/AppShell";
import { useAuth } from "../providers/AuthProvider";

const HomePage = lazy(() => import("../pages/HomePage"));
const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const MapPage = lazy(() => import("../pages/MapPage"));
const AnalyticsPage = lazy(() => import("../pages/AnalyticsPage"));
const AssistantPage = lazy(() => import("../pages/AssistantPage"));
const ComplaintsPage = lazy(() => import("../pages/ComplaintsPage"));
const AdminPage = lazy(() => import("../pages/AdminPage"));
const ContractorsPage = lazy(() => import("../pages/ContractorsPage"));
const AlertsPage = lazy(() => import("../pages/AlertsPage"));
const AuthPage = lazy(() => import("../pages/AuthPage"));
const LogoutPage = lazy(() => import("../pages/LogoutPage"));

function Placeholder() {
  return (
    <div className="glass-panel">
      <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">Page Under Construction</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">This module is reserved for future hackathon expansion.</p>
    </div>
  );
}

function RequireAuth({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }
  return children;
}

function PublicOnly({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

export const router = createBrowserRouter([
  {
    path: "/auth",
    element: (
      <PublicOnly>
        <AuthPage />
      </PublicOnly>
    ),
  },
  {
    path: "/logout",
    element: <LogoutPage />,
  },
  {
    path: "/",
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "home", element: <HomePage /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "map", element: <MapPage /> },
      { path: "analytics", element: <AnalyticsPage /> },
      { path: "assistant", element: <AssistantPage /> },
      { path: "complaints", element: <ComplaintsPage /> },
      { path: "admin", element: <AdminPage /> },
      { path: "contractors", element: <ContractorsPage /> },
      { path: "alerts", element: <AlertsPage /> },
      { path: "*", element: <Navigate to="/dashboard" replace /> },
      { path: "placeholder", element: <Placeholder /> },
    ],
  },
  { path: "*", element: <Navigate to="/auth" replace /> },
]);
