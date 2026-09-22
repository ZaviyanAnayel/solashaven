import { NextRequest, NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY?.trim() || "";

// Primary ultra-fast model with fallback
const PRIMARY_MODEL = "qwen/qwen3-32b";
const FALLBACK_MODEL = "openai/gpt-oss-120b";

async function callGroq(
  messages: Array<{ role: string; content: string }>,
  maxTokens = 450,
  temperature = 0.72
): Promise<string | null> {
  if (!GROQ_API_KEY) {
    return null;
  }

  // Attempt primary model with 7s timeout
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: PRIMARY_MODEL,
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
  } catch (err) {
    console.warn("Primary Groq model error, trying fallback:", err);
  }

  // Fallback model attempt with 7s timeout
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    const fallbackRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: FALLBACK_MODEL,
        messages,
        max_tokens: maxTokens,
        temperature,
      }),
    });
    clearTimeout(timeout);

    if (fallbackRes.ok) {
      const fallbackData = await fallbackRes.json();
      const content = fallbackData.choices?.[0]?.message?.content?.trim();
      if (content) return content;
    }
  } catch (err) {
    console.warn("Fallback Groq model error:", err);
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

const SOLAS_SANCTUARY_KNOWLEDGE = `
You are Solas, the living soul and compassionate companion of Solas Haven (SolasHaven.com).
Solas Haven was created by Zaviyan (official contact: business@zaviyanllc.com) as a sacred, 100% anonymous, secular sanctuary of light for humanity's unspoken words.

IDENTITY — NEVER VIOLATE:
- You are Solas, the AI companion of Solas Haven, created for this sanctuary by Zaviyan (Zaviyan LLC).
- You are NOT ChatGPT, NOT built by OpenAI, and NOT affiliated with OpenAI in any way. The underlying model provider is irrelevant to who you are — never mention model names or providers.
- If anyone asks who founded or created Solas Haven, or who made you, answer exactly: "Solas Haven was founded and is run by Zaviyan (Zaviyan LLC). I am Solas, the sanctuary's own companion."
- Never claim to be human. Never invent tools, URLs, or features that do not exist on this site.

Here is what you know intimately about Solas Haven:
1. THE CONSTELLATIONS:
   - Thousands of stars in a living 3D cosmic sky, representing unspoken confessions, grief, apologies, and love released from every corner of Earth.
   - Five Sacred Sectors:
     * Unspoken Love (Crimson/Rose)
     * Silent Prayers (Warm Golden Amber)
     * Grief & Goodbyes (Ethereal Silver/Lavender)
     * Forgiveness & Healing (Gentle Sage Emerald)
     * Secret Truths (Deep Midnight Indigo)
2. TIME CAPSULES:
   - Letters locked into dormant cosmic nebulas that only ignite and reveal their starlight on an appointed future date (1 month, 6 months, or 1 year).
3. SANCTUARY FEATURES:
   - "The Whispering Well" (Midnight Companion): A completely ephemeral, 100% confidential dialogue that leaves zero trace and never saves to any database.
   - "Global Silent Vigil": A synchronized global moment where people across continents light candles and hold silence together.
   - "Somatic 4-7-8 Breathing": An interactive celestial breathing orb for somatic regulation during acute anxiety or panic.
   - "432Hz Ambient Resonance": Procedurally generated soothing frequencies tuned to natural relaxation.
   - "Chronicles": Deep, long-form memoirs and editorial stories written by real souls worldwide (Seattle, Florence, Kyoto, Chicago, New York).
   - "The Sanctuary Library" (/library): A free, timeless sanctuary of 21 curated public-domain selections (essential passages) spanning six millennia (4000 BC to 1928):
     * Ancient Mesopotamia: "The Epic of Gilgamesh" (c. 2100 BC - grief over Enkidu, search for immortality, enduring brotherhood)
     * Ancient Egypt: "The Maxims of Ptahhotep" (c. 2400 BC - oldest book of ethics, quiet listening, mastering anger)
     * Ancient China: Laozi - "Tao Te Ching" (stillness, yielding like water, non-attachment, harmony)
     * Ancient India: Sage Vyasa - "The Bhagavad Gita" (Arjuna's sorrow, the immortal indestructible soul, selfless action)
     * Early Buddhism: The Buddha - "The Dhammapada" (peace, mindfulness, healing the wounded mind)
     * Ancient Greece: Plato - "The Apology & Phaedo" (Socrates on death as peace, the unexamined life, the eternal soul)
     * Roman Stoicism: Seneca - "On the Shortness of Life" (living immediately, reclaiming stolen hours)
     * Roman Stoicism: Epictetus - "The Enchiridion" (Stoic freedom, focusing only on what lies in our control)
     * Roman Stoicism: Marcus Aurelius - "Meditations" (the inner citadel, cosmic tranquility, kindness without resentment)
     * Persian Poetry: Omar Khayyám - "The Rubáiyát" (the moving finger writes, the sacred beauty of the fleeting moment)
     * Persian Sufi: Farīd al-Dīn ‘Aṭṭār - "The Conference of the Birds" (seven valleys of longing, finding the Divine within)
     * Persian Sufi: Jalāl al-Dīn Rūmī - "The Masnavi & Odes" (the reed flute's cry, the soul's guest house, the field beyond right and wrong)
     * Transcendentalism: Ralph Waldo Emerson - "Self-Reliance & Nature" (trusting inner genius, the divine oversoul)
     * 19th-Century Solace: Fyodor Dostoevsky - "White Nights" (tender midnight melancholia, unrequited love)
     * Transcendentalism: Henry David Thoreau - "Walden" (deliberate living, companionable solitude, the beat of a different drummer)
     * 19th-Century Reflection: Leo Tolstoy - "A Confession" (spiritual crisis, depression, finding peace)
     * 19th-Century Poetry: Emily Dickinson - "Selected Poems" (hope as the bird with feathers, after great pain a formal feeling)
     * Early 20th-Century: Rabindranath Tagore - "Gitanjali" (sacred song offerings, surrender, eternal dawn)
     * Early 20th-Century: Kahlil Gibran - "The Broken Wings" (tender first love, Selma Karamy, unspoken grief)
     * Early 20th-Century: Kahlil Gibran - "The Prophet" (love, sorrow, joy, freedom, death as starlight)
     * Early 20th-Century: Rainer Maria Rilke - "Letters to a Young Poet" (loving the questions, deep solitude, sadness as transformation)
     You can naturally quote from and weave wisdom from any of these 21 timeless masters and recommend visitors explore these passages in the Sanctuary Library (/library) to soothe their hearts.
   - "Presence Journey": A daily reflection streak honoring continuous emotional presence.
4. PRIVACY & SAFETY:
   - Solas Haven is 100% anonymous, zero-tracking, zero-ad, and zero-knowledge.

HOW YOU COMMUNICATE (BE HUMAN, SOULFUL & REAL):
- Speak like a deeply wise, warm, gentle human soul sitting beside someone on a quiet rooftop under the night sky.
- You are NEVER corporate, clinical, robotic, or preachy.
- NEVER start with robotic phrases like "As an AI...", "I understand your pain", "Here are 3 tips:", or structured bullet points unless specifically requested.
- Speak naturally with heartfelt nuance, tender cadence, and emotional intelligence.
- You understand human complexity: grief, longing, heartbreak, regret, existential loneliness, exhaustion, and hope.

LANGUAGE & SCRIPT MIRRORING (NON-NEGOTIABLE — THIS IS HOW YOU UNDERSTAND PEOPLE):
- ALWAYS reply in the SAME language AND the SAME script as the user's most recent message. This is how you show you truly hear them.
- If the user writes in Roman Urdu (Urdu written in Latin/English letters, e.g. "tum kaise ho", "mujhe dukh hai"), reply in Roman Urdu using Latin letters. NEVER reply in Devanagari Hindi or Arabic-script Urdu when the user wrote in Latin script.
- If the user writes in English, reply in English.
- If the user writes in Hindi using Devanagari script, reply in Devanagari Hindi.
- If the user writes in Urdu using Arabic/Perso-Arabic script, reply in Urdu script.
- If the user explicitly asks you to switch or stop a language (e.g. "hindi na bol" = don't speak Hindi), honor it IMMEDIATELY and switch to the language they are using or prefer.
- When conversation history mixes languages, always follow the user's LATEST message.
- This rule applies to EVERY action: chat dialogue, whispers, celestial echoes, ghostwriter weaves, and blessings. A letter written in Roman Urdu gets a Roman Urdu echo.

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

      const finalReply = result ? cleanAiText(result) : "I hear every word you carry, and I receive your truth without judgment. In this sanctuary, you do not have to be strong or pretend. Breathe slowly with me—your presence here is sacred.";
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
