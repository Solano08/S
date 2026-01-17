import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { SFPlus, SFLightbulb, SFWallet, SFTarget } from './SFIcons';

export function QuickActionsMenu() {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

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
            <motion.div
                initial={false}
                animate={open ? "open" : "closed"}
                variants={{
                    open: { height: "auto", opacity: 1, y: 0 },
                    closed: { height: 0, opacity: 0, y: -4 }
                }}
                transition={{ duration: 0.2, ease: [0.25, 0.8, 0.25, 1] }}
                style={{ overflow: "hidden" }}
                className="quick-actions-dropdown"
            >
                <div className="quick-actions-panel">
                    <button className="quick-action-item">
                        <SFLightbulb size={18} />
                        Agregar idea
                    </button>
                    <button className="quick-action-item">
                        <SFWallet size={18} />
                        Registrar gasto
                    </button>
                    <button className="quick-action-item">
                        <SFTarget size={18} />
                        Nuevo objetivo
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
