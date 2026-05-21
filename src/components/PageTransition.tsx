"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [showFlash, setShowFlash] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);

  useEffect(() => {
    if (pathname !== prevPath) {
      setShowFlash(true);
      const timer = setTimeout(() => setShowFlash(false), 400);
      setPrevPath(pathname);
      return () => clearTimeout(timer);
    }
  }, [pathname, prevPath]);

  return (
    <>
      {/* CRT Flash overlay on route change */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.9, 0.6, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, times: [0, 0.1, 0.2, 1] }}
            className="fixed inset-0 z-[300] pointer-events-none bg-[var(--accent)]"
            style={{
              mixBlendMode: "screen",
            }}
          />
        )}
      </AnimatePresence>

      {/* Page content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
