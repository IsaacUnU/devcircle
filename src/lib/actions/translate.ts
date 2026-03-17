'use server'

export async function translateText(text: string, targetLanguage: string) {
  if (!text || !targetLanguage) return null

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`
    const res = await fetch(url)
    
    if (!res.ok) throw new Error('Translation failed')
    
    const data = await res.json()
    // The data format is [[["translated text", "original text", ...], ...], ...]
    const translatedText = data[0].map((item: any) => item[0]).join('')
    
    return translatedText
  } catch (error) {
    console.error('Translation error:', error)
    throw new Error('No se pudo traducir el post')
  }
}
