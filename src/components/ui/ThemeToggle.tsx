import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="icon-button theme-toggle relative overflow-hidden group"
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? (
                <Moon size={18} className="text-[var(--ios-blue)]" />
            ) : (
                <Sun size={18} className="text-[var(--ios-orange)]" />
            )}
        </button>
    );
}
