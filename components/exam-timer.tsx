"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Clock3 } from "lucide-react";
import { EXAM_DURATION_SECONDS } from "@/lib/constants";

export function ExamTimer({ startedAt }: { startedAt: string }) {
  const [left, setLeft] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateRemaining = () => {
      const next = getRemainingSeconds(startedAt);
      if (next === 0) {
        window.setTimeout(() => {
          document.querySelector<HTMLFormElement>("form")?.requestSubmit();
        }, 100);
      }
      setLeft(next);
    };
    const initialTimer = window.setTimeout(updateRemaining, 0);
    const timer = window.setInterval(() => {
      updateRemaining();
    }, 1000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, [startedAt]);

  useEffect(() => {
    const tick = () => setCurrentTime(formatIndonesianDateTime(new Date()));
    const initialTimer = window.setTimeout(tick, 0);
    const timer = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, []);

  const minutes = left === null ? "--" : Math.floor(left / 60).toString().padStart(2, "0");
  const seconds = left === null ? "--" : (left % 60).toString().padStart(2, "0");

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm font-semibold">
        <CalendarDays className="h-4 w-4 text-primary" />
        <span>{currentTime || "Memuat waktu..."}</span>
      </div>
      <div className="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm font-semibold">
        <Clock3 className="h-4 w-4 text-primary" />
        <span>{minutes}:{seconds}</span>
      </div>
    </div>
  );
}

function getRemainingSeconds(startedAt: string) {
  const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
  return Math.max(0, EXAM_DURATION_SECONDS - elapsed);
}

function formatIndonesianDateTime(date: Date) {
  const weekdays = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const day = date.getDate().toString().padStart(2, "0");
  const hour = date.getHours().toString().padStart(2, "0");
  const minute = date.getMinutes().toString().padStart(2, "0");

  return `${weekdays[date.getDay()]}, ${day} ${months[date.getMonth()]} ${date.getFullYear()}, ${hour}:${minute}`;
}
