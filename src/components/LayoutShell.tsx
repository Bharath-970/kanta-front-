"use client";

import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import GrainOverlay from "@/components/GrainOverlay";
import PageTransition from "@/components/PageTransition";
import Preloader from "@/components/Preloader";
import ClientCursor from "@/components/ClientCursor";

const CHROMELESS_PATHS = ["/risk-scoring"];

export default function LayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isChromeless = pathname ? CHROMELESS_PATHS.includes(pathname) : false;

  if (isChromeless) {
    return (
      <>
        <ClientCursor />
        {children}
      </>
    );
  }

  return (
    <>
      <ClientCursor />
      <Preloader />
      <ScrollProgress />
      <GrainOverlay />
      <Navigation />
      <PageTransition>
        <main className="flex-1">{children}</main>
      </PageTransition>
      <Footer />
    </>
  );
}
