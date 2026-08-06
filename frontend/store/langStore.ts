import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'uz' | 'ru';

interface LangState {
  lang: Language;
  setLang: (lang: Language) => void;
}

export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      lang: 'uz', // default language
      setLang: (lang) => set({ lang }),
    }),
    {
      name: 'aitest-lang-storage',
    }
  )
);
