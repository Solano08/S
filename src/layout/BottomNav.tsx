import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { Calendar, DollarSign, Briefcase, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
    { path: '/calendar', icon: Calendar, label: 'Agenda' },
    { path: '/finances', icon: DollarSign, label: 'Ingresos' },
    { path: '/', icon: null, label: 'Inicio', isCenter: true },
    { path: '/projects', icon: Briefcase, label: 'Proyectos' },
    { path: '/ideas', icon: Lightbulb, label: 'Ideas' },
];

export function BottomNav() {
    const location = useLocation();

    return (
        <nav className="bottom-nav">
            <motion.div
                className="glass-tabbar w-full pb-[max(env(safe-area-inset-bottom),12px)]"
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
            >
                <div className="tabbar">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    "tabbar-item focus:outline-none",
                                    isActive && "tabbar-item-active",
                                    item.isCenter && "tabbar-item-center"
                                )}
                            >
                                <span className={clsx("tabbar-pill", item.isCenter && "tabbar-pill-center")}>
                                    {item.isCenter ? (
                                        <motion.span
                                            animate={{ scale: isActive ? 1.05 : 1 }}
                                            className="tabbar-center-letter"
                                        >
                                            S
                                        </motion.span>
                                    ) : (
                                        <motion.div
                                            animate={{ scale: isActive ? 1.1 : 1 }}
                                            className={clsx(
                                                isActive ? "text-[var(--ios-blue)]" : "text-[var(--text-tertiary)]"
                                            )}
                                        >
                                            <Icon size={20} strokeWidth={2} />
                                        </motion.div>
                                    )}
                                </span>
                                {!item.isCenter && (
                                    <span className={clsx(isActive ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]")}>
                                        {item.label}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </motion.div>
        </nav>
    );
}
