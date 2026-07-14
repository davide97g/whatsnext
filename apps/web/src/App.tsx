import { useQuery } from "@tanstack/react-query";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader.tsx";
import { api } from "@/lib/api.ts";
import { isLoggedIn } from "@/lib/auth.ts";
import { Home } from "@/pages/Home.tsx";
import { Roadmap } from "@/pages/Roadmap.tsx";
import { Dashboard } from "@/pages/admin/Dashboard.tsx";
import { Login } from "@/pages/admin/Login.tsx";

function PublicLayout() {
  const { data: links } = useQuery({ queryKey: ["links"], queryFn: api.links });
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader discordUrl={links?.discord} />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t-2 border-line-strong">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6 sm:px-6">
          <span className="eyebrow text-faint">
            {links?.channelName ?? "whatsnext"} — programming guide
          </span>
          <span className="eyebrow text-faint">Broadcast in public · Est. 2026</span>
        </div>
      </footer>
    </div>
  );
}

function RequireAuth() {
  return isLoggedIn() ? <Outlet /> : <Navigate to="/admin/login" replace />;
}

export function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/roadmap" element={<Roadmap />} />
      </Route>

      <Route path="/admin/login" element={<Login />} />
      <Route element={<RequireAuth />}>
        <Route path="/admin" element={<Dashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
