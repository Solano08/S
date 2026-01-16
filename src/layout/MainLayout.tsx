import type { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface MainLayoutProps {
    children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
    const location = useLocation();

    return (
        <div className="full-screen bg-[var(--bg-primary)] text-[var(--text-primary)] relative">
            {/* Background Ambience - Breathing blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-[rgba(41,151,255,0.08)] rounded-full blur-[120px] animate-breathe" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] bg-[rgba(94,92,230,0.08)] rounded-full blur-[120px] animate-breathe" style={{ animationDelay: '4s' }} />
            </div>

            <main className="h-full w-full pt-[env(safe-area-inset-top)] pb-[calc(var(--tabbar-height)+env(safe-area-inset-bottom))] px-4 sm:px-6 flex flex-col relative z-0">
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
                        className="flex-1 flex flex-col items-center justify-center h-full w-full"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>

            <BottomNav />
        </div>
    );
}
