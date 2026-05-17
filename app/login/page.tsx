import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, UserRound } from "lucide-react";
import { signIn } from "@/app/actions";
import { ActionForm } from "@/components/action-form";
import { LoginPasswordInput } from "@/components/login-password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#070b22] px-4 py-6 text-cyan-50">
      <div className="login-cyber-grid" />
      <div className="login-morph-shape left-[6%] top-[12%] h-36 w-36 opacity-50" />
      <div className="login-morph-shape right-[8%] top-[18%] h-56 w-56 opacity-40 [animation-delay:1.4s]" />
      <div className="login-morph-shape bottom-[8%] left-[18%] h-44 w-44 opacity-30 [animation-delay:2.8s]" />

      <section className="relative z-10 mx-auto grid min-h-[calc(100dvh-3rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1fr_460px]">
        <div className="hidden max-w-xl lg:block">
          <div className="mb-8 flex items-center gap-3">
            
              
            
            <div>
              
            </div>
          </div>

         
          <h1 className="text-5xl font-black uppercase leading-tight tracking-[0.06em] text-white drop-shadow-[0_0_24px_rgba(34,211,238,0.28)]">
            Portal Akses Ujian Online
          </h1>
          <p className="mt-5 max-w-lg text-base leading-8 text-cyan-100/70">
            Peserta masuk menggunakan nomor HP yang didaftarkan. Admin dapat masuk dengan email untuk mengelola peserta,
            soal, hasil ujian, dan pengaturan seleksi.
          </p>

          <div className="mt-8 grid max-w-lg grid-cols-2 gap-3 text-sm text-cyan-100/80">
            <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/5 p-4 backdrop-blur transition-all duration-300 ease-out hover:-translate-y-1 hover:border-orange-400 hover:bg-cyan-300/10 hover:shadow-[0_0_0_1px_rgba(251,146,60,0.8),0_0_24px_rgba(249,115,22,0.38),0_22px_55px_-32px_rgba(249,115,22,0.75)]">
              <p className="font-semibold text-white">60 Menit</p>
              <p className="mt-1 text-xs leading-5 text-cyan-100/60">Timer otomatis waktu ujian dimulai.</p>
            </div>
            <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/5 p-4 backdrop-blur transition-all duration-300 ease-out hover:-translate-y-1 hover:border-orange-400 hover:bg-cyan-300/10 hover:shadow-[0_0_0_1px_rgba(251,146,60,0.8),0_0_24px_rgba(249,115,22,0.38),0_22px_55px_-32px_rgba(249,115,22,0.75)]">
              <p className="font-semibold text-white">Aman Tercatat</p>
              <p className="mt-1 text-xs leading-5 text-cyan-100/60">Jawaban dan hasil tersimpan, Skor Otomatis.</p>
            </div>
          </div>
          <p className="mt-5 max-w-lg rounded-xl border border-cyan-300/20 bg-cyan-300/5 p-4 text-sm leading-7 text-cyan-100/70 backdrop-blur transition-all duration-300 ease-out hover:-translate-y-1 hover:border-orange-400 hover:bg-cyan-300/10 hover:shadow-[0_0_0_1px_rgba(251,146,60,0.8),0_0_24px_rgba(249,115,22,0.38),0_22px_55px_-32px_rgba(249,115,22,0.75)]">
            Tes Kompetensi merupakan salah satu tahapan pada Rekrutmen Mitra Statistik BPS 2026 yang bertujuan
            mengukur kemampuan Calon Mitra Statistik melalui tes kompetensi dasar (Tes Matematika-Tes Analogi-Tes
            Logika).
          </p>
        </div>

        <div className="mx-auto w-full max-w-[460px]">
          <div className="mb-6 flex items-center justify-center gap-3 lg:hidden">
            <Image src="/bps.png" alt="BPS" width={34} height={34} className="h-9 w-9 object-contain" priority />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold italic text-white">Badan Pusat Statistik Kabupaten Labuhanbatu Utara</p>
              <p className="text-xs tracking-[0.18em] text-emerald-300/80">SYSTEM READY</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[1.35rem] border-2 border-cyan-300/25 bg-[#0a0e27]/80 p-6 shadow-[0_0_60px_rgba(34,211,238,0.22)] backdrop-blur-xl sm:p-9">
            <span className="absolute left-3 top-3 h-5 w-5 border-l-2 border-t-2 border-cyan-300" />
            <span className="absolute right-3 top-3 h-5 w-5 border-r-2 border-t-2 border-cyan-300" />
            <span className="absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 border-cyan-300" />
            <span className="absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-cyan-300" />

            <div className="relative mb-8 overflow-hidden text-center">
              <span className="login-scan-line" />
              <h2 className="text-3xl font-black uppercase tracking-[0.18em] text-cyan-300 drop-shadow-[0_0_18px_rgba(34,211,238,0.55)]">
                Access
              </h2>
              <p className="login-status mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
                System Ready
              </p>
              <p className="mx-auto mt-4 max-w-xs text-sm leading-6 text-cyan-100/65">
                Peserta masuk dengan nomor HP. Admin masuk dengan email.
              </p>
            </div>

            <Suspense>
              <LoginForm searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </section>

      <p className="pointer-events-none fixed bottom-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-200/50">
        TIM IPDS 2026
      </p>
    </main>
  );
}

async function LoginForm({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  return (
    <ActionForm action={signIn} className="space-y-5">
      <input type="hidden" name="next" value={params.next || ""} />
      <div className="space-y-2">
        <Label htmlFor="identifier" className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-300">
          Nomor HP / Email Admin
        </Label>
        <div className="relative">
          <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-300" />
          <Input
            id="identifier"
            name="identifier"
            inputMode="email"
            autoComplete="username"
            placeholder="08xxxxxxxxxx atau admin@email.com"
            className="h-12 border-cyan-300/30 bg-cyan-300/[0.06] pl-11 font-mono text-cyan-50 placeholder:text-cyan-200/35 focus-visible:border-cyan-300 focus-visible:ring-cyan-300/40"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-300">
          Password
        </Label>
        <LoginPasswordInput />
      </div>

      <Button className="login-glow-sweep h-12 w-full overflow-hidden border-2 border-cyan-300 bg-cyan-300/10 font-mono text-sm font-black uppercase tracking-[0.22em] text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.22)] hover:bg-cyan-300/20 hover:text-white hover:shadow-[0_0_34px_rgba(34,211,238,0.45)]">
        Masuk
        <ArrowRight className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-3 py-2">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-300/30 to-cyan-300/10" />
        <span className="text-[10px] uppercase tracking-[0.22em] text-cyan-200/45">Daftar Akun</span>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent via-cyan-300/30 to-cyan-300/10" />
      </div>

      <p className="text-center text-sm text-cyan-100/65">
        Belum punya akun?{" "}
        <Link href="/register" className="font-semibold text-emerald-300 transition hover:text-cyan-200">
          Register peserta
        </Link>
      </p>
    </ActionForm>
  );
}
