import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { SFCalendar, SFDollar, SFBriefcase, SFTarget } from '../components/ui/SFIcons';
import { motion } from 'framer-motion';

const navItems = [
    { path: '/calendar', icon: SFCalendar, label: 'Agenda' },
    { path: '/finances', icon: SFDollar, label: 'Ingresos' },
    { path: '/', icon: null, label: 'Inicio', isCenter: true },
    { path: '/projects', icon: SFBriefcase, label: 'Proyectos' },
    { path: '/ideas', icon: SFTarget, label: 'Hábitos' },
];

export function BottomNav() {
    const location = useLocation();

    const SolanoLogo = ({ className }: { className?: string }) => (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1942.52 3670.64"
            aria-hidden="true"
        >
            <path
                fill="currentColor"
                d="M1247.74,632c-119.54-111.2-193.94-175.83-255-193.49-76.09-22-83.57,18.14-114.36,85-20,43.47-1.29,326.26,21.78,386.16,16.83,43.7,26,90.57,48.77,131.83,20.94,37.89,47.81,72.33,77.81,103.45,66.39,68.86,150.87,117,230.19,169.31,169.23,111.51,174.06,172.48,267.64,281.34,82.67,96.16,228.5,155.7,314.28,155.7-91,70.63-181.66,212.26-194.94,302.59-47.33,321.82,20.28,404.06,51.47,455.64,71,117.34,175.13,36.59,175.13,36.59s18,200.91-141.48,207.85c-122.21,5.31-237.9-73.46-316.78-128.83C1187.08,2467,823.71,2601,370.24,3090,263.69,3204.89,0,3670.64,0,3670.64c-3.81,0,398.32-864.65,507.94-1043,89.28-145.31,262.55-292,400.71-339.8,13.33-4.62,278.15-71.44,278.15-254.15,0-67.56-7.32-144.85-40.33-205.26a132.45,132.45,0,0,0-13.74-20.77c-10.24-12.48-16.67-29.84-26.39-43.16C1027.2,1656,903.5,1578,809.8,1494.12c-31.6-28.29-278.65-280.88-316.19-460.5-81.09-388.07,45.32-792.5-282.81-1029C179.27-18.07,694.67,232.52,956.82,0c3.71-3.3,331.53,245.81,609.31,0-2.3,231.25-329.74,230-6.2,495.07,147,120.45,374.29,43.48,382.59,37.05,0,0-133.3,192.79-282.09,220.38C1569.38,769.46,1380.44,755.42,1247.74,632Z"
            />
        </svg>
    );

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
                                            className="tabbar-center-logo"
                                        >
                                            <SolanoLogo />
                                        </motion.span>
                                    ) : (
                                        <motion.div
                                            animate={{ scale: isActive ? 1.1 : 1 }}
                                            className={clsx(
                                                "tabbar-icon",
                                                isActive && "tabbar-icon-active"
                                            )}
                                        >
                                            <Icon size={22} />
                                        </motion.div>
                                    )}
                                </span>
                                {!item.isCenter && (
                                    <span className={clsx("tabbar-label", isActive && "tabbar-label-active")}>
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
