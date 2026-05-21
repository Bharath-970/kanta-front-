import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import GrainOverlay from "@/components/GrainOverlay";
import PageTransition from "@/components/PageTransition";
import Preloader from "@/components/Preloader";
import ClientCursor from "@/components/ClientCursor";

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
          <ClientCursor />
          <Preloader />
          <ScrollProgress />
          <GrainOverlay />
          <Navigation />
          <PageTransition>
            <main className="flex-1">{children}</main>
          </PageTransition>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
