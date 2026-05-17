export type Role = "admin" | "user";
export type ParticipantStatus = "passed_adm" | "blocked";
export type AnswerKey = "A" | "B" | "C" | "D" | "E";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  nik: string | null;
  phone: string | null;
  birth_date: string | null;
  district: string | null;
  participant_id: string | null;
  role: Role;
  avatar_url: string | null;
  created_at: string;
};

export type Participant = {
  id: string;
  full_name: string;
  nik: string | null;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  district: string | null;
  registered_user_id: string | null;
  status: ParticipantStatus;
  created_at: string;
};

export type Question = {
  id: string;
  order_number: number;
  prompt: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
  correct_answer: AnswerKey;
  category: string | null;
  is_active: boolean;
  created_at: string;
};

export type ExamAttempt = {
  id: string;
  user_id: string;
  participant_id: string | null;
  started_at: string;
  submitted_at: string | null;
  score: number | null;
  grade: number | null;
  result_status: "passed" | "failed" | null;
  duration_seconds: number | null;
  status: "in_progress" | "submitted" | "expired";
};

export type AppSetting = {
  key: string;
  value: string;
};
