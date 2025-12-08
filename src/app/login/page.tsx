"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import Image from "next/image";


const ROLES = [
  { id: "admin", label: "Administrador", icon: "🎓" },
  { id: "teacher", label: "Professor", icon: "📘" },
  { id: "parent", label: "Responsável", icon: "👤" },
] as const;

type RoleId = (typeof ROLES)[number]["id"];

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<RoleId>("admin");
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
      role, // se quiser usar o tipo de acesso no backend depois
    });

    setLoading(false);

    if (result?.error) {
      setError("Email ou senha inválidos.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen w-full flex bg-white">
      {/* LADO ESQUERDO – roxo com logo e cards centralizados */}
<div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
  {/* fundo roxo */}
  <div className="absolute inset-0 bg-gradient-to-br from-[#5b22a8] via-[#7f35d9] to-[#b158ff]" />
  <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_1px_1px,#ffffff33_1px,transparent_0)] bg-[length:24px_24px]" />

  <div className="relative flex flex-col items-center justify-center w-full px-10">
    {/* BLOCO CENTRAL: logo + cards */}
    <div className="flex flex-col items-center gap-10 w-full max-w-xl">

      {/* Logo */}
      <div>
        <div className="bg-black/20 rounded-3xl p-10 shadow-xl">
          <Image
            src="/logo.jpg"
            alt="Luma"
            width={240}
            height={240}
            className="object-contain mx-auto"
            priority
          />
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-3 gap-4 w-full">
        <div className="rounded-2xl bg-white/10 backdrop-blur px-4 py-3 text-center text-sm text-white shadow-lg border border-white/15">
          <div className="text-lg mb-1">📊</div>
          <p className="font-semibold">Notas e médias</p>
        </div>
        <div className="rounded-2xl bg-white/10 backdrop-blur px-4 py-3 text-center text-sm text-white shadow-lg border border-white/15">
          <div className="text-lg mb-1">📗</div>
          <p className="font-semibold">Diário de classe</p>
        </div>
        <div className="rounded-2xl bg-white/10 backdrop-blur px-4 py-3 text-center text-sm text-white shadow-lg border border-white/15">
          <div className="text-lg mb-1">💬</div>
          <p className="font-semibold">Observações</p>
        </div>
      </div>
    </div>
  </div>
</div>


      {/* LADO DIREITO – clean, espaçado e moderno */}
<div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-12 lg:px-20 bg-white">
  <div className="w-full max-w-md">

    {/* Título */}
    <div className="mb-10">
      <h1 className="text-3xl font-semibold text-slate-900">
        Entrar na plataforma
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Selecione seu tipo de acesso para continuar
      </p>
    </div>

    {/* Seleção de perfil */}
    <div className="mb-8 grid grid-cols-3 gap-4">
      {ROLES.map((r) => {
        const isActive = role === r.id;
        return (
          <button
            key={r.id}
            type="button"
            onClick={() => setRole(r.id)}
            className={[
              "flex flex-col items-center justify-center h-24 rounded-2xl border transition-all",
              "text-sm font-medium",
              isActive
                ? "border-[#7c3aed] bg-[#f3e8ff] text-[#5b21b6] shadow-[0_4px_12px_rgba(124,58,237,0.25)]"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            ].join(" ")}
          >
            <div className="text-xl mb-1">{r.icon}</div>
            <span>{r.label}</span>
          </button>
        );
      })}
    </div>

    {/* Card de formulário */}
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white border border-slate-200 rounded-3xl shadow-sm px-7 py-7"
    >
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          E-mail
        </label>
        <input
          type="email"
          className="w-full h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Senha
        </label>
        <input
          type="password"
          className="w-full h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
          placeholder="Sua senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {/* Opções */}
      <div className="flex items-center justify-between">
        <label className="inline-flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-400 text-[#7c3aed] focus:ring-[#7c3aed]"
          />
          Lembrar de mim
        </label>
        <button type="button" className="text-sm text-[#7c3aed] hover:underline">
          Esqueci a senha
        </button>
      </div>

      {/* Erro */}
      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      {/* Botão */}
      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-[#6d28d9] to-[#9333ea] text-white text-sm font-semibold shadow-md hover:brightness-110 disabled:opacity-60 transition-all"
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>

    {/* Rodapé */}
    <div className="mt-8 text-center text-sm text-slate-500">
      <p>
        Não tem uma conta?{" "}
        <span className="font-medium text-[#7c3aed]">Fale com a escola</span>
      </p>
    </div>
  </div>
</div>
    </div>
  );
}
