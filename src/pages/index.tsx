import { motion } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import { Plus, Briefcase, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export { Home } from './Home';
export const Projects = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 200, damping: 22 } as any
        }
    };

    return (
        <div className="app-screen">
            <header className="app-header">
                <div className="app-title-group">
                    <span className="app-date">Proyectos</span>
                    <h1 className="app-title">Activos y en progreso</h1>
                    <span className="app-subtitle">Prioriza, monitorea y cierra</span>
                </div>
                <div className="app-header-actions">
                    <button className="icon-button" aria-label="Nuevo proyecto">
                        <Plus size={18} />
                    </button>
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
                                <p className="hero-eyebrow">Resumen</p>
                                <h2 className="hero-title">3 proyectos activos</h2>
                            </div>
                            <div className="hero-icon">
                                <Briefcase size={18} />
                            </div>
                        </div>
                        <div className="hero-metrics">
                            <div>
                                <span className="hero-metric-value">2</span>
                                <span className="hero-metric-label">En curso</span>
                            </div>
                            <div>
                                <span className="hero-metric-value">1</span>
                                <span className="hero-metric-label">Por iniciar</span>
                            </div>
                            <div>
                                <span className="hero-metric-value">74%</span>
                                <span className="hero-metric-label">Completado</span>
                            </div>
                        </div>
                    </div>
                </motion.section>

                <motion.section variants={itemVariants} className="app-section">
                    <div className="section-title">
                        <h3>Prioridad hoy</h3>
                        <button className="link-button">
                            Ver todo
                            <ArrowUpRight size={14} />
                        </button>
                    </div>
                    <div className="list-card">
                        <div className="list-item">
                            <div className="list-icon">
                                <CheckCircle2 size={18} />
                            </div>
                            <div className="list-content">
                                <p>Rediseño UI</p>
                                <span>Entrega mañana</span>
                            </div>
                            <span className="list-time">80%</span>
                        </div>
                        <div className="list-item">
                            <div className="list-icon">
                                <CheckCircle2 size={18} />
                            </div>
                            <div className="list-content">
                                <p>Plan financiero 2026</p>
                                <span>Fase de revisión</span>
                            </div>
                            <span className="list-time">60%</span>
                        </div>
                    </div>
                </motion.section>

                <motion.section variants={itemVariants} className="app-section">
                    <div className="section-title">
                        <h3>Plantillas</h3>
                        <span className="pill">3 disponibles</span>
                    </div>
                    <div className="list-card">
                        <div className="list-item">
                            <div className="list-icon">
                                <Briefcase size={18} />
                            </div>
                            <div className="list-content">
                                <p>Proyecto personal</p>
                                <span>Objetivos, tareas y gastos</span>
                            </div>
                            <ArrowUpRight size={16} className="text-[var(--text-tertiary)]" />
                        </div>
                        <div className="list-item">
                            <div className="list-icon">
                                <Briefcase size={18} />
                            </div>
                            <div className="list-content">
                                <p>Planificación trimestral</p>
                                <span>Roadmap y métricas</span>
                            </div>
                            <ArrowUpRight size={16} className="text-[var(--text-tertiary)]" />
                        </div>
                    </div>
                </motion.section>
            </motion.div>
        </div>
    );
};
export const Finances = () => <div className="p-4"><GlassCard><h1 className="text-2xl font-bold">Finances</h1></GlassCard></div>;
export const Calendar = () => <div className="p-4"><GlassCard><h1 className="text-2xl font-bold">Calendar</h1></GlassCard></div>;
export const Ideas = () => <div className="p-4"><GlassCard><h1 className="text-2xl font-bold">Ideas</h1></GlassCard></div>;
export const Assistant = () => <div className="p-4"><GlassCard><h1 className="text-2xl font-bold">Assistant (S)</h1></GlassCard></div>;
