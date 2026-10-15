import { createContext } from 'react';
import type { Dictionary, Lang } from './dictionaries';

export type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Dictionary;
};

export const LanguageContext = createContext<LanguageContextValue | null>(null);
