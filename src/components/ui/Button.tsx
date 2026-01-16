import clsx from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'glass' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}

export function Button({
    children,
    className,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    ...props
}: ButtonProps) {

    const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 ease-spring active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black';

    const variants = {
        primary: 'bg-[var(--ios-blue)] text-white hover:brightness-110 shadow-lg shadow-[rgba(10,132,255,0.3)]',
        secondary: 'bg-[var(--ios-bg-tertiary)] text-white hover:bg-[var(--ios-bg-secondary)]',
        glass: 'glass-panel hover:bg-[rgba(255,255,255,0.1)] text-white',
        ghost: 'bg-transparent text-[var(--ios-text-secondary)] hover:text-white',
    };

    const sizes = {
        sm: 'h-8 px-4 text-xs rounded-full',
        md: 'h-12 px-6 text-sm rounded-full',
        lg: 'h-14 px-8 text-base rounded-full',
    };

    return (
        <button
            className={clsx(
                baseStyles,
                variants[variant],
                sizes[size],
                fullWidth && 'w-full',
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
