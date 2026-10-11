import type { Metadata } from "next";
import "./globals.css";
import { db } from "@/lib/db";
import { Navbar } from "@/components/navbar";

export async function generateMetadata(): Promise<Metadata> {
  let title = "Anish Shah | Premium Barber";
  let description = "Sharp cuts. Clean looks. Better you.";

  try {
    const content = await db.siteContent.findUnique({
      where: { id: "main" },
    });

    if (content) {
      title = content.seoTitle;
      description = content.seoDescription;
    }
  } catch {}

  return {
    title,
    description,
    icons: {
      icon: [
        { url: "/favicon.ico", type: "image/x-icon" },
        { url: "/icon.png", type: "image/png" },
      ],
    },
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Navbar />

        {children}

        <footer className="border-t border-[#27313a] py-6 text-center text-sm muted">
          © {new Date().getFullYear()} Anish Shah. Crafted with care.
        </footer>
      </body>
    </html>
  );
}
