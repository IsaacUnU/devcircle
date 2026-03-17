import es from '../i18n/locales/es.json'
import en from '../i18n/locales/en.json'
import pt from '../i18n/locales/pt.json'
import fr from '../i18n/locales/fr.json'
import de from '../i18n/locales/de.json'
import it from '../i18n/locales/it.json'
import nl from '../i18n/locales/nl.json'
import pl from '../i18n/locales/pl.json'
import ru from '../i18n/locales/ru.json'
import zh from '../i18n/locales/zh.json'
import ja from '../i18n/locales/ja.json'
import ko from '../i18n/locales/ko.json'
import ar from '../i18n/locales/ar.json'
import tr from '../i18n/locales/tr.json'
import hi from '../i18n/locales/hi.json'
import { useUIStore } from './store'

const dictionaries = {
  es, en, pt, fr, de, it, nl, pl, ru, zh, ja, ko, ar, tr, hi
}

export type Locale = keyof typeof dictionaries

// Hook for Client Components
export function useTranslation() {
  const language = useUIStore((state) => state.language)
  const dict = dictionaries[language as Locale] || dictionaries.es

  return { dict, language }
}

// Utility for Server Components (if needed later)
export function getDictionary(locale: string) {
  return dictionaries[locale as Locale] || dictionaries.es
}
