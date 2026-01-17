import { motion } from 'framer-motion';
import { useState } from 'react';
import {
    SFBriefcase,
    SFArrowUpRight,
    SFCheckCircle,
    SFWallet,
    SFTrendingUp,
    SFArrowDownRight,
    SFCalendar,
    SFClock,
    SFLightbulb,
    SFStar
} from '../components/ui/SFIcons';
import { QuickActionsMenu } from '../components/ui/QuickActionsMenu';

export { Home } from './Home';
export const Projects = () => {
    return (
        <div className="app-screen">
            <header className="app-header">
                <div className="app-title-group">
                    <span className="app-date">Proyectos</span>
                    <h1 className="app-title">Activos y en progreso</h1>
                    <span className="app-subtitle">Prioriza, monitorea y cierra</span>
                </div>
                <div className="app-header-actions">
                    <QuickActionsMenu />
                </div>
            </header>

            <div className="app-content">
                <section className="app-section">
                    <div className="hero-card">
                        <div className="hero-header">
                            <div>
                                <p className="hero-eyebrow">Resumen</p>
                                <h2 className="hero-title">3 proyectos activos</h2>
                            </div>
                            <div className="hero-icon">
                                <SFBriefcase size={18} />
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
                </section>

                <section className="app-section">
                    <div className="section-title">
                        <h3>Prioridad hoy</h3>
                        <button className="link-button">
                            Ver todo
                            <SFArrowUpRight size={14} />
                        </button>
                    </div>
                    <div className="list-card">
                        <div className="list-item">
                            <div className="list-icon">
                                <SFCheckCircle size={18} />
                            </div>
                            <div className="list-content">
                                <p>Rediseño UI</p>
                                <span>Entrega mañana</span>
                            </div>
                            <span className="list-time">80%</span>
                        </div>
                        <div className="list-item">
                            <div className="list-icon">
                                <SFCheckCircle size={18} />
                            </div>
                            <div className="list-content">
                                <p>Plan financiero 2026</p>
                                <span>Fase de revisión</span>
                            </div>
                            <span className="list-time">60%</span>
                        </div>
                    </div>
                </section>

                <section className="app-section">
                    <div className="section-title">
                        <h3>Plantillas</h3>
                        <span className="pill">3 disponibles</span>
                    </div>
                    <div className="list-card">
                        <div className="list-item">
                            <div className="list-icon">
                                <SFBriefcase size={18} />
                            </div>
                            <div className="list-content">
                                <p>Proyecto personal</p>
                                <span>Objetivos, tareas y gastos</span>
                            </div>
                            <SFArrowUpRight size={16} className="text-[var(--text-tertiary)]" />
                        </div>
                        <div className="list-item">
                            <div className="list-icon">
                                <SFBriefcase size={18} />
                            </div>
                            <div className="list-content">
                                <p>Planificación trimestral</p>
                                <span>Roadmap y métricas</span>
                            </div>
                            <SFArrowUpRight size={16} className="text-[var(--text-tertiary)]" />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};
export const Finances = () => {
    return (
        <div className="app-screen">
            <header className="app-header">
                <div className="app-title-group">
                    <span className="app-date">Finanzas</span>
                    <h1 className="app-title">Control claro y simple</h1>
                    <span className="app-subtitle">Balance, ingresos y gastos</span>
                </div>
                <div className="app-header-actions">
                    <QuickActionsMenu />
                </div>
            </header>

            <div className="app-content">
                <section className="app-section">
                    <div className="hero-card">
                        <div className="hero-header">
                            <div>
                                <p className="hero-eyebrow">Balance actual</p>
                                <h2 className="hero-title">$1.240 disponibles</h2>
                            </div>
                            <div className="hero-icon">
                                <SFWallet size={18} />
                            </div>
                        </div>
                        <div className="hero-metrics">
                            <div>
                                <span className="hero-metric-value">$3.450</span>
                                <span className="hero-metric-label">Ingresos</span>
                            </div>
                            <div>
                                <span className="hero-metric-value">$2.210</span>
                                <span className="hero-metric-label">Gastos</span>
                            </div>
                            <div>
                                <span className="hero-metric-value">+12%</span>
                                <span className="hero-metric-label">Mes</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="app-section">
                    <div className="section-title">
                        <h3>Movimientos recientes</h3>
                        <span className="pill">Hoy</span>
                    </div>
                    <div className="list-card">
                        <div className="list-item">
                            <div className="list-icon">
                                <SFTrendingUp size={18} />
                            </div>
                            <div className="list-content">
                                <p>Pago freelance</p>
                                <span>Ingresos</span>
                            </div>
                            <span className="list-time positive">+$420</span>
                        </div>
                        <div className="list-item">
                            <div className="list-icon">
                                <SFArrowDownRight size={18} />
                            </div>
                            <div className="list-content">
                                <p>Supermercado</p>
                                <span>Hogar</span>
                            </div>
                            <span className="list-time negative">-$86</span>
                        </div>
                    </div>
                </section>

                <section className="app-section">
                    <div className="section-title">
                        <h3>Presupuesto</h3>
                        <span className="pill">62% usado</span>
                    </div>
                    <div className="goal-card">
                        <div className="goal-header">
                            <div>
                                <p>Gastos variables</p>
                                <span>$1.240 / $2.000</span>
                            </div>
                            <span className="goal-progress">62%</span>
                        </div>
                        <div className="hero-progress">
                            <div className="hero-progress-bar" style={{ width: '62%' }} />
                        </div>
                        <div className="goal-footer">
                            <span>4 días restantes</span>
                            <button className="link-button">Ajustar</button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export const Calendar = () => {
    const [calendarOpen, setCalendarOpen] = useState(false);

    return (
        <div className="app-screen">
            <header className="app-header">
                <div className="app-title-group">
                    <span className="app-date">Calendario</span>
                    <h1 className="app-title">Agenda clara y accionable</h1>
                    <div className="day-status-row">
                        <span className="day-status-date">Viernes, 16 de enero</span>
                        <span className="day-status-dot day-status-focus" />
                        <span className="day-status-label day-status-focus">Día de enfoque</span>
                    </div>
                </div>
                <div className="app-header-actions">
                    <QuickActionsMenu />
                </div>
            </header>

            <div className="app-content">
                <section className="app-section">
                    <div className="hero-card">
                        <div className="hero-header">
                            <div>
                                <p className="hero-eyebrow">Hoy</p>
                                <h2 className="hero-title">2 eventos pendientes</h2>
                            </div>
                            <button
                                className="hero-icon-button"
                                aria-label="Abrir calendario"
                                onClick={() => setCalendarOpen(true)}
                            >
                                <SFCalendar size={18} />
                            </button>
                        </div>
                        <div className="day-event-list horizontal">
                            <div className="day-event-item horizontal">
                                <div className="day-event-badge">16</div>
                                <div className="day-event-info">
                                    <span className="day-event-title">Revisión semanal</span>
                                    <span className="day-event-meta">Planificación y prioridades</span>
                                    <span className="day-event-time-range">08:00 - 09:30</span>
                                </div>
                            </div>
                            <div className="day-event-item horizontal">
                                <div className="day-event-badge">16</div>
                                <div className="day-event-info">
                                    <span className="day-event-title">Trabajo profundo</span>
                                    <span className="day-event-meta">Bloque sin interrupciones</span>
                                    <span className="day-event-time-range">14:00 - 15:30</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="app-section">
                    <div className="section-title">
                        <h3>Agenda de hoy</h3>
                        <span className="pill">Viernes</span>
                    </div>
                    <div className="list-card">
                        <div className="list-item">
                            <div className="list-icon">
                                <SFClock size={18} />
                            </div>
                            <div className="list-content">
                                <p>Enviar correo al SENA</p>
                                <span>10:00 AM</span>
                            </div>
                            <span className="list-time">Prioridad alta</span>
                        </div>
                        <div className="list-item">
                            <div className="list-icon">
                                <SFClock size={18} />
                            </div>
                            <div className="list-content">
                                <p>Mandado de mi mamá</p>
                                <span>Comprar carne</span>
                            </div>
                            <span className="list-time">Pendiente</span>
                        </div>
                    </div>
                </section>
            </div>

            {calendarOpen && (
                <div className="calendar-modal">
                    <button
                        className="calendar-backdrop"
                        aria-label="Cerrar calendario"
                        onClick={() => setCalendarOpen(false)}
                    />
                    <motion.div
                        className="calendar-modal-card"
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.98 }}
                        transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
                    >
                        <div className="section-title">
                            <h3>Calendario</h3>
                            <span className="pill">Semana</span>
                        </div>
                        <div className="calendar-card">
                            <div className="calendar-tabs">
                                <button className="calendar-tab calendar-tab-active">Semana</button>
                                <button className="calendar-tab">Mes</button>
                                <button className="calendar-tab">Año</button>
                            </div>
                            <div className="calendar-month">Enero 2026</div>
                            <div className="calendar-grid">
                                <div className="calendar-day calendar-day-muted">L</div>
                                <div className="calendar-day calendar-day-muted">M</div>
                                <div className="calendar-day calendar-day-muted">M</div>
                                <div className="calendar-day calendar-day-muted">J</div>
                                <div className="calendar-day calendar-day-muted">V</div>
                                <div className="calendar-day calendar-day-muted">S</div>
                                <div className="calendar-day calendar-day-muted">D</div>
                                <div className="calendar-day calendar-day-muted">30</div>
                                <div className="calendar-day calendar-day-muted">31</div>
                                <div className="calendar-day">1</div>
                                <div className="calendar-day">2</div>
                                <div className="calendar-day">3</div>
                                <div className="calendar-day">4</div>
                                <div className="calendar-day">5</div>
                                <div className="calendar-day calendar-day-active">6</div>
                                <div className="calendar-day">7</div>
                                <div className="calendar-day">8</div>
                                <div className="calendar-day">9</div>
                                <div className="calendar-day">10</div>
                                <div className="calendar-day">11</div>
                                <div className="calendar-day">12</div>
                                <div className="calendar-day">13</div>
                                <div className="calendar-day">14</div>
                                <div className="calendar-day">15</div>
                                <div className="calendar-day">16</div>
                                <div className="calendar-day">17</div>
                                <div className="calendar-day">18</div>
                                <div className="calendar-day">19</div>
                                <div className="calendar-day">20</div>
                                <div className="calendar-day">21</div>
                                <div className="calendar-day">22</div>
                                <div className="calendar-day">23</div>
                                <div className="calendar-day">24</div>
                                <div className="calendar-day">25</div>
                                <div className="calendar-day">26</div>
                                <div className="calendar-day">27</div>
                                <div className="calendar-day">28</div>
                                <div className="calendar-day">29</div>
                                <div className="calendar-day">30</div>
                                <div className="calendar-day calendar-day-muted">1</div>
                                <div className="calendar-day calendar-day-muted">2</div>
                                <div className="calendar-day calendar-day-muted">3</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export const Ideas = () => {
    return (
        <div className="app-screen">
            <header className="app-header">
                <div className="app-title-group">
                    <span className="app-date">Ideas</span>
                    <h1 className="app-title">Captura inspiración rápida</h1>
                    <span className="app-subtitle">Organiza y prioriza</span>
                </div>
                <div className="app-header-actions">
                    <QuickActionsMenu />
                </div>
            </header>

            <div className="app-content">
                <section className="app-section">
                    <div className="hero-card">
                        <div className="hero-header">
                            <div>
                                <p className="hero-eyebrow">Bandeja</p>
                                <h2 className="hero-title">5 ideas activas</h2>
                            </div>
                            <div className="hero-icon">
                                <SFLightbulb size={18} />
                            </div>
                        </div>
                        <div className="hero-metrics">
                            <div>
                                <span className="hero-metric-value">2</span>
                                <span className="hero-metric-label">Hoy</span>
                            </div>
                            <div>
                                <span className="hero-metric-value">3</span>
                                <span className="hero-metric-label">Semana</span>
                            </div>
                            <div>
                                <span className="hero-metric-value">1</span>
                                <span className="hero-metric-label">Favorita</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="app-section">
                    <div className="section-title">
                        <h3>Recientes</h3>
                        <span className="pill">Hoy</span>
                    </div>
                    <div className="list-card">
                        <div className="list-item">
                            <div className="list-icon">
                                <SFLightbulb size={18} />
                            </div>
                            <div className="list-content">
                                <p>Rutina matinal optimizada</p>
                                <span>Personal · 08:30</span>
                            </div>
                            <SFArrowUpRight size={16} className="text-[var(--text-tertiary)]" />
                        </div>
                        <div className="list-item">
                            <div className="list-icon">
                                <SFLightbulb size={18} />
                            </div>
                            <div className="list-content">
                                <p>Plan de ahorro automático</p>
                                <span>Finanzas · 09:10</span>
                            </div>
                            <SFArrowUpRight size={16} className="text-[var(--text-tertiary)]" />
                        </div>
                    </div>
                </section>

                <section className="app-section">
                    <div className="section-title">
                        <h3>Favoritas</h3>
                        <span className="pill">1</span>
                    </div>
                    <div className="list-card">
                        <div className="list-item">
                            <div className="list-icon">
                                <SFStar size={18} />
                            </div>
                            <div className="list-content">
                                <p>Dashboard mensual simplificado</p>
                                <span>UI/UX · Guardada</span>
                            </div>
                            <SFArrowUpRight size={16} className="text-[var(--text-tertiary)]" />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export const Assistant = () => (
    <div className="app-screen">
        <header className="app-header">
            <div className="app-title-group">
                <span className="app-date">Inicio</span>
                <h1 className="app-title">Pantalla principal</h1>
                <span className="app-subtitle">Accede desde la S central</span>
            </div>
        </header>
        <div className="app-content">
            <div className="hero-card">
                <div className="hero-header">
                    <div>
                        <p className="hero-eyebrow">Estado</p>
                        <h2 className="hero-title">Todo en orden</h2>
                    </div>
                    <div className="hero-icon">
                        <SFBriefcase size={18} />
                    </div>
                </div>
            </div>
        </div>
    </div>
);
