import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chronicles of Light & Memory | Solas Haven",
  description:
    "Explore deeply moving reflections on grief, unrequited love, forgiveness, and silent prayers — editorial essays written by the Solas Haven team.",
  keywords: [
    "grief stories",
    "unspoken love chronicles",
    "letters to heaven stories",
    "bereavement healing articles",
    "emotional catharsis essays",
    "unsent letters project",
    "grief journaling reflections",
    "memorial tributes",
    "solas haven chronicles",
  ],
  alternates: {
    canonical: "https://www.solashaven.com/chronicles",
  },
  openGraph: {
    title: "Chronicles of Light & Memory | Solas Haven",
    description:
      "A sacred sanctuary archive of reflections, grief essays, and silent prayers from the Solas Haven editorial team.",
    url: "https://www.solashaven.com/chronicles",
    siteName: "Solas Haven",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chronicles of Light & Memory | Solas Haven",
    description:
      "A sacred sanctuary archive of reflections, grief essays, and silent prayers from the Solas Haven editorial team.",
  },
};

export default function ChroniclesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
