import { ChronicleArticle } from "./types";

// Daily SEO chronicles, published by the `solashaven-daily-chronicle` cron.
// The cron worker appends one new article per day. Newest first.
export const DAILY_STORIES: ChronicleArticle[] = [
  {
    slug: "the-letters-we-never-post",
    title: "The Letters We Never Post: Why the Words We Keep Hurt More Than the Ones We Send",
    subtitle: "Everyone carries at least one unsent message — an apology that never left the drafts, a confession sealed behind fear, a truth held back one day too long.",
    excerpt: "Somewhere between the drafts folder and the desk drawer sits the letter you never sent. A meditation on the unsent words we all carry — and why writing them down, even for no one, can finally set them free.",
    readTime: "7 min read",
    publishedAt: "October 2026",
    category: "Unspoken Love",
    author: "Solas Haven Editorial",
    tags: ["Unsent Letters", "Apology", "Confession", "Healing"],
    sections: [
      {
        heading: "The Drawer Everybody Keeps",
        paragraphs: [
          "Almost every person alive carries a sentence they rehearsed a hundred times and never said. In the age of instant messages, it is the unsent text glowing in a drafts folder at two in the morning, the thumb hovering over the send button that never gets pressed. A generation earlier, it was a letter folded into a drawer — creased, re-folded, sealed but never stamped. The medium changed. The weight did not.",
          "The apology drafted after the funeral, when the person who needed it most was already beyond reach. The confession aimed at someone who had already chosen someone else. The thank-you that never caught up with a kindness because life moved faster than gratitude. These are not the rare confessions of cowards. They are among the most ordinary documents of being human.",
          "Ask anyone you truly trust, and they will admit to one. It might live in a phone, in a shoebox, or nowhere but memory. But it is there — taking up a room inside them that no one else can see."
        ]
      },
      {
        heading: "Why Sending Feels Impossible",
        paragraphs: [
          "We tell ourselves the words were not ready. The timing was not right. They might not have wanted to hear it. Each reason is plausible on its own, and together they form a wall so smooth there is nothing to hold on to.",
          "Beneath the reasons sits something simpler: fear. Fear that the apology will be rejected. Fear that the love will not be returned. Fear that speaking the truth will break something that silence, however painful, keeps intact. Silence feels like control. It is not — but it is very good at impersonating control.",
          "And so the letter stays unsent. Days become seasons. People move cities, marry others, grow old, pass on. The window for the words closes quietly, the way a shop door closes at the end of the day — no ceremony, only the sound of a lock."
        ]
      },
      {
        heading: "The Weight of the Unsent Word",
        paragraphs: [
          "Here is what nobody warns you about: an unsent letter does not fade. A spoken sentence disperses into the air the moment it leaves your mouth, and whatever it breaks or heals begins at once. An unsent sentence has no such exit. It circles.",
          "It finds you in the small hours, when every defense is down. It edits itself — grows sharper, or softer, or longer. You begin to wonder what would have happened if you had sent it, and the wondering becomes its own small prison. The words were meant to be a bridge, and instead they became a stone in your pocket.",
          "This is not weakness; it is the simple arithmetic of the heart. What is never expressed is never resolved. The mind keeps the file open, the way it keeps open every story without an ending."
        ]
      },
      {
        heading: "What the Unsent Letter Really Is",
        paragraphs: [
          "Look closer at your unsent letter and you will notice something strange: half of it was never really addressed to the other person at all. It was addressed to you. It is the sentence you needed to say in order to know you were capable of saying it.",
          "The letter is a mirror disguised as a message. 'I was wrong' is not only an apology — it is proof that you can admit it. 'I loved you' is not only a confession — it is proof that you were brave enough to feel it. The words were always, at least partly, yours to receive.",
          "That is why the unsent letter aches with a double weight: the person who never read it, and the version of you that never got to send it."
        ]
      },
      {
        heading: "Writing It Down Anyway",
        paragraphs: [
          "You do not need to send the letter to be free of it. Some words cannot be delivered — the address is gone, or the delivery would only reopen a wound that finally closed. Wisdom is knowing the difference between what must be said and what must merely be written.",
          "So write it. All of it. The apology with no return address. The confession with no recipient. The truth you carried for years because no one else could have carried it but you. Put it on paper, in a file, in the dark. Writing it is not the same as hiding it — writing it is what turns a stone in your pocket into something you can finally set down.",
          "And if you want it witnessed without being seen, release it here. On Solas Haven, unsent letters become stars — anonymous, eternal, glowing for every other soul carrying their own unmailed truths. The person it was written for may never read it. But you will have sent it, in the one way that was always available: out of you, and into the light."
        ]
      }
    ]
  }
];
