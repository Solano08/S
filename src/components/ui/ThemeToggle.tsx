import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full glass-panel hover:bg-[var(--glass-border)] transition-colors relative overflow-hidden group"
            aria-label="Toggle theme"
        >
            <div className="relative z-10">
                {theme === 'dark' ? (
                    <Moon size={20} className="text-[var(--ios-blue)]" />
                ) : (
                    <Sun size={20} className="text-[var(--ios-orange)]" />
                )}
            </div>
            <motion.div
                className="absolute inset-0 bg-[var(--glass-shine)] opacity-0 group-hover:opacity-100"
                layoutId="theme-hover"
            />
        </button>
    );
}
