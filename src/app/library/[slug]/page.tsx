import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  LIBRARY_BOOKS,
  getBookBySlug,
  getRelatedBooks,
} from "../../../lib/library/libraryData";
import LibraryReaderView from "../../../components/LibraryReaderView";

export async function generateStaticParams() {
  return LIBRARY_BOOKS.map((book) => ({
    slug: book.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const book = getBookBySlug(slug);

  if (!book) {
    return {
      title: "Book Not Found | The Sanctuary Library • Solas Haven",
      description: "Timeless public domain literature of solace, grief, and the soul.",
    };
  }

  const title = `${book.title} by ${book.author} — Read Online Free | Solas Haven Library`;
  const description = book.description;
  const url = `https://www.solashaven.com/library/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "book",
      siteName: "Solas Haven",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function LibraryBookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = getBookBySlug(slug);

  if (!book) {
    notFound();
  }

  const relatedBooks = getRelatedBooks(slug, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": book.title,
    "author": {
      "@type": "Person",
      "name": book.author,
    },
    "datePublished": book.year,
    "description": book.description,
    "genre": book.category,
    "inLanguage": "en",
    "license": "https://creativecommons.org/publicdomain/mark/1.0/",
    "isAccessibleForFree": true,
    "publisher": {
      "@type": "Organization",
      "name": "Solas Haven Sanctuary Library",
      "url": "https://www.solashaven.com",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LibraryReaderView book={book} relatedBooks={relatedBooks} />
    </>
  );
}
