import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { api } from "@/lib/api.ts";
import { setToken } from "@/lib/auth.ts";

export function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = useMutation({
    mutationFn: () => api.login(username, password),
    onSuccess: (data) => {
      setToken(data.token);
      navigate("/admin");
    },
    onError: (e: Error) => toast.error(e.message || "Login failed"),
  });

  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-md items-center px-4">
      <Card className="w-full p-7">
        <span className="eyebrow">Control room</span>
        <h1 className="mt-2 font-display text-2xl font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-muted">Manage the roadmap and push updates.</p>

        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            login.mutate();
          }}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" size="lg" disabled={login.isPending} className="mt-2">
            {login.isPending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
