import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
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
    SFStar,
    SFPlus,
    SFTarget,
    SFTrash
} from '../components/ui/SFIcons';
import { QuickActionsMenu } from '../components/ui/QuickActionsMenu';
import { useAppData } from '../context/AppDataContext';
import { useToday } from '../hooks/useToday';

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
                    <QuickActionsMenu
                        actions={[
                            { label: "Nuevo proyecto", icon: <SFBriefcase size={18} /> },
                            { label: "Revisar entregas", icon: <SFArrowUpRight size={18} /> }
                        ]}
                    />
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
    const { balance, income, expenses, transactions } = useAppData();
    const percentUsed = Math.round((expenses / Math.max(income, 1)) * 100);

    return (
        <div className="app-screen">
            <header className="app-header">
                <div className="app-title-group">
                    <span className="app-date">Finanzas</span>
                    <h1 className="app-title">Control claro y simple</h1>
                    <span className="app-subtitle">Balance, ingresos y gastos</span>
                </div>
                <div className="app-header-actions">
                    <QuickActionsMenu
                        actions={[
                            { label: "Registrar gasto", icon: <SFWallet size={18} /> },
                            { label: "Nuevo ingreso", icon: <SFTrendingUp size={18} /> }
                        ]}
                    />
                </div>
            </header>

            <div className="app-content">
                <section className="app-section">
                    <div className="hero-card">
                        <div className="hero-header">
                            <div>
                                <p className="hero-eyebrow">Balance actual</p>
                                <h2 className="hero-title">${balance.toLocaleString('es-CO')} disponibles</h2>
                            </div>
                            <div className="hero-icon">
                                <SFWallet size={18} />
                            </div>
                        </div>
                        <div className="hero-metrics">
                            <div>
                                <span className="hero-metric-value">${income.toLocaleString('es-CO')}</span>
                                <span className="hero-metric-label">Ingresos</span>
                            </div>
                            <div>
                                <span className="hero-metric-value">${expenses.toLocaleString('es-CO')}</span>
                                <span className="hero-metric-label">Gastos</span>
                            </div>
                            <div>
                                <span className="hero-metric-value">-{percentUsed}%</span>
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
                        {transactions.map((tx) => (
                            <div className="list-item" key={tx.id}>
                                <div className="list-icon">
                                    {tx.amount >= 0 ? (
                                        <SFTrendingUp size={18} />
                                    ) : (
                                        <SFArrowDownRight size={18} />
                                    )}
                                </div>
                                <div className="list-content">
                                    <p>{tx.title}</p>
                                    <span>{tx.category}</span>
                                </div>
                                <span className={tx.amount >= 0 ? "list-time positive" : "list-time negative"}>
                                    {tx.amount >= 0 ? "+" : "-"}${Math.abs(tx.amount).toLocaleString('es-CO')}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="app-section">
                    <div className="section-title">
                        <h3>Presupuesto</h3>
                        <span className="pill">{percentUsed}% usado</span>
                    </div>
                    <div className="goal-card">
                        <div className="goal-header">
                            <div>
                                <p>Gastos variables</p>
                                <span>${expenses.toLocaleString('es-CO')} / ${income.toLocaleString('es-CO')}</span>
                            </div>
                            <span className="goal-progress">{percentUsed}%</span>
                        </div>
                        <div className="hero-progress">
                            <div className="hero-progress-bar" style={{ width: `${percentUsed}%` }} />
                        </div>
                        <div className="goal-footer">
                            <span>Corte: 15 de enero</span>
                            <button className="link-button">Ajustar</button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export const Calendar = () => {
    const todayHook = useToday();
    // Validación defensiva para asegurar que today sea una fecha válida
    const today = (todayHook && todayHook instanceof Date && !isNaN(todayHook.getTime())) 
        ? todayHook 
        : new Date();
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [tasksOpen, setTasksOpen] = useState(false);
    const [editingTaskInModal, setEditingTaskInModal] = useState<string | null>(null);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [completedModalOpen, setCompletedModalOpen] = useState(false);
    const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ type: 'task' | 'event'; id: string } | null>(null);
    const [taskTitle, setTaskTitle] = useState("");
    const [taskDate, setTaskDate] = useState("");
    const [taskTime, setTaskTime] = useState("");
    const [taskPriority, setTaskPriority] = useState("Media");
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [pickerMode, setPickerMode] = useState<"date" | "time" | null>(null);
    const [calendarMode, setCalendarMode] = useState<"calendar" | "event">("calendar");
    const [calendarView, setCalendarView] = useState<"semana" | "mes" | "año">("mes");
    const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);
    const [eventDate, setEventDate] = useState<Date | null>(null);
    const [eventTitle, setEventTitle] = useState("");
    const [eventDescription, setEventDescription] = useState("");
    const [eventTime, setEventTime] = useState("");
    const [eventPriority, setEventPriority] = useState("Media");
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editingEventId, setEditingEventId] = useState<string | null>(null);
    const { tasks, events, addTask, updateTask, deleteTask, addEvent, updateEvent, deleteEvent } = useAppData();

    // Validaciones defensivas para evitar errores - usar useMemo para reactividad
    const safeTasks = useMemo(() => Array.isArray(tasks) ? tasks : [], [tasks]);
    const safeEvents = useMemo(() => Array.isArray(events) ? events : [], [events]);

    // Filtrar eventos del día actual (usando hora local, no UTC)
    const formatDateLocal = (date: Date) => {
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const todayDateString = formatDateLocal(today);
    const dayEvents = useMemo(() => {
        if (!Array.isArray(safeEvents)) return [];
        return safeEvents
            .filter((event) => event && event.event_date === todayDateString && !event.completed)
            .map((event) => ({
                id: event.id || '',
                title: event.title || '',
                meta: event.description || '',
                time: event.event_time || '',
                priority: event.priority || 'Media'
            }));
    }, [safeEvents, todayDateString]);
    
    const completedDayEvents = useMemo(() => {
        if (!Array.isArray(safeEvents)) return [];
        return safeEvents
            .filter((event) => event && event.event_date === todayDateString && event.completed)
            .map((event) => ({
                id: event.id || '',
                title: event.title || '',
                meta: event.description || '',
                time: event.event_time || '',
                priority: event.priority || 'Media'
            }));
    }, [safeEvents, todayDateString]);

    // Filtrar tareas: pendientes (no completadas) y completadas
    const pendingTasks = useMemo(() => safeTasks.filter(task => task && !task.completed), [safeTasks]);
    const completedTasks = useMemo(() => safeTasks.filter(task => task && task.completed), [safeTasks]);
    const visibleTasks = useMemo(() => pendingTasks.slice(0, 3), [pendingTasks]);
    
    // Calcular contadores con useMemo para que se actualicen automáticamente
    const pendingCount = useMemo(() => pendingTasks.length, [pendingTasks]);
    const completedCount = useMemo(() => completedTasks.length, [completedTasks]);
    const eventsCount = useMemo(() => dayEvents.length, [dayEvents]);
    const completedEventsCount = useMemo(() => completedDayEvents.length, [completedDayEvents]);
    const totalCount = useMemo(() => pendingCount + eventsCount, [pendingCount, eventsCount]);
    const pendingLabel = useMemo(() => totalCount === 1 ? "evento pendiente" : "eventos pendientes", [totalCount]);
    
    // Calcular progreso con useMemo para que se actualice automáticamente
    const progressData = useMemo(() => {
        const total = totalCount + completedCount + completedEventsCount;
        const completed = completedCount + completedEventsCount;
        if (total === 0) {
            return { percentage: 0, percentageText: '0% completado', allCompleted: false };
        }
        const percentage = Math.round((completed / total) * 100);
        const allCompleted = total > 0 && completed === total;
        return { 
            percentage, 
            percentageText: allCompleted ? '¡Todo completado!' : `${percentage}% completado`,
            total,
            completed,
            allCompleted
        };
    }, [totalCount, completedCount, completedEventsCount]);
    const dayStatusDate = useMemo(() => {
        try {
            if (!today || !(today instanceof Date) || isNaN(today.getTime())) {
                return new Date().toLocaleDateString("es-ES", {
                    weekday: "long",
                    day: "numeric",
                    month: "long"
                });
            }
            const label = today.toLocaleDateString("es-ES", {
                weekday: "long",
                day: "numeric",
                month: "long"
            });
            return label.charAt(0).toUpperCase() + label.slice(1);
        } catch (error) {
            console.error("Error en dayStatusDate:", error);
            return "Hoy";
        }
    }, [today]);
    const monthLabel = useMemo(() => {
        try {
            const dateToUse = selectedMonth ?? today;
            if (!dateToUse || !(dateToUse instanceof Date) || isNaN(dateToUse.getTime())) {
                return new Date().toLocaleDateString("es-ES", {
                    month: "long",
                    year: "numeric"
                });
            }
            const label = dateToUse.toLocaleDateString("es-ES", {
                month: "long",
                year: "numeric"
            });
            return label.charAt(0).toUpperCase() + label.slice(1);
        } catch (error) {
            console.error("Error en monthLabel:", error);
            return new Date().toLocaleDateString("es-ES", { month: "long", year: "numeric" });
        }
    }, [selectedMonth, today]);
    const calendarDays = useMemo(() => {
        try {
            const dateToUse = selectedMonth ?? today;
            if (!dateToUse || !(dateToUse instanceof Date) || isNaN(dateToUse.getTime())) {
                const fallbackDate = new Date();
                const year = fallbackDate.getFullYear();
                const month = fallbackDate.getMonth();
                const startOfMonth = new Date(year, month, 1);
                const startIndex = (startOfMonth.getDay() + 6) % 7;
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const daysInPrevMonth = new Date(year, month, 0).getDate();
                const totalCells = 42;

                return Array.from({ length: totalCells }, (_, index) => {
                    let dayNumber = 0;
                    let monthOffset = 0;

                    if (index < startIndex) {
                        dayNumber = daysInPrevMonth - startIndex + index + 1;
                        monthOffset = -1;
                    } else if (index >= startIndex + daysInMonth) {
                        dayNumber = index - (startIndex + daysInMonth) + 1;
                        monthOffset = 1;
                    } else {
                        dayNumber = index - startIndex + 1;
                        monthOffset = 0;
                    }

                    const dayDate = new Date(year, month + monthOffset, dayNumber);
                    return {
                        key: `${year}-${month + monthOffset}-${dayNumber}-${index}`,
                        dayNumber,
                        isCurrentMonth: monthOffset === 0,
                        isToday: false,
                        date: dayDate
                    };
                });
            }
            
            const year = dateToUse.getFullYear();
            const month = dateToUse.getMonth();
            const startOfMonth = new Date(year, month, 1);
            const startIndex = (startOfMonth.getDay() + 6) % 7;
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const daysInPrevMonth = new Date(year, month, 0).getDate();
            const totalCells = 42;

            return Array.from({ length: totalCells }, (_, index) => {
                let dayNumber = 0;
                let monthOffset = 0;

                if (index < startIndex) {
                    dayNumber = daysInPrevMonth - startIndex + index + 1;
                    monthOffset = -1;
                } else if (index >= startIndex + daysInMonth) {
                    dayNumber = index - (startIndex + daysInMonth) + 1;
                    monthOffset = 1;
                } else {
                    dayNumber = index - startIndex + 1;
                    monthOffset = 0;
                }

                const dayDate = new Date(year, month + monthOffset, dayNumber);
                const isToday =
                    monthOffset === 0 &&
                    dayNumber === today.getDate() &&
                    month === today.getMonth() &&
                    year === today.getFullYear();

                return {
                    key: `${year}-${month + monthOffset}-${dayNumber}-${index}`,
                    dayNumber,
                    isCurrentMonth: monthOffset === 0,
                    isToday,
                    date: dayDate
                };
            });
        } catch (error) {
            console.error("Error en calendarDays:", error);
            return [];
        }
    }, [selectedMonth, today]);

    const calendarWeekDays = useMemo(() => {
        try {
            if (!today || !(today instanceof Date) || isNaN(today.getTime())) {
                const fallbackDate = new Date();
                const year = fallbackDate.getFullYear();
                const month = fallbackDate.getMonth();
                const currentDay = fallbackDate.getDate();
                const currentDate = new Date(year, month, currentDay);
                const dayOfWeek = (currentDate.getDay() + 6) % 7;
                const weekStart = new Date(currentDate);
                weekStart.setDate(currentDay - dayOfWeek);

                return Array.from({ length: 7 }, (_, index) => {
                    const weekDate = new Date(weekStart);
                    weekDate.setDate(weekStart.getDate() + index);
                    return {
                        key: `week-${index}`,
                        dayNumber: weekDate.getDate(),
                        dayName: weekDate.toLocaleDateString("es-ES", { weekday: "short" }),
                        date: weekDate,
                        isToday: false
                    };
                });
            }
            
            const year = today.getFullYear();
            const month = today.getMonth();
            const currentDay = today.getDate();
            const currentDate = new Date(year, month, currentDay);
            const dayOfWeek = (currentDate.getDay() + 6) % 7;
            const weekStart = new Date(currentDate);
            weekStart.setDate(currentDay - dayOfWeek);

            return Array.from({ length: 7 }, (_, index) => {
                const weekDate = new Date(weekStart);
                weekDate.setDate(weekStart.getDate() + index);
                return {
                    key: `week-${index}`,
                    dayNumber: weekDate.getDate(),
                    dayName: weekDate.toLocaleDateString("es-ES", { weekday: "short" }),
                    date: weekDate,
                    isToday: weekDate.toDateString() === today.toDateString()
                };
            });
        } catch (error) {
            console.error("Error en calendarWeekDays:", error);
            return [];
        }
    }, [today]);

    const calendarMonths = useMemo(() => {
        try {
            if (!today || !(today instanceof Date) || isNaN(today.getTime())) {
                const fallbackDate = new Date();
                const currentYear = fallbackDate.getFullYear();
                return Array.from({ length: 12 }, (_, index) => {
                    const monthDate = new Date(currentYear, index, 1);
                    return {
                        key: `month-${index}`,
                        monthNumber: index,
                        monthName: monthDate.toLocaleDateString("es-ES", { month: "long" }),
                        isCurrentMonth: index === fallbackDate.getMonth()
                    };
                });
            }
            
            const currentYear = today.getFullYear();
            return Array.from({ length: 12 }, (_, index) => {
                const monthDate = new Date(currentYear, index, 1);
                return {
                    key: `month-${index}`,
                    monthNumber: index,
                    monthName: monthDate.toLocaleDateString("es-ES", { month: "long" }),
                    isCurrentMonth: index === today.getMonth()
                };
            });
        } catch (error) {
            console.error("Error en calendarMonths:", error);
            return [];
        }
    }, [today]);

    const calendarYears = useMemo(() => {
        try {
            if (!today || !(today instanceof Date) || isNaN(today.getTime())) {
                const fallbackDate = new Date();
                const currentYear = fallbackDate.getFullYear();
                const startYear = currentYear - 5;
                return Array.from({ length: 11 }, (_, index) => {
                    const year = startYear + index;
                    return {
                        key: `year-${year}`,
                        year,
                        isCurrentYear: year === currentYear
                    };
                });
            }
            
            const currentYear = today.getFullYear();
            const startYear = currentYear - 5;
            return Array.from({ length: 11 }, (_, index) => {
                const year = startYear + index;
                return {
                    key: `year-${year}`,
                    year,
                    isCurrentYear: year === currentYear
                };
            });
        } catch (error) {
            console.error("Error en calendarYears:", error);
            return [];
        }
    }, [today]);
    const timeSlots = useMemo(() => {
        const slots: string[] = [];
        for (let hour = 0; hour < 24; hour += 1) {
            for (const minute of [0, 30]) {
                const h = `${hour}`.padStart(2, "0");
                const m = `${minute}`.padStart(2, "0");
                slots.push(`${h}:${m}`);
            }
        }
        return slots;
    }, []);
    const dayStatus = useMemo(() => {
        try {
            const totalPending = (pendingCount || 0) + (dayEvents?.length || 0);
            if (totalPending === 0) {
                return { label: "Día despejado", className: "day-status-relax" };
            }
            if (totalPending <= 2) {
                return { label: "Día balanceado", className: "day-status-work" };
            }
            return { label: "Día de enfoque", className: "day-status-focus" };
        } catch (error) {
            console.error("Error en dayStatus:", error);
            return { label: "Día despejado", className: "day-status-relax" };
        }
    }, [dayEvents.length, pendingCount]);

    useEffect(() => {
        if (!calendarOpen) return;
        setCalendarMode("calendar");
        setEventDate(null);
        setEventTitle("");
        setEventDescription("");
        setEventTime("");
        setEventPriority("Media");
        setEditingEventId(null);
    }, [calendarOpen]);

    const handleSaveTask = () => {
        // Validar que el título esté presente
        if (!taskTitle.trim()) {
            alert("Por favor, ingresa un título para la tarea");
            return;
        }

        // Si no hay fecha seleccionada, usar la fecha de hoy por defecto
        let dateToUse: Date = selectedDate || today;
        let formattedDate = taskDate;
        
        // Si no hay fecha formateada ni selectedDate, usar la fecha de hoy
        if (!formattedDate && !selectedDate) {
            formattedDate = today.toLocaleDateString("es-ES", { day: "numeric", month: "short" }).replace(".", "");
            dateToUse = today;
        } else if (!formattedDate && selectedDate) {
            formattedDate = selectedDate.toLocaleDateString("es-ES", { day: "numeric", month: "short" }).replace(".", "");
            dateToUse = selectedDate;
        } else if (formattedDate && !selectedDate) {
            // Si hay fecha formateada pero no selectedDate, usar today para verificar si es hoy
            dateToUse = today;
        }

        // Determinar si es "hoy"
        const isToday = dateToUse.getDate() === today.getDate() &&
            dateToUse.getMonth() === today.getMonth() &&
            dateToUse.getFullYear() === today.getFullYear();

        // Formatear meta: si hay hora, mostrar "hora · fecha", si no, mostrar "Hoy - fecha" o solo "fecha"
        let meta = "";
        if (taskTime) {
            if (isToday) {
                meta = `${taskTime} · Hoy`;
            } else {
                meta = `${taskTime} · ${formattedDate}`;
            }
        } else if (isToday) {
            meta = `Hoy - ${formattedDate}`;
        } else {
            meta = formattedDate;
        }

        if (editingTaskId) {
            updateTask(editingTaskId, {
                title: taskTitle.trim(),
                meta: meta,
                priority: taskPriority || "Media"
            });
        } else {
            addTask({
                title: taskTitle.trim(),
                meta: meta,
                priority: taskPriority || "Media"
            });
        }

        setEditingTaskId(null);
        setTaskTitle("");
        setTaskDate("");
        setTaskTime("");
        setTaskPriority("Media");
        setPickerMode(null);
        setSelectedDate(null);
        setShowTaskForm(false);
        
        // Si estamos editando en el modal, cerrar el modo de edición
        if (editingTaskInModal) {
            setEditingTaskInModal(null);
        }
    };

    const handleOpenTaskForm = () => {
        setEditingTaskId(null);
        setTaskTitle("");
        setTaskDate("");
        setTaskTime("");
        setTaskPriority("Media");
        setPickerMode(null);
        setSelectedDate(null);
        setShowTaskForm(true);
    };

    const handleSelectDate = (date: Date) => {
        const label = date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
        setSelectedDate(date);
        setTaskDate(label.replace(".", ""));
        setPickerMode(null);
    };

    const handleSelectTime = (value: string) => {
        setTaskTime(value);
        setPickerMode(null);
    };

    const handleSaveEvent = async () => {
        console.log('🔵 handleSaveEvent llamado', { eventTitle, eventDate, editingEventId });
        
        if (!eventTitle.trim()) {
            console.warn('⚠️ El título del evento está vacío');
            alert('Por favor, ingresa un título para el evento');
            return;
        }
        
        // Formatear fecha en hora local (no UTC) para evitar problemas de zona horaria
        const formatDateLocal = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        const eventDateString = formatDateLocal(eventDate ?? today);
        
        console.log('📅 Guardando evento:', {
            title: eventTitle.trim(),
            description: eventDescription.trim() || "Sin descripción",
            event_time: eventTime || "Sin hora",
            event_date: eventDateString,
            priority: eventPriority
        });
        
        try {
            if (editingEventId) {
                console.log('✏️ Actualizando evento:', editingEventId);
                await updateEvent(editingEventId, {
                    title: eventTitle.trim(),
                    description: eventDescription.trim() || "Sin descripción",
                    event_time: eventTime || "Sin hora",
                    event_date: eventDateString,
                    priority: eventPriority
                });
                console.log('✅ Evento actualizado exitosamente');
            } else {
                console.log('➕ Agregando nuevo evento');
                await addEvent({
                    title: eventTitle.trim(),
                    description: eventDescription.trim() || "Sin descripción",
                    event_time: eventTime || "Sin hora",
                    event_date: eventDateString,
                    priority: eventPriority
                });
                console.log('✅ Evento agregado exitosamente');
            }
            
            // Limpiar formulario y cerrar modal solo si se guardó correctamente
            console.log('🧹 Limpiando formulario y cerrando modal');
            setEditingEventId(null);
            setEventTitle("");
            setEventDescription("");
            setEventTime("");
            setEventPriority("Media");
            setEventDate(null);
            setCalendarMode("calendar");
            setCalendarOpen(false);
            console.log('✅ Modal cerrado y formulario limpiado');
        } catch (error) {
            console.error("❌ Error guardando evento:", error);
            alert(`Error al guardar el evento: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    };
    const handleEditTask = (id: string) => {
        const task = safeTasks.find((item) => item && item.id === id);
        if (!task) return;
        setEditingTaskId(id);
        setTaskTitle(task.title);
        
        // Parsear meta para extraer fecha y hora
        const meta = task.meta || "";
        let parsedDate = "";
        let parsedTime = "";
        
        if (meta.includes(" · ")) {
            // Formato: "hora · fecha" o "hoy - fecha"
            const parts = meta.split(" · ");
            if (parts.length === 2) {
                // Verificar si la primera parte es una hora (formato HH:MM)
                if (/^\d{2}:\d{2}$/.test(parts[0].trim())) {
                    parsedTime = parts[0].trim();
                    parsedDate = parts[1].trim();
                } else {
                    parsedDate = parts[0].trim();
                }
            }
        } else if (meta.includes(" - ")) {
            // Formato: "hoy - fecha"
            const parts = meta.split(" - ");
            if (parts.length === 2) {
                parsedDate = parts[1].trim();
            }
        } else if (meta && meta !== "Sin fecha") {
            // Solo fecha
            parsedDate = meta.trim();
        }
        
        setTaskDate(parsedDate);
        setTaskTime(parsedTime);
        setTaskPriority(task.priority || "Media");
        setPickerMode(null);
        setSelectedDate(null);
        setShowTaskForm(true);
    };

    const handleDeleteTask = (id: string) => {
        const confirmed = window.confirm("¿Eliminar esta tarea?");
        if (!confirmed) return;
        deleteTask(id);
    };

    const handleEditEvent = (id: string) => {
        const event = safeEvents.find((item) => item && item.id === id);
        if (!event) return;
        setEditingEventId(id);
        setEventTitle(event.title);
        setEventDescription(event.description);
        setEventTime(event.event_time);
        setEventPriority(event.priority);
        setEventDate(new Date(event.event_date));
        setCalendarMode("event");
        setCalendarOpen(true);
    };

    const handleDeleteEvent = (id: string) => {
        setDeleteConfirmModal({ type: 'event', id });
    };

    const SwipeTaskItem = ({
        task
    }: {
        task: { id: string; title: string; meta: string; priority: string };
    }) => {
        const [offset, setOffset] = useState(0);
        const [open, setOpen] = useState(false);
        const [isCompleting, setIsCompleting] = useState(false);
        const [isExiting, setIsExiting] = useState(false);
        const startXRef = useRef<number | null>(null);
        const draggingRef = useRef(false);

        const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
            startXRef.current = event.clientX - offset;
            draggingRef.current = true;
        };

        const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
            if (!draggingRef.current || startXRef.current === null) return;
            const deltaX = event.clientX - startXRef.current;
            if (Math.abs(deltaX) < 6) return;
            const next = Math.max(-120, Math.min(0, deltaX));
            setOffset(next);
            setOpen(next < -10);
        };

        const onPointerUp = () => {
            if (!draggingRef.current) return;
            draggingRef.current = false;
            if (offset < -60) {
                setOffset(-120);
                setOpen(true);
            } else {
                setOffset(0);
                setOpen(false);
            }
        };

        const closeRow = () => {
            setOffset(0);
            setOpen(false);
        };

        const handleCompleteTask = (e: React.MouseEvent) => {
            e.stopPropagation();
            if (isCompleting || !task?.id) return; // Prevenir múltiples clicks y validar task
            
            setIsCompleting(true);
            
            // Iniciar la animación de salida inmediatamente pero con transición suave
            setTimeout(() => {
                setIsExiting(true);
            }, 100);
        };

        const handleAnimationComplete = () => {
            if (isExiting && task?.id) {
                // Marcar tarea como completada en lugar de eliminarla
                try {
                    updateTask(task.id, { completed: true });
                } catch (error) {
                    console.error("Error completando tarea:", error);
                }
            }
        };

        const actionsTranslate = Math.max(0, 120 + offset);

        return (
            <motion.div
                className={clsx("swipe-row", open && "open")}
                layout
                initial={{ opacity: 1, scale: 1 }}
                animate={isExiting ? { 
                    opacity: 0, 
                    scale: 0.98,
                    height: 0,
                    marginBottom: 0
                } : { 
                    opacity: 1, 
                    scale: 1
                }}
                transition={{ 
                    opacity: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
                    scale: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
                    height: { 
                        duration: 0.35, 
                        ease: [0.25, 0.1, 0.25, 1],
                        delay: 0.05
                    },
                    marginBottom: { 
                        duration: 0.35, 
                        ease: [0.25, 0.1, 0.25, 1],
                        delay: 0.05
                    },
                    layout: { 
                        duration: 0.35, 
                        ease: [0.25, 0.1, 0.25, 1]
                    }
                }}
                onAnimationComplete={handleAnimationComplete}
                style={{ overflow: "hidden" }}
            >
                <div
                    className="swipe-actions"
                    style={{ transform: `translateX(${actionsTranslate}px)` }}
                >
                    <button
                        className="swipe-action edit"
                        onClick={() => {
                            closeRow();
                            if (tasksOpen) {
                                // Si estamos en el modal, editar dentro del modal
                                setEditingTaskInModal(task.id);
                                const taskToEdit = safeTasks.find((t) => t && t.id === task.id);
                                if (taskToEdit) {
                                    setEditingTaskId(task.id);
                                    setTaskTitle(taskToEdit.title);
                                    
                                    // Parsear meta para extraer fecha y hora
                                    const meta = taskToEdit.meta || "";
                                    let parsedDate = "";
                                    let parsedTime = "";
                                    
                                    if (meta.includes(" · ")) {
                                        const parts = meta.split(" · ");
                                        if (parts.length === 2) {
                                            if (/^\d{2}:\d{2}$/.test(parts[0].trim())) {
                                                parsedTime = parts[0].trim();
                                                parsedDate = parts[1].trim();
                                            } else {
                                                parsedDate = parts[0].trim();
                                            }
                                        }
                                    } else if (meta.includes(" - ")) {
                                        const parts = meta.split(" - ");
                                        if (parts.length === 2) {
                                            parsedDate = parts[1].trim();
                                        }
                                    } else if (meta && meta !== "Sin fecha") {
                                        parsedDate = meta.trim();
                                    }
                                    
                                    setTaskDate(parsedDate);
                                    setTaskTime(parsedTime);
                                    setTaskPriority(taskToEdit.priority || "Media");
                                    setPickerMode(null);
                                    setSelectedDate(null);
                                }
                            } else {
                                // Si estamos en la vista principal, usar el formulario normal
                                handleEditTask(task.id);
                            }
                        }}
                    >
                        Editar
                    </button>
                    <button
                        className="swipe-action delete"
                        onClick={() => handleDeleteTask(task.id)}
                    >
                        Eliminar
                    </button>
                </div>
                <div
                    className={clsx("list-item swipe-content", open && "open")}
                    style={{ transform: `translateX(${offset}px)` }}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                >
                    <button
                        className={clsx("task-complete-button", isCompleting && "task-complete-button-active")}
                        onClick={handleCompleteTask}
                        aria-label="Completar tarea"
                        disabled={isCompleting}
                    >
                        <SFCheckCircle size={16} className={clsx("task-complete-icon", isCompleting && "task-complete-icon-active")} />
                    </button>
                    <div className="list-content">
                        <p>{task?.title || 'Sin título'}</p>
                        <span>{task?.meta || 'Sin fecha'}</span>
                    </div>
                    <span className="list-time">{task?.priority || 'Media'}</span>
                </div>
            </motion.div>
        );
    };

    const SwipeEventItem = ({
        event
    }: {
        event: { id: string; title: string; meta: string; time: string; priority: string };
    }) => {
        const [offset, setOffset] = useState(0);
        const [open, setOpen] = useState(false);
        const startXRef = useRef<number | null>(null);
        const draggingRef = useRef(false);

        const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
            startXRef.current = event.clientX - offset;
            draggingRef.current = true;
        };

        const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
            if (!draggingRef.current || startXRef.current === null) return;
            const deltaX = event.clientX - startXRef.current;
            if (Math.abs(deltaX) < 6) return;
            const next = Math.max(-120, Math.min(0, deltaX));
            setOffset(next);
            setOpen(next < -10);
        };

        const onPointerUp = () => {
            if (!draggingRef.current) return;
            draggingRef.current = false;
            if (offset < -60) {
                setOffset(-120);
                setOpen(true);
            } else {
                setOffset(0);
                setOpen(false);
            }
        };

        const closeRow = () => {
            setOffset(0);
            setOpen(false);
        };

        const actionsTranslate = Math.max(0, 120 + offset);

        return (
            <div className={clsx("swipe-row", open && "open")}>
                <div
                    className="swipe-actions"
                    style={{ transform: `translateX(${actionsTranslate}px)` }}
                >
                    <button
                        className="swipe-action edit"
                        onClick={() => {
                            closeRow();
                            handleEditEvent(event.id);
                        }}
                    >
                        Editar
                    </button>
                    <button
                        className="swipe-action delete"
                        onClick={() => handleDeleteEvent(event.id)}
                    >
                        Eliminar
                    </button>
                </div>
                <div
                    className={clsx("day-event-item horizontal swipe-content", open && "open")}
                    style={{ transform: `translateX(${offset}px)` }}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                >
                    <button
                        className="task-complete-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (event?.id) {
                                try {
                                    updateEvent(event.id, { completed: true });
                                } catch (error) {
                                    console.error("Error completando evento:", error);
                                }
                            }
                        }}
                        aria-label="Completar evento"
                    >
                        <SFCheckCircle size={16} className="task-complete-icon" />
                    </button>
                    <div className="day-event-badge">{(today && today instanceof Date && !isNaN(today.getTime())) ? today.getDate() : new Date().getDate()}</div>
                    <div className="day-event-info">
                        <span className="day-event-title">{event?.title || 'Sin título'}</span>
                        <span className="day-event-meta">{event?.meta || 'Sin descripción'}</span>
                        <span className="day-event-time-range">{event?.time || 'Sin hora'}</span>
                    </div>
                </div>
            </div>
        );
    };

    // Asegurar que el componente siempre se renderice correctamente
    // No retornar early para evitar problemas de renderizado

    return (
        <div className="app-screen">
            <header className="app-header">
                <div className="app-title-group">
                    <span className="app-date">Calendario</span>
                    <h1 className="app-title">Agenda clara y accionable</h1>
                    <div className="day-status-row">
                        <span className="day-status-date">{dayStatusDate}</span>
                        <span className={clsx("day-status-dot", dayStatus.className)} />
                        <span className={clsx("day-status-label", dayStatus.className)}>
                            {dayStatus.label}
                        </span>
                    </div>
                </div>
                <div className="app-header-actions">
                    <QuickActionsMenu
                        actions={[
                            {
                                label: "Nueva tarea",
                                icon: <SFCheckCircle size={18} />,
                                onClick: handleOpenTaskForm
                            },
                            {
                                label: "Ver calendario",
                                icon: <SFCalendar size={18} />,
                                onClick: () => setCalendarOpen(true)
                            }
                        ]}
                    />
                </div>
            </header>

            <div className="app-content">
                <section className="app-section">
                    <div className="hero-card">
                        <div className="hero-header">
                            <div>
                                <p className="hero-eyebrow">Hoy</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <h2 className="hero-title">
                                        {totalCount} {pendingLabel}
                                    </h2>
                                    {eventsCount > 0 && (
                                        <span className="pill" style={{ fontSize: '11px', fontWeight: '500' }}>
                                            {eventsCount} {eventsCount === 1 ? 'evento' : 'eventos'}
                                        </span>
                                    )}
                                </div>
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
                            {dayEvents.filter(event => event && event.id).map((event) => (
                                <SwipeEventItem key={event.id} event={event} />
                            ))}
                        </div>
                    </div>
                </section>

                <section className="app-section">
                    <div className="section-title">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <h3>Tareas puntuales</h3>
                            {pendingCount > 0 && (
                                <span className="pill" style={{ fontSize: '11px', fontWeight: '500' }}>
                                    {pendingCount} {pendingCount === 1 ? 'tarea' : 'tareas'}
                                </span>
                            )}
                        </div>
                        <button
                            className="inline-plus-button"
                            aria-label="Agregar tarea"
                            onClick={() => {
                                if (showTaskForm) {
                                    setShowTaskForm(false);
                                } else {
                                    handleOpenTaskForm();
                                }
                            }}
                        >
                            +
                        </button>
                    </div>
                    <motion.div
                        initial={false}
                        animate={showTaskForm ? "open" : "closed"}
                        variants={{
                            open: { height: "auto", opacity: 1, y: 0 },
                            closed: { height: 0, opacity: 0, y: -6 }
                        }}
                        transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
                        style={{ overflow: "hidden" }}
                    >
                        <div className="task-form-card">
                            <input
                                className="task-input"
                                placeholder="Nueva tarea"
                                value={taskTitle}
                                onChange={(event) => setTaskTitle(event.target.value)}
                            />
                            <div className="task-form-row">
                                <div className="task-picker">
                                    <button
                                        type="button"
                                        className={clsx(
                                            "task-input",
                                            "task-input-button",
                                            !taskDate && !selectedDate && "task-input-placeholder"
                                        )}
                                        onClick={() => {
                                            setPickerMode("date");
                                        }}
                                    >
                                        {taskDate || (selectedDate ? selectedDate.toLocaleDateString("es-ES", { day: "numeric", month: "short" }).replace(".", "") : "Fecha (opcional)")}
                                    </button>
                                </div>
                                <div className="task-picker">
                                    <select
                                        className="task-input"
                                        value={taskTime}
                                        onChange={(event) => setTaskTime(event.target.value)}
                                    >
                                        <option value="">Hora</option>
                                        {timeSlots.map((slot) => (
                                            <option key={slot} value={slot}>
                                                {slot}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="task-form-row">
                                <select
                                    className="task-input"
                                    value={taskPriority}
                                    onChange={(event) => setTaskPriority(event.target.value)}
                                >
                                    <option value="Alta">Alta</option>
                                    <option value="Media">Media</option>
                                    <option value="Baja">Baja</option>
                                </select>
                                <button
                                    className="task-add-button"
                                    onClick={handleSaveTask}
                                >
                                    {editingTaskId ? "Guardar" : "Agregar"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                    {pendingCount > 0 && (
                        <>
                            <div className="list-card">
                                {visibleTasks.filter(task => task && task.id).map((task) => (
                                    <SwipeTaskItem key={task.id} task={task} />
                                ))}
                            </div>
                            {pendingCount > 3 && (
                                <button className="view-more-button right" onClick={() => setTasksOpen(true)}>
                                    Ver más ({pendingCount})
                                </button>
                            )}
                        </>
                    )}
                </section>

                <section className="app-section">
                    <div className="section-title">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <h3>Completados</h3>
                            <span className="pill" style={{ fontSize: '11px', fontWeight: '500' }}>
                                {progressData.completed} {progressData.completed === 1 ? 'completado' : 'completados'}
                            </span>
                        </div>
                    </div>
                    <div 
                        className="hero-card"
                        style={{ 
                            cursor: (completedCount > 0 || completedEventsCount > 0) ? 'pointer' : 'default',
                            transition: 'opacity 0.2s ease'
                        }}
                        onClick={() => {
                            if (completedCount > 0 || completedEventsCount > 0) {
                                setCompletedModalOpen(true);
                            }
                        }}
                        onMouseEnter={(e) => {
                            if (completedCount > 0 || completedEventsCount > 0) {
                                e.currentTarget.style.opacity = '0.8';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '1';
                        }}
                    >
                        <div className="hero-header">
                            <div>
                                <p className="hero-eyebrow">Progreso de hoy</p>
                                <h2 className="hero-title">
                                    {progressData.percentageText}
                                </h2>
                                {(completedCount > 0 || completedEventsCount > 0) ? (
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '8px',
                                        flexWrap: 'wrap',
                                        marginTop: '8px'
                                    }}>
                                        {completedCount > 0 && (
                                            <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '6px',
                                                color: 'var(--text-secondary)',
                                                fontSize: '13px'
                                            }}>
                                                <SFCheckCircle size={14} style={{ color: 'var(--ios-green)' }} />
                                                <span style={{ fontWeight: '500' }}>
                                                    {completedCount} {completedCount === 1 ? 'tarea completada' : 'tareas completadas'}
                                                </span>
                                            </div>
                                        )}
                                        {completedEventsCount > 0 && (
                                            <>
                                                {completedCount > 0 && (
                                                    <span style={{ 
                                                        color: 'var(--text-tertiary)', 
                                                        fontSize: '13px',
                                                        margin: '0 2px'
                                                    }}>
                                                        •
                                                    </span>
                                                )}
                                                <div style={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: '6px',
                                                    color: 'var(--text-secondary)',
                                                    fontSize: '13px'
                                                }}>
                                                    <SFCheckCircle size={14} style={{ color: 'var(--ios-green)' }} />
                                                    <span style={{ fontWeight: '500' }}>
                                                        {completedEventsCount} {completedEventsCount === 1 ? 'evento completado' : 'eventos completados'}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <p style={{ 
                                        color: 'var(--text-tertiary)', 
                                        fontSize: '13px', 
                                        margin: '8px 0 0 0' 
                                    }}>
                                        Aún no hay tareas o eventos completados hoy
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="hero-progress">
                            <div 
                                className="hero-progress-bar" 
                                style={{ 
                                    width: `${progressData.percentage}%`,
                                    backgroundColor: 'var(--ios-green)',
                                    transition: 'width 0.3s ease'
                                }} 
                            />
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
                        onClick={(e) => e.stopPropagation()}
                    >
                        {calendarMode === "calendar" ? (
                            <>
                                <div className="calendar-card">
                                    <div className="calendar-tabs">
                                        <button
                                            type="button"
                                            className={clsx(
                                                "calendar-tab",
                                                calendarView === "semana" && "calendar-tab-active"
                                            )}
                                            onClick={() => setCalendarView("semana")}
                                        >
                                            Semana
                                        </button>
                                        <button
                                            type="button"
                                            className={clsx(
                                                "calendar-tab",
                                                calendarView === "mes" && "calendar-tab-active"
                                            )}
                                            onClick={() => setCalendarView("mes")}
                                        >
                                            Mes
                                        </button>
                                        <button
                                            type="button"
                                            className={clsx(
                                                "calendar-tab",
                                                calendarView === "año" && "calendar-tab-active"
                                            )}
                                            onClick={() => setCalendarView("año")}
                                        >
                                            Año
                                        </button>
                                    </div>
                                    {calendarView === "mes" && (
                                        <>
                                            <div className="calendar-month">{monthLabel}</div>
                                            <div className="calendar-grid">
                                                {["L", "M", "M", "J", "V", "S", "D"].map((label, index) => (
                                                    <div
                                                        key={`${label}-${index}`}
                                                        className="calendar-day calendar-day-muted calendar-weekday-header"
                                                    >
                                                        {label}
                                                    </div>
                                                ))}
                                                {calendarDays.map((day) => (
                                                    <button
                                                        key={day.key}
                                                        type="button"
                                                        className={clsx(
                                                            "calendar-day",
                                                            "calendar-day-button",
                                                            !day.isCurrentMonth && "calendar-day-muted",
                                                            day.isToday && "calendar-day-active"
                                                        )}
                                                        onClick={() => {
                                                            setEventDate(day.date);
                                                            setCalendarMode("event");
                                                        }}
                                                    >
                                                        {day.dayNumber}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                    {calendarView === "semana" && (
                                        <>
                                            <div className="calendar-month">
                                                {today.toLocaleDateString("es-ES", {
                                                    month: "long",
                                                    year: "numeric"
                                                })}
                                            </div>
                                            <div className="calendar-week-grid">
                                                {calendarWeekDays.map((day) => (
                                                    <button
                                                        key={day.key}
                                                        type="button"
                                                        className={clsx(
                                                            "calendar-day",
                                                            "calendar-day-button",
                                                            "calendar-week-day",
                                                            day.isToday && "calendar-day-active"
                                                        )}
                                                        onClick={() => {
                                                            setEventDate(day.date);
                                                            setCalendarMode("event");
                                                        }}
                                                    >
                                                        <span className="calendar-week-day-name">{day.dayName}</span>
                                                        <span className="calendar-week-day-number">{day.dayNumber}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                    {calendarView === "año" && (
                                        <>
                                            <div className="calendar-year-label">{today.getFullYear()}</div>
                                            <div className="calendar-year-grid">
                                                {calendarMonths.map((month) => (
                                                    <button
                                                        key={month.key}
                                                        type="button"
                                                        className={clsx(
                                                            "calendar-month-item",
                                                            month.isCurrentMonth && "calendar-month-active"
                                                        )}
                                                        onClick={() => {
                                                            const monthDate = new Date(today.getFullYear(), month.monthNumber, 1);
                                                            setSelectedMonth(monthDate);
                                                            setCalendarView("mes");
                                                        }}
                                                    >
                                                        {month.monthName.charAt(0).toUpperCase() + month.monthName.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="section-title">
                                    <h3>{editingEventId ? "Editar evento" : "Nuevo evento"}</h3>
                                    <button
                                        className="link-button"
                                        onClick={() => setCalendarMode("calendar")}
                                    >
                                        Volver
                                    </button>
                                </div>
                                <div className="event-form-card task-form-card">
                                    <div className="event-date-label">
                                        {eventDate
                                            ? eventDate.toLocaleDateString("es-ES", {
                                                  weekday: "long",
                                                  day: "numeric",
                                                  month: "long"
                                              })
                                            : "Selecciona una fecha"}
                                    </div>
                                    <input
                                        className="task-input"
                                        placeholder="Título del evento"
                                        value={eventTitle}
                                        onChange={(event) => setEventTitle(event.target.value)}
                                    />
                                    <textarea
                                        className="task-input event-textarea"
                                        placeholder="Descripción"
                                        value={eventDescription}
                                        onChange={(event) => setEventDescription(event.target.value)}
                                    />
                                    <div className="task-form-row">
                                        <select
                                            className="task-input"
                                            value={eventTime}
                                            onChange={(event) => setEventTime(event.target.value)}
                                        >
                                            <option value="">Hora</option>
                                            {timeSlots.map((slot) => (
                                                <option key={slot} value={slot}>
                                                    {slot}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            className="task-input"
                                            value={eventPriority}
                                            onChange={(event) => setEventPriority(event.target.value)}
                                        >
                                            <option value="Alta">Alta</option>
                                            <option value="Media">Media</option>
                                            <option value="Baja">Baja</option>
                                        </select>
                                    </div>
                                    <div className="event-actions">
                                        <button 
                                            type="button"
                                            className="task-add-button" 
                                            onClick={handleSaveEvent}
                                        >
                                            Guardar evento
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            )}

            {deleteConfirmModal && (
                <div className="calendar-modal">
                    <button
                        className="calendar-backdrop"
                        aria-label="Cerrar confirmación"
                        onClick={() => setDeleteConfirmModal(null)}
                    />
                    <motion.div
                        className="calendar-modal-card"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
                        style={{ maxWidth: '360px', width: '100%' }}
                    >
                        <div style={{ padding: '32px 28px', textAlign: 'center' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(255, 69, 58, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px auto'
                            }}>
                                <svg
                                    width="28"
                                    height="28"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="var(--ios-red)"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M3 6h18" />
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                    <line x1="10" y1="11" x2="10" y2="17" />
                                    <line x1="14" y1="11" x2="14" y2="17" />
                                </svg>
                            </div>
                            <h3 style={{ 
                                fontSize: '20px', 
                                fontWeight: '700', 
                                color: 'var(--text-primary)', 
                                margin: '0 0 8px 0',
                                letterSpacing: '-0.3px'
                            }}>
                                ¿Eliminar {deleteConfirmModal.type === 'task' ? 'tarea' : 'evento'}?
                            </h3>
                            <p style={{ 
                                fontSize: '14px', 
                                color: 'var(--text-secondary)', 
                                margin: '0 0 28px 0',
                                lineHeight: '1.5',
                                padding: '0 8px'
                            }}>
                                Esta acción no se puede deshacer. El {deleteConfirmModal.type === 'task' ? 'tarea' : 'evento'} se eliminará permanentemente.
                            </p>
                            <div style={{ 
                                display: 'flex', 
                                gap: '10px',
                                justifyContent: 'center'
                            }}>
                                <button
                                    className="link-button"
                                    onClick={() => setDeleteConfirmModal(null)}
                                    style={{
                                        padding: '14px 28px',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        color: 'var(--text-secondary)',
                                        flex: 1,
                                        borderRadius: '12px',
                                        transition: 'background-color 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => {
                                        if (deleteConfirmModal.type === 'task') {
                                            deleteTask(deleteConfirmModal.id);
                                        } else {
                                            deleteEvent(deleteConfirmModal.id);
                                        }
                                        setDeleteConfirmModal(null);
                                    }}
                                    style={{
                                        padding: '14px 28px',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        backgroundColor: 'var(--ios-red)',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '12px',
                                        flex: 1,
                                        cursor: 'pointer',
                                        transition: 'opacity 0.2s ease, transform 0.2s ease',
                                        boxShadow: '0 4px 12px rgba(255, 69, 58, 0.25)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.opacity = '0.9';
                                        e.currentTarget.style.transform = 'scale(0.98)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.opacity = '1';
                                        e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {completedModalOpen && (
                <div className="calendar-modal">
                    <button
                        className="calendar-backdrop"
                        aria-label="Cerrar completados"
                        onClick={() => setCompletedModalOpen(false)}
                    />
                    <motion.div
                        className="calendar-modal-card"
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.98 }}
                        transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
                    >
                        <div className="section-title">
                            <h3>Completados</h3>
                            <button
                                className="link-button"
                                onClick={() => setCompletedModalOpen(false)}
                            >
                                Cerrar
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {completedTasks.length > 0 && (
                                <div>
                                    <h4 style={{ 
                                        fontSize: '13px', 
                                        fontWeight: '600', 
                                        color: 'var(--text-secondary)', 
                                        marginBottom: '12px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        Tareas completadas ({completedTasks.length})
                                    </h4>
                                    <div className="list-card">
                                        {completedTasks.map((task) => (
                                            <div key={task.id} className="list-item" style={{ opacity: 0.7 }}>
                                                <div className="list-icon" style={{ backgroundColor: 'transparent', color: 'var(--ios-blue)' }}>
                                                    <SFCheckCircle size={18} />
                                                </div>
                                                <div className="list-content">
                                                    <p style={{ textDecoration: 'line-through', color: 'var(--text-secondary)' }}>{task.title}</p>
                                                    <span style={{ color: 'var(--text-tertiary)' }}>{task.meta}</span>
                                                </div>
                                                <span className="list-time" style={{ color: 'var(--text-tertiary)' }}>{task.priority}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {completedDayEvents.length > 0 && (
                                <div>
                                    <h4 style={{ 
                                        fontSize: '13px', 
                                        fontWeight: '600', 
                                        color: 'var(--text-secondary)', 
                                        marginBottom: '12px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        Eventos completados ({completedDayEvents.length})
                                    </h4>
                                    <div className="list-card">
                                        {completedDayEvents.map((event) => (
                                            <div key={event.id} className="day-event-item horizontal" style={{ opacity: 0.7 }}>
                                                <div className="day-event-badge" style={{ backgroundColor: 'transparent', color: 'var(--ios-blue)' }}>
                                                    <SFCheckCircle size={16} />
                                                </div>
                                                <div className="day-event-info">
                                                    <span className="day-event-title" style={{ textDecoration: 'line-through', color: 'var(--text-secondary)' }}>{event.title}</span>
                                                    <span className="day-event-meta" style={{ color: 'var(--text-tertiary)' }}>{event.meta}</span>
                                                    <span className="day-event-time-range" style={{ color: 'var(--text-tertiary)' }}>{event.time}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {completedTasks.length === 0 && completedDayEvents.length === 0 && (
                                <div className="list-card" style={{ padding: '40px 20px', textAlign: 'center' }}>
                                    <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', margin: 0 }}>
                                        No hay tareas o eventos completados
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}

            {tasksOpen && (
                <div className="calendar-modal">
                    <button
                        className="calendar-backdrop"
                        aria-label="Cerrar tareas"
                        onClick={() => {
                            setTasksOpen(false);
                            setEditingTaskInModal(null);
                            setEditingTaskId(null);
                            setTaskTitle("");
                            setTaskDate("");
                            setTaskTime("");
                            setTaskPriority("Media");
                            setPickerMode(null);
                            setSelectedDate(null);
                        }}
                    />
                    <motion.div
                        className="calendar-modal-card"
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.98 }}
                        transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
                    >
                        {editingTaskInModal ? (
                            <>
                                <div className="section-title">
                                    <h3>Editar tarea</h3>
                                    <button
                                        className="link-button"
                                        onClick={() => {
                                            setEditingTaskInModal(null);
                                            setEditingTaskId(null);
                                            setTaskTitle("");
                                            setTaskDate("");
                                            setTaskTime("");
                                            setTaskPriority("Media");
                                            setPickerMode(null);
                                            setSelectedDate(null);
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                                <div className="task-form-card">
                                    <input
                                        className="task-input"
                                        placeholder="Título de la tarea"
                                        value={taskTitle}
                                        onChange={(event) => setTaskTitle(event.target.value)}
                                    />
                                    <div className="task-form-row">
                                        <div className="task-picker">
                                            <button
                                                type="button"
                                                className={clsx(
                                                    "task-input",
                                                    "task-input-button",
                                                    !taskDate && !selectedDate && "task-input-placeholder"
                                                )}
                                                onClick={() => {
                                                    setPickerMode("date");
                                                }}
                                            >
                                                {taskDate || (selectedDate ? selectedDate.toLocaleDateString("es-ES", { day: "numeric", month: "short" }).replace(".", "") : "Fecha (opcional)")}
                                            </button>
                                        </div>
                                        <div className="task-picker">
                                            <select
                                                className="task-input"
                                                value={taskTime}
                                                onChange={(event) => setTaskTime(event.target.value)}
                                            >
                                                <option value="">Hora</option>
                                                {timeSlots.map((slot) => (
                                                    <option key={slot} value={slot}>
                                                        {slot}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="task-form-row">
                                        <select
                                            className="task-input"
                                            value={taskPriority}
                                            onChange={(event) => setTaskPriority(event.target.value)}
                                        >
                                            <option value="Alta">Alta</option>
                                            <option value="Media">Media</option>
                                            <option value="Baja">Baja</option>
                                        </select>
                                        <button
                                            className="task-add-button"
                                            onClick={() => {
                                                handleSaveTask();
                                                setEditingTaskInModal(null);
                                            }}
                                        >
                                            Guardar
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="section-title">
                                    <h3>Tareas puntuales</h3>
                                </div>
                                <div className="list-card">
                                    {pendingTasks.filter(task => task && task.id).map((task) => (
                                        <SwipeTaskItem key={task.id} task={task} />
                                    ))}
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            )}

            {pickerMode && (
                <div className="task-picker-overlay" onClick={() => setPickerMode(null)}>
                    <div className="task-picker-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="mini-picker-panel mini-picker-panel-full">
                            {pickerMode === "date" ? (
                                <>
                                    <div className="mini-picker-header">{monthLabel}</div>
                                    <div className="mini-calendar-weekdays">
                                        {["L", "M", "M", "J", "V", "S", "D"].map((label, index) => (
                                            <span key={`${label}-${index}`}>{label}</span>
                                        ))}
                                    </div>
                                    <div className="mini-calendar-grid">
                                        {calendarDays.map((day) => (
                                            <button
                                                key={day.key}
                                                type="button"
                                                className={clsx(
                                                    "mini-day",
                                                    !day.isCurrentMonth && "mini-day-muted",
                                                    selectedDate &&
                                                        day.date.toDateString() ===
                                                            selectedDate.toDateString() &&
                                                        "mini-day-selected"
                                                )}
                                                onClick={() => handleSelectDate(day.date)}
                                            >
                                                {day.dayNumber}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="mini-picker-header">
                                        Hora{taskDate ? ` · ${taskDate}` : ""}
                                    </div>
                                    <div className="mini-time-grid">
                                        {timeSlots.map((slot) => (
                                            <button
                                                key={slot}
                                                type="button"
                                                className={clsx(
                                                    "mini-time-item",
                                                    slot === taskTime && "mini-time-selected"
                                                )}
                                                onClick={() => handleSelectTime(slot)}
                                            >
                                                {slot}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

type HabitCategory = 'non-negotiable' | 'consider' | 'basic-routine';

type Habit = {
    id: string;
    title: string;
    description: string;
    category: HabitCategory;
    completed: boolean;
    timestamp: Date;
};

export const Ideas = () => {
    const { habits, addHabit, updateHabit, deleteHabit } = useAppData();
    const [currentTitle, setCurrentTitle] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<HabitCategory | null>(null);
    const [editingHabit, setEditingHabit] = useState<string | null>(null);
    const [editingBasicRoutine, setEditingBasicRoutine] = useState(false);
    const [editingSection, setEditingSection] = useState<HabitCategory | null>(null);
    
    // Rutina básica predefinida
    const [basicRoutine, setBasicRoutine] = useState({
        morning: {
            title: "Mañana (ideal, no forzada)",
            emoji: "🌅",
            items: [
                "Levantarse",
                "Aseo básico",
                "5-10 min de silencio / respiración / sol",
                "Definir 1 acción importante del día"
            ]
        },
        day: {
            title: "Día",
            emoji: "🕰️",
            items: [
                "Estudio / trabajo",
                "1 bloque de enfoque real",
                "Alimentarse sin prisas"
            ]
        },
        night: {
            title: "Noche",
            emoji: "🌙",
            items: [
                "Desconectar pantallas",
                "Revisar: ¿qué sí funcionó hoy?",
                "Dormir sin culpa"
            ]
        }
    });

    // Organizar hábitos por categoría
    const nonNegotiableHabits = useMemo(() => 
        habits.filter(h => h.category === 'non-negotiable'), 
        [habits]
    );
    
    const considerHabits = useMemo(() => 
        habits.filter(h => h.category === 'consider'), 
        [habits]
    );
    
    const basicRoutineHabits = useMemo(() => 
        habits.filter(h => h.category === 'basic-routine'), 
        [habits]
    );

    const handleSaveHabit = () => {
        if (!currentTitle.trim() || !selectedCategory) return;

        if (editingHabit) {
            updateHabit(editingHabit, {
                title: currentTitle.trim(),
                category: selectedCategory
            });
        } else {
            addHabit({
                title: currentTitle.trim(),
                description: "",
                category: selectedCategory,
                completed: false
            });
        }

        setCurrentTitle("");
        setEditingHabit(null);
        setSelectedCategory(null);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && currentTitle.trim()) {
            handleSaveHabit();
        }
    };

    const handleInputBlur = () => {
        if (currentTitle.trim() && selectedCategory) {
            handleSaveHabit();
        } else if (!currentTitle.trim()) {
            setSelectedCategory(null);
            setCurrentTitle("");
        }
    };

    const handleEditHabit = (habitId: string) => {
        const habit = habits.find(h => h.id === habitId);
        if (habit) {
            setCurrentTitle(habit.title);
            setEditingHabit(habitId);
        }
    };

    const handleSaveEdit = () => {
        if (!editingHabit || !currentTitle.trim()) {
            setEditingHabit(null);
            setCurrentTitle("");
            return;
        }
        
        updateHabit(editingHabit, {
            title: currentTitle.trim()
        });
        
        setEditingHabit(null);
        setCurrentTitle("");
    };

    const handleSaveSection = (category: HabitCategory) => {
        // Si hay un hábito siendo editado, guardarlo primero
        if (editingHabit) {
            if (currentTitle.trim()) {
                updateHabit(editingHabit, {
                    title: currentTitle.trim()
                });
            }
            setEditingHabit(null);
            setCurrentTitle("");
        }
        // Cerrar el modo edición de la sección
        setEditingSection(null);
    };

    const handleCancelEdit = () => {
        setEditingHabit(null);
        setCurrentTitle("");
    };

    const handleDeleteHabit = (habitId: string) => {
        deleteHabit(habitId);
    };

    const handleNewHabit = (category: HabitCategory) => {
        setSelectedCategory(category);
        setCurrentTitle("");
        setEditingHabit(null);
    };

    // Componente para renderizar un hábito
    const HabitItem = ({ 
        habit, 
        isEditing,
        showActions,
        isBeingEdited,
        onEdit,
        onDelete,
        onSaveEdit,
        onCancelEdit,
        editValue,
        onEditValueChange
    }: { 
        habit: Habit;
        isEditing: boolean;
        showActions: boolean;
        isBeingEdited: boolean;
        onEdit: (id: string) => void;
        onDelete: (id: string) => void;
        onSaveEdit: () => void;
        onCancelEdit: () => void;
        editValue: string;
        onEditValueChange: (value: string) => void;
    }) => {
        if (isBeingEdited) {
            return (
                <div className="list-item">
                    <input
                        type="text"
                        className="task-input"
                        value={editValue}
                        onChange={(e) => onEditValueChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                if (editValue.trim()) {
                                    onSaveEdit();
                                } else {
                                    onCancelEdit();
                                }
                            } else if (e.key === 'Escape') {
                                e.preventDefault();
                                onCancelEdit();
                            }
                        }}
                        onBlur={() => {
                            if (editValue.trim()) {
                                onSaveEdit();
                            } else {
                                onCancelEdit();
                            }
                        }}
                        autoFocus
                        style={{ 
                            margin: 0, 
                            width: '100%',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}
                    />
                </div>
            );
        }

        return (
            <div className="list-item">
                <div 
                    className="list-content" 
                    style={{ 
                        flex: 1,
                        cursor: isEditing && showActions ? 'pointer' : 'default'
                    }}
                    onClick={() => {
                        if (isEditing && showActions) {
                            onEdit(habit.id);
                        }
                    }}
                >
                    <p style={{ 
                        margin: 0,
                        fontWeight: '600'
                    }}>
                        {habit.title}
                    </p>
                </div>
                {isEditing && showActions && (
                    <button
                        className="icon-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(habit.id);
                        }}
                        aria-label="Eliminar hábito"
                        style={{ 
                            width: '32px', 
                            height: '32px',
                            padding: 0,
                            color: 'var(--ios-red)'
                        }}
                    >
                        <SFTrash size={16} />
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="app-screen">

            <header className="app-header">
                <div className="app-title-group">
                    <span className="app-date">Hábitos</span>
                    <h1 className="app-title">Construye tu mejor versión</h1>
                    <span className="app-subtitle">Organiza y prioriza tus hábitos diarios</span>
                </div>
                <div className="app-header-actions">
                </div>
            </header>

            <div className="app-content">
                {/* Hábitos No Negociables */}
                <section className="app-section">
                    <div className="section-title">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <h3>Hábitos No Negociables</h3>
                            <span className="pill" style={{ fontSize: '11px', fontWeight: '500' }}>
                                {nonNegotiableHabits.length}
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {nonNegotiableHabits.length > 0 && (
                                <button
                                    className="link-button"
                                    aria-label={editingSection === 'non-negotiable' || editingHabit ? 'Guardar cambios' : 'Editar hábitos no negociables'}
                                    onClick={() => {
                                        if (editingSection === 'non-negotiable' || editingHabit) {
                                            handleSaveSection('non-negotiable');
                                        } else {
                                            setEditingSection('non-negotiable');
                                        }
                                    }}
                                    style={{ fontSize: '14px', fontWeight: '600' }}
                                >
                                    {editingSection === 'non-negotiable' || editingHabit ? 'Guardar' : 'Editar'}
                                </button>
                            )}
                            <button
                                className="icon-button"
                                aria-label="Agregar hábito no negociable"
                                onClick={() => {
                                    if (selectedCategory === 'non-negotiable') {
                                        setSelectedCategory(null);
                                    } else {
                                        handleNewHabit('non-negotiable');
                                    }
                                }}
                            >
                                <SFPlus size={18} />
                            </button>
                        </div>
                    </div>
                    {nonNegotiableHabits.length === 0 && selectedCategory !== 'non-negotiable' ? (
                        <div className="list-card" style={{ padding: '40px 20px', textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', margin: 0 }}>
                                No hay hábitos no negociables aún
                            </p>
                        </div>
                    ) : (
                        <div className="list-card">
                            <AnimatePresence>
                                {selectedCategory === 'non-negotiable' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <div className="list-item" style={{ padding: '12px' }}>
                                            <input
                                                className="task-input"
                                                placeholder="Título del hábito"
                                                value={currentTitle}
                                                onChange={(e) => setCurrentTitle(e.target.value)}
                                                onKeyDown={handleInputKeyDown}
                                                onBlur={handleInputBlur}
                                                autoFocus
                                                style={{ margin: 0, width: '100%' }}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            {nonNegotiableHabits.map((habit) => (
                                <HabitItem
                                    key={habit.id}
                                    habit={habit}
                                    isEditing={editingSection === 'non-negotiable'}
                                    showActions={editingSection === 'non-negotiable' && nonNegotiableHabits.length > 0}
                                    isBeingEdited={editingHabit === habit.id}
                                    onEdit={handleEditHabit}
                                    onDelete={handleDeleteHabit}
                                    onSaveEdit={handleSaveEdit}
                                    onCancelEdit={handleCancelEdit}
                                    editValue={currentTitle}
                                    onEditValueChange={setCurrentTitle}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* Hábitos a Tener en Cuenta */}
                <section className="app-section">
                    <div className="section-title">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <h3>Hábitos a Tener en Cuenta</h3>
                            <span className="pill" style={{ fontSize: '11px', fontWeight: '500' }}>
                                {considerHabits.length}
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {considerHabits.length > 0 && (
                                <button
                                    className="link-button"
                                    aria-label={editingSection === 'consider' || editingHabit ? 'Guardar cambios' : 'Editar hábitos a tener en cuenta'}
                                    onClick={() => {
                                        if (editingSection === 'consider' || editingHabit) {
                                            handleSaveSection('consider');
                                        } else {
                                            setEditingSection('consider');
                                        }
                                    }}
                                    style={{ fontSize: '14px', fontWeight: '600' }}
                                >
                                    {editingSection === 'consider' || editingHabit ? 'Guardar' : 'Editar'}
                                </button>
                            )}
                            <button
                                className="icon-button"
                                aria-label="Agregar hábito a tener en cuenta"
                                onClick={() => {
                                    if (selectedCategory === 'consider') {
                                        setSelectedCategory(null);
                                    } else {
                                        handleNewHabit('consider');
                                    }
                                }}
                            >
                                <SFPlus size={18} />
                            </button>
                        </div>
                    </div>
                    {considerHabits.length === 0 && selectedCategory !== 'consider' ? (
                        <div className="list-card" style={{ padding: '40px 20px', textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', margin: 0 }}>
                                No hay hábitos a tener en cuenta aún
                            </p>
                        </div>
                    ) : (
                        <div className="list-card">
                            <AnimatePresence>
                                {selectedCategory === 'consider' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <div className="list-item" style={{ padding: '12px' }}>
                                            <input
                                                className="task-input"
                                                placeholder="Título del hábito"
                                                value={currentTitle}
                                                onChange={(e) => setCurrentTitle(e.target.value)}
                                                onKeyDown={handleInputKeyDown}
                                                onBlur={handleInputBlur}
                                                autoFocus
                                                style={{ margin: 0, width: '100%' }}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            {considerHabits.map((habit) => (
                                <HabitItem
                                    key={habit.id}
                                    habit={habit}
                                    isEditing={editingSection === 'consider'}
                                    showActions={editingSection === 'consider' && considerHabits.length > 0}
                                    isBeingEdited={editingHabit === habit.id}
                                    onEdit={handleEditHabit}
                                    onDelete={handleDeleteHabit}
                                    onSaveEdit={handleSaveEdit}
                                    onCancelEdit={handleCancelEdit}
                                    editValue={currentTitle}
                                    onEditValueChange={setCurrentTitle}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* Rutina Básica */}
                <section className="app-section">
                    <div className="section-title">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <h3>Rutina Básica</h3>
                        </div>
                        <button
                            className="link-button"
                            aria-label="Editar rutina básica"
                            onClick={() => setEditingBasicRoutine(!editingBasicRoutine)}
                            style={{ fontSize: '14px', fontWeight: '600' }}
                        >
                            {editingBasicRoutine ? 'Guardar' : 'Editar'}
                        </button>
                    </div>
                    <div className="list-card">
                        {editingBasicRoutine ? (
                            /* Modo Edición */
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {/* Editar Mañana */}
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <input
                                            type="text"
                                            className="task-input"
                                            value={basicRoutine.morning.emoji}
                                            onChange={(e) => setBasicRoutine(prev => ({
                                                ...prev,
                                                morning: { ...prev.morning, emoji: e.target.value }
                                            }))}
                                            style={{ width: '50px', textAlign: 'center' }}
                                            placeholder="🌅"
                                        />
                                        <input
                                            type="text"
                                            className="task-input"
                                            value={basicRoutine.morning.title}
                                            onChange={(e) => setBasicRoutine(prev => ({
                                                ...prev,
                                                morning: { ...prev.morning, title: e.target.value }
                                            }))}
                                            style={{ flex: 1 }}
                                            placeholder="Título"
                                        />
                                    </div>
                                    <textarea
                                        className="task-input"
                                        value={basicRoutine.morning.items.join('\n')}
                                        onChange={(e) => setBasicRoutine(prev => ({
                                            ...prev,
                                            morning: { ...prev.morning, items: e.target.value.split('\n').filter(item => item.trim()) }
                                        }))}
                                        placeholder="Cada línea es un item"
                                        style={{ minHeight: '80px', fontSize: '14px' }}
                                    />
                                </div>

                                {/* Editar Día */}
                                <div style={{ paddingTop: '12px', borderTop: '1px solid var(--glass-border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <input
                                            type="text"
                                            className="task-input"
                                            value={basicRoutine.day.emoji}
                                            onChange={(e) => setBasicRoutine(prev => ({
                                                ...prev,
                                                day: { ...prev.day, emoji: e.target.value }
                                            }))}
                                            style={{ width: '50px', textAlign: 'center' }}
                                            placeholder="🕰️"
                                        />
                                        <input
                                            type="text"
                                            className="task-input"
                                            value={basicRoutine.day.title}
                                            onChange={(e) => setBasicRoutine(prev => ({
                                                ...prev,
                                                day: { ...prev.day, title: e.target.value }
                                            }))}
                                            style={{ flex: 1 }}
                                            placeholder="Título"
                                        />
                                    </div>
                                    <textarea
                                        className="task-input"
                                        value={basicRoutine.day.items.join('\n')}
                                        onChange={(e) => setBasicRoutine(prev => ({
                                            ...prev,
                                            day: { ...prev.day, items: e.target.value.split('\n').filter(item => item.trim()) }
                                        }))}
                                        placeholder="Cada línea es un item"
                                        style={{ minHeight: '80px', fontSize: '14px' }}
                                    />
                                </div>

                                {/* Editar Noche */}
                                <div style={{ paddingTop: '12px', borderTop: '1px solid var(--glass-border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <input
                                            type="text"
                                            className="task-input"
                                            value={basicRoutine.night.emoji}
                                            onChange={(e) => setBasicRoutine(prev => ({
                                                ...prev,
                                                night: { ...prev.night, emoji: e.target.value }
                                            }))}
                                            style={{ width: '50px', textAlign: 'center' }}
                                            placeholder="🌙"
                                        />
                                        <input
                                            type="text"
                                            className="task-input"
                                            value={basicRoutine.night.title}
                                            onChange={(e) => setBasicRoutine(prev => ({
                                                ...prev,
                                                night: { ...prev.night, title: e.target.value }
                                            }))}
                                            style={{ flex: 1 }}
                                            placeholder="Título"
                                        />
                                    </div>
                                    <textarea
                                        className="task-input"
                                        value={basicRoutine.night.items.join('\n')}
                                        onChange={(e) => setBasicRoutine(prev => ({
                                            ...prev,
                                            night: { ...prev.night, items: e.target.value.split('\n').filter(item => item.trim()) }
                                        }))}
                                        placeholder="Cada línea es un item"
                                        style={{ minHeight: '80px', fontSize: '14px' }}
                                    />
                                </div>
                            </div>
                        ) : (
                            /* Modo Visualización */
                            <>
                                {/* Mañana */}
                                <div style={{ marginBottom: '2px' }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '8px', 
                                        marginBottom: '2px' 
                                    }}>
                                        <span style={{ fontSize: '18px' }}>{basicRoutine.morning.emoji}</span>
                                        <h4 style={{ 
                                            fontSize: '15px', 
                                            fontWeight: '700', 
                                            color: 'var(--text-primary)', 
                                            margin: 0 
                                        }}>
                                            {basicRoutine.morning.title}
                                        </h4>
                                    </div>
                                    <ul style={{ 
                                        listStyle: 'none', 
                                        padding: 0, 
                                        margin: 0,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '2px'
                                    }}>
                                        {basicRoutine.morning.items.map((item, index) => (
                                            <li key={index} style={{ 
                                                display: 'flex', 
                                                alignItems: 'flex-start', 
                                                gap: '8px',
                                                color: 'var(--text-secondary)',
                                                fontSize: '14px',
                                                lineHeight: '1.4'
                                            }}>
                                                <span style={{ 
                                                    color: 'var(--text-tertiary)', 
                                                    marginTop: '2px',
                                                    flexShrink: 0
                                                }}>•</span>
                                                <span style={{ flex: 1 }}>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Día */}
                                <div style={{ marginBottom: '2px', paddingTop: '2px', borderTop: '1px solid var(--glass-border)' }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '8px', 
                                        marginBottom: '2px' 
                                    }}>
                                        <span style={{ fontSize: '18px' }}>{basicRoutine.day.emoji}</span>
                                        <h4 style={{ 
                                            fontSize: '15px', 
                                            fontWeight: '700', 
                                            color: 'var(--text-primary)', 
                                            margin: 0 
                                        }}>
                                            {basicRoutine.day.title}
                                        </h4>
                                    </div>
                                    <ul style={{ 
                                        listStyle: 'none', 
                                        padding: 0, 
                                        margin: 0,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '2px'
                                    }}>
                                        {basicRoutine.day.items.map((item, index) => (
                                            <li key={index} style={{ 
                                                display: 'flex', 
                                                alignItems: 'flex-start', 
                                                gap: '8px',
                                                color: 'var(--text-secondary)',
                                                fontSize: '14px',
                                                lineHeight: '1.4'
                                            }}>
                                                <span style={{ 
                                                    color: 'var(--text-tertiary)', 
                                                    marginTop: '2px',
                                                    flexShrink: 0
                                                }}>•</span>
                                                <span style={{ flex: 1 }}>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Noche */}
                                <div style={{ paddingTop: '2px', borderTop: '1px solid var(--glass-border)' }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '8px', 
                                        marginBottom: '2px' 
                                    }}>
                                        <span style={{ fontSize: '18px' }}>{basicRoutine.night.emoji}</span>
                                        <h4 style={{ 
                                            fontSize: '15px', 
                                            fontWeight: '700', 
                                            color: 'var(--text-primary)', 
                                            margin: 0 
                                        }}>
                                            {basicRoutine.night.title}
                                        </h4>
                                    </div>
                                    <ul style={{ 
                                        listStyle: 'none', 
                                        padding: 0, 
                                        margin: 0,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '2px'
                                    }}>
                                        {basicRoutine.night.items.map((item, index) => (
                                            <li key={index} style={{ 
                                                display: 'flex', 
                                                alignItems: 'flex-start', 
                                                gap: '8px',
                                                color: 'var(--text-secondary)',
                                                fontSize: '14px',
                                                lineHeight: '1.4'
                                            }}>
                                                <span style={{ 
                                                    color: 'var(--text-tertiary)', 
                                                    marginTop: '2px',
                                                    flexShrink: 0
                                                }}>•</span>
                                                <span style={{ flex: 1 }}>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </>
                        )}
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
            <div className="app-header-actions">
                <QuickActionsMenu
                    actions={[
                        { label: "Abrir agenda", icon: <SFCalendar size={18} /> },
                        { label: "Nueva tarea", icon: <SFCheckCircle size={18} /> }
                    ]}
                />
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
