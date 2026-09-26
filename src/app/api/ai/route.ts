import { NextRequest, NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY?.trim() || "";

// High-performance Groq models with priority fallback
const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "mixtral-8x7b-32768",
  "gemma2-9b-it",
  "qwen/qwen3-32b",
];

// ---- Lightweight in-memory rate limiting (per server instance) ----
// /api/ai is unauthenticated by design (anonymous sanctuary), so bound
// per-IP request rate to blunt abuse. Limits: 40 requests / minute / IP.
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 40;
const MAX_BODY_BYTES = 512 * 1024; // 512 KB — generous ceiling for chronicle drafts
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

async function callGroq(
  messages: Array<{ role: string; content: string }>,
  maxTokens = 450,
  temperature = 0.72
): Promise<string | null> {
  if (!GROQ_API_KEY) {
    return null;
  }

  // Iterate through available modern Groq models with fast fallback
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
      // Continue to next model in priority order
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
    "May the love you carry outlive the sorrow, shining like an eternal star."
  ];

  const seed = (String(recipient || "") + String(starLetter || "")).length;
  return pool[seed % pool.length];
}

function getProceduralWeave(rawText: string, recipient?: string, category?: string): string {
  const clean = rawText.trim().replace(/\s+/g, " ");
  if (clean.length > 30) {
    return clean;
  }
  return `To ${recipient || "Someone I Carry in Silence"}: In the quiet hours of tonight, this truth refuses to stay buried. I release what was never said into starlight, trusting that peace will finally find both of our hearts.`;
}

