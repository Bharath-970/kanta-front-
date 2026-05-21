"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface TextRotateProps {
  words: string[];
  interval?: number;
  className?: string;
}

export default function TextRotate({
  words,
  interval = 2200,
  className = "",
}: TextRotateProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, interval);
    return () => clearInterval(id);
  }, [words, interval]);

  return (
    <span
      className={`relative inline-block overflow-hidden align-bottom ${className}`}
      style={{ minWidth: "1ch" }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ y: "110%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-110%", opacity: 0 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
