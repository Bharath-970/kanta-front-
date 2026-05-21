"use client";

import { motion } from "framer-motion";
import { useRef } from "react";

interface ScrollCardProps {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "left" | "right";
  className?: string;
  once?: boolean;
}

export default function ScrollCard({
  children,
  delay = 0,
  direction = "up",
  className = "",
  once = true,
}: ScrollCardProps) {
  const initial =
    direction === "up"
      ? { opacity: 0, y: 48 }
      : direction === "left"
      ? { opacity: 0, x: -48 }
      : { opacity: 0, x: 48 };

  const animate =
    direction === "up"
      ? { opacity: 1, y: 0 }
      : { opacity: 1, x: 0 };

  return (
    <motion.div
      initial={initial}
      whileInView={animate}
      viewport={{ once, margin: "-60px" }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
