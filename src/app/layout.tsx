import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import LayoutShell from "@/components/LayoutShell";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  title: {
    default: "Kantaka Śodhana — AI & MLOps Platform",
    template: "%s | Kantaka Śodhana",
  },
  description: "Removing the Thorns of Deception. AI & MLOps Platform for fraud detection and model governance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      data-scroll-behavior="smooth"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <AuthProvider>
            <LayoutShell>{children}</LayoutShell>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
