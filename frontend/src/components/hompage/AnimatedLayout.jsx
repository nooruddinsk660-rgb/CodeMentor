import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * AnimatedLayout provides:
 *  - parallax transforms for background elements
 *  - helper wrapper to animate children on scroll
 */
export function ParallaxBg({ children, yRange = [50, -50], className = "" }) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 800], yRange);
  return (
    <motion.div style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * Reveal wrapper - use on sections to apply enter animation
 */
export function Reveal({ children, delay = 0, className = "" }) {
  const variants = {
    hidden: { opacity: 0, y: 20, scale: 0.995 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, delay }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
