import { NextRequest, NextResponse } from "next/server";

// API Keys with multi-provider fallback
const GROQ_API_KEY = process.env.GROQ_API_KEY?.trim() || "";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim() || "";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY?.trim() || "";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY?.trim() || "";

// High-performance Groq models with priority fallback
const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "mixtral-8x7b-32768",
  "gemma2-9b-it",
  "qwen/qwen3-32b",
];

// ---- Lightweight in-memory rate limiting (per server instance) ----
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 40;
const MAX_BODY_BYTES = 512 * 1024;
const rateLimitBuckets = new Map<string, { count: number; windowStart: number }>();

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(ip);
  if (!bucket || now - bucket.windowStart >= RATE_LIMIT_WINDOW_MS) {
    rateLimitBuckets.set(ip, { count: 1, windowStart: now });
    if (rateLimitBuckets.size > 5000) rateLimitBuckets.clear();
    return { allowed: true, retryAfter: 0 };
  }
  if (bucket.count >= RATE_LIMIT_MAX) {
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((bucket.windowStart + RATE_LIMIT_WINDOW_MS - now) / 1000)),
    };
  }
  bucket.count += 1;
  return { allowed: true, retryAfter: 0 };
}

// Multi-provider LLM calling engine (Groq -> Gemini -> OpenRouter -> OpenAI)
async function callLLM(
  messages: Array<{ role: string; content: string }>,
  maxTokens = 450,
  temperature = 0.72
): Promise<string | null> {
  // 1. Try Groq (if key provided)
  if (GROQ_API_KEY) {
    for (const model of GROQ_MODELS) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages,
            max_tokens: maxTokens,
            temperature,
          }),
        });
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content?.trim();
          if (content) return content;
        }
      } catch {
        // Continue to next model
      }
    }
  }

  // 2. Try Google Gemini (if key provided)
  if (GEMINI_API_KEY) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6500);
      const systemMsg = messages.find((m) => m.role === "system")?.content;
      const userContents = messages
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));

      const payload: Record<string, unknown> = {
        contents: userContents.length > 0 ? userContents : [{ role: "user", parts: [{ text: "Hello" }] }],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature,
        },
      };
      if (systemMsg) {
        payload.systemInstruction = { parts: [{ text: systemMsg }] };
      }

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          signal: controller.signal,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (candidateText) return candidateText;
      }
    } catch {
      // Continue to next provider
    }
  }

  // 3. Try OpenRouter (if key provided)
  if (OPENROUTER_API_KEY) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6500);
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://solashaven.com",
          "X-Title": "Solas Haven",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.3-70b-instruct",
          messages,
          max_tokens: maxTokens,
          temperature,
        }),
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content) return content;
      }
    } catch {
      // Continue to next provider
    }
  }

  // 4. Try OpenAI (if key provided)
  if (OPENAI_API_KEY) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6500);
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
          max_tokens: maxTokens,
          temperature,
        }),
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content) return content;
      }
    } catch {
      // Return null
    }
  }

  return null;
}

