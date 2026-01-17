import { motion } from 'framer-motion';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { QuickActionsMenu } from '../components/ui/QuickActionsMenu';
import {
    SFArrowUpRight,
    SFCalendar,
    SFWallet,
    SFCheckCircle,
    SFSparkles,
    SFTarget,
    SFTrendingUp
} from '../components/ui/SFIcons';

export function Home() {
    const time = new Date().getHours();
    const greeting = time < 12 ? 'Buenos días' : time < 18 ? 'Buenas tardes' : 'Buenas noches';

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 10 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { type: "spring", stiffness: 200, damping: 20 } as any
        }
    };

    return (
        <div className="app-screen">
            <header className="app-header">
                <div className="app-title-group">
                    <motion.span
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="app-date"
                    >
                        {new Date().toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </motion.span>
                    <div className="app-header-row">
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.08 }}
                            className="app-title"
                        >
                            {greeting}, Solano
                        </motion.h1>
                        <div className="app-header-actions">
                            <ThemeToggle />
                            <QuickActionsMenu />
                        </div>
                    </div>
                </div>
            </header>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="app-content"
            >
                <motion.section variants={itemVariants} className="app-section">
                    <div className="hero-card">
                        <div className="hero-header">
                            <div>
                                <p className="hero-eyebrow">Resumen del día</p>
                                <h2 className="hero-title">Mantén foco en finanzas, objetivos y agenda</h2>
                            </div>
                            <div className="hero-icon">
                                <SFSparkles size={18} />
                            </div>
                        </div>
                        <div className="hero-metrics">
                            <div>
                                <span className="hero-metric-value">$1.2k</span>
                                <span className="hero-metric-label">Balance</span>
                            </div>
                            <div>
                                <span className="hero-metric-value">3</span>
                                <span className="hero-metric-label">Objetivos</span>
                            </div>
                            <div>
                                <span className="hero-metric-value">2</span>
                                <span className="hero-metric-label">Eventos</span>
                            </div>
                        </div>
                        <div className="hero-progress">
                            <div className="hero-progress-bar" style={{ width: '68%' }} />
                        </div>
                        <div className="hero-chips">
                            <span className="chip">Gasto controlado</span>
                            <span className="chip">Rutina estable</span>
                        </div>
                    </div>
                </motion.section>

                <motion.section variants={itemVariants} className="app-section">
                    <div className="section-title">
                        <h3>Finanzas</h3>
                        <span className="pill">Este mes</span>
                    </div>
                    <div className="list-card">
                        <div className="list-item">
                            <div className="list-icon">
                                <SFWallet size={18} />
                            </div>
                            <div className="list-content">
                                <p>Ingresos</p>
                                <span>$3.450 recibidos</span>
                            </div>
                            <span className="list-time positive">+12%</span>
                        </div>
                        <div className="list-item">
                            <div className="list-icon">
                                <SFTrendingUp size={18} />
                            </div>
                            <div className="list-content">
                                <p>Gastos</p>
                                <span>$2.250 gastados</span>
                            </div>
                            <span className="list-time negative">-8%</span>
                        </div>
                    </div>
                </motion.section>

                <motion.section variants={itemVariants} className="app-section">
                    <div className="section-title">
                        <h3>Objetivos</h3>
                        <span className="pill">3 activos</span>
                    </div>
                    <div className="goal-card">
                        <div className="goal-header">
                            <div>
                                <p>Fondo de emergencia</p>
                                <span>$2.400 / $4.000</span>
                            </div>
                            <span className="goal-progress">60%</span>
                        </div>
                        <div className="hero-progress">
                            <div className="hero-progress-bar" style={{ width: '60%' }} />
                        </div>
                        <div className="goal-footer">
                            <span>Meta en 3 meses</span>
                            <button className="link-button">Actualizar</button>
                        </div>
                    </div>
                </motion.section>

                <motion.section variants={itemVariants} className="app-section">
                    <div className="section-title">
                        <h3>Agenda</h3>
                        <span className="pill">Hoy</span>
                    </div>
                    <div className="list-card">
                        <div className="list-item">
                            <div className="list-icon">
                                <SFCalendar size={18} />
                            </div>
                            <div className="list-content">
                                <p>Revisión semanal</p>
                                <span>10:00 AM · Google Meet</span>
                            </div>
                            <span className="list-time">30 min</span>
                        </div>
                        <div className="list-item">
                            <div className="list-icon">
                                <SFCheckCircle size={18} />
                            </div>
                            <div className="list-content">
                                <p>Planificación mensual</p>
                                <span>Pendiente</span>
                            </div>
                            <span className="list-time">2/5</span>
                        </div>
                    </div>
                </motion.section>
            </motion.div>
        </div>
    );
}
