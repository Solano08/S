import { motion } from 'framer-motion';
import {
    ArrowUpRight,
    Plus,
    Calendar as CalendarIcon,
    Wallet,
    CheckCircle2,
    Sparkles,
    Target,
    TrendingUp
} from 'lucide-react';

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
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 }}
                        className="app-title"
                    >
                        {greeting}, Solano
                    </motion.h1>
                    <span className="app-subtitle">Centro de control personal</span>
                    <div className="app-header-actions">
                        <button className="icon-button" aria-label="Notas rápidas">
                            <Plus size={18} />
                        </button>
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
                                <Sparkles size={18} />
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
                        <h3>Acciones rápidas</h3>
                        <button className="link-button">
                            Editar
                            <ArrowUpRight size={14} />
                        </button>
                    </div>
                    <div className="quick-actions">
                        <button className="quick-action">
                            <Wallet size={18} />
                            Registrar gasto
                        </button>
                        <button className="quick-action">
                            <Target size={18} />
                            Nuevo objetivo
                        </button>
                        <button className="quick-action">
                            <CalendarIcon size={18} />
                            Agendar evento
                        </button>
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
                                <Wallet size={18} />
                            </div>
                            <div className="list-content">
                                <p>Ingresos</p>
                                <span>$3.450 recibidos</span>
                            </div>
                            <span className="list-time positive">+12%</span>
                        </div>
                        <div className="list-item">
                            <div className="list-icon">
                                <TrendingUp size={18} />
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
                                <CalendarIcon size={18} />
                            </div>
                            <div className="list-content">
                                <p>Revisión semanal</p>
                                <span>10:00 AM · Google Meet</span>
                            </div>
                            <span className="list-time">30 min</span>
                        </div>
                        <div className="list-item">
                            <div className="list-icon">
                                <CheckCircle2 size={18} />
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
