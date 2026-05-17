import { create } from "zustand";

type ExamStore = {
  answers: Record<string, string>;
  setAnswer: (questionId: string, value: string) => void;
  reset: () => void;
};

export const useExamStore = create<ExamStore>((set) => ({
  answers: {},
  setAnswer: (questionId, value) => set((state) => ({ answers: { ...state.answers, [questionId]: value } })),
  reset: () => set({ answers: {} }),
}));
