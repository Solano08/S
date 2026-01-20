import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SFPlus, SFLightbulb } from './SFIcons';

type QuickActionItem = {
    label: string;
    icon: ReactNode;
    onClick?: () => void;
};

type QuickActionsMenuProps = {
    actions?: QuickActionItem[];
};

export function QuickActionsMenu({ actions = [] }: QuickActionsMenuProps) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const quickActions = useMemo(
        () => [
            {
                label: "Agregar idea",
                icon: <SFLightbulb size={18} />
            },
            ...actions
        ],
        [actions]
    );

    useEffect(() => {
        function handlePointerDown(event: PointerEvent) {
            if (!containerRef.current) return;
            if (!containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        if (open) {
            document.addEventListener('pointerdown', handlePointerDown);
        }

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
        };
    }, [open]);

    return (
        <div className="quick-actions-trigger" ref={containerRef}>
            <button
                className="icon-button"
                aria-label="Acciones rápidas"
                onClick={() => setOpen((prev) => !prev)}
            >
                <SFPlus size={18} />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="quick-actions-dropdown"
                    >
                        <div className="quick-actions-panel">
                            {quickActions.map((action) => (
                                <button
                                    key={action.label}
                                    className="quick-action-item"
                                    onClick={() => {
                                        action.onClick?.();
                                        setOpen(false);
                                    }}
                                >
                                    {action.icon}
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
