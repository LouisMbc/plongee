import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Backend Plongée",
  description: "API Backend pour l'application de plongée",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
