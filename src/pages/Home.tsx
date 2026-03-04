import { useMemo, useState, useEffect, useCallback } from 'react';
import { motion, type Variants, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { useAppData } from '../context/AppDataContext';
import { useToday } from '../hooks/useToday';
import { useTheme } from '../context/ThemeContext';
import { GlassCard } from '../components/ui/GlassCard';
import {
    SFWallet,
    SFCheckCircle,
    SFSparkles,
    SFTarget,
    SFTrendingUp,
    SFArrowUpRight,
    SFArrowDownRight,
    SFPlus,
    SFMinus,
    SFCalendar,
    SFStar,
    SFStarFilled
} from '../components/ui/SFIcons';
import { DatePicker } from '../components/ui/DatePicker';

export function Home() {
    let appData;
    try {
        appData = useAppData();
    } catch (error) {
        throw error;
    }
    const { balance, income, expenses, tasks, events, transactions, addTransaction, goals, addGoal, updateGoal, reorderGoals } = appData;
    const today = useToday();
    const time = new Date().getHours();
    const greeting = time < 12 ? 'Buenos días' : time < 18 ? 'Buenas tardes' : 'Buenas noches';
    const dateLabel = today.toLocaleDateString('es-ES', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });

    const [showGoalForm, setShowGoalForm] = useState(false);
    const [goalName, setGoalName] = useState('');
    const [goalDate, setGoalDate] = useState('');
    const [goalPriority, setGoalPriority] = useState<'Alta' | 'Media' | 'Baja'>('Media');
    
    // Estados para la calculadora de objetivos
    const [goalCalculatorOpen, setGoalCalculatorOpen] = useState(false);
    const [selectedGoalForCalculator, setSelectedGoalForCalculator] = useState<string | null>(null); // ID del objetivo seleccionado
    const [goalCalculatorValueCOP, setGoalCalculatorValueCOP] = useState(0);
    const [goalCalculatorValueUSD, setGoalCalculatorValueUSD] = useState(0);
    const [goalCurrency, setGoalCurrency] = useState<'COP' | 'USD'>('COP');
    const [goalExchangeRate, setGoalExchangeRate] = useState(4100);
    const [isEditingGoalAmount, setIsEditingGoalAmount] = useState(false);
    const [tempGoalAmountInput, setTempGoalAmountInput] = useState('');
    const [goalMinusButtonActive, setGoalMinusButtonActive] = useState(false);
    const [isSavingGoal, setIsSavingGoal] = useState(false);
    
    // Estados para el calendario de objetivos
    const [goalCalendarOpen, setGoalCalendarOpen] = useState(false);
    const [goalSelectedDate, setGoalSelectedDate] = useState<Date | null>(null);
    const [goalSelectedMonth, setGoalSelectedMonth] = useState<Date | null>(null);
    const [goalCalendarView, setGoalCalendarView] = useState<'semana' | 'mes' | 'año'>('mes');

    // Objetivo fijado para Resumen del día (estrella iluminada). Persistido en localStorage.
    const [summaryGoalId, setSummaryGoalId] = useState<string | null>(() => {
        try {
            return localStorage.getItem('home-summary-goal-id');
        } catch {
            return null;
        }
    });
    useEffect(() => {
        try {
            if (summaryGoalId) localStorage.setItem('home-summary-goal-id', summaryGoalId);
            else localStorage.removeItem('home-summary-goal-id');
        } catch (_) {}
    }, [summaryGoalId]);
    
    const { theme } = useTheme();

    // Obtener tasa de cambio real para la calculadora de objetivos
    useEffect(() => {
        if (goalCalculatorOpen) {
            fetch('https://api.exchangerate-api.com/v4/latest/USD')
                .then(res => res.json())
                .then(data => {
                    if (data && data.rates && data.rates.COP) {
                        setGoalExchangeRate(data.rates.COP);
                    }
                })
                .catch(err => console.error('Error fetching exchange rate:', err));
        }
    }, [goalCalculatorOpen]);

    // Calcular días del calendario para objetivos
    const goalCalendarDays = useMemo(() => {
        try {
            const dateToUse = goalSelectedMonth ?? today;
            if (!dateToUse || !(dateToUse instanceof Date) || isNaN(dateToUse.getTime())) {
                return [];
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
            console.error("Error en goalCalendarDays:", error);
            return [];
        }
    }, [goalSelectedMonth, today]);

    const goalCalendarWeekDays = useMemo(() => {
        try {
            if (!today || !(today instanceof Date) || isNaN(today.getTime())) {
                return [];
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
                    dayName: weekDate.toLocaleDateString("es-ES", { weekday: "short" }),
                    dayNumber: weekDate.getDate(),
                    isToday: weekDate.toDateString() === today.toDateString(),
                    date: weekDate
                };
            });
        } catch (error) {
            console.error("Error en goalCalendarWeekDays:", error);
            return [];
        }
    }, [today]);

    const goalCalendarMonths = useMemo(() => {
        try {
            const year = today.getFullYear();
            return Array.from({ length: 12 }, (_, index) => {
                const monthDate = new Date(year, index, 1);
                return {
                    key: `month-${index}`,
                    monthName: monthDate.toLocaleDateString("es-ES", { month: "short" }),
                    monthNumber: index,
                    isCurrentMonth: index === today.getMonth()
                };
            });
        } catch (error) {
            console.error("Error en goalCalendarMonths:", error);
            return [];
        }
    }, [today]);

    const goalMonthLabel = useMemo(() => {
        const dateToUse = goalSelectedMonth ?? today;
        return dateToUse.toLocaleDateString("es-ES", {
            month: "long",
            year: "numeric"
        });
    }, [goalSelectedMonth, today]);

    // Función helper para parsear fechas sin problemas de zona horaria
    const parseDateFromString = useCallback((dateString: string): Date => {
        if (!dateString || typeof dateString !== 'string') {
            return new Date(); // Fallback a fecha actual
        }
        const parts = dateString.split('-');
        if (parts.length === 3) {
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const day = parseInt(parts[2], 10);
            return new Date(year, month, day);
        }
        return new Date(dateString);
    }, []);

    const handleSelectGoalDate = (date: Date) => {
        // Formatear fecha en formato YYYY-MM-DD para el input type="date"
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        
        setGoalSelectedDate(date);
        setGoalDate(formattedDate);
        setGoalCalendarOpen(false);
    };

    const handleOpenCalculator = () => {
        setSelectedGoalForCalculator(null); // Nuevo objetivo
        setGoalCalculatorValueCOP(0);
        setGoalCalculatorValueUSD(0);
        setGoalCurrency('COP');
        setGoalCalculatorOpen(true);
    };

    const handleOpenCalculatorForGoal = (goalId: string) => {
        if (!goals || !Array.isArray(goals)) {
            return;
        }
        const goal = goals.find(g => g && g.id === goalId);
        if (goal) {
            setSelectedGoalForCalculator(goalId);
            setGoalCalculatorValueCOP(0);
            setGoalCalculatorValueUSD(0);
            setGoalCurrency('COP');
            setGoalCalculatorOpen(true);
        }
    };

    const handleSaveGoalFromCalculator = async () => {
        const currentValue = goalCurrency === 'USD' ? goalCalculatorValueUSD : goalCalculatorValueCOP;
        if (currentValue <= 0) {
            setGoalCalculatorOpen(false);
            return;
        }
        
        // Si hay un objetivo seleccionado, agregar dinero a ese objetivo
        if (selectedGoalForCalculator) {
            if (!goals || !Array.isArray(goals)) {
                setGoalCalculatorOpen(false);
                return;
            }
            const goal = goals.find(g => g && g.id === selectedGoalForCalculator);
            if (goal) {
                try {
                    let amountToAdd = currentValue;
                    // Si es USD, convertir a COP
                    if (goalCurrency === 'USD') {
                        amountToAdd = goalCalculatorValueUSD * goalExchangeRate;
                    }
                    
                    const currentAmount = goal.current_amount;
                    const currentAmountNumber = typeof currentAmount === 'number' ? currentAmount : (currentAmount ? Number(currentAmount) : 0);
                    const newCurrentAmount = currentAmountNumber + amountToAdd;
                    
                    // Actualizar el objetivo
                    if (typeof updateGoal === 'function') {
                        await updateGoal(selectedGoalForCalculator, {
                            current_amount: newCurrentAmount
                        });
                    }
                    
                    // Reset y cerrar
                    setGoalCalculatorValueCOP(0);
                    setGoalCalculatorValueUSD(0);
                    setGoalCurrency('COP');
                    setSelectedGoalForCalculator(null);
                    setGoalCalculatorOpen(false);
                    return;
                } catch (error) {
                    console.error('Error al actualizar objetivo:', error);
                    setGoalCalculatorOpen(false);
                    return;
                }
            }
        }
        
        // Si no hay objetivo seleccionado, solo cerrar (esto es para el formulario de nuevo objetivo)
        setGoalCalculatorOpen(false);
    };

    const handleSaveGoal = () => {
        const currentValue = goalCurrency === 'USD' ? goalCalculatorValueUSD : goalCalculatorValueCOP;
        if (currentValue <= 0 || !goalName || !goalDate) return;
        
        setIsSavingGoal(true);
        
        let targetInCOP = currentValue;
        
        // Si es USD, convertir a COP para guardar en la base de datos
        if (goalCurrency === 'USD') {
            targetInCOP = goalCalculatorValueUSD * goalExchangeRate;
        } else {
            targetInCOP = goalCalculatorValueCOP;
        }

        addGoal({
            name: goalName,
            target: targetInCOP,
            current_amount: 0,
            target_date: goalDate,
            priority: goalPriority
        });

        // Reset and close
        setTimeout(() => {
            setGoalName('');
            setGoalDate('');
            setGoalPriority('Media');
            setGoalCalculatorValueCOP(0);
            setGoalCalculatorValueUSD(0);
            setGoalCurrency('COP');
            setGoalCalculatorOpen(false);
            setShowGoalForm(false);
            setIsSavingGoal(false);
        }, 500);
    };

    // Obtener el valor del monto formateado para mostrar en el input
    const getGoalAmountDisplay = () => {
        const currentValue = goalCurrency === 'USD' ? goalCalculatorValueUSD : goalCalculatorValueCOP;
        if (currentValue <= 0) return '';
        return goalCurrency === 'USD' 
            ? `$${currentValue.toLocaleString('en-US')} USD`
            : `$${currentValue.toLocaleString('es-CO')} COP`;
    };

    // Calcular inversiones basado en transacciones de tipo 'Cripto' o 'Inversión'
    const investments = useMemo(() => {
        return (transactions || [])
            .filter(t => ['Cripto', 'Inversión', 'Inversiones', 'Acciones'].includes(t.category))
            .reduce((acc, t) => acc + Math.abs(t.amount), 0);
    }, [transactions]);

    // Objetivo del Resumen del día: el de la estrella iluminada (summaryGoalId) o el más próximo por fecha.
    const activeGoal = useMemo(() => {
        if (!goals || !Array.isArray(goals) || goals.length === 0) return null;
        if (summaryGoalId) {
            const byStar = goals.find(g => g && g.id === summaryGoalId);
            if (byStar) return byStar;
        }
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const validGoals = goals.filter(goal => {
                if (!goal || !goal.target_date) return false;
                try {
                    const targetDate = parseDateFromString(goal.target_date);
                    targetDate.setHours(0, 0, 0, 0);
                    return targetDate >= today;
                } catch (e) {
                    return false;
                }
            });
            if (validGoals.length === 0) return goals[0] || null;
            const sorted = [...validGoals].sort((a, b) => {
                try {
                    const dateA = parseDateFromString(a.target_date!);
                    const dateB = parseDateFromString(b.target_date!);
                    return dateA.getTime() - dateB.getTime();
                } catch (e) {
                    return 0;
                }
            });
            return sorted[0] || null;
        } catch (error) {
            return null;
        }
    }, [goals, summaryGoalId, parseDateFromString]);

    // Progreso del objetivo activo (current_amount / target). Conectado con la barra del resumen del día.
    const goalProgress = useMemo(() => {
        if (!activeGoal || !activeGoal.target) return 0;
        const target = typeof activeGoal.target === 'number' ? activeGoal.target : Number(activeGoal.target);
        if (target <= 0) return 0;
        const current = typeof activeGoal.current_amount === 'number' ? activeGoal.current_amount : Number(activeGoal.current_amount || 0);
        return Math.min(100, Math.round((current / target) * 100));
    }, [activeGoal]);

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

    try {
        // Validación defensiva de goals
        const safeGoals = Array.isArray(goals) ? goals : [];
        
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
                                <span className="hero-metric-value" style={{ 
                                    fontSize: '20px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: 'block',
                                    maxWidth: '100%'
                                }}>
                                    {activeGoal && activeGoal.name ? activeGoal.name : 'Sin objetivo'}
                                </span>
                                <span className="hero-metric-label">
                                    {activeGoal && activeGoal.target ? `${goalProgress}%` : 'Objetivo'}
                                </span>
                            </div>
                        </div>
                        <div className="hero-progress">
                            <div 
                                className="hero-progress-bar" 
                                style={{ 
                                    width: `${goalProgress}%`, 
                                    minWidth: 0,
                                    transition: 'width 0.4s ease'
                                }} 
                            />
                        </div>
                    </div>
                </motion.section>

                <motion.section variants={itemVariants} className="app-section">
                    <div className="section-title">
                        <h3>Finanzas</h3>
                        <span className="pill">Balance</span>
                    </div>
                    <div className="list-card">
                        <div className="list-item" style={{ border: 'none', padding: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <span style={{ 
                                            fontSize: '11px', 
                                            fontWeight: '600',
                                            color: 'var(--text-tertiary)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            Balance actual
                                        </span>
                                        <span style={{ 
                                            fontSize: '24px', 
                                            fontWeight: '700',
                                            color: 'var(--text-primary)'
                                        }}>
                                            ${balance.toLocaleString('es-CO')}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                                        <span style={{ 
                                            fontSize: '11px', 
                                            fontWeight: '600',
                                            color: 'var(--text-tertiary)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            Ahorro neto
                                        </span>
                                        <span style={{ 
                                            fontSize: '20px', 
                                            fontWeight: '700',
                                            color: income - expenses >= 0 ? 'var(--ios-green)' : 'var(--ios-red)'
                                        }}>
                                            ${(income - expenses).toLocaleString('es-CO')}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    paddingTop: '8px',
                                    borderTop: '1px solid var(--glass-border)'
                                }}>
                                    <span style={{ 
                                        fontSize: '12px',
                                        color: 'var(--text-secondary)'
                                    }}>
                                        Promedio diario: ${Math.round(income / 30).toLocaleString('es-CO')}
                                    </span>
                                    <span style={{ 
                                        fontSize: '12px',
                                        color: 'var(--text-secondary)'
                                    }}>
                                        Ratio inversión: {income > 0 ? Math.round((investments / income) * 100) : 0}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.section>

                <motion.section variants={itemVariants} className="app-section">
                    <div className="section-title">
                        <h3>Objetivos</h3>
                        {goals.length > 0 && <span className="pill">{goals.length} {goals.length === 1 ? 'activo' : 'activos'}</span>}
                        {!showGoalForm && (
                            <button
                                className="hero-icon-button"
                                onClick={() => setShowGoalForm(true)}
                                aria-label="Agregar objetivo"
                            >
                                <SFPlus size={18} />
                            </button>
                        )}
                    </div>
                    
                    <motion.div
                        initial={false}
                        animate={showGoalForm ? "open" : "closed"}
                        variants={{
                            open: { height: "auto", opacity: 1, y: 0 },
                            closed: { height: 0, opacity: 0, y: -6 }
                        }}
                        transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
                        style={{ overflow: "hidden" }}
                    >
                        {showGoalForm && !goalCalculatorOpen && (
                            <div className="task-form-card">
                                <input
                                    className="task-input"
                                    placeholder="Nombre del objetivo (ej: Dinero para mi BMW 240i)"
                                    value={goalName}
                                    onChange={(e) => setGoalName(e.target.value)}
                                />
                                <div
                                    className="task-input"
                                    onClick={handleOpenCalculator}
                                    style={{
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        color: getGoalAmountDisplay() ? 'var(--text-primary)' : 'var(--text-tertiary)'
                                    }}
                                >
                                    <span>{getGoalAmountDisplay() || 'Monto del objetivo (toca para ingresar)'}</span>
                                    <span style={{ fontSize: '18px', color: 'var(--ios-blue)' }}>💰</span>
                                </div>
                                <div className="task-form-row">
                                    <div className="task-picker">
                                        <DatePicker
                                            value={goalDate}
                                            onChange={setGoalDate}
                                            placeholder="Fecha"
                                            taskStyle={true}
                                        />
                                    </div>
                                    <select
                                        className="task-input"
                                        value={goalPriority}
                                        onChange={(e) => setGoalPriority(e.target.value as 'Alta' | 'Media' | 'Baja')}
                                    >
                                        <option value="Alta">Alta</option>
                                        <option value="Media">Media</option>
                                        <option value="Baja">Baja</option>
                                    </select>
                                </div>
                                <button
                                    className="task-add-button"
                                    onClick={handleSaveGoal}
                                    disabled={!goalName || !goalDate || (goalCurrency === 'USD' ? goalCalculatorValueUSD : goalCalculatorValueCOP) <= 0}
                                    style={{
                                        opacity: (!goalName || !goalDate || (goalCurrency === 'USD' ? goalCalculatorValueUSD : goalCalculatorValueCOP) <= 0) ? 0.5 : 1,
                                        cursor: (!goalName || !goalDate || (goalCurrency === 'USD' ? goalCalculatorValueUSD : goalCalculatorValueCOP) <= 0) ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    Agregar
                                </button>
                            </div>
                        )}
                    </motion.div>

                    {safeGoals.length === 0 && !showGoalForm ? (
                        <div className="list-card" style={{ padding: '40px 20px', textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', margin: 0 }}>
                                No hay objetivos aún
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {(!goals || !Array.isArray(goals)) ? (
                                <div className="list-card" style={{ padding: '40px 20px', textAlign: 'center' }}>
                                    <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', margin: 0 }}>
                                        Error cargando objetivos
                                    </p>
                                </div>
                            ) : safeGoals.map((goal) => {
                                if (!goal || !goal.id) {
                                    return null;
                                }
                                
                                if (!goal.target_date) {
                                    return null;
                                }
                                
                                let parsedTargetDate: Date;
                                try {
                                    parsedTargetDate = parseDateFromString(goal.target_date);
                                } catch (error) {
                                    parsedTargetDate = new Date();
                                }
                                
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                parsedTargetDate.setHours(0, 0, 0, 0);
                                const daysRemaining = Math.ceil((parsedTargetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                
                                const currentAmount = typeof goal.current_amount === 'number' ? goal.current_amount : (goal.current_amount ? Number(goal.current_amount) : 0);
                                const target = typeof goal.target === 'number' ? goal.target : (goal.target ? Number(goal.target) : 0);
                                const progress = target > 0 ? Math.min(100, Math.round((currentAmount / target) * 100)) : 0;
                                
                                // Obtener color de prioridad
                                const getPriorityColor = (priority: string) => {
                                    switch (priority) {
                                        case 'Alta':
                                            return '#ff453a';
                                        case 'Media':
                                            return '#2997ff';
                                        case 'Baja':
                                            return '#30db5b';
                                        default:
                                            return '#2997ff';
                                    }
                                };
                                
                                return (
                                    <div 
                                        key={goal.id} 
                                        className="goal-card"
                                        onClick={() => {
                                            try {
                                                handleOpenCalculatorForGoal(goal.id);
                                            } catch (error) {
                                                console.error('Error al abrir calculadora:', error);
                                            }
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="goal-header">
                                            <div style={{ flex: 1 }}>
                                                <p style={{ margin: 0, marginBottom: '4px', fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                                                    {goal.name}
                                                </p>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                                        ${currentAmount.toLocaleString('es-CO')} / ${goal.target.toLocaleString('es-CO')}
                                                    </span>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                                                        <span>{parsedTargetDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                        <span style={{ 
                                                            padding: '2px 8px', 
                                                            borderRadius: '6px', 
                                                            background: `${getPriorityColor(goal.priority)}20`,
                                                            color: getPriorityColor(goal.priority),
                                                            fontWeight: '600'
                                                        }}>
                                                            {goal.priority}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSummaryGoalId(prev => prev === goal.id ? null : goal.id);
                                                }}
                                                aria-label={summaryGoalId === goal.id ? 'Quitar de resumen del día' : 'Mostrar en resumen del día'}
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    padding: '4px',
                                                    border: 'none',
                                                    background: 'transparent',
                                                    cursor: 'pointer',
                                                    color: summaryGoalId === goal.id ? '#f5c542' : 'var(--text-tertiary)',
                                                    opacity: summaryGoalId === goal.id ? 1 : 0.6
                                                }}
                                            >
                                                {summaryGoalId === goal.id ? (
                                                    <SFStarFilled size={24} />
                                                ) : (
                                                    <SFStar size={24} strokeWidth={1.5} />
                                                )}
                                                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>{progress}%</span>
                                            </button>
                                        </div>
                                        <div className="hero-progress" style={{ marginTop: '12px' }}>
                                            <div 
                                                className="hero-progress-bar" 
                                                style={{ 
                                                    width: `${progress}%`, 
                                                    minWidth: 0,
                                                    transition: 'width 0.4s ease'
                                                }} 
                                            />
                                        </div>
                                        <div className="goal-footer">
                                            <span>{daysRemaining > 0 ? `${daysRemaining} días restantes` : daysRemaining === 0 ? 'Hoy' : 'Fecha alcanzada'}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </motion.section>

            </motion.div>

            {/* Calculadora de Objetivos (Bottom Sheet) */}
            <AnimatePresence>
                {goalCalculatorOpen && (
                    <div 
                        className="calendar-backdrop" 
                        onClick={() => {
                            setGoalCalculatorOpen(false);
                        }}
                        style={{ 
                            position: 'fixed',
                            inset: 0,
                            zIndex: 200,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'flex-end',
                            paddingBottom: 'calc(60px + env(safe-area-inset-bottom))',
                            background: 'rgba(0,0,0,0.4)'
                        }}
                    >
                        <motion.div
                            initial={{ y: '100%', opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: '100%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="calendar-modal-card"
                            onClick={(e) => e.stopPropagation()}
                            style={{ 
                                width: '100%', 
                                maxWidth: '100%',
                                borderRadius: '24px 24px 0 0',
                                padding: '20px 24px',
                                margin: '0',
                                background: 'var(--bg-secondary)',
                                borderTop: '1px solid var(--glass-border)',
                                boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {/* Header con nombre del objetivo */}
                                <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', marginBottom: '8px' }}>
                                    <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                        {selectedGoalForCalculator 
                                            ? (safeGoals.find(g => g && g.id === selectedGoalForCalculator)?.name || 'Agregar dinero')
                                            : goalName || 'Monto del objetivo'
                                        }
                                    </p>
                                    {selectedGoalForCalculator && (() => {
                                        const goal = safeGoals.find(g => g && g.id === selectedGoalForCalculator);
                                        if (goal) {
                                            const currentAmount = goal.current_amount || 0;
                                            const progress = goal.target > 0 ? Math.min(100, Math.round((currentAmount / goal.target) * 100)) : 0;
                                            return (
                                                <p style={{ margin: '8px 0 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                                    Actual: ${currentAmount.toLocaleString('es-CO')} / ${goal.target.toLocaleString('es-CO')} ({progress}%)
                                                </p>
                                            );
                                        }
                                        return null;
                                    })()}
                                </div>
                                
                                {/* Header con selector de moneda y conversión */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '4px', background: 'rgba(118, 118, 128, 0.12)', padding: '3px', borderRadius: '10px' }}>
                                        <button
                                            onClick={() => {
                                                setGoalCurrency('USD');
                                                setGoalCalculatorValueUSD(0);
                                            }}
                                            style={{
                                                padding: '6px 16px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                background: goalCurrency === 'USD' ? 'var(--bg-primary)' : 'transparent',
                                                color: goalCurrency === 'USD' ? 'var(--text-primary)' : 'var(--text-secondary)',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                boxShadow: goalCurrency === 'USD' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            USD
                                        </button>
                                        <button
                                            onClick={() => {
                                                setGoalCurrency('COP');
                                                setGoalCalculatorValueCOP(0);
                                            }}
                                            style={{
                                                padding: '6px 16px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                background: goalCurrency === 'COP' ? 'var(--bg-primary)' : 'transparent',
                                                color: goalCurrency === 'COP' ? 'var(--text-primary)' : 'var(--text-secondary)',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                boxShadow: goalCurrency === 'COP' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            COP
                                        </button>
                                    </div>

                                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Conversión estimada
                                        </span>
                                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                                            {goalCurrency === 'USD' 
                                                ? `≈ $${(goalCalculatorValueUSD * goalExchangeRate).toLocaleString('es-CO')} COP`
                                                : `≈ $${(goalCalculatorValueCOP / goalExchangeRate).toLocaleString('en-US', { maximumFractionDigits: 2 })} USD`
                                            }
                                        </span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '4px 0' }}>
                                    <button
                                        onClick={() => {
                                            setGoalMinusButtonActive(true);
                                            const decrement = goalCurrency === 'USD' ? 20 : 20000;
                                            if (goalCurrency === 'USD') {
                                                setGoalCalculatorValueUSD(prev => Math.max(0, prev - decrement));
                                            } else {
                                                setGoalCalculatorValueCOP(prev => Math.max(0, prev - decrement));
                                            }
                                            setTimeout(() => setGoalMinusButtonActive(false), 200);
                                        }}
                                        onMouseDown={() => setGoalMinusButtonActive(true)}
                                        onMouseUp={() => setTimeout(() => setGoalMinusButtonActive(false), 200)}
                                        onTouchStart={() => setGoalMinusButtonActive(true)}
                                        onTouchEnd={() => setTimeout(() => setGoalMinusButtonActive(false), 200)}
                                        style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '50%',
                                            border: 'none',
                                            background: 'transparent',
                                            fontSize: '24px',
                                            color: theme === 'dark' 
                                                ? (goalMinusButtonActive ? '#ff453a' : '#fff')
                                                : '#000',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'color 0.15s ease'
                                        }}
                                    >
                                        <SFMinus size={24} />
                                    </button>

                                    <div style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
                                        {isEditingGoalAmount ? (
                                            <input
                                                type="number"
                                                value={tempGoalAmountInput}
                                                onChange={(e) => setTempGoalAmountInput(e.target.value)}
                                                onBlur={() => {
                                                    const val = parseFloat(tempGoalAmountInput);
                                                    if (!isNaN(val) && val >= 0) {
                                                        if (goalCurrency === 'USD') {
                                                            setGoalCalculatorValueUSD(val);
                                                        } else {
                                                            setGoalCalculatorValueCOP(val);
                                                        }
                                                    }
                                                    setIsEditingGoalAmount(false);
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const val = parseFloat(tempGoalAmountInput);
                                                        if (!isNaN(val) && val >= 0) {
                                                            if (goalCurrency === 'USD') {
                                                                setGoalCalculatorValueUSD(val);
                                                            } else {
                                                                setGoalCalculatorValueCOP(val);
                                                            }
                                                        }
                                                        setIsEditingGoalAmount(false);
                                                    }
                                                }}
                                                autoFocus
                                                style={{
                                                    fontSize: '36px',
                                                    fontWeight: '700',
                                                    color: 'var(--text-primary)',
                                                    background: 'transparent',
                                                    border: 'none',
                                                    textAlign: 'center',
                                                    width: '100%',
                                                    outline: 'none',
                                                    letterSpacing: '-1px'
                                                }}
                                            />
                                        ) : (
                                            <div 
                                                onClick={() => {
                                                    const currentValue = goalCurrency === 'USD' ? goalCalculatorValueUSD : goalCalculatorValueCOP;
                                                    setTempGoalAmountInput(currentValue.toString());
                                                    setIsEditingGoalAmount(true);
                                                }}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <span style={{ fontSize: '36px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-1px' }}>
                                                    {goalCurrency === 'USD' ? '$' : ''}
                                                    {(goalCurrency === 'USD' ? goalCalculatorValueUSD : goalCalculatorValueCOP).toLocaleString(goalCurrency === 'USD' ? 'en-US' : 'es-CO')}
                                                </span>
                                                <p style={{ margin: '2px 0 0', fontSize: '14px', color: 'var(--text-tertiary)' }}>
                                                    {goalCurrency === 'USD' ? 'Dólares' : 'Pesos Colombianos'}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => {
                                            const increment = goalCurrency === 'USD' ? 100 : 1000000;
                                            if (goalCurrency === 'USD') {
                                                setGoalCalculatorValueUSD(prev => prev + increment);
                                            } else {
                                                setGoalCalculatorValueCOP(prev => prev + increment);
                                            }
                                        }}
                                        style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '50%',
                                            border: 'none',
                                            background: 'transparent',
                                            fontSize: '24px',
                                            color: 'var(--ios-blue)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.1s'
                                        }}
                                    >
                                        <SFPlus size={24} />
                                    </button>
                                </div>

                                <button
                                    onClick={handleSaveGoalFromCalculator}
                                    disabled={(goalCurrency === 'USD' ? goalCalculatorValueUSD : goalCalculatorValueCOP) <= 0}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '12px',
                                        background: (goalCurrency === 'USD' ? goalCalculatorValueUSD : goalCalculatorValueCOP) > 0 ? 'var(--ios-blue)' : 'rgba(255, 255, 255, 0.1)',
                                        color: (goalCurrency === 'USD' ? goalCalculatorValueUSD : goalCalculatorValueCOP) > 0 ? '#fff' : 'var(--text-tertiary)',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        border: 'none',
                                        cursor: (goalCurrency === 'USD' ? goalCalculatorValueUSD : goalCalculatorValueCOP) > 0 ? 'pointer' : 'not-allowed',
                                        marginBottom: '0',
                                        opacity: (goalCurrency === 'USD' ? goalCalculatorValueUSD : goalCalculatorValueCOP) > 0 ? 1 : 0.5,
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {selectedGoalForCalculator ? 'Agregar Dinero' : 'Confirmar Monto'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                    )}
            </AnimatePresence>

            {/* Modal del Calendario para Objetivos */}
            <AnimatePresence>
                {goalCalendarOpen && (
                    <div 
                        className="calendar-modal"
                        style={{ 
                            position: 'fixed',
                            inset: 0,
                            zIndex: 200,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            background: 'rgba(0,0,0,0.4)'
                        }}
                    >
                        <button
                            className="calendar-backdrop"
                            aria-label="Cerrar calendario"
                            onClick={() => setGoalCalendarOpen(false)}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        />
                        <motion.div
                            className="calendar-modal-card"
                            initial={{ opacity: 0, y: 12, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 12, scale: 0.98 }}
                            transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="calendar-card">
                                <div className="calendar-tabs">
                                    <button
                                        type="button"
                                        className={clsx(
                                            "calendar-tab",
                                            goalCalendarView === "semana" && "calendar-tab-active"
                                        )}
                                        onClick={() => setGoalCalendarView("semana")}
                                    >
                                        Semana
                                    </button>
                                    <button
                                        type="button"
                                        className={clsx(
                                            "calendar-tab",
                                            goalCalendarView === "mes" && "calendar-tab-active"
                                        )}
                                        onClick={() => setGoalCalendarView("mes")}
                                    >
                                        Mes
                                    </button>
                                    <button
                                        type="button"
                                        className={clsx(
                                            "calendar-tab",
                                            goalCalendarView === "año" && "calendar-tab-active"
                                        )}
                                        onClick={() => setGoalCalendarView("año")}
                                    >
                                        Año
                                    </button>
                                </div>
                                {goalCalendarView === "mes" && (
                                    <>
                                        <div className="calendar-month">{goalMonthLabel}</div>
                                        <div className="calendar-grid">
                                            {["L", "M", "M", "J", "V", "S", "D"].map((label, index) => (
                                                <div
                                                    key={`${label}-${index}`}
                                                    className="calendar-day calendar-day-muted calendar-weekday-header"
                                                >
                                                    {label}
                                                </div>
                                            ))}
                                            {goalCalendarDays.map((day) => (
                                                <button
                                                    key={day.key}
                                                    type="button"
                                                    className={clsx(
                                                        "calendar-day",
                                                        "calendar-day-button",
                                                        !day.isCurrentMonth && "calendar-day-muted",
                                                        day.isToday && "calendar-day-active",
                                                        goalSelectedDate && 
                                                        day.date.toDateString() === goalSelectedDate.toDateString() && 
                                                        "calendar-day-selected"
                                                    )}
                                                    onClick={() => handleSelectGoalDate(day.date)}
                                                >
                                                    {day.dayNumber}
                                                </button>
                                            ))}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const dateToUse = goalSelectedMonth ?? today;
                                                    const prevMonth = new Date(dateToUse);
                                                    prevMonth.setMonth(prevMonth.getMonth() - 1);
                                                    setGoalSelectedMonth(prevMonth);
                                                }}
                                                style={{
                                                    padding: '8px 16px',
                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                    border: '1px solid var(--glass-border)',
                                                    borderRadius: '8px',
                                                    color: 'var(--text-primary)',
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                ← Anterior
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setGoalSelectedMonth(today);
                                                }}
                                                style={{
                                                    padding: '8px 16px',
                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                    border: '1px solid var(--glass-border)',
                                                    borderRadius: '8px',
                                                    color: 'var(--text-primary)',
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Hoy
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const dateToUse = goalSelectedMonth ?? today;
                                                    const nextMonth = new Date(dateToUse);
                                                    nextMonth.setMonth(nextMonth.getMonth() + 1);
                                                    setGoalSelectedMonth(nextMonth);
                                                }}
                                                style={{
                                                    padding: '8px 16px',
                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                    border: '1px solid var(--glass-border)',
                                                    borderRadius: '8px',
                                                    color: 'var(--text-primary)',
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Siguiente →
                                            </button>
                                        </div>
                                    </>
                                )}
                                {goalCalendarView === "semana" && (
                                    <>
                                        <div className="calendar-month">
                                            {today.toLocaleDateString("es-ES", {
                                                month: "long",
                                                year: "numeric"
                                            })}
                                        </div>
                                        <div className="calendar-week-grid">
                                            {goalCalendarWeekDays.map((day) => (
                                                <button
                                                    key={day.key}
                                                    type="button"
                                                    className={clsx(
                                                        "calendar-day",
                                                        "calendar-day-button",
                                                        "calendar-week-day",
                                                        day.isToday && "calendar-day-active",
                                                        goalSelectedDate && 
                                                        day.date.toDateString() === goalSelectedDate.toDateString() && 
                                                        "calendar-day-selected"
                                                    )}
                                                    onClick={() => handleSelectGoalDate(day.date)}
                                                >
                                                    <span className="calendar-week-day-name">{day.dayName}</span>
                                                    <span className="calendar-week-day-number">{day.dayNumber}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                                {goalCalendarView === "año" && (
                                    <>
                                        <div className="calendar-year-label">{today.getFullYear()}</div>
                                        <div className="calendar-year-grid">
                                            {goalCalendarMonths.map((month) => (
                                                <button
                                                    key={month.key}
                                                    type="button"
                                                    className={clsx(
                                                        "calendar-month-item",
                                                        month.isCurrentMonth && "calendar-month-active"
                                                    )}
                                                    onClick={() => {
                                                        const monthDate = new Date(today.getFullYear(), month.monthNumber, 1);
                                                        setGoalSelectedMonth(monthDate);
                                                        setGoalCalendarView("mes");
                                                    }}
                                                >
                                                    {month.monthName.charAt(0).toUpperCase() + month.monthName.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
        );
    } catch (error) {
        throw error;
    }
}