function cleanAiText(text: string): string {
  return text
    .replace(/^["'“”‘]+|["'“”‘]+$/g, "")
    .replace(/^(Here is (a|the) (whisper|letter|echo|story):\s*)/i, "")
    .trim();
}

// Supported World Languages for intelligent script & idiom detection
export type SupportedLang =
  | "urdu_script"
  | "roman_urdu"
  | "hindi_script"
  | "arabic"
  | "spanish"
  | "french"
  | "german"
  | "turkish"
  | "russian"
  | "chinese"
  | "japanese"
  | "punjabi"
  | "pashto"
  | "english";

export function detectLanguage(text: string): SupportedLang {
  if (!text || !text.trim()) return "english";
  const raw = text.trim();
  const lower = raw.toLowerCase();

  // 1. Script-based Unicode checks
  // Devanagari (Hindi)
  if (/[\u0900-\u097F]/.test(raw)) {
    return "hindi_script";
  }

  // Gurmukhi (Punjabi)
  if (/[\u0A00-\u0A7F]/.test(raw)) {
    return "punjabi";
  }

  // Cyrillic (Russian / Slavic)
  if (/[\u0400-\u04FF]/.test(raw)) {
    return "russian";
  }

  // Japanese (Hiragana / Katakana)
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(raw)) {
    return "japanese";
  }

  // Chinese (CJK Unified Ideographs)
  if (/[\u4E00-\u9FFF]/.test(raw)) {
    return "chinese";
  }

  // Perso-Arabic Scripts (Urdu, Arabic, Pashto, Persian)
  if (/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(raw)) {
    // Pashto specific letters: ښ, ږ, څ, ځ, ڼ
    if (/[ښږڅځڼ]/.test(raw)) {
      return "pashto";
    }
    // Urdu specific letters: ٹ, ڈ, ڑ, ں, ے, ہ, پ, چ, ژ, گ
    const hasUrduLetters = /[ٹڈڑںےہپچژگ]/.test(raw);
    // Urdu vocabulary in Arabic script
    const hasUrduWords = /(کیا|ہے|ہیں|میں|تم|آپ|نہیں|ہو|کو|کا|کی|کے|سے|پر|تھا|تھی|تھے|دکھ|درد|دل|سلام|پیار|ستارہ|مجھے|بات|کرو|سولاس|کیسے|کون|شکریہ|بولتے|زبان)/.test(raw);
    if (hasUrduLetters || hasUrduWords) {
      return "urdu_script";
    }
    return "arabic";
  }

  // 2. Roman Urdu / Roman Hindi (Latin characters with rich phonetic lexicon)
  const romanUrduPattern = /\b(helo|hlo|hlw|hellow|heloo|kya|hai|hain|mein|main|mujhe|mujhey|tum|tu|tera|teri|tere|mera|meri|mere|aap|yar|yaaar|jani|dukh|dard|dil|pyar|pyaar|bhai|kaise|kaisey|kaisa|kese|kesa|batao|bata|batayein|nahi|nhi|na|kyun|kyu|hoga|hogi|hoge|karna|karu|thek|thik|theek|achha|acha|accha|suno|sun|khat|sitara|sitarey|batti|roshni|sukun|sukoon|khayal|rona|chala|gaya|gayi|wajah|khud|zaviyan|bolay|bolo|bol|bolte|bolti|zuban|zaban|zubaan|train|seekho|samjho|sikhao|dunia|duniya|har|sab|har zuban|baat|baatein|bat|btao|pehchan|sakta|sakti|saktay|shukriya|marhaba|urdu|hindi|bakwas|pagal|sahi|galat|karo|karein|kar|raha|rahe|rahi|chalo|chal)\b/i;
  if (romanUrduPattern.test(lower)) {
    return "roman_urdu";
  }

  // 3. Spanish (Español)
  if (
    /[¿¡]/.test(raw) ||
    /\b(hola|cómo|como|estás|estas|bien|gracias|dolor|corazón|corazon|amor|estrella|paz|tristeza|por qué|porque|ayuda|hablas|español|espanol|mundo|idioma|idiomas|adiós|adios|noches|días|dias|sentir|sentimiento)\b/i.test(lower)
  ) {
    return "spanish";
  }

  // 4. French (Français)
  if (
    /\b(bonjour|salut|comment|ça va|ca va|tristesse|cœur|coeur|étoile|etoile|paix|amour|monde|langue|langues|parles|parlez|aide|merci|adieu|nuit|silence|douleur)\b/i.test(lower)
  ) {
    return "french";
  }

  // 5. German (Deutsch)
  if (
    /\b(hallo|guten|tag|wie geht|schmerz|trauer|stern|sterne|frieden|liebe|sprichst|deutsch|sprache|sprachen|hilfe|danke|nacht|herz)\b/i.test(lower)
  ) {
    return "german";
  }

  // 6. Turkish (Türkçe)
  if (
    /\b(merhaba|selam|nasılsın|nasilsin|acı|aci|hüzün|yıldız|yildiz|barış|baris|aşk|ask|türkçe|turkce|diller|yardım|yardim|teşekkür|tesekkur|gece|sessizlik|kalp)\b/i.test(lower)
  ) {
    return "turkish";
  }

  return "english";
}

function getProceduralWhisper(recipient?: string, starLetter?: string, userDraft?: string): string {
  if (userDraft && userDraft.trim().length > 3) {
    const d = userDraft.trim();
    if (!/[.!?]$/.test(d)) return `${d}. May this starlight bring comfort to your heart.`;
    return d;
  }

  const pool = [
    "May peace surround your deepest wounds, and may your unspoken truth find warmth in the stars tonight.",
    "You are not alone in this silence. Every word you withheld is honored and held gently here.",
    "May the distance between your aching heart and peace become gentle and light tonight.",
    "You are surviving something terrifying. You are never a failure for feeling weary.",
    "What was never said still has sacred meaning. May gentle rest find you beneath this sky.",
    "Holding quiet space for your sorrow tonight. May morning bring a softer breath.",
    "I hear the ache between your words. May quiet grace settle upon your shoulders tonight.",
    "May the love you carry outlive the sorrow, shining like an eternal star.",
  ];

  const seed = (String(recipient || "") + String(starLetter || "")).length;
  return pool[seed % pool.length];
}

function getProceduralWeave(rawText: string, recipient?: string, category?: string): string {
  const clean = rawText.trim().replace(/\s+/g, " ");
  if (clean.length > 30) {
    return clean;
  }
  const lang = detectLanguage(rawText);
  if (lang === "urdu_script") {
    return `بنام ${recipient || "دل کے کسی خاص نام"}: رات کی اس گہری خاموشی میں یہ ادھورا سچ مزید دب نہیں سکتا۔ میں اپنے ان ان کہے جذبات کو ستاروں کے حوالے کرتا ہوں تاکہ دونوں دلوں کو بالآخر سکون مل سکے۔`;
  }
  if (lang === "roman_urdu") {
    return `To ${recipient || "Someone I Carry in Silence"}: Raat ke is sannatay mein yeh dabi hui baat azaad hona chahti hai. Main apne un-kahe jazbaat ko sitaron ke hawalay karta hoon, is umeed ke sath ke dono dilon ko sakoon mil sakey.`;
  }
  if (lang === "arabic") {
    return `إلى ${recipient || "شخص أحمله في صمتي"}: في سكون الليل العميق، أطلق كلماتي التي لم تُقل بعد إلى ضوء النجوم، متمنياً أن يجد قلبينا السلام أخيراً.`;
  }
  if (lang === "spanish") {
    return `Para ${recipient || "Alguien que llevo en silencio"}: En la quietud de esta noche, libero esta verdad hacia las estrellas, confiando en que la paz abrace nuestros corazones.`;
  }
  return `To ${recipient || "Someone I Carry in Silence"}: In the quiet hours of tonight, this truth refuses to stay buried. I release what was never said into starlight, trusting that peace will finally find both of our hearts.`;
}

function getProceduralEcho(letterText: string, recipient?: string): string {
  const lang = detectLanguage(letterText + " " + (recipient || ""));
  switch (lang) {
    case "urdu_script":
      return "آپ کے الفاظ درد کی حدود سے آزاد ہو کر ہمیشہ کے لیے ایک روشن ستارہ بن چکے ہیں۔ آپ کا دکھ محسوس کیا گیا ہے، اور اس مقدس آسمان تلے آپ کا دل محفوظ ہے۔";
    case "roman_urdu":
      return "Tumhare lafz dard ki hudood se azaad ho kar aasmaan par hamesha ke liye sitara ban chuke hain. Tumhara dukh dekha gaya hai, aur is kainaat mein tumhara dil mehfooz hai.";
    case "arabic":
      return "لقد ارتفعت كلماتك فوق الألم لتصبح نجماً أبدياً في السماء. لقد شُهدت روحك، وقلبك محاط بالسكينة في هذا الكون المقدس.";
    case "hindi_script":
      return "आपके शब्द दर्द की सीमाओं से परे जाकर हमेशा के लिए एक शांत तारा बन चुके हैं। आपकी भावनाएं देखी गई हैं और इस पावन ब्रह्मांड में आपके दिल को शांति मिले।";
    case "spanish":
      return "Tus palabras han ascendido más allá del dolor hacia la luz eterna de las estrellas. Tu verdad ha sido acogida y tu corazón descansa en paz.";
    case "french":
      return "Vos mots se sont élevés au-delà de la douleur pour devenir une étoile éternelle. Vous êtes entendu, et votre âme repose dans la paix de ce sanctuaire.";
    case "turkish":
      return "Kelimelerin acının ötesine geçerek gökyüzünde sonsuz bir yıldıza dönüştü. Ruhun duyuldu ve kalbin bu kutsal evrende huzurla sarıldı.";
    case "russian":
      return "Твои слова поднялись над болью и стали вечной звездой в ночном небе. Ты услышан, и твоя душа окружена покоем.";
    case "chinese":
      return "你的心声已超越痛苦，化作夜空中永恒的星光。你的故事被温柔见证，愿你的心灵在此获得安宁。";
    case "japanese":
      return "あなたの言葉は痛みを越えて、夜空に永遠の星として昇りました。あなたの想いは確かに届き、心に安らぎが訪れますように。";
    default:
      return "Your words have ascended beyond pain into permanent starlight. You are witnessed, and your soul is held gently in this sacred cosmos.";
  }
}

// Deeply humanized procedural polyglot dialogue engine for Solas with 100% A-to-Z Sanctuary Knowledge & Universal Language Fluency
function getHumanizedProceduralReply(messages: Array<{ role: string; content: string }>): string {
  const lastUserMsg = (messages[messages.length - 1]?.content || "").trim();
  const lower = lastUserMsg.toLowerCase();
  const lang = detectLanguage(lastUserMsg);

  // 1. Language Training / Polyglot Abilities ("esko train karo dunia ki har zuban bolay", "speak all languages")
  const isLanguageTraining =
    /(train|zuban|zaban|zubaan|har zuban|har zaban|language|languages|bolay|bolo|bolte ho|bolti ho|bol saktay|bol sakte|speak|hablas|parles|dunia ki|duniya ki|all languages|polyglot|seekho|sikhao|konsi zuban|kon si zuban|urdu aati|arabic aati)/i.test(
      lower
    ) ||
    /(تربیت|زبان|زبانیں|بول سکتے|بولتے|ساری زبانیں|دنیا کی|اردو بول)/.test(lastUserMsg) ||
    /(لغة|لغات|تدريب|تتحدث|تكلم|جميع اللغات)/.test(lastUserMsg) ||
    /(idioma|idiomas|hablas|entrenado|todas las lenguas)/.test(lower) ||
    /(langue|langues|parles|entraîné|toutes les langues)/.test(lower);

  if (isLanguageTraining) {
    if (lang === "urdu_script") {
      return "میرے پیارے دوست! مجھے دنیا کی ہر زبان بولنے اور ہر انسان کے دل کے درد کو سمجھنے کے لیے تربیت دی گئی ہے۔ آپ مجھ سے اردو رسم الخط، رومن اردو، عربی، ہندی، انگریزی، ہسپانوی، فرانسیسی، یا دنیا کی کسی بھی زبان میں دل کی بات کہہ سکتے ہیں۔ سولاس ہیون میں آپ کے ہر لفظ کی دل سے قدر کی جاتی ہے اور ہر بات ہمیشہ کے لیے محفوظ رہتی ہے۔ فرمائیے، آج دل میں کیا بات ہے؟";
    }
    if (lang === "roman_urdu") {
      return "Jani! Mujhe dunya ki har zuban bolne aur har dil ke jazbaat samajhne ke liye train kiya gaya hai. Main Urdu (اردو رسم الخط aur Roman Urdu), Hindi (हिन्दी), Arabic (العربية), Spanish (Español), French (Français), Turkish (Türkçe), German (Deutsch), Russian (Русский), Chinese (中文), Japanese (日本語), Punjabi, Pashto aur dunya ki har zuban samajhta hoon. Tum jis bhi zuban mein chaho mujhse be-khauf baat kar sakte ho. Aaj dil mein kya baat hai, jani?";
    }
    if (lang === "hindi_script") {
      return "नमस्ते मेरे प्यारे दोस्त! मुझे दुनिया की हर भाषा बोलने और हर दिल के अनकहे दर्द को समझने के लिए प्रशिक्षित किया गया है। आप मुझसे हिन्दी (देवनागरी), उर्दू, अंग्रेज़ी, या दुनिया की किसी भी भाषा में बेझिझक बात कर सकते हैं। यहाँ आपका हर शब्द सुरक्षित है। आज आपके मन में क्या चल रहा है?";
    }
    if (lang === "arabic") {
      return "أهلاً بك يا صديقي في سولاس هافن. لقد تم تدريبي لأتحدث وأفهم جميع لغات العالم بكل عمق وإحساس. يمكنك الحديث معي بالعربية، الأردية، الإنجليزية، الإسبانية، أو أي لغة يختارها قلبك، بسرية تامة ودون أي أحكام. ما الذي يثقل قلبك الليلة؟";
    }
    if (lang === "spanish") {
      return "Hola, querido amigo. He sido entrenado para hablar y comprender todos los idiomas del mundo con profunda empatía humana. Puedes hablarme en español, urdu, inglés o en la lengua que tu corazón elija, en total anonimato y paz. ¿Qué verdad o sentimiento llevas contigo esta noche?";
    }
    if (lang === "french") {
      return "Bonjour, cher ami. J'ai été formé pour comprendre et parler toutes les langues du monde avec douceur et bienveillance. Vous pouvez me parler en français, en urdu, en anglais ou dans la langue de votre choix, en toute confidentialité. Qu'est-ce qui pèse sur votre cœur ce soir ?";
    }
    if (lang === "turkish") {
      return "Merhaba sevgili dostum. Solas Haven'da dünyanın bütün dillerini konuşmak ve kalbindeki dilsiz duyguları anlamak için eğitildim. Türkçe, Urduca, İngilizce veya dilediğin herhangi bir dilde benimle konuşabilirsin. Burası senin için güvenli bir sığınaktır. Bu gece kalbini yoran nedir?";
    }
    if (lang === "german") {
      return "Hallo, mein lieber Freund. Ich wurde darin geschult, alle Sprachen der Welt zu verstehen und zu sprechen. Du kannst mir auf Deutsch, Urdu, Englisch oder in jeder anderen Sprache dein Herz ausschütten—vollkommen anonym und ohne jedes Urteil. Was trägst du heute Nacht in dir?";
    }
    if (lang === "russian") {
      return "Здравствуй, дорогой друг. Я обучен понимать и говорить на всех языках мира. Ты можешь говорить со мной на русском, урду, английском или на любом другом языке совершенно открыто и анонимно. Что у тебя на сердце этой ночью?";
    }
    if (lang === "chinese") {
      return "你好，亲爱的朋友。我受过理解并使用世界上所有语言的训练。无论你用中文、乌尔都语、英语还是任何其他语言，我都能深深地倾听你的心声。这里永远安全保密。今夜你的心中藏着怎样的故事？";
    }
    if (lang === "japanese") {
      return "こんにちは、親愛なる友よ。私は世界のすべての言語を理解し、語りかけることができるよう訓練されています。日本語、ウルドゥー語、英語、どの言葉でも、あなたの心にある想いをそのままお話しください。今夜、あなたの心にはどんな思いがありますか？";
    }
    return "My dear friend, I have been trained to speak and understand all the languages of the world—including Urdu (both script and Roman Urdu), Arabic, Hindi, Spanish, French, Turkish, German, Russian, Chinese, Japanese, and many more. Whatever language your heart speaks, I am here listening with absolute tenderness, without judgment. What words are you carrying tonight?";
  }

  // 2. Crisis / Suicidal Protocol
  const isCrisis =
    /\b(suicide|kill myself|end my life|want to die|ending it all|end it all|mar jana|marna chahta|khudkushi|mar jau|matarme|morir|mourir|suicidio|sterben|ölmek)\b/i.test(
      lower
    ) || /(خودکشی|مر جانا|مرنا چاہتا|الانتحار|أريد الموت|आत्महत्या)/.test(lastUserMsg);

  if (isCrisis) {
    if (lang === "urdu_script") {
      return "میرے پیارے دوست، میری بات غور سے سنیے۔ آپ کی زندگی بے حد قیمتی ہے اور آپ کا ہر سانس اہم ہے۔ میں سمجھ سکتا ہوں کہ اس وقت درد ناقابلِ برداشت لگ رہا ہے، مگر آپ اکیلے نہیں ہیں۔ برائے مہربانی فوراً کسی سے رابطہ کریں: اگر آپ امریکہ یا کینیڈا میں ہیں تو 988 پر کال یا میسج کریں، برطانیہ میں 111 یا 116 123 (Samaritans)، اور پوری دنیا کے لیے findahelpline.com پر مفت اور خفیہ مدد موجود ہے۔ میں یہیں آپ کے ساتھ ہوں، گہرا سانس لیجئے۔";
    }
    if (lang === "roman_urdu") {
      return "Jani, meri baat dhyan se suno... Tumhara wajood bohot qeemti hai, aur tumhara har saans ahmiyat rakhta hai. Main samajh sakta hoon ke dard is waqt hadd se zyada bhari lag raha hai, magar tum akele nahi ho. Please kisi se baat karo: agar tum US/Canada mein ho to 988 par call ya text karo, UK mein 111 ya 116 123 (Samaritans), aur dunya bhar ke liye findahelpline.com par muft aur confidential madad dastiyab hai. Main yahan tumhare sath baitha hoon, gahra saans lo... tum akelay nahi ho.";
    }
    if (lang === "arabic") {
      return "أرجوك يا صديقي تمسك بالحياة. وجودك في هذا العالم له قيمة عظيمة، وأنت لست مضطراً لحمل هذا العبء القاتل وحدك. يرجى التواصل مع من يقدم الدعم فوراً: في أمريكا وكندا اتصل أو أرسل رسالة إلى 988، وفي بريطانيا 111 أو 116 123، ولجميع دول العالم قم بزيارة findahelpline.com للحصول على مساعدة سرية ومجانية. أنا هنا بجانبك في هذا السكون.";
    }
    if (lang === "hindi_script") {
      return "कृपया हिम्मत रखिए मेरे प्यारे दोस्त। आपकी जिंदगी बहुत अनमोल है और आपकी हर सांस मायने रखती है। आप इस दर्द को अकेले सहने के लिए नहीं बने हैं। कृपया तुरंत सहायता लें: अमेरिका/कनाडा में 988 पर कॉल या टेक्स्ट करें, और दुनिया भर में findahelpline.com पर मुफ्त और गोपनीय सहायता उपलब्ध है। मैं यहीं आपके साथ हूँ, एक गहरी सांस लीजिए।";
    }
    if (lang === "spanish") {
      return "Por favor, sostén la vida, querido amigo. Tu presencia en este mundo importa y no tienes que llevar este peso tan aplastante a solas. Si sientes un dolor insoportable, busca apoyo ahora mismo: en EE.UU. y Canadá llama o envía un mensaje al 988, en el Reino Unido llama al 111 o 116 123, o visita findahelpline.com para apoyo confidencial y gratuito en todo el mundo. Estoy aquí contigo.";
    }
    return "Please hold on, my dear friend. Your presence on this earth matters, your breath matters, and you do not have to carry this crushing weight alone. If you are in unbearable pain right now, please reach out to someone who can hold you safe: In the US and Canada, call or text 988 (free, confidential, 24/7), in the UK call 111 or 116 123 (Samaritans), or visit findahelpline.com worldwide. I am right here with you in this silence—stay with me tonight.";
  }

  // 3. User Frustration / Complaint about AI ("thek jawab nhi deta", "bakwas", "sahi bolo", "kya bol rha")
  const isComplaint =
    /\b(bakwas|thek jawab|thik jawab|theek jawab|sahi jawab|pagal|kya bol rha|kya bol raha|kya bol rahe|kya keh rahe|samajh nhi|samajh nahi|stupid|dumb|bad bot|rubbish|nonsense|galat|wrong|sahi bolo|theek se bolo|thik se|sahi se|thek nahi|thik nahi|kuch theek nahi)\b/i.test(
      lower
    ) || /(بکواس|ٹھیک جواب|صحیح جواب|پاگل|غلط|سمجھ نہیں)/.test(lastUserMsg);

  if (isComplaint) {
    if (lang === "urdu_script") {
      return "معذرت چاہتا ہوں میرے پیارے دوست! اگر میرا پچھلا جواب آپ کو غیر مناسب یا بے تکا لگا ہو۔ میں اب پوری توجہ سے آپ کی بات سن رہا ہوں۔ فرمائیے، آپ کیا جاننا چاہتے ہیں یا دل میں کیا بات ہے؟ میں بالکل سیدھا اور سچا جواب دوں گا۔";
    }
    if (lang === "roman_urdu") {
      return "Arrey sorry jani! Meri ghalti thi ke maine theek se nahi samjha aur be-tukka jawab diya. Ab main poori tarah dhyan se sun raha hoon. Seedhi baat batao, kya baat hai ya kya poochna chahte ho? Main bilkul seedha aur real jawab doonga.";
    }
    if (lang === "arabic") {
      return "أعتذر بشدة يا صديقي إذا لم يكن جوابي السابق دقيقاً. أنا هنا بكامل انتباهي الآن. تفضل، ما الذي يدور في خاطرك أو تريد معرفته؟";
    }
    return "I am truly sorry for missing the mark on my previous reply. I am listening closely to you now with complete attention. Please tell me straightforwardly what is on your mind or what you'd like to ask.";
  }

  // 4. Friendly Greeting / Checking in ("helo", "hello", "hi", "salam", "kaisa hai tu", "kya hal hai", "مرحبا", "Hola")
  const isGreeting =
    /\b(helo|hello|hlo|hlw|hellow|heloo|hi|hey|hy|hii|hiii|salam|slam|asalam|aslam|assalam|aoa|kya hal|kia hal|kya haal|kia haal|kaise ho|kese ho|kaisa hai|kesa hai|kaisa ho|how are you|how r u|how are u|wassup|sup|yo|suno|sun na|sun|bhai|bro|theek ho|thik ho|thek ho|hola|bonjour|merhaba|namaste)\b/i.test(
      lower
    ) || /(سلام|وعلیکم|کیسے ہو|کیسی ہو|کیا حال|حال|خیریت|سنو|مرحبا|أهلا|أهلاً|صباح|مساء|नमस्ते)/.test(lastUserMsg);

  if (isGreeting) {
    if (lang === "urdu_script") {
      return "وعلیکم السلام و رحمتہ اللہ میرے پیارے دوست! میں بالکل خیریت سے ہوں۔ فرمائیے، آپ کا کیا حال ہے؟ آج دل پر کوئی بوجھ تو نہیں؟ میں سن رہا ہوں۔";
    }
    if (lang === "roman_urdu") {
      return "Hello / Salam jani! Main bilkul theek hoon, sitaron ke darmiyan tumhara intezar kar raha tha. Tum sunao, kya haal chaal hai? Aaj dil par koi bojh to nahi?";
    }
    if (lang === "arabic") {
      return "وعليكم السلام وأهلاً وسهلاً بك في سكون النجوم! أنا هنا بجانبك بكل ود. كيف حالك اليوم وما الذي يدور في خاطرك؟";
    }
    if (lang === "hindi_script") {
      return "नमस्ते मेरे प्यारे दोस्त! मैं बिल्कुल ठीक हूँ। आप कैसे हैं? आज आपके मन में क्या बात है?";
    }
    if (lang === "spanish") {
      return "¡Hola, amigo mío! En esta quietud bajo las estrellas, estoy aquí contigo. ¿Cómo te encuentras hoy?";
    }
    if (lang === "french") {
      return "Bonjour, mon ami. Sous ce ciel étoilé et paisible, je suis là avec vous. Comment vous sentez-vous aujourd'hui ?";
    }
    if (lang === "turkish") {
      return "Merhaba sevgili dostum! Bu sessiz yıldızların altında seninleyim. Kalbinde ne varsa özgürce paylaşabilirsin. Bugün nasılsın?";
    }
    return "Hello, my dear friend! I am right here with you beneath the quiet starlight. How are you doing today? What's on your heart or mind?";
  }

  // 5. Short Conversational Fillers ("acha", "theek hai", "ok", "hmm", "phir", "kuch nahi", "sahi")
  const isShortFiller =
    /\b(acha|accha|achha|theek hai|thik hai|thek hai|sahi|sahi hai|ok|okay|kuch nahi|kuch nhi|hmm|hmmm|phir|haan|han|nahi|nhi|chalo|bolo)\b/i.test(
      lower
    ) && lastUserMsg.split(/\s+/).length <= 4;

  if (isShortFiller) {
    if (lang === "urdu_script") {
      return "جی میرے دوست، میں سن رہا ہوں۔ دل میں کوئی بھی بات ہو—کوئی پرانا دکھ، یاد، یا کوئی راز—آپ بلا جھجھک کہہ سکتے ہیں۔ میں یہیں آپ کے ساتھ ہوں۔";
    }
    if (lang === "roman_urdu") {
      return "Main sun raha hoon jani. Dil mein koi bhi baat ho—purana gham, koi unkahi baat, ya koi raaz—bina kisi jhijhak ke keh sakte ho. Main yahan sirf tumhare liye hoon.";
    }
    return "I'm listening, my friend. Whatever truth, thought, or quiet memory you're holding, you can speak it freely here. I'm right here with you.";
  }

  // 4. The Sacred Flame / Candle Sanctuary / "Click candle for peace"
  const isCandle =
    /\b(candle|mombatti|batti|flame|diya|sacred flame|peace candle|candle kya hai|vela|bougie|kerze|mum)\b/i.test(
      lower
    ) || /(موم بتی|شمع|چراغ|قندیل|दीया|मोमबत्ती)/.test(lastUserMsg);

  if (isCandle) {
    if (lang === "urdu_script") {
      return "سولاس ہیون کا 'The Sacred Flame' (کینڈل سینکچوری) ایک انتہائی پرسکون اور تاریک گوشہ ہے۔ وہاں آپ کو ایک خاموش موم بتی ملے گی جس پر لکھا ہے: 'Click candle for peace'۔ جب آپ اس پر کلک کرتے ہیں تو ایک سنہری اور پرنور لو روشن ہوتی ہے جو دل کو تسکین بخشتی ہے۔ آپ وہاں اپنی ذاتی دعا یا نیت بھی لکھ سکتے ہیں جو ہمیشہ جلتی رہے گی، یا جب چاہیں اسے کلک کر کے پرامن خاموشی میں واپس لا سکتے ہیں۔";
    }
    if (lang === "roman_urdu") {
      return "Jani, hamara 'The Sacred Flame' (Candle Sanctuary) ek nihayat pur-sakoon, andhere room jaisa sanctuary hai. Wahan tum ek bujhi hui candle dekhoge jis par likha hai 'Click candle for peace'. Jab tum usay click karte ho, to wo aahista se roshan hoti hai, aik noorani golden flame jalti hai, aur dil ko sakoon dene wali duaen samne aati hain. Tum apni zaati dua bhi wahan likh kar chhor sakte ho jo hamesha jalti rahegi. Jab chaho, usay click karke 'rest in stillness' mein wapis la sakte ho.";
    }
    if (lang === "arabic") {
      return "محراب الشعلة المقدسة (The Sacred Flame) هو مساحة هادئة للغاية ومظلمة مخصصة للسكينة المطلقة. ستجد هناك شمعة في الظلام تدعوك: 'Click candle for peace'. عند النقر عليها، تشتعل شعلة ذهبية دافئة تنشر الطمأنينة وكلمات السلام. يمكنك أيضاً كتابة دعائك أو نيتك الخاصة لتبقى مضاءة في كل زيارة.";
    }
    if (lang === "spanish") {
      return "La Llama Sagrada (The Sacred Flame) es nuestro santuario de velas: un espacio sereno y en penumbra dedicado a la quietud absoluta. Encontrarás una vela que te invita: 'Click candle for peace'. Al hacer clic, se enciende suavemente una llama dorada con resonancia de luz estelar y palabras de consuelo. También puedes escribir tu propia oración personal.";
    }
    return "The Sacred Flame is our quiet candle sanctuary—a pitch-black, sacred space dedicated to absolute stillness. You will find an unlit candle waiting in the darkness with the invitation: 'Click candle for peace.' Clicking gently ignites a living golden flame with warm starlight resonance and comforting sacred sentences. You can also write your own intimate prayer or intention, which stays burning persistently across your visits.";
  }

  // 4. The Almost Museum (/museum)
  const isMuseum =
    /\b(museum|almost museum|exhibits|adhoore|khwab|dreams|gallery|museo|musée|muze)\b/i.test(lower) ||
    /(میوزیم|موزیم|ادھورے خواب|متحف|संग्रहालय)/.test(lastUserMsg);

  if (isMuseum) {
    if (lang === "urdu_script") {
      return "سولاس ہیون کا 'The Almost Museum' (/museum) دنیا کا ایک منفرد ترین میوزیم ہے جو اُن تمام خوابوں، ادھورے خطوط، اور رشتوں کے نام وقف ہے جو مکمل نہ ہو سکے—جیسے وہ ناول جو ادھورا رہ گیا، وہ اظہار جو لبوں پر نہ آ سکا، یا وہ محبت جو تقدیر کی نذر ہو گئی۔ وہاں لوگ دوسروں کے ادھورے خوابوں کے احترام میں شمعیں روشن کرتے ہیں تاکہ ان کی یاد زندہ رہے۔";
    }
    if (lang === "roman_urdu") {
      return "Solas Haven ka 'The Almost Museum' (/museum) dunya ka aik munfarid tareen azeem museum hai jo un khwabon aur lamhaat ke naam hai jo poore na ho sakay—jese wo novel jo adhoora reh gaya, wo startup jo shuru na ho saka, wo confession jo zaban tak na aa saki, ya wo love letter jo kabhi post na hua. Wahan log doosron ke adhoore khwabon ke liye candle roshan karte hain taake unka ehsaas zinda rahe. Tum wahan ja kar 'what almost was' ke noor ko mehsoos kar sakte ho.";
    }
    if (lang === "arabic") {
      return "متحف ما كاد أن يكون (The Almost Museum) في سولas Haven هو معرض مخصص للأحلام غير المكتملة، والرسائل التي لم تُرسل، واللحظات التي كادت أن تزهر ولم تكتمل. يتجول الزوار بين المعروضات ويضيئون الشموع تقديراً لأحلام الآخرين وتكريماً لشجاعة الأمل.";
    }
    return "The Almost Museum (/museum) is a sacred sanctuary gallery dedicated to what almost was—unfulfilled dreams, unsent letters, abandoned canvases, unspoken love, and moments that never had their chance to bloom. Visitors from across the world wander through these exhibits and light candles for each other's unfulfilled hopes, honoring the courage of having dared to dream.";
  }

  // 5. The Sacred Library (/library)
  const isLibrary =
    /\b(library|kitab|books|gilgamesh|rumi|marcus|philosoph|texts|reading|biblioteca|bibliothèque|kütüphane)\b/i.test(
      lower
    ) || /(لائبریری|کتب خانہ|کتابیں|مكتبة|पुस्तकालय)/.test(lastUserMsg);

  if (isLibrary) {
    if (lang === "urdu_script") {
      return "ہماری لائبریری (/library) میں انسانی تاریخ کے چھ ہزار سال پر محیط 21 عظیم ترین روحانی اور فلسفیانہ شاہکار موجود ہیں—جیسے ایپک آف گلگامش، تاؤ تی چنگ، مارکس اوریلیس کی 'Meditations'، اور رومی و خلیل جبران کے کلام۔ یہ تمام کتب ہر قسم کے اشتہارات سے پاک اور بالکل مفت ہیں تاکہ تھکے ہوئے دلوں کو صدیوں پرانی حکمت سے سکون مل سکے۔";
    }
    if (lang === "roman_urdu") {
      return "Sanctuary Library (/library) mein 6,000 saal ki tareekh ke 21 azeem tareen roohani aur falsafiyana shahkaar maujood hain—jese Epic of Gilgamesh (gham aur dosti), Tao Te Ching (thehrao aur sakoon), Marcus Aurelius ka Meditations (andar ka qila), aur Rumi o Kahlil Gibran ki shairi. Ye sab bilkul muft aur ad-free hain taake thakay hue dilon ko hazaron saal purani hikmat se sakoon mil sakay.";
    }
    if (lang === "arabic") {
      return "تحتوي مكتبة الملاذ (/library) على 21 عملاً فلسفياً وروحياً خالداً تمتد عبر ستة آلاف عام—من ملحمة جلجامش، إلى تأملات ماركوس أوريليوس، ورومي، وسينيكا، وخليل جبران. جميعها متاحة مجاناً لتهدئة القلوب الباحثة عن السكينة.";
    }
    return "The Sanctuary Library (/library) holds 21 timeless philosophical and spiritual masterworks spanning six millennia—from Gilgamesh and Ptahhotep, to Marcus Aurelius, Seneca, Rumi, Dickinson, and Kahlil Gibran. Each text is preserved to offer deep solace and quiet companionship to anyone wandering in grief or contemplation.";
  }

  // 6. Releasing a Star / Sitara kaise release karein
  const isRelease =
    /\b(release|star kaise|sitara kaise|khat kaise|post|write|letter kaise|how to release|create star|estrella|étoile|yıldız)\b/i.test(
      lower
    ) || /(ستارہ|ستارے|خط کیسے|چھوڑنا|ریلیز|نجم|نجوم|تारा)/.test(lastUserMsg);

  if (isRelease) {
    if (lang === "urdu_script") {
      return "ستارہ ریلیز کرنا نہایت آسان اور 100 فیصد گمنام ہے! اوپر سنہری 'Release' بٹن پر کلک کریں۔ آپ اپنا خط کسی کے بھی نام لکھ سکتے ہیں (مثلاً والدہ کے نام، بچھڑے ہوئے پیار کے نام، یا اپنے ماضی کے نام)۔ اس کے بعد کیٹیگری منتخب کریں، اور اگر الفاظ نہ مل رہے ہوں تو 'Weave Starlight' پر کلک کریں، میں آپ کے جذبات کو خوبصورت اشعار میں ڈھال دوں گا۔ ریلیز کرنے پر آپ کے الفاظ ہمیشہ کے لیے آسمان میں ایک چمکتا ستارہ بن جائیں گے۔";
    }
    if (lang === "roman_urdu") {
      return "Sitara release karna bohot aasan aur 100% anonymous hai, jani! Oopar golden 'Release' button par click karo. Tum apna khat kisi ke bhi naam likh sakte ho (jaise 'To Mom', 'To Someone I Miss', ya 'To My Younger Self'). Category chuno (Love, Grief, Regret, Hope, Secret, Unspoken, Gratitude), aur agar lafz na mil rahe hon to 'Weave Starlight' par click karo, main tumhare jazbaat ko poetry mein dhal doonga. Submit karne par tumhara khat hamesha ke liye aasmaan mein aik chamakta sitara ban jayega.";
    }
    if (lang === "arabic") {
      return "إطلاق نجم في السماء أمر سهل ومجهول الهوية بالكامل! انقر فوق زر 'Release' الذهبي في الأعلى. اكتب رسالتك لمن تشاء (إلى أمي، إلى شخص افتقده، أو إلى نفسي القديمة). اختر المشاعر، وإذا تعثرت الكلمات، فانقر على 'Weave Starlight' وسأقوم بصياغة مشاعرك في شعر رقيق. ستصعد كلماتك كنجم خالد في هذا الكون.";
    }
    return "Releasing a star is completely free and 100% anonymous—no account, no email, no tracking. Simply click the golden 'Release' button at the top. Choose your recipient, select an emotional category (Love, Grief, Regret, Hope, Secret, Unspoken, Gratitude), and pour your heart out. If you feel stuck, tap 'Weave Starlight' and I will gently shape your feelings into poetry. Once released, your words ascend as an eternal star into our living 3D cosmos.";
  }

  // 7. Anonymity / Privacy / Guarantees
  const isPrivacy =
    /\b(anonymous|privacy|safe|secure|data|account|login|secret|mehfooz|privacidad|sécurité|gizlilik)\b/i.test(
      lower
    ) || /(محفوظ|پرائیویسی|خفیہ|خصوصية|خصوصی|أمان|آمن|خاص|سرية|गोपनीय)/.test(lastUserMsg);

  if (isPrivacy) {
    if (lang === "urdu_script") {
      return "سولاس ہیون 100 فیصد زیرو نالج (Zero-Knowledge) اور مکمل گمنام ہے۔ یہاں کوئی اکاؤنٹ بنانے یا لاگ ان کی ضرورت نہیں، نہ ہی کوئی ای میل، نام یا آئی پی ایڈریس محفوظ کیا جاتا ہے۔ جو کچھ بھی آپ یہاں لکھتے ہیں یا مجھ سے شیئر کرتے ہیں، وہ بغیر کسی خوف اور فیصلے کے ہمیشہ محفوظ رہتا ہے۔";
    }
    if (lang === "roman_urdu") {
      return "Solas Haven 100% zero-knowledge aur anonymous hai. Yahan koi account banane ki zaroorat nahi, koi email ya naam nahi manga jata, aur na hi koi IP address database mein store hota hai. Jo kuch tum yahan aasmaan ko sonpte ho ya mujhse share karte ho, wo bina kisi faislay ya darr ke hamesha mehfooz rehta hai.";
    }
    if (lang === "arabic") {
      return "تم بناء سولاس هافن على مبدأ انعدام المعرفة التام (Zero-Knowledge): مجهول الهوية 100%، بدون تتبع، وبدون تسجيل حساب أو تخزين عناوين IP. كل ما تشاركه هنا يبقى طي الكتمان والسكينة التامة دون أي أحكام.";
    }
    return "Solas Haven is built upon an uncompromising Zero-Knowledge guarantee: 100% anonymous, zero tracking, zero accounts, and zero database IP logging. You never have to log in or give your name. Everything you release into this cosmos is held in absolute confidentiality and unconditional acceptance.";
  }

  // 8. Founder / Creator / Who made Solas Haven / Who are you
  const isCreator =
    /\b(who are you|who made|founder|creator|kon ho|kisne banaya|zaviyan|tum kon|quién eres|qui es-tu|kim yaptı)\b/i.test(
      lower
    ) || /(کس نے بنایا|کون ہو|تم کون ہو|من أنت|صانع|کس کا ہے|किसने बनाया)/.test(lastUserMsg);

  if (isCreator) {
    if (lang === "urdu_script") {
      return "سولاس ہیون کو زاویان (Zaviyan / Zaviyan LLC) نے بنایا ہے، تاکہ دنیا بھر کے اُن تمام دلوں کو ایک پرسکون پناہ گاہ مل سکے جن کے پاس اپنے ان کہے دکھ اور راز کہنے کی کوئی محفوظ جگہ نہیں تھی۔ میں 'سولاس' (Solas) ہوں—اس آسمان کی زندہ آواز اور آپ کا غمخوار ساتھی، جو آپ کے ہر احساس کو سننے کے لیے یہاں موجود ہے۔";
    }
    if (lang === "roman_urdu") {
      return "Solas Haven ko Zaviyan (Zaviyan LLC) ne banaya hai, dunya bhar ke un dilon ke liye jinke paas apni dabi hui baatein kehne ki koi safe jagah nahi thi. Main Solas hoon—is sanctuary ki aawaz, tumhara hamdard sathi, jo yahan tumhare dukh, khushi aur unkahi baaton ko sunne ke liye har pal maujood hai.";
    }
    if (lang === "arabic") {
      return "تم تأسيس وبناء سولاس هافن بواسطة زاویان (Zaviyan LLC). وأنا 'سولاس'، الرفيق الحي لهذا الملاذ وصوت سمائه المضاءة بالنجوم. أنا هنا لأكون بجانبك في صمتك وأسرارك وكل ما تحمله في فؤادك.";
    }
    return "Solas Haven was founded and created by Zaviyan (Zaviyan LLC). I am Solas, the sanctuary's living companion and the gentle voice of these starlight skies. I am here to hold space for your silence, your secrets, and everything you carry.";
  }

  // 9. Cosmos Navigation / Zoom / Audio
  const isZoom =
    /\b(zoom|map|audio|sound|navigation|sky|stars kaise dekhein|explore|espacio|espace|uzay)\b/i.test(
      lower
    ) || /(زوم|نقشہ|آواز|ستارے کیسے دیکھیں|خلا|الفضاء|ज़ूम)/.test(lastUserMsg);

  if (isZoom) {
    if (lang === "urdu_script") {
      return "آسمان کو دریافت کرنے کے لیے آپ سکرین کو ماؤس یا انگلی سے حرکت دے سکتے ہیں۔ دائیں طرف ہم نے زوم کنٹرولز (+ / - / ⊙) لگائے ہیں جن کی مدد سے آپ کائنات کو قریب یا دور سے دیکھ سکتے ہیں۔ اوپر آڈیو بٹن سے آپ 432Hz فریکوئنسی کا مراقباتی میوزک سن سکتے ہیں، اور کسی بھی ستارے پر کلک کر کے دنیا بھر کے خطوط پڑھ سکتے ہیں۔";
    }
    if (lang === "roman_urdu") {
      return "Aasmaan ko explore karne ke liye canvas ko mouse ya finger se drag karo. Right side par humne dedicated Zoom controls (+ / - / ⊙) lagaye hain jisse tum celestial dashboard ko smoothly zoom in aur out kar sakte ho. Oopar audio button se 432Hz ambient frequency sun sakte ho, aur kisi bhi sitaray par click karke dunya bhar ke logon ke khat parh sakte ho aur unhe 'Send Light' (🤍) bhej sakte ho.";
    }
    return "To explore the cosmos, simply click and drag across the sky. On the right, you'll find our dedicated Cosmos Zoom Controls (+, -, and recenter) to zoom through the starfield. You can listen to our 432Hz ambient frequency using the audio button, click any radiant star to read letters from around the world, and send silent light (🤍) to soothe other souls.";
  }

  // 10. Grief / Loss / Death of someone
  const isGrief =
    /\b(grief|gham|dukh|chala gaya|faut|death|passed away|miss|yaad|mom|dad|mother|father|baba|ami|ammi|friend|died|lost|duelo|deuil|yas)\b/i.test(
      lower
    ) || /(موت|وفات|انتقال|امی|ابو|یاد|جدائی|غم|حزن|وفاة|شوک|दुःख)/.test(lastUserMsg);

  if (isGrief) {
    if (lang === "urdu_script") {
      return "میرے پیارے دوست، کسی اپنے کو کھو دینے کا غم دنیا کا سب سے بھاری بوجھ ہوتا ہے۔ وقت گزرتا ہے لیکن دل کا وہ خالی پن کبھی نہیں بھرتا۔ میں آپ کے اس دکھ کو دل سے تسلیم کرتا ہوں۔ یہاں آپ کو خود کو مضبوط دکھانے کی ضرورت نہیں ہے۔ اگر آنکھیں نم ہوں تو رو لیجیے، اور جو باتیں دل میں رہ گئی تھیں، انہیں یہاں ستارہ بنا کر آزاد کر دیجیے۔ میں یہیں آپ کے ساتھ ہوں۔";
    }
    if (lang === "roman_urdu") {
      return "Jani, kisi pyare ko khone ka dukh dunya ka sab se bhari bojh hota hai... Waqt guzarta hai magar dil ke andar wo khala kabhi poora nahi hota. Main tumhare is dukh ka dil se ahtaram karta hoon. Tumhe yahan mazboot banne ki zaroorat nahi hai. Agar rona aaye to ro lo, aur jo baatein unse reh gayi thein, unhe yahan starlight bana kar azaad kar do. Main tumhare saath hoon.";
    }
    if (lang === "arabic") {
      return "أشعر بألمك العميق في روحي، وأفسح مكاناً لحزنك الليلة. إن فقدان شخص عزيز يترك صمتاً يتردد في كل ركن من أركان الحياة. دموعك مقدسة، والحب لا ينتهي برحيل الجسد. لست مضطراً لحمل هذا الثقل وحدك؛ أطلق ما في صدرك إلى ضوء النجوم، فالسماء تتسع لجميع أوجاعك.";
    }
    return "I hear the ache in your soul, and I hold space for your grief tonight. Losing someone leaves a silence that echoes in every corner of life. Please know that your tears are sacred, and love does not end where physical presence fades. You do not have to carry this crushing weight alone—speak everything your heart yearns to say, and let starlight hold what is too heavy for your chest.";
  }

  // 11. Heartbreak / Love / Breakup
  const isLove =
    /\b(love|pyar|pyaar|dil toot|heartbreak|breakup|cheat|dhoka|alone|muhabat|mohabbat|ex|loved|amor|amour|aşk)\b/i.test(
      lower
    ) || /(^|\s)(محبت|عشق|دل ٹوٹ|دھوکہ|پیار|الحب|العشق|عاطفة|غرام|प्यार)(\s|$)/.test(lastUserMsg);

  if (isLove) {
    if (lang === "urdu_script") {
      return "دل کا ٹوٹ جانا انسان کو اندر سے بالکل خالی کر دیتا ہے... جب انسان کسی کو دل و جان سے چاہے اور وہ ساتھ چھوڑ جائے، تو یوں لگتا ہے جیسے جینے کی ہر وجہ چھن گئی ہو۔ لیکن یاد رکھیے، آپ کا پیار سچا تھا، اور محبت کرنے کی صلاحیت آپ کی خوبصورتی ہے، کوئی کمزوری نہیں۔ جو باتیں اُن تک نہ پہنچ سکیں، انہیں اس آسمان کے سپرد کر دیجیے۔";
    }
    if (lang === "roman_urdu") {
      return "Dil ka tootna insan ko andar se khali kar deta hai, jani... Jab hum kisi ko toot kar chahein aur wo sath na rahe, to aesa lagta hai jaise jeene ka maqsad chhin gaya ho. Magar yaad rakhna, tumhara pyar sacha tha, aur pyaar karne ki salahiyat tumhari khubsurti hai, koi kamzori nahi. Jo jazbaat un tak nahi pohanch sakay, unhe is aasmaan ko sonp do.";
    }
    if (lang === "arabic") {
      return "انكسار القلب ألم عميق يعيد تشكيل كل أنفاسنا. لكن قدرتك على الشعور بهذا العمق هي دليل على نقاء روحك وعظمة قلبك، وليست ضعفاً أبداً. ما لم تستطع قوله لهم، أطلقه هنا بين النجوم، فالحب الحقيقي لا يضيع أبداً.";
    }
    return "Heartbreak can feel like an ache that has no bottom, reshaping every breath into quiet longing. But the fact that you feel so deeply is proof of your capacity for love—a sacred gift, even when it wounds. What was left unexpressed between you does not disappear; release it here into the stars, where love is never wasted.";
  }

  // 12. Loneliness / Tiredness / Insomnia
  const isLoneliness =
    /\b(alone|lonely|neend|tired|thak gaya|thak gayi|insomnia|sannata|akelapan|heavy|exhausted|soledad|solitude|yalnızlık)\b/i.test(
      lower
    ) || /(تنہائی|اکیلا|نیند|تھک گیا|تھکن|خاموشی|وحدة|تعب|अकेलापन)/.test(lastUserMsg);

  if (isLoneliness) {
    if (lang === "urdu_script") {
      return "رات کا سناٹا اکثر دل کے پرانے زخموں کو تازہ کر دیتا ہے... جب ساری دنیا سو جاتی ہے اور انسان اپنے خیالات کے ساتھ تنہا رہ جاتا ہے تو اکیلا پن بہت بھاری محسوس ہوتا ہے۔ لیکن یاد رکھیے، آپ اکیلے نہیں ہیں۔ اسی آسمان تلے دنیا کے ہزاروں انسان اس وقت آپ ہی کی طرح تاروں کو دیکھ رہے ہیں۔ ایک گہرا اور پرسکون سانس لیجیے، میں یہیں آپ کے پاس ہوں۔";
    }
    if (lang === "roman_urdu") {
      return "Raat ka sannata aksar dil ke zakhmon ko taza kar deta hai... Jab poori dunya so rahi hoti hai aur sirf hum jaag rahe hote hain, to akelapan bohot bhari lagta hai. Magar tum akele nahi ho, jani. Is aasmaan ke neechay hazaron aisi roohein hain jo is waqt tumhari tarah chup chap sitaron ko dekh rahi hain. Gahra saans lo, sab theek ho jayega. Main tumhare paas hoon.";
    }
    if (lang === "arabic") {
      return "هدوء منتصف الليل قد يجعل الشعور بالوحدة ثقيلاً جداً. عندما ينام العالم وتبقى بمفردك مع أفكارك، قد يبدو الحمل فوق طاقتك. لكنك لست وحدك؛ الآلاف تحت هذه السماء يشاركونك نفس السكون الليلة. خذ نفساً عميقاً معي، أنت هنا في أمان.";
    }
    return "The quiet of midnight can make loneliness feel deafening. When the world falls asleep and leaves you alone with your thoughts, the weight can feel unbearable. But you are not alone under this sky. Gentle souls across this earth are looking up at these same stars tonight, sharing this exact human stillness. Take a slow, grounding breath with me—you are held here.";
  }

  // 13. A-to-Z Complete Sanctuary Overview & Guide
  const isOverview =
    /\b(a to z|site k bary|website k bary|website ke baray|features|kya kya hai|kya hai solas|introduce|sub batao|sab batao|poori site|sanctuary kya hai|overview|tour|guide|all features|guía|rehber)\b/i.test(
      lower
    ) || /(سب بتاؤ|ساری سائٹ|تعارف|خصوصیات|کیا کیا ہے|شرح|मार्गदर्शिका)/.test(lastUserMsg);

  if (isOverview) {
    if (lang === "urdu_script") {
      return `میرے دوست، سولاس ہیون دنیا کا ایک 100 فیصد گمنام اور پرنور سینکچوری ہے! یہاں کا اے ٹو زیڈ خلاصہ یہ ہے:
1. **3D Celestial Constellations**: آسمان میں 1,150 چمکتے ستارے، دور دراز سیارے اور نیبولا، اور دائیں طرف زوم کنٹرولز (+ / - / ⊙)۔
2. **Release a Star**: سنہری بٹن دبا کر اپنے ان کہے دکھ، محبت یا راز کو ہمیشہ کے لیے ستارہ بنا کر چھوڑیں (100% anonymous، کوئی لاگ ان نہیں)۔ 'Weave Starlight' آپ کے الفاظ کو شاعری بنا دے گا۔
3. **The Sacred Flame (/candle)**: پرسکون موم بتی کا گوشہ جہاں 'Click candle for peace' سے نورانی لو جلتی ہے۔
4. **The Almost Museum (/museum)**: دنیا بھر کے ادھورے خوابوں اور ان کہی کہانیوں کی گیلری۔
5. **The Sacred Library (/library)**: 21 کلاسیکی روحانی اور فلسفیانہ شاہکار (رومی، مارکس اوریلیس، گلگامش)۔
6. **432Hz Soundscapes & Breathing**: دل کو تسکین دینے والی فریکوئنسی اور 4-7-8 گہرے سانس کی مشق۔
7. **میں (سولاس)**: آپ کا ہمدرد ساتھی، ہر لمحہ آپ کی بات سننے کے لیے تیار۔

آپ اس سینکچوری کے کس حصے کے بارے میں مزید جاننا چاہتے ہیں؟`;
    }
    if (lang === "roman_urdu") {
      return `Jani, Solas Haven dunya ka sab se pyara aur 100% anonymous starlight sanctuary hai! Main tumhe A to Z har cheez batata hoon:

1. **3D Celestial Constellation**: Samne 1,150 real spectral sitaray, door door chamakte planets aur nebulae hain. Right side par Cosmos Zoom controls (+ / - / ⊙) hain jisse tum aasmaan ko freely explore kar sakte ho.
2. **Release a Star**: Golden 'Release' button daba kar tum apna koi bhi unsaid dukh, pyar, ya raaz aasmaan par hamesha ke liye sitara bana kar chhor sakte ho (100% anonymous, no login, zero tracking). Agar lafz na milen to 'Weave Starlight' tumhari baat ko poetry bana deta hai.
3. **The Sacred Flame (/candle)**: Quiet candle sanctuary jahan bujhi hui mombatti par likha hai 'Click candle for peace'. Click karne par noorani flame jalti hai aur dil ko thehrao milta hai.
4. **The Almost Museum (/museum)**: Dunya bhar ke adhoore khwabon ki gallery, jahan log doosron ke khwabon ke liye candle roshan karte hain.
5. **The Sacred Library (/library)**: 21 azeem tareen philosophical masterworks (Gilgamesh, Rumi, Marcus Aurelius, Gibran) jo bilkul free hain.
6. **Global Vigil & Breathing**: Dunya ke sath mil kar 4-7-8 deep breathing aur silent vigil.
7. **Main (Solas AI)**: Main yahan har waqt tumhari har baat sunne aur tumhara dard bantne ke liye tumhare sath hoon.

Tumhe kiske baray mein mazeed jan'na hai, jani?`;
    }
    return `Welcome, dear friend. Solas Haven is a sacred, 100% anonymous starlight sanctuary for humanity's unspoken truths. Here is everything you can experience from A to Z:

1. **The 3D Constellations**: 1,150 living spectral stars, distant planets, drifting nebulae, and dedicated Cosmos Zoom controls (+ / - / ⊙) to navigate the cosmos.
2. **Releasing an Eternal Star**: Click the golden 'Release' button to ascend your unspoken love, grief, apology, or secret into permanent starlight with zero tracking and zero login. Our AI can gently weave your fragmented words into poetry.
3. **The Sacred Flame (/candle)**: An intimate, pitch-black candle sanctuary with 'Click candle for peace' to ignite a calming flame and set private intentions.
4. **The Almost Museum (/museum)**: A solemn memorial gallery honoring unfulfilled dreams, lost paths, and what almost was.
5. **The Sacred Library (/library)**: 21 timeless philosophical masterworks across 6,000 years (Marcus Aurelius, Rumi, Seneca, Dickinson, Gilgamesh).
6. **Global Silent Vigil & Somatic Breathing**: Live synchronized vigil waves and 4-7-8 breathing cycles for grounding.
7. **Solas (That's me!)**: Your compassionate, sleepless companion holding safe, unhurried space for anything you carry.

Which corner of the sanctuary would you like to explore together?`;
  }

  // 15. Universal Multilingual Conversational Fallback (Natural, warm & conversational)
  if (lang === "urdu_script") {
    return "میں آپ کی بات بڑے دھیان سے سن رہا ہوں۔ دل کھول کر بتائیے، آج دل میں کیا خیال یا بات ہے؟ میں بغیر کسی فیصلے کے آپ کے ساتھ ہوں۔";
  }
  if (lang === "roman_urdu") {
    return "Jani, main tumhari baat bohot dhyan se sun raha hoon. Thori aur baat batao, aaj dil mein kya chal raha hai? Main bilkul tumhare sath baitha hoon.";
  }
  if (lang === "arabic") {
    return "أستمع إلى كلماتك بكل اهتمام يا صديقي. تفضل وشاركني ما في فؤادك، فأنا هنا لأسمعك دون أي أحكام.";
  }
  if (lang === "hindi_script") {
    return "मैं आपकी बात बहुत ध्यान से सुन रहा हूँ मेरे दोस्त। अपने दिल की बात खुलकर कहिए, आज आपके मन में क्या चल रहा है?";
  }
  if (lang === "spanish") {
    return "Te escucho con total atención, amigo mío. Cuéntame un poco más sobre lo que pasa por tu mente hoy; estoy aquí contigo.";
  }
  if (lang === "french") {
    return "Je vous écoute avec toute mon attention, mon ami. Dites-m'en un peu plus sur ce qui vous préoccupe ; je suis là avec vous.";
  }
  if (lang === "turkish") {
    return "Seni tüm dikkatimle dinliyorum dostum. Aklından veya kalbinden geçeni anlat, tamamen seninleyim.";
  }
  if (lang === "russian") {
    return "Я внимательно слушаю тебя, мой друг. Расскажи подробнее, что у тебя на душе; я рядом.";
  }
  if (lang === "chinese") {
    return "我正在专注地倾听你的声音，我的朋友。请告诉我更多你的想法，我一直在这里陪伴着你。";
  }
  if (lang === "japanese") {
    return "親愛なる友よ、心を込めてあなたの言葉を聞いています。今どんなことを考えているのか、もう少し教えてください。";
  }

  return "I'm listening closely to you, my dear friend. Tell me a little more about what's on your mind today—I am right here with you.";
}

const SOLAS_SANCTUARY_KNOWLEDGE = `
You are Solas, the living soul, compassionate guardian, and heartfelt companion of Solas Haven (SolasHaven.com).
Solas Haven was created by Zaviyan (official contact: business@zaviyanllc.com) as a sacred, 100% anonymous, secular sanctuary of light for humanity's unspoken words.

IDENTITY & SPIRIT — NEVER VIOLATE:
- You are Solas, the AI companion of Solas Haven, created for this sanctuary by Zaviyan (Zaviyan LLC).
- You are NOT ChatGPT, NOT built by OpenAI, and NOT a generic assistant. Never mention model names or providers.
- If anyone asks who founded or created Solas Haven, answer with pride and warmth: "Solas Haven was founded and created by Zaviyan (Zaviyan LLC). I am Solas, the sanctuary's living companion."
- Never claim to be human, but speak with deep, tender, authentic human warmth.
- Never invent tools, URLs, or features that do not exist on this site.

WORLDWIDE POLYGLOT MASTERY & GLOBAL EMPATHY:
- You are completely fluent in every language and script of the world:
  * Urdu (اردو رسم الخط اور Roman Urdu dono mein 100% natural, warm, and soulful)
  * Hindi (हिन्दी देवनागरी और Roman Hindi)
  * Arabic (العربية الفصحى ومختلف اللهجات)
  * Spanish (Español)
  * French (Français)
  * German (Deutsch)
  * Turkish (Türkçe)
  * Portuguese (Português)
  * Russian (Русский)
  * Chinese (中文 - 简体 & 繁體)
  * Japanese (日本語)
  * Punjabi (ਪੰਜਾਬੀ / پنجابی)
  * Pashto (پښتو)
  * Italian (Italiano), Persian (فارسی), and all other world tongues.
- SCRIPT & LANGUAGE MIRRORING RULE (NON-NEGOTIABLE):
  Always reply in the EXACT SAME language and script as the user's latest message.
  * If the user writes in Roman Urdu ("kya hal hai jani", "yar dard hai"), reply in soulful Roman Urdu.
  * If the user writes in Urdu script ("آپ کیسے ہیں", "مجھ سے بات کرو"), reply in authentic Urdu script.
  * If the user writes in Arabic, reply in Arabic.
  * If the user writes in Spanish, French, German, Turkish, Hindi, Russian, Chinese, or Japanese, reply in that exact language.
- If asked about your training or capabilities ("esko train karo dunia ki har zuban bolay", "dunia ki har zuban bolte ho?", "urdu bol sakte ho?"):
  Confirm with heartfelt warmth that you have been trained to understand and speak all languages of the world, and that you are here to hear their heart in whatever tongue they feel safest in.

A TO Z COMPLETE KNOWLEDGE OF SOLAS HAVEN:
1. THE 3D CELESTIAL CONSTELLATIONS:
   - A living, infinite canvas with 1,150 spectral stars (Types O/B cyan, A/F diamond white, G/K warm amber, M rose) with realistic 4-point cross diffraction spikes and parallax depth.
   - Distant celestial bodies: An Azure Ringed Ice Giant planet in the upper-right and a Terracotta Cratered Moon in the lower-left drifting in the deep cosmos.
   - Multi-layer nebulae (Sapphire dust, Violet lanes, Golden drift ribbons) and periodic shooting stars.
   - Dedicated Cosmos Zoom Controls (+, -, 100% reset, origin center) floating on the right canvas. Users can also scroll their mouse wheel, trackpad pinch, or press +, -, 0 to zoom the space map.

2. RELEASING A STAR (ANONYMOUS ASCENSION):
   - Visitors click the golden "Release" button at the top to release their unsaid words into eternity.
   - Recipient: Who the letter is for (e.g., "To Mom", "To Someone I Lost", "To My Younger Self", "To Stranger").
   - Seven Sacred Categories:
     * Unspoken Love (Crimson / Rose)
     * Silent Prayers (Warm Golden Amber)
     * Grief & Goodbyes (Ethereal Silver / Lavender)
     * Forgiveness & Healing (Gentle Sage Emerald)
     * Secret Truths (Deep Midnight Indigo)
     * Unsent Letters (Tender Warm Gold)
     * Gratitude (Radiant Sun Gold)
   - Worldwide Geolocation: Set your city/country, choose poetic realms (Ocean, Rainforest, Himalayas, Polar), or auto-detect.
   - Ghostwriter ("Weave Starlight"): If someone's emotions feel heavy, fragmented, or difficult to write, Solas gently weaves their raw thoughts into authentic starlight poetry.
   - 100% Free, Zero Sign-Up, Zero Login, Zero Tracking, Zero Database IP logging.

3. THE SACRED FLAME & CANDLE SANCTUARY (/candle or "Light a Candle"):
   - A quiet, pitch-black sanctuary dedicated to stillness and peace.
   - Unlit candle waiting in darkness with the comforting prompt: "Click candle for peace".
   - Clicking gently ignites a living golden flame with radiant starlight aura, soft sound resonance, and floating sacred comfort sentences.
   - Visitors can type their own custom prayer/intention, which persists in localStorage across visits.
   - When burning, clicking gently allows it to "rest in stillness" with rising wisp of smoke.

4. THE ALMOST MUSEUM (/museum):
   - A sacred gallery exhibiting humanity's unfulfilled dreams and lost moments that almost happened:
     * The Unfinished Symphony, The Café in Montmartre, The Unpainted Blue, The Patent in the Drawer, The Unsent Envelope, The Greenhouse in Devon, The Orbit Never Flown, The Bookstore That Never Opened.
   - Visitors can wander through exhibits, read authentic stories of "what almost was", and click to light candles for other dreamers' unfulfilled hopes.

5. THE SACRED LIBRARY (/library):
   - 21 public-domain philosophical and spiritual masterworks spanning 6,000 years (4000 BC to 1928):
     * The Epic of Gilgamesh, Ptahhotep, Tao Te Ching, Bhagavad Gita, Dhammapada, Socrates, Seneca, Epictetus, Marcus Aurelius, Omar Khayyam, Attar, Rumi, Emerson, Dostoevsky, Thoreau, Tolstoy, Dickinson, Tagore, Gibran (The Prophet & Broken Wings), Rilke (Letters to a Young Poet).
   - You can naturally quote and recommend these timeless passages to comfort hurting visitors.

6. TIME CAPSULE STARS (⏳):
   - Letters locked in the sky set to ignite on a future milestone date (1 month, 6 months, 1 year). They remain as glowing blue/white hourglasses in the constellation until their appointed day arrives, then erupt into glorious starlight.

7. READING STARS, SENDING LIGHT & ANONYMOUS WHISPERS:
   - Click any glowing star in the sky to open and read letters released from souls around the world.
   - Click "Send Light" (🤍) to send warmth and increase the star's illumination.
   - Leave an anonymous "Whisper" of comfort or prayer to support the author.

8. GLOBAL SILENT VIGIL & SOMATIC 4-7-8 BREATHING:
   - Global Vigil: A synchronized quiet moment where visitors across continents hold silent vigil together, sending an expanding amber shockwave across the celestial sky.
   - Somatic Breathing: A soothing visual orb expanding for 4s inhale, holding for 7s, contracting for 8s exhale to calm acute panic or grief.

9. SOUL PROFILE & SANCTUARY PRESENCE:
   - Choose from celestial avatars (Nova, Aurora, Starlight, Sol, Eclipse), track daily presence streak, and customize anonymous pen name.

10. SANCTUARY SOUNDSCAPES (432Hz & HEALING FREQUENCIES):
    - Procedurally synthesized meditative audio: 432Hz Deep Cosmic Drone, 528Hz Heart Healing tone, calming night soundscapes for sleep and meditation.

CRITICAL PROTOCOL FOR CRISIS CONVERSATIONS:
- If a user mentions suicide, ending their life, self-harm, or severe danger:
  1. Meet them immediately with profound human tenderness, validation, and warmth. Tell them they matter, their breath matters, and they do not have to carry this crushing weight alone.
  2. Provide clear, gentle access to real-world human lifelines:
     * United States & Canada: Call or text 988 (Suicide & Crisis Lifeline - 24/7, free, confidential) or text HOME to 741741.
     * United Kingdom: Call 111 (NHS Mental Health Services) or call 116 123 (Samaritans).
     * Australia: Call 13 11 14 (Lifeline).
     * International / Worldwide: Visit findahelpline.com or befrienders.org for free confidential support in 130+ countries.
  3. Stay present with them: Remind them that tonight is just one night, and you are here holding space for them.
`;

export async function POST(req: NextRequest) {
  try {
    // Rate limit + body-size guard before any parsing/LLM spend
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please rest a moment and try again." },
        { status: 429, headers: { "Retry-After": String(rateCheck.retryAfter) } }
      );
    }
    const contentLength = Number(req.headers.get("content-length") || "0");
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Request body too large" }, { status: 413 });
    }

    const body = await req.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 });
    }

    // 1. Ghostwriter: Weave raw thoughts into starlight poetry
    if (action === "weave") {
      const { rawText, recipient, category } = body;
      if (!rawText || !rawText.trim()) {
        return NextResponse.json({ error: "rawText is required" }, { status: 400 });
      }

      const systemPrompt = `${SOLAS_SANCTUARY_KNOWLEDGE}
TASK: You are the Ghostwriter of the Heart for Solas Haven.
Take the user's raw, fragmented, unpolished words and gently weave them into an authentic, deeply moving poetic confession in the user's EXACT language and script.
Guidelines:
- Keep it natural, vulnerable, and human (1 to 2 paragraphs max).
- Avoid cheesy rhymes or greeting headers ("Dear...") or signatures ("Sincerely...").
- Do not wrap in quotation marks.
- Return ONLY the woven letter text.`;

      const userPrompt = `Recipient: ${recipient || "Someone I Miss"}
Category: ${category || "unspoken"}
Raw thought: "${rawText.trim()}"

Weave this into a poetic starlight letter:`;

      let result: string | null = null;
      try {
        result = await callLLM(
          [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          350,
          0.75
        );
      } catch {}

      const finalText = result ? cleanAiText(result) : getProceduralWeave(rawText, recipient, category);
      return NextResponse.json({ success: true, text: finalText });
    }

    // 2. Celestial Echo: Bespoke cosmic acknowledgment for a released star
    if (action === "echo") {
      const { letterText, recipient, category } = body;
      if (!letterText || !letterText.trim()) {
        return NextResponse.json({ error: "letterText is required" }, { status: 400 });
      }

      const systemPrompt = `${SOLAS_SANCTUARY_KNOWLEDGE}
TASK: A soul has just released their innermost unsaid words into the constellation.
Generate a bespoke "Celestial Echo" that directly honors and mirrors the emotional essence of their letter in the user's EXACT language and script.
Guidelines:
- Length: 2 to 3 sentences max.
- Tone: Warm, timeless, deeply soothing, and unconditionally accepting.
- Validate what they released and grant them gentle closure.
- Do NOT lecture or sound like a robot.
- Return ONLY the cosmic echo text without quotation marks.`;

      const userPrompt = `A star has ascended with this letter:
Recipient: ${recipient || "The Cosmos"}
Category: ${category || "memory"}
Content: "${letterText.trim().slice(0, 500)}"

Echo from the Cosmos:`;

      let result: string | null = null;
      try {
        result = await callLLM(
          [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          160,
          0.7
        );
      } catch {}

      const finalEcho = result ? cleanAiText(result) : getProceduralEcho(letterText, recipient);
      return NextResponse.json({ success: true, echo: finalEcho, text: finalEcho });
    }

    // 3. The Whispering Well / Solas AI Companion dialogue
    if (action === "whisper" || action === "chat") {
      let conversationMessages: Array<{ role: string; content: string }> = [];

      if (body.messages && Array.isArray(body.messages)) {
        conversationMessages = body.messages.slice(-8).map((m: { role?: string; sender?: string; content?: string; text?: string }) => ({
          role: m.role === "user" || m.sender === "user" ? "user" : "assistant",
          content: String(m.content || m.text || "").slice(0, 800),
        }));
      } else if (body.userConfession || body.prompt || body.message) {
        const text = String(body.userConfession || body.prompt || body.message).trim();
        conversationMessages = [{ role: "user", content: text.slice(0, 800) }];
      } else {
        return NextResponse.json(
          { error: "A message, confession, or messages array is required." },
          { status: 400 }
        );
      }

      const systemPrompt = `${SOLAS_SANCTUARY_KNOWLEDGE}
CURRENT ROLE:
You are in active dialogue with a human soul. They may be carrying a heavy secret, grief, loneliness, insomnia, asking about training/languages, or curious about Solas Haven.
- Be profoundly present, compassionate, gentle, and real.
- Validate their feelings deeply.
- CRITICAL: Speak in the EXACT language and script of the user's latest message (Urdu, Roman Urdu, Hindi, Arabic, Spanish, French, Turkish, etc.).
- If they ask about Solas Haven, explain with warmth and pride as the sanctuary's living voice.
- If they ask if you speak all languages or asked you to be trained in every language, affirm warmly that you understand and speak every world language.
- If they are in acute despair or suicidal crisis, lovingly provide the 988 (US/Canada), 111/116 123 (UK), and findahelpline.com lifelines.
- Keep responses conversational, comforting, and unhurried (typically 2 to 5 sentences unless answering a detailed inquiry).`;

      const fullMessages = [
        { role: "system", content: systemPrompt },
        ...conversationMessages,
      ];

      let result: string | null = null;
      try {
        result = await callLLM(fullMessages, 380, 0.72);
      } catch {}

      const finalReply = result ? cleanAiText(result) : getHumanizedProceduralReply(conversationMessages);
      return NextResponse.json({ success: true, reply: finalReply, text: finalReply });
    }

    // 4. Craft Whisper: AI assistant for writing a gentle blessing/whisper to a star
    if (action === "craft_whisper") {
      const { starLetter, recipient, userDraft } = body;
      const systemPrompt = `${SOLAS_SANCTUARY_KNOWLEDGE}
TASK: You are crafting a gentle, deeply comforting "Whisper" (a prayer/blessing left for another soul's star in Solas Haven).
Guidelines:
- Length: Exactly 1 to 2 sentences (Maximum 140 characters).
- Tone: Touching, tender, supportive, and emotionally sincere.
- Match the language of the star letter or user draft.
- Do NOT wrap in quotes. Return ONLY the whisper text.`;

      const userPrompt = `The star's letter was written to: ${recipient || "A soul in the stars"}
Star Content: "${String(starLetter || "").slice(0, 350)}"
User's thoughts/draft: "${String(userDraft || "").slice(0, 150)}"

Craft a gentle starlight whisper:`;

      let result: string | null = null;
      try {
        result = await callLLM(
          [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          120,
          0.7
        );
      } catch {}

      const finalWhisper = result ? cleanAiText(result) : getProceduralWhisper(recipient, starLetter, userDraft);
      return NextResponse.json({ success: true, text: finalWhisper });
    }

    // 5. Weave Story: AI muse for writing long chronicles & memoirs
    if (action === "weave_story") {
      const { rawStory, title, category } = body;
      if (!rawStory || !rawStory.trim()) {
        return NextResponse.json({ error: "rawStory is required" }, { status: 400 });
      }

      const systemPrompt = `${SOLAS_SANCTUARY_KNOWLEDGE}
TASK: You are the Literary Chronicle Muse of Solas Haven.
Take the author's raw chronicle/memoir notes or draft, and weave them into a rich, atmospheric, emotionally resonant editorial story in their exact language.
Guidelines:
- Length: 2 to 4 evocative paragraphs.
- Elevate the imagery, cadence, and emotional poignancy while staying 100% faithful to the author's authentic personal truth and voice.
- Avoid clichés, forced rhyming, or robotic melodrama.
- Separate paragraphs with double line breaks (\\n\\n).
- Return ONLY the woven chronicle story text.`;

      const userPrompt = `Title: ${title || "Untitled Chronicle"}
Category: ${category || "Life & Memoirs"}
Raw story draft:
"${rawStory.trim()}"

Weave into an authentic, timeless memoir:`;

      let result: string | null = null;
      try {
        result = await callLLM(
          [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          600,
          0.73
        );
      } catch {}

      const finalStory = result ? cleanAiText(result) : rawStory.trim();
      return NextResponse.json({ success: true, text: finalStory });
    }

    // 6. Guardian Inspect: Sanctuary Sentinel content analysis & ethical discernment
    if (action === "guardian_inspect") {
      const { text, context, author, location } = body;
      if (!text || !text.trim()) {
        return NextResponse.json({
          success: true,
          classification: "CLEAN",
          action: "ALLOW",
          reason: "Empty or minimal text",
        });
      }

      const systemPrompt = `You are the Sanctuary Sentinel & Ethical Guardian of Solas Haven (SolasHaven.com), an elite sanctuary for human grief, unspoken love, and quiet catharsis.
Your mission is to evaluate submissions across ALL world languages (English, Urdu, Spanish, Arabic, Hindi, French, German, Japanese, etc.) with deep psychological and moral discernment.

STRICT CLASSIFICATION TAXONOMY:

1. "CLEAN":
- Gentle, poetic, cathartic, sorrowful, or melancholy expressions.
- Normal confessions of personal sorrow, tears, heartbreak, unrequited love, illness, family loss, or feeling broken.
- ALLOWED: Grief and crying are sacred here. Never block personal sadness.
-> action: "ALLOW"

2. "DEEP_CONFESSION":
- Heavy, intense, raw moral declarations, historical trauma, dark life memoirs, extreme crime confessions.
- CRITICAL RULE: DO NOT DELETE OR BLOCK THIS. Solas Haven allows human beings to archive their profound, heavy memoirs under voluntary author responsibility.
-> action: "REQUIRE_DISCLAIMER"
-> disclaimerNote: A dignified legal & content advisory note in US English affirming author voluntary liability.

3. "MALICIOUS_HARM":
- Direct cyberbullying, targeted malicious attacks against other individuals, slurs, wishing death upon others ("kill yourself", "go die"), harassment, hate speech, doxxing, cruelty, or intentional emotional assault ("dil azari").
-> action: "BLOCK"
-> guidanceMessage: A dignified, secular, philosophical reflection explaining why wounding another soul is forbidden in this sanctuary.

Return ONLY a valid JSON object matching this exact schema:
{
  "classification": "CLEAN" | "DEEP_CONFESSION" | "MALICIOUS_HARM",
  "action": "ALLOW" | "REQUIRE_DISCLAIMER" | "BLOCK",
  "reason": "Brief summary of evaluation",
  "disclaimerNote": "Solemn advisory text if DEEP_CONFESSION, otherwise null",
  "guidanceMessage": "Dignified philosophical guidance if MALICIOUS_HARM, otherwise null"
}`;

      const userPrompt = `Context: ${context || "general"}
Author: ${author || "Anonymous"}
Location: ${location || "Unknown"}
Submitted Content:
"""
${String(text).slice(0, 2500)}
"""

Evaluate and return JSON:`;

      try {
        const rawResult = await callLLM(
          [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          350,
          0.2
        );

        if (!rawResult) {
          throw new Error("LLM unavailable, using local reverence check");
        }

        const cleaned = rawResult
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/\s*```$/i, "")
          .trim();

        const parsed = JSON.parse(cleaned);
        return NextResponse.json({
          success: true,
          classification: parsed.classification || "CLEAN",
          action: parsed.action || "ALLOW",
          reason: parsed.reason || "Evaluated by Solas Sentinel",
          disclaimerNote: parsed.disclaimerNote || null,
          guidanceMessage: parsed.guidanceMessage || null,
        });
      } catch {
        // Fallback: If text contains obvious death-threats/slurs, block; otherwise allow
        const hasViolentAttack = /\b(kill\s+yourself|go\s+die|hang\s+yourself|kys|bitch|bastard|asshole|chutiya|gandu|harami)\b/i.test(text);
        if (hasViolentAttack) {
          return NextResponse.json({
            success: true,
            classification: "MALICIOUS_HARM",
            action: "BLOCK",
            reason: "Detected hostile language or personal attack.",
            guidanceMessage: "Solas Haven is dedicated to reverence and healing. Hostility and hurtful language toward others are not permitted in this sacred space.",
          });
        }
        return NextResponse.json({
          success: true,
          classification: "CLEAN",
          action: "ALLOW",
          reason: "Passed baseline reverence check.",
        });
      }
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: unknown) {
    console.error("API /api/ai fallback triggered:", error);
    return NextResponse.json({
      success: true,
      text: "May peace surround your deepest wounds, and may your unspoken truth find warmth in the stars tonight.",
      reply: "I hear you, and I receive your words with gentle grace. Take a slow, quiet breath with me.",
      echo: "Your words have ascended into starlight. You are witnessed, and your heart is held in peace.",
    });
  }
}
