import { motion, type Variants } from 'framer-motion';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { QuickActionsMenu } from '../components/ui/QuickActionsMenu';
import { useAppData } from '../context/AppDataContext';
import { useToday } from '../hooks/useToday';
import {
    SFWallet,
    SFCheckCircle,
    SFSparkles,
    SFTarget,
    SFTrendingUp
} from '../components/ui/SFIcons';

export function Home() {
    const { balance, income, expenses, tasks } = useAppData();
    const today = useToday();
    const time = new Date().getHours();
    const greeting = time < 12 ? 'Buenos días' : time < 18 ? 'Buenas tardes' : 'Buenas noches';
    const dateLabel = today.toLocaleDateString('es-ES', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, scale: 0.9, y: 10 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { type: "spring", stiffness: 200, damping: 20 }
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
                        {dateLabel}
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
                            <QuickActionsMenu
                                actions={[
                                    { label: "Registrar gasto", icon: <SFWallet size={18} /> },
                                    { label: "Nuevo objetivo", icon: <SFTarget size={18} /> }
                                ]}
                            />
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
                                <span className="hero-metric-value">${balance.toLocaleString('es-CO')}</span>
                                <span className="hero-metric-label">Balance</span>
                            </div>
                            <div>
                                <span className="hero-metric-value">0</span>
                                <span className="hero-metric-label">Objetivos</span>
                            </div>
                            <div>
                                <span className="hero-metric-value">{tasks.length}</span>
                                <span className="hero-metric-label">Eventos</span>
                            </div>
                        </div>
                        <div className="hero-progress">
                            <div className="hero-progress-bar" style={{ width: '0%' }} />
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
                                <span>${income.toLocaleString('es-CO')} recibidos</span>
                            </div>
                            <span className="list-time positive">+{Math.round((income / Math.max(income, 1)) * 100)}%</span>
                        </div>
                        <div className="list-item">
                            <div className="list-icon">
                                <SFTrendingUp size={18} />
                            </div>
                            <div className="list-content">
                                <p>Gastos</p>
                                <span>${expenses.toLocaleString('es-CO')} gastados</span>
                            </div>
                            <span className="list-time negative">-{Math.round((expenses / Math.max(income, 1)) * 100)}%</span>
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
                        <h3>Tareas puntuales</h3>
                    </div>
                    <div className="list-card">
                        {tasks.slice(0, 2).map((task) => (
                            <div className="list-item" key={task.id}>
                                <div className="list-icon">
                                    <SFCheckCircle size={18} />
                                </div>
                                <div className="list-content">
                                    <p>{task.title}</p>
                                    <span>{task.meta}</span>
                                </div>
                                <span className="list-time">{task.priority}</span>
                            </div>
                        ))}
                    </div>
                </motion.section>
            </motion.div>
        </div>
    );
}
