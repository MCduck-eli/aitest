"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
                key={pathname}
                initial={{ opacity: 0, x: "100%" }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: "-100%" }}
                transition={{
                    duration: 0.6,
                    ease: [0.4, 0.0, 0.2, 1],
                }}
                className="w-full h-full grow flex flex-col items-center justify-center absolute inset-0"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
