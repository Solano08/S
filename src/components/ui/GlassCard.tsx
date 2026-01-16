import clsx from 'clsx';
import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: ReactNode;
    className?: string;
    variant?: 'default' | 'strong';
}

export function GlassCard({ children, className, variant = 'default', ...props }: GlassCardProps) {
    return (
        <motion.div
            className={clsx(
                'rounded-[24px] p-6 transition-all duration-300',
                variant === 'strong' ? 'glass-panel-strong' : 'glass-panel',
                className
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            {...props}
        >
            {children}
        </motion.div>
    );
}
