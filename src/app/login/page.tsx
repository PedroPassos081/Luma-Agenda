"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@schoolflow.dev");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email ou senha inválidos.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
      {/* “faixa” central */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row rounded-2xl border border-slate-800 bg-slate-900/60 shadow-2xl overflow-hidden">
        {/* Lado esquerdo – branding */}
        <div className="hidden md:flex md:w-1/2 flex-col justify-between bg-gradient-to-br from-sky-500/10 via-emerald-500/10 to-sky-500/30 p-8 border-r border-slate-800">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Luma Class
            </h1>
            <p className="mt-2 text-sm text-slate-100/80 max-w-xs">
              Painel inteligente para escolas: notas, presença, relatórios com
              IA e dashboards para diretoria, professores e responsáveis.
            </p>
          </div>

          <div className="mt-6 text-xs text-slate-100/70">
            <p className="font-medium mb-1">Acesso de demonstração</p>
            <ul className="space-y-0.5">
              <li>Admin: admin@schoolflow.dev / 123456</li>
              <li>Professor: prof@schoolflow.dev / 123456</li>
              <li>Responsável: pai@schoolflow.dev / 123456</li>
            </ul>
          </div>
        </div>

        {/* Lado direito – formulário */}
        <div className="w-full md:w-1/2 p-8 md:p-10 bg-slate-950/60 backdrop-blur">
          <div className="mb-6">
            <h2 className="text-xl font-semibold tracking-tight">
              Faça login para acessar o painel
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Use o acesso de demonstração para testar os diferentes perfis.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Email
              </label>
              <input
                type="email"
                className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                placeholder="voce@escola.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Senha
              </label>
              <input
                type="password"
                className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="mt-6 text-[11px] text-slate-500">
            * Projeto em desenvolvimento – versão demo do Luma Class.
          </p>
        </div>
      </div>
    </div>
  );
}
