"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, type Variants } from "framer-motion";
import gsap from "gsap";
import { ArrowRight, ChevronLeft, ChevronRight, FileText, LogIn, MapPinned, ShieldCheck, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME, OFFICE_NAME } from "@/lib/constants";

const slides = [
  { src: "/hero-1.png", alt: "Kegiatan pendataan mitra statistik" },
  { src: "/hero-2.png", alt: "Tim lapangan mitra statistik" },
  { src: "/hero-3.png", alt: "Koordinasi statistik lapangan" },
];

const navItems = [
  { href: "#tentang", label: "" },
  { href: "#jadwal", label: "" },
  { href: "#faq", label: "" },
];

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.12 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
};

export function LandingPage() {
  const [active, setActive] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const accentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((value) => (value + 1) % slides.length);
    }, 4800);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 18);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!accentRef.current) return;
    const animation = gsap.to(accentRef.current, {
      y: 16,
      x: -10,
      duration: 3.4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    return () => {
      animation.kill();
    };
  }, []);

  const slide = useMemo(() => slides[active], [active]);

  return (
    <main className="min-h-dvh overflow-hidden bg-[#fff8f1] text-slate-950">
      <header className={`fixed inset-x-0 top-0 z-40 pt-[var(--safe-top)] transition-all duration-300 ${scrolled ? "bg-white/82 shadow-sm backdrop-blur-md" : "bg-transparent"}`}>
        <div className="app-container flex min-h-16 items-center justify-between gap-2 px-4 py-2 sm:gap-3 sm:px-5 sm:py-0 md:px-6 lg:px-8 xl:px-10 2xl:max-w-[88rem] 2xl:px-12">
          <Link href="/" className="flex min-h-11 min-w-0 flex-1 items-center gap-0">
            <Image src="/bps.png" alt="Logo BPS" width={64} height={64} className="h-15 w-15 shrink-0 object-contain -mr-1 sm:h-14 sm:w-14" />
            <span className="-ml-1 min-w-0 text-[12px] font-semibold italic leading-3 sm:text-sm sm:leading-4">Badan Pusat Statistik <br />Kabupaten Labuhanbatu Utara</span>
          </Link>
          <nav className="hidden items-center gap-20 text-xs font-semibold text-slate-700 md:flex">
            <Link href="/" className="text-orange-600"></Link>
            {navItems.map((nav) => <Link key={nav.href} href={nav.href}>{nav.label}</Link>)}
          </nav>
          <Button asChild size="sm" className="min-h-10 shrink-0 px-3 text-sm bg-orange-600 text-white hover:bg-orange-700 sm:min-h-11 sm:px-4">
            <Link href="/login"><LogIn className="h-4 w-4" /> <span>Masuk</span><span className="hidden sm:inline"> / Daftar</span></Link>
          </Button>
        </div>
      </header>

      <section className="relative min-h-dvh px-4 pb-[calc(4rem_+_var(--safe-bottom))] pt-[calc(6rem_+_var(--safe-top))] sm:px-5 sm:pt-[calc(7.5rem_+_var(--safe-top))] md:px-6 md:pt-[calc(7rem_+_var(--safe-top))] lg:px-8 xl:px-10 2xl:px-12">
        <div className="absolute inset-0 bg-[linear-gradient(110deg,#fffaf4_0%,#fff4e5_42%,#fed7aa_100%)]" />
        <div className="absolute right-0 top-0 h-[70dvh] w-[62vw] rounded-bl-[8rem] bg-orange-200/50" />
        <div ref={accentRef} className="absolute bottom-20 right-8 h-32 w-32 rounded-full border border-orange-300/50 opacity-60" />

        <div className="app-container landing-hero-grid relative min-h-[calc(100dvh_-_10rem)] items-start gap-8 sm:gap-8 md:gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start xl:gap-12 2xl:max-w-[88rem] 2xl:gap-14">
          <motion.div variants={container} initial="hidden" animate="show" className="max-w-2xl">
            <motion.h1 variants={item} className="responsive-headline font-extrabold leading-tight tracking-normal text-slate-950">
              Rekrutmen <span className="block text-orange-600">Mitra Statistik Tambahan 2026</span>
            </motion.h1>
            <motion.p variants={item} className="mt-5 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
              Bergabunglah menjadi bagian dari {APP_NAME} bersama {OFFICE_NAME}. Seleksi berlangsung cepat,
              transparan, dan berbasis sistem online terintegrasi untuk mendukung pelaksanaan kegiatan statistik
              tahun 2026.
            </motion.p>
            <motion.div variants={item} className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="bg-orange-600 text-white shadow-lg shadow-orange-600/20 hover:bg-orange-700">
                <Link href="/register">Daftar Sekarang <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" className="border-orange-200 bg-white/70 text-orange-700 hover:bg-orange-50">
                <Link href="https://www.youtube.com/watch?v=tv8odFuYg9s" target="_blank" rel="noopener noreferrer">
                  <FileText className="h-4 w-4" /> Lihat Panduan Aplikasi
                </Link>
              </Button>
            </motion.div>
            <motion.div variants={item} className="mt-10 flex items-center gap-3">
              {slides.map((entry, index) => (
                <button
                  key={entry.src}
                  type="button"
                  className="grid min-h-11 min-w-11 place-items-center rounded-full"
                  aria-label={`Slide ${index + 1}`}
                  onClick={() => setActive(index)}
                >
                  <span className={`h-1.5 rounded-full transition-all ${active === index ? "w-9 bg-orange-600" : "w-5 bg-orange-200"}`} />
                </button>
              ))}
              <button type="button" className="ml-1 grid h-11 w-11 place-items-center rounded-full bg-white text-orange-600 shadow-sm" onClick={() => setActive((active + slides.length - 1) % slides.length)} aria-label="Slide sebelumnya">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button type="button" className="grid h-11 w-11 place-items-center rounded-full bg-orange-600 text-white shadow-sm" onClick={() => setActive((active + 1) % slides.length)} aria-label="Slide berikutnya">
                <ChevronRight className="h-4 w-4" />
              </button>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.98, x: 24 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ duration: 0.7, ease: "easeOut" }} className="relative aspect-[16/10] w-full lg:-mt-1 xl:-mt-2">
            <div className="absolute inset-0 overflow-hidden rounded-[2rem] bg-gradient-to-br from-orange-50 via-white to-orange-100">
              <Image
                key={slide.src}
                src={slide.src}
                alt={slide.alt}
                fill
                priority
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,248,241,0.24)_0%,rgba(255,248,241,0.04)_45%,rgba(234,88,12,0.16)_100%)]" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,transparent,rgba(234,88,12,0.22))]" />
            </div>
          </motion.div>
        </div>
      </section>

      <section id="tentang" className="bg-white px-4 py-16">
        <div className="app-container">
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-normal text-slate-950">Apa itu Mitra Statistik BPS?</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              Mitra Statistik adalah individu yang membantu BPS dalam pelaksanaan kegiatan sensus dan survei statistik nasional, termasuk Sensus Ekonomi 2026.
            </p>
          </motion.div>
          <div className="landing-feature-grid gap-6 sm:grid-cols-2 sm:gap-7 md:grid-cols-2 md:gap-8 lg:grid-cols-3 xl:grid-cols-3 xl:gap-9 2xl:grid-cols-3 2xl:gap-10">
            {[
              { icon: UsersRound, title: "Terbuka untuk Umum", text: "Siapa saja yang memenuhi syarat dan bukan ASN dapat mendaftar sebagai Calon Mitra Statistik BPS untuk membantu pelaksanaan Sensus Ekonomi 2026." },
              { icon: ShieldCheck, title: "Proses Seleksi Transparan", text: "Seluruh tahapan rekrutmen dilakukan secara terbuka melalui aplikasi Sobat, dengan kriteria seleksi yang jelas." },
              { icon: MapPinned, title: "Berbasis Wilayah", text: "Calon mitra diutamakan berdomisili di wilayah pendataan yang sama dengan BPS Kabupaten/Kota untuk memudahkan koordinasi lapangan." },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8, scale: 1.015 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                viewport={{ once: true }}
                className="group rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm transition-all duration-300 ease-out hover:border-orange-400 hover:shadow-[0_0_0_1px_rgba(251,146,60,0.75),0_0_24px_rgba(249,115,22,0.28),0_24px_60px_-34px_rgba(249,115,22,0.65)]"
              >
                <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-lg bg-orange-50 text-orange-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-orange-100 group-hover:shadow-[0_14px_30px_-18px_rgba(234,88,12,0.75)]">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="font-bold text-slate-950">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{feature.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 px-4 py-5 text-center text-xs font-medium text-white">
        © 2026 TIM IPDS. All rights reserved.
      </footer>
    </main>
  );
}