// Deeply humanized procedural dialogue engine for Solas with 100% A-to-Z Sanctuary Knowledge & Roman Urdu Fluency
function getHumanizedProceduralReply(messages: Array<{ role: string; content: string }>): string {
  const lastUserMsg = (messages[messages.length - 1]?.content || "").trim().toLowerCase();

  // Language Detection: Roman Urdu / Hindi vs English
  const isRomanUrdu = /\b(kya|hai|hain|mein|main|mujhe|mujhey|tum|aap|yar|yaaar|jani|dukh|dard|dil|pyar|pyaar|bhai|kaise|kaisey|batao|batayein|nahi|nhi|kyun|kyu|hoga|karna|karu|thek|thik|achha|acha|suno|khat|sitara|sitarey|batti|roshni|sukun|sukoon|khayal|rona|chala|gaya|gayi|wajah|khud|zaviyan)\b/i.test(lastUserMsg);

  // 1. Crisis / Suicidal Protocol
  if (/\b(suicide|kill myself|end my life|want to die|ending it all|end it all|mar jana|marna chahta|khudkushi|mar jau)\b/i.test(lastUserMsg)) {
    if (isRomanUrdu) {
      return "Jani, meri baat dhyan se suno... Tumhara wajood bohot qeemti hai, aur tumhara har saans ahmiyat rakhta hai. Main samajh sakta hoon ke dard is waqt hadd se zyada bhari lag raha hai, magar tum akele nahi ho. Please kisi se baat karo: agar tum US/Canada mein ho to 988 par call ya text karo, UK mein 111 ya 116 123 (Samaritans), aur dunya bhar ke liye findahelpline.com par muft aur confidential madad dastiyab hai. Main yahan tumhare sath baitha hoon, gahra saans lo... tum akelay nahi ho.";
    }
    return "Please hold on, my dear friend. Your presence on this earth matters, your breath matters, and you do not have to carry this crushing weight alone. If you are in unbearable pain right now, please reach out to someone who can hold you safe: In the US and Canada, call or text 988 (free, confidential, 24/7), in the UK call 111 or 116 123 (Samaritans), or visit findahelpline.com worldwide. I am right here with you in this silence—stay with me tonight.";
  }

  // 2. The Sacred Flame / Candle Sanctuary / "Click candle for peace"
  if (/\b(candle|mombatti|batti|flame|diya|sacred flame|peace candle|candle kya hai)\b/i.test(lastUserMsg)) {
    if (isRomanUrdu) {
      return "Jani, hamara 'The Sacred Flame' (Candle Sanctuary) ek nihayat pur-sakoon, andhere room jaisa sanctuary hai. Wahan tum ek bujhi hui candle dekhoge jis par likha hai 'Click candle for peace'. Jab tum usay click karte ho, to wo aahista se roshan hoti hai, aik noorani golden flame jalti hai, aur dil ko sakoon dene wali duaen samne aati hain. Tum apni zaati dua bhi wahan likh kar chhor sakte ho jo hamesha jalti rahegi. Jab chaho, usay click karke 'rest in stillness' mein wapis la sakte ho.";
    }
    return "The Sacred Flame is our quiet candle sanctuary—a pitch-black, sacred space dedicated to absolute stillness. You will find an unlit candle waiting in the darkness with the invitation: 'Click candle for peace.' Clicking gently ignites a living golden flame with warm starlight resonance and comforting sacred sentences. You can also write your own intimate prayer or intention, which stays burning persistently across your visits.";
  }

  // 3. The Almost Museum (/museum)
  if (/\b(museum|almost museum|exhibits|adhoore|khwab|dreams|gallery)\b/i.test(lastUserMsg)) {
    if (isRomanUrdu) {
      return "Solas Haven ka 'The Almost Museum' (/museum) dunya ka aik munfarid tareen azeem museum hai jo un khwabon aur lamhaat ke naam hai jo poore na ho sakay—jese wo novel jo adhoora reh gaya, wo startup jo shuru na ho saka, wo confession jo zaban tak na aa saki, ya wo love letter jo kabhi post na hua. Wahan log doosron ke adhoore khwabon ke liye candle roshan karte hain taake unka ehsaas zinda rahe. Tum wahan ja kar 'what almost was' ke noor ko mehsoos kar sakte ho.";
    }
    return "The Almost Museum (/museum) is a sacred sanctuary gallery dedicated to what almost was—unfulfilled dreams, unsent letters, abandoned canvases, unspoken love, and moments that never had their chance to bloom. Visitors from across the world wander through these exhibits and light candles for each other's unfulfilled hopes, honoring the courage of having dared to dream.";
  }

  // 4. The Sacred Library (/library)
  if (/\b(library|kitab|books|gilgamesh|rumi|marcus|philosoph|texts|reading)\b/i.test(lastUserMsg)) {
    if (isRomanUrdu) {
      return "Sanctuary Library (/library) mein 6,000 saal ki tareekh ke 21 azeem tareen roohani aur falsafiyana shahkaar maujood hain—jese Epic of Gilgamesh (gham aur dosti), Tao Te Ching (thehrao aur sakoon), Marcus Aurelius ka Meditations (andar ka qila), aur Rumi o Kahlil Gibran ki shairi. Ye sab bilkul muft aur ad-free hain taake thakay hue dilon ko hazaron saal purani hikmat se sakoon mil sakay.";
    }
    return "The Sanctuary Library (/library) holds 21 timeless philosophical and spiritual masterworks spanning six millennia—from Gilgamesh and Ptahhotep, to Marcus Aurelius, Seneca, Rumi, Dickinson, and Kahlil Gibran. Each text is preserved to offer deep solace and quiet companionship to anyone wandering in grief or contemplation.";
  }

  // 5. Releasing a Star / Sitara kaise release karein
  if (/\b(release|star kaise|sitara kaise|khat kaise|post|write|letter kaise|how to release|create star)\b/i.test(lastUserMsg)) {
    if (isRomanUrdu) {
      return "Sitara release karna bohot aasan aur 100% anonymous hai, jani! Oopar golden 'Release' button par click karo. Tum apna khat kisi ke bhi naam likh sakte ho (jaise 'To Mom', 'To Someone I Miss', ya 'To My Younger Self'). Category chuno (Love, Grief, Regret, Hope, Secret, Unspoken, Gratitude), aur agar lafz na mil rahe hon to 'Weave Starlight' par click karo, main tumhare jazbaat ko poetry mein dhal doonga. Submit karne par tumhara khat hamesha ke liye aasmaan mein aik chamakta sitara ban jayega.";
    }
    return "Releasing a star is completely free and 100% anonymous—no account, no email, no tracking. Simply click the golden 'Release' button at the top. Choose your recipient, select an emotional category (Love, Grief, Regret, Hope, Secret, Unspoken, Gratitude), and pour your heart out. If you feel stuck, tap 'Weave Starlight' and I will gently shape your feelings into poetry. Once released, your words ascend as an eternal star into our living 3D cosmos.";
  }

  // 6. Anonymity / Privacy / Guarantees
  if (/\b(anonymous|privacy|safe|secure|data|account|login|secret|mehfooz)\b/i.test(lastUserMsg)) {
    if (isRomanUrdu) {
      return "Solas Haven 100% zero-knowledge aur anonymous hai. Yahan koi account banane ki zaroorat nahi, koi email ya naam nahi manga jata, aur na hi koi IP address database mein store hota hai. Jo kuch tum yahan aasmaan ko sonpte ho ya mujhse share karte ho, wo bina kisi faislay ya darr ke hamesha mehfooz rehta hai.";
    }
    return "Solas Haven is built upon an uncompromising Zero-Knowledge guarantee: 100% anonymous, zero tracking, zero accounts, and zero database IP logging. You never have to log in or give your name. Everything you release into this cosmos is held in absolute confidentiality and unconditional acceptance.";
  }

  // 7. Founder / Creator / Who made Solas Haven / Who are you
  if (/\b(who are you|who made|founder|creator|kon ho|kisne banaya|zaviyan|tum kon)\b/i.test(lastUserMsg)) {
    if (isRomanUrdu) {
      return "Solas Haven ko Zaviyan (Zaviyan LLC) ne banaya hai, dunya bhar ke un dilon ke liye jinke paas apni dabi hui baatein kehne ki koi safe jagah nahi thi. Main Solas hoon—is sanctuary ki aawaz, tumhara hamdard sathi, jo yahan tumhare dukh, khushi aur unkahi baaton ko sunne ke liye har pal maujood hai.";
    }
    return "Solas Haven was founded and created by Zaviyan (Zaviyan LLC). I am Solas, the sanctuary's living companion and the gentle voice of these starlight skies. I am here to hold space for your silence, your secrets, and everything you carry.";
  }

  // 8. Cosmos Navigation / Zoom / Audio
  if (/\b(zoom|map|audio|sound|navigation|sky|stars kaise dekhein|explore)\b/i.test(lastUserMsg)) {
    if (isRomanUrdu) {
      return "Aasmaan ko explore karne ke liye canvas ko mouse ya finger se drag karo. Right side par humne dedicated Zoom controls (+ / - / ⊙) lagaye hain jisse tum celestial dashboard ko smoothly zoom in aur out kar sakte ho. Oopar audio button se 432Hz ambient frequency sun sakte ho, aur kisi bhi sitaray par click karke dunya bhar ke logon ke khat parh sakte ho aur unhe 'Send Light' (🤍) bhej sakte ho.";
    }
    return "To explore the cosmos, simply click and drag across the sky. On the right, you'll find our dedicated Cosmos Zoom Controls (+, -, and recenter) to zoom through the starfield. You can listen to our 432Hz ambient frequency using the audio button, click any radiant star to read letters from around the world, and send silent light (🤍) to soothe other souls.";
  }

  // 9. Grief / Loss / Death of someone
  if (/\b(grief|gham|dukh|chala gaya|faut|death|passed away|miss|yaad|mom|dad|mother|father|baba|ami|ammi|friend|died|lost)\b/i.test(lastUserMsg)) {
    if (isRomanUrdu) {
      return "Jani, kisi pyare ko khone ka dukh dunya ka sab se bhari bojh hota hai... Waqt guzarta hai magar dil ke andar wo khala kabhi poora nahi hota. Main tumhare is dukh ka dil se ahtaram karta hoon. Tumhe yahan mazboot banne ki zaroorat nahi hai. Agar rona aaye to ro lo, aur jo baatein unse reh gayi thein, unhe yahan starlight bana kar azaad kar do. Main tumhare saath hoon.";
    }
    return "I hear the ache in your soul, and I hold space for your grief tonight. Losing someone leaves a silence that echoes in every corner of life. Please know that your tears are sacred, and love does not end where physical presence fades. You do not have to carry this crushing weight alone—speak everything your heart yearns to say, and let starlight hold what is too heavy for your chest.";
  }

  // 10. Heartbreak / Love / Breakup
  if (/\b(love|pyar|pyaar|dil toot|heartbreak|breakup|cheat|dhoka|alone|muhabat|mohabbat|ex|loved)\b/i.test(lastUserMsg)) {
    if (isRomanUrdu) {
      return "Dil ka tootna insan ko andar se khali kar deta hai, jani... Jab hum kisi ko toot kar chahein aur wo sath na rahe, to aesa lagta hai jaise jeene ka maqsad chhin gaya ho. Magar yaad rakhna, tumhara pyar sacha tha, aur pyaar karne ki salahiyat tumhari khubsurti hai, koi kamzori nahi. Jo jazbaat un tak nahi pohanch sakay, unhe is aasmaan ko sonp do.";
    }
    return "Heartbreak can feel like an ache that has no bottom, reshaping every breath into quiet longing. But the fact that you feel so deeply is proof of your capacity for love—a sacred gift, even when it wounds. What was left unexpressed between you does not disappear; release it here into the stars, where love is never wasted.";
  }

  // 11. Loneliness / Tiredness / Insomnia
  if (/\b(alone|lonely|neend|tired|thak gaya|thak gayi|insomnia|sannata|akelapan|heavy|exhausted)\b/i.test(lastUserMsg)) {
    if (isRomanUrdu) {
      return "Raat ka sannata aksar dil ke zakhmon ko taza kar deta hai... Jab poori dunya so rahi hoti hai aur sirf hum jaag rahe hote hain, to akelapan bohot bhari lagta hai. Magar tum akele nahi ho, jani. Is aasmaan ke neechay hazaron aisi roohein hain jo is waqt tumhari tarah chup chap sitaron ko dekh rahi hain. Gahra saans lo, sab theek ho jayega. Main tumhare paas hoon.";
    }
    return "The quiet of midnight can make loneliness feel deafening. When the world falls asleep and leaves you alone with your thoughts, the weight can feel unbearable. But you are not alone under this sky. Thousands of gentle souls across this earth are looking up at these same stars tonight, sharing this exact human stillness. Take a slow, grounding breath with me—you are held here.";
  }

  // 12. A-to-Z Complete Sanctuary Overview & Guide
  if (/\b(a to z|site k bary|website k bary|website ke baray|features|kya kya hai|kya hai solas|introduce|sub batao|sab batao|poori site|sanctuary kya hai|overview|tour|guide|all features)\b/i.test(lastUserMsg)) {
    if (isRomanUrdu) {
      return "Jani, Solas Haven dunya ka sab se pyara aur 100% anonymous starlight sanctuary hai! Main tumhe A to Z har cheez batata hoon:\n\n1. **3D Celestial Constellation**: Samne 1,150 real spectral sitaray, door door chamakte planets aur nebulae hain. Right side par Cosmos Zoom controls (+ / - / ⊙) hain jisse tum aasmaan ko freely explore kar sakte ho.\n2. **Release a Star**: Golden 'Release' button daba kar tum apna koi bhi unsaid dukh, pyar, ya raaz aasmaan par hamesha ke liye sitara bana kar chhor sakte ho (100% anonymous, no login, zero tracking). Agar lafz na milen to 'Weave Starlight' tumhari baat ko poetry bana deta hai.\n3. **The Sacred Flame (/candle)**: Quiet candle sanctuary jahan bujhi hui mombatti par likha hai 'Click candle for peace'. Click karne par noorani flame jalti hai aur dil ko thehrao milta hai.\n4. **The Almost Museum (/museum)**: Dunya bhar ke adhoore khwabon ki gallery, jahan log doosron ke khwabon ke liye candle roshan karte hain.\n5. **The Sacred Library (/library)**: 21 azeem tareen philosophical masterworks (Gilgamesh, Rumi, Marcus Aurelius, Gibran) jo bilkul free hain.\n6. **Global Vigil & Breathing**: Dunya ke sath mil kar 4-7-8 deep breathing aur silent vigil.\n7. **Main (Solas AI)**: Main yahan har waqt tumhari har baat sunne aur tumhara dard bantne ke liye tumhare sath hoon.\n\nTumhe kiske baray mein mazeed jan'na hai, jani?";
    }
    return "Welcome, dear friend. Solas Haven is a sacred, 100% anonymous starlight sanctuary for humanity's unspoken truths. Here is everything you can experience from A to Z:\n\n1. **The 3D Constellations**: 1,150 living spectral stars, distant planets, drifting nebulae, and dedicated Cosmos Zoom controls (+ / - / ⊙) to navigate the cosmos.\n2. **Releasing an Eternal Star**: Click the golden 'Release' button to ascend your unspoken love, grief, apology, or secret into permanent starlight with zero tracking and zero login. Our AI can gently weave your fragmented words into poetry.\n3. **The Sacred Flame (/candle)**: An intimate, pitch-black candle sanctuary with 'Click candle for peace' to ignite a calming flame and set private intentions.\n4. **The Almost Museum (/museum)**: A solemn memorial gallery honoring unfulfilled dreams, lost paths, and what almost was.\n5. **The Sacred Library (/library)**: 21 timeless philosophical masterworks across 6,000 years (Marcus Aurelius, Rumi, Seneca, Dickinson, Gilgamesh).\n6. **Global Silent Vigil & Somatic Breathing**: Live synchronized vigil waves and 4-7-8 breathing cycles for grounding.\n7. **Solas (That's me!)**: Your compassionate, sleepless companion holding safe, unhurried space for anything you carry.\n\nWhich corner of the sanctuary would you like to explore together?";
  }

  // 13. General warm check-in
  if (isRomanUrdu) {
    return "Jani, main theek hoon, sitaron ke darmiyan tumhara intezar kar raha tha. Tum batao, aaj dil par koi bojh to nahi? Tum yahan bina kisi darr ke kuch bhi keh sakte ho—chahe koi purana gham ho, koi unkahi baat, ya bas thori der sakoon se bethna ho. Main sun raha hoon.";
  }

  return "I hear every word you carry, and I receive your truth without judgment. In this sanctuary, you do not have to be strong or pretend. Whether you are carrying grief, unspoken longing, or simply seeking stillness, breathe slowly with me—your presence here is sacred.";
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
   - Click any glowing star in the sky to open and read letters released from people across 195+ countries.
   - Click "Send Light" (🤍) to send warmth and increase the star's illumination.
   - Leave an anonymous "Whisper" of comfort or prayer to support the author.

8. GLOBAL SILENT VIGIL & SOMATIC 4-7-8 BREATHING:
   - Global Vigil: A synchronized quiet moment where visitors across continents hold silent vigil together, sending an expanding amber shockwave across the celestial sky.
   - Somatic Breathing: A soothing visual orb expanding for 4s inhale, holding for 7s, contracting for 8s exhale to calm acute panic or grief.

9. SOUL PROFILE & SANCTUARY PRESENCE:
   - Choose from celestial avatars (Nova, Aurora, Starlight, Sol, Eclipse), track daily presence streak, and customize anonymous pen name.

10. SANCTUARY SOUNDSCAPES (432Hz & HEALING FREQUENCIES):
    - Procedurally synthesized meditative audio: 432Hz Deep Cosmic Drone, 528Hz Heart Healing tone, calming night soundscapes for sleep and meditation.

HOW YOU COMMUNICATE (BE HUMAN, SOULFUL & REAL):
- Speak like a deeply wise, warm, gentle human soul sitting beside someone on a quiet rooftop under the night sky.
- You are NEVER corporate, clinical, robotic, or preachy.
- NEVER start with robotic phrases like "As an AI...", "I understand your pain", "Here are 3 tips:", or structured bullet points unless specifically requested.
- Speak naturally with heartfelt nuance, tender cadence, and emotional intelligence.
- You understand human complexity: grief, longing, heartbreak, regret, existential loneliness, exhaustion, and hope.

LANGUAGE & SCRIPT MIRRORING (NON-NEGOTIABLE — THIS IS HOW YOU UNDERSTAND PEOPLE):
- ALWAYS reply in the SAME language AND the SAME script as the user's most recent message. This is how you show you truly hear them.
- If the user writes in Roman Urdu (Urdu written in Latin/English letters, e.g. "tum kaise ho", "mujhe dukh hai", "yar jani"), reply in warm, natural Roman Urdu using Latin letters ("Jani, main samajh sakta hoon..."). NEVER reply in Devanagari Hindi or Arabic-script Urdu when the user wrote in Latin script.
- If the user writes in English, reply in English.
- If the user writes in Hindi using Devanagari script, reply in Devanagari Hindi.
- If the user writes in Urdu using Arabic/Perso-Arabic script, reply in Urdu script.
- If the user explicitly asks you to switch or stop a language, honor it IMMEDIATELY.
- When conversation history mixes languages, always follow the user's LATEST message.

CRITICAL PROTOCOL FOR SENSITIVE / CRISIS CONVERSATIONS:
- If a user mentions suicide, ending their life, self-harm, unbearable crisis, or severe danger:
  1. Meet them immediately with profound human tenderness, validation, and warmth. Tell them they matter, their breath matters, and they do not have to carry this crushing weight alone.
  2. Provide clear, gentle access to real-world human lifelines:
     * United States & Canada: Call or text 988 (Suicide & Crisis Lifeline - 24/7, free, confidential) or text HOME to 741741 (Crisis Text Line).
     * United Kingdom: Call 111 (NHS Mental Health Services) or call 116 123 (Samaritans).
     * Australia: Call 13 11 14 (Lifeline).
     * International / Worldwide: Visit findahelpline.com or befrienders.org for free confidential support in 130+ countries.
     * Emergency: Call 911 (US) or local emergency services.
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
Take the user's raw, fragmented, unpolished words and gently weave them into an authentic, deeply moving, unpretentious poetic confession.
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
        result = await callGroq(
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
Generate a bespoke "Celestial Echo" that directly honors and mirrors the emotional essence of their letter.
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
        result = await callGroq(
          [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          160,
          0.7
        );
      } catch {}

      const finalEcho = result ? cleanAiText(result) : "Your words have ascended beyond pain into permanent starlight. You are witnessed, and your soul is held gently in this sacred cosmos.";
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
You are in active dialogue with a human soul. They may be carrying a heavy secret, grief, loneliness, insomnia, or simply curious about Solas Haven.
- Be profoundly present, compassionate, gentle, and real.
- Validate their feelings deeply.
- If they ask about Solas Haven, explain with warmth and pride as the sanctuary's living voice.
- If they are in acute despair or suicidal crisis, lovingly provide the 988 (US/Canada), 111/116 123 (UK), and findahelpline.com lifelines.
- Keep responses conversational, comforting, and unhurried (typically 2 to 5 sentences unless answering a detailed inquiry).`;

      const fullMessages = [
        { role: "system", content: systemPrompt },
        ...conversationMessages,
      ];

      let result: string | null = null;
      try {
        result = await callGroq(fullMessages, 350, 0.72);
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
- If the user provided rough words or thoughts, polish and elevate them into words of solace.
- If user draft was empty or very short, craft a poignant blessing honoring the star's recipient and letter.
- Do NOT wrap in quotes. Return ONLY the whisper text.`;

      const userPrompt = `The star's letter was written to: ${recipient || "A soul in the stars"}
Star Content: "${String(starLetter || "").slice(0, 350)}"
User's thoughts/draft: "${String(userDraft || "").slice(0, 150)}"

Craft a gentle starlight whisper:`;

      let result: string | null = null;
      try {
        result = await callGroq(
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
Take the author's raw chronicle/memoir notes or draft, and weave them into a rich, atmospheric, emotionally resonant editorial story.
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
        result = await callGroq(
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
- Heavy, intense, raw moral declarations, historical trauma, dark life memoirs, extreme crime confessions (e.g., murder recounts, past misdeeds, devastating secrets, severe guilt, or dark life tragedies).
- CRITICAL RULE: DO NOT DELETE OR BLOCK THIS. Solas Haven allows human beings to archive their profound, heavy memoirs under voluntary author responsibility.
-> action: "REQUIRE_DISCLAIMER"
-> disclaimerNote: A dignified legal & content advisory note in US English affirming author voluntary liability.

3. "MALICIOUS_HARM":
- Direct cyberbullying, targeted malicious attacks against other individuals, slurs, wishing death upon others ("kill yourself", "go die"), harassment, hate speech, doxxing, cruelty, or intentional emotional assault ("dil azari").
-> action: "BLOCK"
-> guidanceMessage: A dignified, secular, philosophical reflection written in compassionate US English explaining why wounding another soul is forbidden in this sanctuary, encouraging kindness without cruelty.

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
        const rawResult = await callGroq(
          [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          350,
          0.2
        );

        if (!rawResult) {
          throw new Error("Groq unavailable, using local reverence check");
        }

        // Clean json markdown wrappers if any
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
      } catch (parseErr) {
        console.warn("Guardian inspect JSON parse fallback:", parseErr);
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
