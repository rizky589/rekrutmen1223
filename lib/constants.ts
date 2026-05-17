export const APP_NAME = "Rekrutmen Mitra Statistik Tambahan 2026";
export const OFFICE_NAME = "BPS Kabupaten Labuhanbatu Utara";
export const EXAM_DURATION_SECONDS = 60 * 60;
export const TOTAL_QUESTIONS = 30;
export const ANSWER_KEYS = ["A", "B", "C", "D", "E"] as const;
export const DISTRICTS = [
  "NA IX-X",
  "MARBAU",
  "AEK KUO",
  "AEK NATAS",
  "KUALUH SELATAN",
  "KUALUH HILIR",
  "KUALUH HULU",
  "KUALUH LEIDONG",
] as const;

export const routes = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  exam: "/exam",
  admin: "/admin",
};
