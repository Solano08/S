import { useMemo, useState, useEffect } from 'react';
import { motion, type Variants, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { QuickActionsMenu } from '../components/ui/QuickActionsMenu';
import { useAppData } from '../context/AppDataContext';
import { useToday } from '../hooks/useToday';
import { GlassCard } from '../components/ui/GlassCard';
import {
    SFWallet,
    SFCheckCircle,
    SFSparkles,
    SFTarget,
    SFTrendingUp,
    SFArrowUpRight,
    SFArrowDownRight
} from '../components/ui/SFIcons';

export function Home() {
    const { balance, income, expenses, tasks, events, transactions, addTransaction } = useAppData();
    const today = useToday();
    const time = new Date().getHours();
    const greeting = time < 12 ? 'Buenos días' : time < 18 ? 'Buenas tardes' : 'Buenas noches';
    const dateLabel = today.toLocaleDateString('es-ES', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });

    const [isBalanceExpanded, setIsBalanceExpanded] = useState(false);
    const [newIncomeAmount, setNewIncomeAmount] = useState('');
    const [newIncomeDesc, setNewIncomeDesc] = useState('');

    const handleSaveIncome = () => {
        if (!newIncomeAmount) return;
        
        const amount = parseFloat(newIncomeAmount.replace(/[^0-9.]/g, ''));
        if (isNaN(amount) || amount <= 0) return;

        addTransaction({
            title: newIncomeDesc || 'Ingreso',
            category: 'Ingreso',
            amount: amount
        });

        // Reset and close
        setNewIncomeAmount('');
        setNewIncomeDesc('');
        setIsBalanceExpanded(false);
    };

    // Calcular inversiones basado en transacciones de tipo 'Cripto' o 'Inversión'
    const investments = useMemo(() => {
        return (transactions || [])
            .filter(t => ['Cripto', 'Inversión', 'Inversiones', 'Acciones'].includes(t.category))
            .reduce((acc, t) => acc + Math.abs(t.amount), 0);
    }, [transactions]);

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
                                <span className="hero-metric-value">{events.length}</span>
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
                    <div className="section-title mb-4">
                        <h3>Finanzas</h3>
                        <span className="pill">Este mes</span>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                        {/* Ingresos y Gastos - Expandible */}
                        <motion.div 
                            layout
                            className={`flex flex-col gap-4 transition-all duration-300 ${isBalanceExpanded ? 'glass-panel p-4 rounded-[24px]' : ''}`}
                            onClick={() => !isBalanceExpanded && setIsBalanceExpanded(true)}
                            style={{ cursor: !isBalanceExpanded ? 'pointer' : 'default' }}
                        >
                            {/* Header (Resumen) */}
                            <motion.div layout className="flex flex-col gap-4">
                                <div className="flex items-center justify-between gap-4">
                                    {/* Ingresos */}
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-black dark:text-white">Ingresos</span>
                                            <SFArrowUpRight size={16} className="text-green-500" />
                                        </div>
                                        <span className="text-2xl font-bold tracking-tight text-green-500">
                                            ${income.toLocaleString('es-CO')}
                                        </span>
                                    </div>

                                    {/* Gastos */}
                                    <div className="flex flex-col gap-1 items-end">
                                        <div className="flex items-center gap-2">
                                            <SFArrowDownRight size={16} className="text-red-500" />
                                            <span className="text-sm font-medium text-black dark:text-white">Gastos</span>
                                        </div>
                                        <span className="text-2xl font-bold tracking-tight text-red-500">
                                            ${expenses.toLocaleString('es-CO')}
                                        </span>
                                    </div>
                                </div>

                                {/* Porcentaje de Ganancias/Pérdidas */}
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>Balance</span>
                                        <span>{income > 0 ? Math.round(((income - expenses) / income) * 100) : 0}% de margen</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-green-500 rounded-full"
                                            style={{ width: `${income > 0 ? Math.min(100, Math.max(0, ((income - expenses) / income) * 100)) : 0}%` }}
                                        />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Formulario de Agregar Ingreso */}
                            <AnimatePresence>
                                {isBalanceExpanded && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="pt-4 flex flex-col gap-3 border-t border-gray-200 dark:border-gray-700 mt-2"
                                    >
                                        <h4 className="text-sm font-semibold text-black dark:text-white">Agregar Ingreso</h4>
                                        <input
                                            type="number"
                                            placeholder="Monto"
                                            value={newIncomeAmount}
                                            onChange={(e) => setNewIncomeAmount(e.target.value)}
                                            className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                            autoFocus
                                        />
                                        <input
                                            type="text"
                                            placeholder="Descripción (opcional)"
                                            value={newIncomeDesc}
                                            onChange={(e) => setNewIncomeDesc(e.target.value)}
                                            className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                        />
                                        <div className="flex gap-2 mt-2">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsBalanceExpanded(false);
                                                    setNewIncomeAmount('');
                                                    setNewIncomeDesc('');
                                                }}
                                                className="flex-1 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300"
                                            >
                                                Cancelar
                                            </button>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSaveIncome();
                                                }}
                                                className="flex-1 py-2.5 rounded-xl bg-green-500 text-sm font-semibold text-white shadow-lg shadow-green-500/30"
                                            >
                                                Guardar
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Inversiones */}
                        <GlassCard className="flex flex-col gap-3 relative overflow-hidden group mt-2">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <SFTrendingUp size={48} className="text-blue-500" />
                            </div>
                            <div className="flex items-center gap-2 text-blue-500 mb-1">
                                <div className="p-2 bg-blue-500/10 rounded-full">
                                    <SFTrendingUp size={16} />
                                </div>
                                <span className="text-sm font-medium">Inversiones</span>
                            </div>
                            <div>
                                <span className="text-2xl font-bold tracking-tight text-white">
                                    ${investments.toLocaleString('es-CO')}
                                </span>
                                <p className="text-xs text-white/50 mt-1">
                                    En crecimiento
                                </p>
                            </div>
                        </GlassCard>
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
                        {tasks.slice(0, 2).map((task) => {
                            const getTaskPriorityColor = (priority: string): string => {
                                switch (priority) {
                                    case 'Alta':
                                        return '#ff453a'; // Rojo iOS
                                    case 'Media':
                                        return '#2997ff'; // Azul iOS
                                    case 'Baja':
                                        return '#30db5b'; // Verde iOS
                                    default:
                                        return '#2997ff'; // Azul por defecto
                                }
                            };
                            return (
                                <div 
                                    className="list-item"
                                    key={task.id}
                                >
                                    <div className="list-icon">
                                        <SFCheckCircle size={18} />
                                    </div>
                                    <div className="list-content">
                                        <p>{task.title}</p>
                                        <span>{task.meta}</span>
                                    </div>
                                    <span 
                                        className="list-time" 
                                        style={{ color: getTaskPriorityColor(task.priority || 'Media') }}
                                    >
                                        {task.priority}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </motion.section>
            </motion.div>
        </div>
    );
}
