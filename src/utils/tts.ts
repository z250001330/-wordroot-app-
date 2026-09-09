// 文本转语音工具 - 优先使用 Web Speech API，降级到 Google Translate TTS
let cachedVoice: SpeechSynthesisVoice | null = null

function getEnglishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null
  if (cachedVoice) return cachedVoice
  const voices = window.speechSynthesis.getVoices()
  cachedVoice =
    voices.find(v => v.lang === 'en-US' && /female|samantha|google/i.test(v.name)) ||
    voices.find(v => v.lang.startsWith('en')) ||
    null
  return cachedVoice
}

// 确保 voices 加载
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = null
    getEnglishVoice()
  }
}

export function speak(text: string, rate = 0.9): void {
  if (!text) return
  // 优先 Web Speech API
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      const voice = getEnglishVoice()
      if (voice) utterance.voice = voice
      utterance.lang = 'en-US'
      utterance.rate = rate
      utterance.pitch = 1
      window.speechSynthesis.speak(utterance)
      return
    } catch {
      // 降级
    }
  }
  // 降级：使用 Audio + Google Translate TTS
  try {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(text)}`
    const audio = new Audio(url)
    audio.play().catch(() => { /* ignore */ })
  } catch {
    // ignore
  }
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}
