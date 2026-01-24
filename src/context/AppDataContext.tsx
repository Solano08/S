/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { saveToCache, getFromCache } from '../utils/localStorageCache';

type Task = {
    id: string;
    title: string;
    meta: string;
    priority: string;
    completed?: boolean;
};

type Transaction = {
    id: string;
    title: string;
    category: string;
    amount: number;
};

type Event = {
    id: string;
    title: string;
    description: string;
    event_date: string;
    event_time: string;
    completed?: boolean;
};

type HabitCategory = 'non-negotiable' | 'consider' | 'basic-routine';

type Habit = {
    id: string;
    title: string;
    description: string;
    category: HabitCategory;
    completed: boolean;
    timestamp: Date;
    position?: number;
};

type ProjectStatus = 'not-started' | 'in-progress' | 'completed';

type Project = {
    id: string;
    title: string;
    description: string;
    start_date?: string; // YYYY-MM-DD
    end_date?: string; // YYYY-MM-DD
    status: ProjectStatus;
    progress: number; // 0-100
    template?: string; // Nombre de la plantilla usada
    created_at?: string;
};

type AppDataContextValue = {
    balance: number;
    income: number;
    expenses: number;
    transactions: Transaction[];
    tasks: Task[];
    events: Event[];
    habits: Habit[];
    projects: Project[];
    addTask: (task: Omit<Task, 'id'>) => void;
    updateTask: (id: string, updates: Partial<Omit<Task, 'id'>>) => void;
    deleteTask: (id: string) => void;
    addEvent: (event: Omit<Event, 'id'>) => void;
    updateEvent: (id: string, updates: Partial<Omit<Event, 'id'>>) => void;
    deleteEvent: (id: string) => void;
    addHabit: (habit: Omit<Habit, 'id' | 'timestamp'>) => void;
    updateHabit: (id: string, updates: Partial<Omit<Habit, 'id' | 'timestamp'>>) => void;
    deleteHabit: (id: string) => void;
    reorderHabits: (category: HabitCategory, habitIds: string[]) => void;
    addProject: (project: Omit<Project, 'id'>) => void;
    updateProject: (id: string, updates: Partial<Omit<Project, 'id'>>) => void;
    deleteProject: (id: string) => void;
    addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
};

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AppDataContext.tsx:AppDataProvider:init',message:'AppDataProvider iniciando',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    // Inicializar con valores por defecto para evitar mostrar 0 mientras carga
    const [tasks, setTasks] = useState<Task[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [habits, setHabits] = useState<Habit[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [balance, setBalance] = useState(880000); // Valor por defecto
    const [income, setIncome] = useState(1100000); // Valor por defecto
    const [expenses, setExpenses] = useState(229900); // Valor por defecto
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AppDataContext.tsx:AppDataProvider:stateInit',message:'Estados inicializados',data:{tasksCount:tasks.length,eventsCount:events.length,habitsCount:habits.length,projectsCount:projects.length,balance,income,expenses},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    const loadDataRef = useRef<(() => Promise<void>) | null>(null);
    // Rastrear cambios recientes para evitar que las suscripciones de tiempo real los sobrescriban
    const recentUpdatesRef = useRef<Map<string, { completed?: boolean; timestamp: number }>>(new Map());

    // Cargar datos del caché primero (para carga instantánea) - useEffect independiente
    useEffect(() => {
        const cachedTasks = getFromCache<Task[]>('tasks');
        const cachedEvents = getFromCache<Event[]>('events');
        const cachedHabits = getFromCache<Habit[]>('habits');
        const cachedProjects = getFromCache<Project[]>('projects');
        const cachedTransactions = getFromCache<Transaction[]>('transactions');
        const cachedOverview = getFromCache<{ balance: number; income: number; expenses: number }>('overview');

        if (cachedTasks && cachedTasks.length > 0) setTasks(cachedTasks);
        if (cachedEvents && cachedEvents.length > 0) setEvents(cachedEvents);
        if (cachedHabits && cachedHabits.length > 0) setHabits(cachedHabits);
        if (cachedProjects && cachedProjects.length > 0) setProjects(cachedProjects);
        if (cachedTransactions && cachedTransactions.length > 0) setTransactions(cachedTransactions);
        if (cachedOverview) {
            setBalance(cachedOverview.balance);
            setIncome(cachedOverview.income);
            setExpenses(cachedOverview.expenses);
        }
    }, []);

    // Guardar en caché cuando cambian los datos (para funcionamiento offline) - useEffect independientes
    useEffect(() => {
        if (tasks.length > 0) saveToCache('tasks', tasks);
    }, [tasks]);

    useEffect(() => {
        if (events.length > 0) saveToCache('events', events);
    }, [events]);

    useEffect(() => {
        if (habits.length > 0) saveToCache('habits', habits);
    }, [habits]);

    useEffect(() => {
        if (projects.length > 0) saveToCache('projects', projects);
    }, [projects]);

    useEffect(() => {
        if (transactions.length > 0) saveToCache('transactions', transactions);
    }, [transactions]);

    useEffect(() => {
        saveToCache('overview', { balance, income, expenses });
    }, [balance, income, expenses]);

    useEffect(() => {
        // Función para inicializar datos si no existen
        const initializeData = async () => {
            if (!supabase) return;

            try {
                // Verificar si app_overview está vacío
                const { data: overviewData } = await supabase
                    .from('app_overview')
                    .select('id')
                    .limit(1);

                if (!overviewData || overviewData.length === 0) {
                    // Insertar datos iniciales
                    await supabase.from('app_overview').insert({
                        balance: 880000,
                        income: 1100000,
                        expenses: 229900
                    });
                }
            } catch (error) {
                console.warn('No se pudieron inicializar los datos automáticamente:', error);
            }
        };

        if (!supabase) {
            console.warn("Supabase no está configurado. Usando datos locales. Revisa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.");
            console.warn("Para PWA: Asegúrate de que las variables de entorno estén disponibles en el build de producción.");
            // Valores por defecto cuando Supabase no está configurado
            setBalance(880000);
            setIncome(1100000);
            setExpenses(229900);
            setTransactions([
                { id: "tx-1", title: "Ingreso 15 de enero", category: "Ingreso", amount: 1100000 },
                { id: "tx-2", title: "Transmilenio", category: "Transporte", amount: -6000 },
                { id: "tx-3", title: "Compra 0,4 SOL", category: "Cripto", amount: -220000 },
                { id: "tx-4", title: "Apple", category: "Suscripción", amount: -3900 }
            ]);
            setTasks([
                { id: "task-1", title: "Enviar correo al SENA", meta: "10:00 AM · Hoy", priority: "Alta" },
                { id: "task-2", title: "Mandado de mi mamá", meta: "Hoy · Comprar carne", priority: "Media" },
                { id: "task-3", title: "Enviar mensaje a Westcol", meta: "18:00 · Hoy", priority: "Baja" }
            ]);
            return;
        }

        let active = true;

        const loadData = async () => {
            if (!supabase) return;
            
            try {
                // Timeout para no bloquear la carga si Supabase es lento
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout')), 5000)
                );
                
                const dataPromise = Promise.all([
                    supabase.from('tasks').select('*').order('created_at', { ascending: true }),
                    supabase.from('transactions').select('*').order('created_at', { ascending: false }),
                    supabase.from('events').select('*').order('event_date', { ascending: true }),
                    supabase.from('app_overview').select('*').order('updated_at', { ascending: false }).limit(1),
                    supabase.from('habits').select('*').order('category', { ascending: true }).order('position', { ascending: true }),
                    supabase.from('projects').select('*').order('created_at', { ascending: false })
                ]);

                // Usar timeout para no bloquear - si tarda más de 5 segundos, usar valores por defecto
                let results;
                try {
                    results = await Promise.race([dataPromise, timeoutPromise]);
                } catch (error) {
                    console.warn('⚠️ Timeout cargando datos - usando valores por defecto');
                    return; // Mantener valores por defecto ya establecidos
                }

                const [tasksResult, transactionsResult, eventsResult, overviewResult, habitsResult, projectsResult] = results as Array<any>;

                if (!active) return;

                if (tasksResult.error) {
                    console.error("Error cargando tareas:", tasksResult.error);
                } else {
                    const loadedTasks = tasksResult.data ?? [];
                    setTasks((prev) => {
                        // Preservar el estado local de completed cuando se recargan los datos
                        const prevTasksMap = new Map(prev.map(t => [t.id, t]));
                        return loadedTasks.map((item: any) => {
                            const taskId = String(item.id);
                            const prevTask = prevTasksMap.get(taskId);
                            return {
                                id: taskId,
                                title: item.title ?? "",
                                meta: item.meta ?? "",
                                priority: item.priority ?? "Media",
                                // Preservar el valor local de completed si existe, sino usar el de Supabase
                                completed: prevTask?.completed !== undefined ? prevTask.completed : Boolean(item.completed ?? false)
                            };
                        });
                    });
                }

                if (transactionsResult.error) {
                    console.error("Error cargando transacciones:", transactionsResult.error);
                } else {
                    const loadedTransactions = transactionsResult.data ?? [];
                    setTransactions(
                        loadedTransactions.map((item: any) => ({
                            id: String(item.id),
                            title: item.title ?? "",
                            category: item.category ?? "",
                            amount: Number(item.amount ?? 0)
                        }))
                    );
                }

                if (eventsResult.error) {
                    console.error("Error cargando eventos:", eventsResult.error);
                } else {
                    const loadedEvents = eventsResult.data ?? [];
                    // Log deshabilitado para optimizar rendimiento
                    // Guardar en caché
                    saveToCache('events', loadedEvents);
                    setEvents((prev) => {
                        // Preservar el estado local de completed cuando se recargan los datos
                        const prevEventsMap = new Map(prev.map(e => [e.id, e]));
                        return loadedEvents.map((item: any) => {
                            const eventId = String(item.id);
                            const prevEvent = prevEventsMap.get(eventId);
                            return {
                                id: eventId,
                                title: item.title ?? "",
                                description: item.description ?? "",
                                event_date: item.event_date ?? "",
                                event_time: item.event_time ?? "",
                                // Preservar el valor local de completed si existe, sino usar el de Supabase
                                completed: prevEvent?.completed !== undefined ? prevEvent.completed : Boolean(item.completed ?? false)
                            };
                        });
                    });
                }

                if (habitsResult.error) {
                    console.error("Error cargando hábitos:", habitsResult.error);
                } else {
                    const loadedHabits = habitsResult.data ?? [];
                    // Log deshabilitado para optimizar rendimiento
                    setHabits((prev) => {
                        // Preservar el estado local de completed cuando se recargan los datos
                        const prevHabitsMap = new Map(prev.map(h => [h.id, h]));
                        return loadedHabits.map((item: any) => {
                            const habitId = String(item.id);
                            const prevHabit = prevHabitsMap.get(habitId);
                            return {
                                id: habitId,
                                title: item.title ?? "",
                                description: item.description ?? "",
                                category: (item.category ?? 'non-negotiable') as HabitCategory,
                                completed: prevHabit?.completed !== undefined ? prevHabit.completed : Boolean(item.completed ?? false),
                                position: item.position ?? 0,
                                timestamp: item.created_at ? new Date(item.created_at) : new Date()
                            };
                        });
                    });
                }

                if (projectsResult.error) {
                    const errorCode = projectsResult.error?.code;
                    const errorMessage = projectsResult.error?.message || '';
                    
                    // Si el error es PGRST205 (tabla no encontrada), mostrar mensaje útil
                    if (errorCode === 'PGRST205' || errorMessage.includes('Could not find the table')) {
                        console.warn("⚠️ La tabla 'projects' no existe en Supabase. Por favor, ejecuta el SQL en supabase/add-projects-table.sql");
                        console.warn("📋 Ve a: Supabase Dashboard > SQL Editor > Ejecuta el contenido de supabase/add-projects-table.sql");
                    } else {
                        console.error("Error cargando proyectos:", projectsResult.error);
                    }
                    // Inicializar con array vacío para que la app funcione
                    setProjects([]);
                } else {
                    const loadedProjects = projectsResult.data ?? [];
                    // Log deshabilitado para optimizar rendimiento
                    setProjects(
                        loadedProjects.map((item: any) => ({
                            id: String(item.id),
                            title: item.title ?? "",
                            description: item.description ?? "",
                            start_date: item.start_date ?? undefined,
                            end_date: item.end_date ?? undefined,
                            status: (item.status ?? 'not-started') as ProjectStatus,
                            progress: Number(item.progress ?? 0),
                            template: item.template ?? undefined,
                            created_at: item.created_at
                        }))
                    );
                }

                if (overviewResult.error) {
                    console.error("Error cargando resumen:", overviewResult.error);
                    // Mantener valores actuales si hay error (no sobrescribir con 0)
                } else {
                    const overview = overviewResult.data?.[0];
                    if (overview) {
                        const newBalance = Number(overview.balance ?? 0);
                        const newIncome = Number(overview.income ?? 0);
                        const newExpenses = Number(overview.expenses ?? 0);
                        // Solo actualizar si los valores son válidos (no 0 a menos que realmente sea 0)
                        if (newBalance !== 0 || overview.balance === 0) {
                            setBalance(newBalance);
                        }
                        if (newIncome !== 0 || overview.income === 0) {
                            setIncome(newIncome);
                        }
                        if (newExpenses !== 0 || overview.expenses === 0) {
                            setExpenses(newExpenses);
                        }
                    }
                    // Si no hay overview, mantener los valores por defecto ya establecidos
                }
            } catch (error) {
                console.error("Error inesperado cargando datos:", error);
            }
        };

        // Guardar referencia a loadData para usar en las suscripciones
        loadDataRef.current = loadData;

        // Inicializar datos y luego cargar
        initializeData().then(() => {
            loadData();
        });

        // Configurar suscripciones en tiempo real
        if (!supabase) {
            return () => {
                active = false;
            };
        }

        // Función helper para recargar datos desde las suscripciones
        const reloadData = () => {
            if (loadDataRef.current && active) {
                // Log deshabilitado para optimizar rendimiento
                loadDataRef.current();
            }
        };

        // Usar un solo canal para todas las suscripciones (mejor práctica)
        // Configuración mejorada para sincronización en tiempo real
        const channel = supabase
            .channel('db-changes', {
                config: {
                    broadcast: { self: false },
                    presence: { key: 'user' }
                }
            })
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'tasks'
                },
                (payload) => {
                    // Log deshabilitado para optimizar rendimiento
                    // console.log('📝 Realtime: cambio en tasks', payload.eventType, payload.new || payload.old);
                    if (payload.eventType === 'UPDATE' && payload.new) {
                        const taskId = String(payload.new.id);
                        const recentUpdate = recentUpdatesRef.current.get(taskId);
                        
                        // Si acabamos de actualizar este item localmente, ignorar el evento de tiempo real
                        if (recentUpdate && Date.now() - recentUpdate.timestamp < 2000) {
                            // Log deshabilitado para optimizar rendimiento
                            return;
                        }
                        
                        // Actualizar solo el item específico en lugar de recargar todo
                        setTasks((prev) => {
                            const existingTask = prev.find(t => String(t.id) === taskId);
                            if (existingTask) {
                                // Si fue una actualización local reciente, preservar el valor local
                                // Si viene de otro dispositivo, usar el valor de Supabase
                                const shouldPreserveLocal = recentUpdate && Date.now() - recentUpdate.timestamp < 2000;
                                return prev.map((task) =>
                                    String(task.id) === taskId
                                        ? {
                                              ...task,
                                              title: payload.new.title ?? task.title,
                                              meta: payload.new.meta ?? task.meta,
                                              priority: payload.new.priority ?? task.priority,
                                              // Sincronizar completed desde Supabase si no fue una actualización local reciente
                                              completed: shouldPreserveLocal ? task.completed : Boolean(payload.new.completed ?? task.completed)
                                          }
                                        : task
                                );
                            }
                            // Si no existe, recargar todo (puede ser un INSERT)
                            reloadData();
                            return prev;
                        });
                    } else if (payload.eventType === 'INSERT' && payload.new) {
                        // Agregar nueva tarea directamente al estado
                        const taskId = String(payload.new.id);
                        setTasks((prev) => {
                            const exists = prev.find(t => String(t.id) === taskId);
                            if (exists) {
                                return prev;
                            }
                            return [...prev, {
                                id: taskId,
                                title: payload.new.title ?? "",
                                meta: payload.new.meta ?? "",
                                priority: payload.new.priority ?? "Media",
                                completed: Boolean(payload.new.completed ?? false)
                            }];
                        });
                    } else if (payload.eventType === 'DELETE') {
                        // Eliminar tarea directamente del estado
                        const taskId = String(payload.old?.id);
                        if (taskId) {
                            setTasks((prev) => prev.filter(t => String(t.id) !== taskId));
                        }
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'transactions'
                },
                () => {
                    // Log deshabilitado para optimizar rendimiento
                    reloadData();
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'events'
                },
                (payload) => {
                    // Log deshabilitado para optimizar rendimiento
                    if (payload.eventType === 'UPDATE' && payload.new) {
                        const eventId = String(payload.new.id);
                        const recentUpdate = recentUpdatesRef.current.get(eventId);
                        
                        // Si acabamos de actualizar este item localmente, ignorar el evento de tiempo real
                        if (recentUpdate && Date.now() - recentUpdate.timestamp < 2000) {
                            // Log deshabilitado para optimizar rendimiento
                            return;
                        }
                        
                        // Actualizar solo el item específico en lugar de recargar todo
                        setEvents((prev) => {
                            const existingEvent = prev.find(e => String(e.id) === eventId);
                            if (existingEvent) {
                                // Si fue una actualización local reciente, preservar el valor local
                                // Si viene de otro dispositivo, usar el valor de Supabase
                                const shouldPreserveLocal = recentUpdate && Date.now() - recentUpdate.timestamp < 2000;
                                return prev.map((event) =>
                                    String(event.id) === eventId
                                        ? {
                                              ...event,
                                              title: payload.new.title ?? event.title,
                                              description: payload.new.description ?? event.description,
                                              event_date: payload.new.event_date ?? event.event_date,
                                              event_time: payload.new.event_time ?? event.event_time,
                                              // Sincronizar completed desde Supabase si no fue una actualización local reciente
                                              completed: shouldPreserveLocal ? event.completed : Boolean(payload.new.completed ?? event.completed)
                                          }
                                        : event
                                );
                            }
                            // Si no existe, recargar todo (puede ser un INSERT)
                            reloadData();
                            return prev;
                        });
                    } else if (payload.eventType === 'INSERT' && payload.new) {
                        // Agregar nuevo evento directamente al estado
                        const eventId = String(payload.new.id);
                        setEvents((prev) => {
                            const exists = prev.find(e => String(e.id) === eventId);
                            if (exists) {
                                return prev;
                            }
                            return [...prev, {
                                id: eventId,
                                title: payload.new.title ?? "",
                                description: payload.new.description ?? "",
                                event_date: payload.new.event_date ?? "",
                                event_time: payload.new.event_time ?? "",
                                priority: payload.new.priority ?? "Media",
                                completed: Boolean(payload.new.completed ?? false)
                            }];
                        });
                    } else if (payload.eventType === 'DELETE') {
                        // Eliminar evento directamente del estado
                        const eventId = String(payload.old?.id);
                        if (eventId) {
                            setEvents((prev) => prev.filter(e => String(e.id) !== eventId));
                        }
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'habits'
                },
                (payload) => {
                    console.log('🎯 Realtime: cambio en habits', payload.eventType, payload.new || payload.old);
                    if (payload.eventType === 'INSERT' && payload.new) {
                        // Agregar el nuevo hábito directamente al estado
                        const habitId = String(payload.new.id);
                        const recentUpdate = recentUpdatesRef.current.get(habitId);
                        
                        // Si acabamos de crear este hábito nosotros mismos, ignorar el evento de tiempo real
                        if (recentUpdate && Date.now() - recentUpdate.timestamp < 5000) {
                            console.log('⏭️ Ignorando evento de tiempo real para hábito recién creado localmente:', habitId);
                            return;
                        }
                        
                        setHabits((prev) => {
                            // Verificar si ya existe (para evitar duplicados)
                            const existingHabit = prev.find(h => String(h.id) === habitId);
                            if (existingHabit) {
                                console.log('⏭️ Hábito ya existe localmente, omitiendo:', habitId);
                                return prev;
                            }
                            // Agregar el nuevo hábito
                            const newHabit: Habit = {
                                id: habitId,
                                title: payload.new.title ?? "",
                                description: payload.new.description ?? "",
                                category: (payload.new.category ?? 'non-negotiable') as HabitCategory,
                                completed: Boolean(payload.new.completed ?? false),
                                timestamp: payload.new.created_at ? new Date(payload.new.created_at) : new Date()
                            };
                            console.log('➕ Agregando hábito desde tiempo real:', newHabit);
                            return [...prev, newHabit];
                        });
                    } else if (payload.eventType === 'UPDATE' && payload.new) {
                        const habitId = String(payload.new.id);
                        const recentUpdate = recentUpdatesRef.current.get(habitId);
                        
                        // Si acabamos de actualizar este item nosotros mismos, ignorar el evento de tiempo real
                        if (recentUpdate && Date.now() - recentUpdate.timestamp < 5000) {
                            console.log('⏭️ Ignorando evento de tiempo real para hábito recién actualizado localmente:', habitId);
                            return;
                        }
                        
                        // Actualizar solo el item específico en lugar de recargar todo
                        setHabits((prev) => {
                            const existingHabit = prev.find(h => String(h.id) === habitId);
                            if (existingHabit) {
                                // Solo actualizar si el item ya existe
                                console.log('✏️ Actualizando hábito desde tiempo real:', habitId);
                                return prev.map((habit) =>
                                    String(habit.id) === habitId
                                        ? {
                                              ...habit,
                                              title: payload.new.title ?? habit.title,
                                              description: payload.new.description ?? habit.description,
                                              category: (payload.new.category ?? habit.category) as HabitCategory,
                                              // Para actualizaciones de otros dispositivos, usar el valor de Supabase
                                              completed: recentUpdate && Date.now() - recentUpdate.timestamp < 5000 
                                                  ? habit.completed 
                                                  : Boolean(payload.new.completed ?? habit.completed)
                                          }
                                        : habit
                                );
                            }
                            // Si no existe, recargar todo (por si acaso)
                            console.log('⚠️ Hábito no existe localmente en UPDATE, recargando datos...');
                            reloadData();
                            return prev;
                        });
                    } else if (payload.eventType === 'DELETE' && payload.old) {
                        // Eliminar el hábito directamente del estado
                        const habitId = String(payload.old.id);
                        console.log('🗑️ Eliminando hábito desde tiempo real:', habitId);
                        setHabits((prev) => prev.filter(h => String(h.id) !== habitId));
                    } else {
                        // Para cualquier otro caso, recargar todo
                        // Log deshabilitado para optimizar rendimiento
                        reloadData();
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'projects'
                },
                (payload) => {
                    // Log deshabilitado para optimizar rendimiento
                    if (payload.eventType === 'INSERT' && payload.new) {
                        const projectId = String(payload.new.id);
                        // Verificar si el proyecto ya existe para evitar duplicados
                        setProjects((prev) => {
                            const exists = prev.find(p => String(p.id) === projectId);
                            if (exists) {
                                console.log('⏭️ Proyecto ya existe localmente, omitiendo:', projectId);
                                return prev;
                            }
                            const newProject: Project = {
                                id: projectId,
                                title: payload.new.title ?? "",
                                description: payload.new.description ?? "",
                                start_date: payload.new.start_date ?? undefined,
                                end_date: payload.new.end_date ?? undefined,
                                status: (payload.new.status ?? 'not-started') as ProjectStatus,
                                progress: Number(payload.new.progress ?? 0),
                                template: payload.new.template ?? undefined,
                                created_at: payload.new.created_at
                            };
                            console.log('➕ Agregando proyecto desde tiempo real:', newProject);
                            return [...prev, newProject];
                        });
                    } else if (payload.eventType === 'UPDATE' && payload.new) {
                        const projectId = String(payload.new.id);
                        setProjects((prev) => {
                            const existingProject = prev.find(p => String(p.id) === projectId);
                            if (existingProject) {
                                console.log('✏️ Actualizando proyecto desde tiempo real:', projectId);
                                return prev.map((p) =>
                                    String(p.id) === projectId
                                        ? {
                                              ...p,
                                              title: payload.new.title ?? p.title,
                                              description: payload.new.description ?? p.description,
                                              start_date: payload.new.start_date ?? p.start_date,
                                              end_date: payload.new.end_date ?? p.end_date,
                                              status: (payload.new.status ?? p.status) as ProjectStatus,
                                              progress: Number(payload.new.progress ?? p.progress),
                                              template: payload.new.template ?? p.template
                                          }
                                        : p
                                );
                            }
                            // Si no existe, recargar todo
                            reloadData();
                            return prev;
                        });
                    } else if (payload.eventType === 'DELETE' && payload.old) {
                        const projectId = String(payload.old.id);
                        console.log('🗑️ Eliminando proyecto desde tiempo real:', projectId);
                        setProjects((prev) => prev.filter(p => String(p.id) !== projectId));
                    } else {
                        // Para cualquier otro caso, recargar todo
                        reloadData();
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'app_overview'
                },
                () => {
                    // Log deshabilitado para optimizar rendimiento
                    reloadData();
                }
            )
            .subscribe((status, err) => {
                if (status === 'SUBSCRIBED') {
                    console.log('✅ Suscripción Realtime activa - Sincronización en tiempo real conectada');
                    // Recargar datos al conectarse para asegurar sincronización
                    if (loadDataRef.current && active) {
                        loadDataRef.current();
                    }
                } else if (status === 'CHANNEL_ERROR') {
                    console.error('❌ Error en suscripción Realtime:', err);
                    // Intentar reconectar después de un delay
                    setTimeout(() => {
                        if (active && loadDataRef.current) {
                            loadDataRef.current();
                        }
                    }, 2000);
                } else if (status === 'TIMED_OUT') {
                    console.warn('⏱️ Timeout en suscripción Realtime - Intentando reconectar...');
                    // Intentar reconectar
                    setTimeout(() => {
                        if (active && loadDataRef.current) {
                            loadDataRef.current();
                        }
                    }, 1000);
                } else if (status === 'CLOSED') {
                    console.warn('🔒 Canal Realtime cerrado - Intentando reconectar...');
                    // Intentar reconectar
                    setTimeout(() => {
                        if (active && loadDataRef.current) {
                            loadDataRef.current();
                        }
                    }, 1000);
                } else {
                    console.log('ℹ️ Estado Realtime:', status);
                }
            });

        // Manejar reconexión cuando vuelva online
        const handleOnline = async () => {
            console.log('🌐 Conexión restaurada - Sincronizando datos...');
            if (loadDataRef.current && active) {
                // Esperar un momento para asegurar que la conexión esté estable
                setTimeout(async () => {
                    if (active && loadDataRef.current) {
                        await loadDataRef.current();
                        // Forzar reconexión del canal si está cerrado
                        if (channel.state !== 'joined') {
                            channel.subscribe();
                        }
                    }
                }, 500);
            }
        };

        const handleOffline = () => {
            console.log('📴 Sin conexión - Modo offline activado');
        };

        // Agregar listener para visibilidad de la página (cuando vuelve a estar activa)
        const handleVisibilityChange = () => {
            if (!document.hidden && active && loadDataRef.current) {
                console.log('👁️ Página visible - Verificando sincronización...');
                setTimeout(() => {
                    if (active && loadDataRef.current) {
                        loadDataRef.current();
                    }
                }, 500);
            }
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            active = false;
            // Limpiar suscripción
            channel.unsubscribe();
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const addTask = useCallback(async (task: Omit<Task, 'id'>) => {
        const newTaskLocal = { id: `task-${Date.now()}`, ...task };
        
        // Actualizar estado local inmediatamente para mejor UX
        setTasks((prev) => [...prev, newTaskLocal]);

        if (!supabase) {
            return;
        }

        try {
            const { data, error } = await supabase
                .from('tasks')
                .insert({ title: task.title, meta: task.meta, priority: task.priority })
                .select()
                .single();

            if (error) {
                console.error("Error creando tarea:", error);
                // Revertir cambio local si falla
                setTasks((prev) => prev.filter((t) => t.id !== newTaskLocal.id));
                return;
            }

            if (data) {
                // Reemplazar tarea local con la de la BD
                setTasks((prev) =>
                    prev.map((t) =>
                        t.id === newTaskLocal.id
                            ? {
                                  id: String(data.id),
                                  title: data.title ?? task.title,
                                  meta: data.meta ?? task.meta,
                                  priority: data.priority ?? task.priority
                              }
                            : t
                    )
                );
            }
        } catch (error) {
            console.error("Error inesperado creando tarea:", error);
            setTasks((prev) => prev.filter((t) => t.id !== newTaskLocal.id));
        }
    }, []);

    const updateTask = useCallback(async (id: string, updates: Partial<Omit<Task, 'id'>>) => {
        // Guardar estado anterior para revertir si falla
        let previousTask: Task | undefined;
        // Registrar este cambio para evitar que las suscripciones de tiempo real lo sobrescriban
        if (updates.completed !== undefined || Object.keys(updates).length > 0) {
            recentUpdatesRef.current.set(id, { completed: updates.completed, timestamp: Date.now() });
            // Limpiar entradas antiguas después de 2 segundos (más rápido para mejor sincronización)
            setTimeout(() => {
                recentUpdatesRef.current.delete(id);
            }, 2000);
        }
        // Actualizar estado local INMEDIATAMENTE para respuesta instantánea
        setTasks((prev) => {
            const task = prev.find((t) => t.id === id);
            previousTask = task;
            // Crear un nuevo array para forzar la actualización de React
            const newTasks = prev.map((task) => (task.id === id ? { ...task, ...updates } : task));
            // Forzar nueva referencia del array
            return [...newTasks];
        });

        if (!supabase) {
            return;
        }

        try {
            const { data, error } = await supabase
                .from('tasks')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error("Error actualizando tarea:", error);
                // Revertir cambio si falla
                if (previousTask) {
                    setTasks((prev) =>
                        prev.map((task) => (task.id === id ? previousTask! : task))
                    );
                }
                return;
            }

            if (data) {
                // NO actualizar el estado de nuevo - ya lo actualizamos localmente
                // Solo verificar que la actualización fue exitosa
                // Esto evita que Supabase sobrescriba nuestros valores locales (especialmente 'completed')
                console.log('✅ Tarea actualizada en Supabase:', id);
            }
        } catch (error) {
            console.error("Error inesperado actualizando tarea:", error);
            if (previousTask) {
                setTasks((prev) =>
                    prev.map((task) => (task.id === id ? previousTask! : task))
                );
            }
        }
    }, []);

    const deleteTask = useCallback(async (id: string) => {
        // Guardar tarea para revertir si falla
        let deletedTask: Task | undefined;
        setTasks((prev) => {
            const task = prev.find((t) => t.id === id);
            deletedTask = task;
            return prev.filter((task) => task.id !== id);
        });

        if (!supabase) {
            return;
        }

        try {
            const { error } = await supabase.from('tasks').delete().eq('id', id);
            if (error) {
                console.error("Error eliminando tarea:", error);
                // Revertir cambio si falla
                if (deletedTask) {
                    setTasks((prev) => [...prev, deletedTask!]);
                }
                return;
            }
        } catch (error) {
            console.error("Error inesperado eliminando tarea:", error);
            // Revertir cambio si falla
            if (deletedTask) {
                setTasks((prev) => [...prev, deletedTask!]);
            }
        }
    }, []);

    const addEvent = useCallback(async (event: Omit<Event, 'id'>) => {
        const newEventLocal: Event = { id: `event-${Date.now()}`, ...event };

        // Actualizar estado local inmediatamente para mejor UX
        setEvents((prev) => [...prev, newEventLocal]);

        if (!supabase) {
            const errorMsg = '⚠️ Supabase no está configurado. Verifica tus variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en el archivo .env';
            console.warn(errorMsg);
            setEvents((prev) => prev.filter((e) => e.id !== newEventLocal.id));
            throw new Error(errorMsg);
        }

        try {
            const { data, error } = await supabase
                .from('events')
                .insert({
                    title: event.title,
                    description: event.description,
                    event_date: event.event_date,
                    event_time: event.event_time
                })
                .select()
                .single();

            if (error) {
                console.error("❌ Error creando evento:", error);
                
                // Revertir cambio local si falla
                setEvents((prev) => prev.filter((e) => e.id !== newEventLocal.id));
                
                // Mensajes de error más claros
                let errorMessage = `Error al guardar evento: ${error.message}`;
                
                if (error.message.includes('Invalid API key') || error.message.includes('JWT')) {
                    errorMessage = `❌ API Key inválida. Por favor:\n\n` +
                        `1. Ve a https://app.supabase.com\n` +
                        `2. Settings → API\n` +
                        `3. Copia la "anon public" key completa\n` +
                        `4. Actualiza VITE_SUPABASE_ANON_KEY en tu archivo .env\n` +
                        `5. Reinicia el servidor de desarrollo (Ctrl+C y luego npm run dev)`;
                } else if (error.message.includes('relation') || error.message.includes('does not exist')) {
                    errorMessage = `❌ La tabla 'events' no existe. Ejecuta el schema SQL en Supabase:\n\n` +
                        `1. Ve a SQL Editor en Supabase\n` +
                        `2. Abre supabase/schema.sql\n` +
                        `3. Ejecuta el SQL completo`;
                } else if (error.message.includes('permission') || error.message.includes('RLS')) {
                    errorMessage = `❌ Problema de permisos. Verifica las políticas RLS en Supabase.`;
                }
                
                throw new Error(errorMessage);
            }

            if (data) {
                console.log('✅ Evento guardado en Supabase:', data.id, 'Fecha:', data.event_date);
                // Reemplazar evento local con el de la BD (tiene el ID real)
                setEvents((prev) =>
                    prev.map((e) =>
                        e.id === newEventLocal.id
                            ? {
                                  id: String(data.id),
                                  title: data.title ?? event.title,
                                  description: data.description ?? event.description,
                                  event_date: data.event_date ?? event.event_date,
                                  event_time: data.event_time ?? event.event_time
                              }
                            : e
                    )
                );
            }
        } catch (error) {
            console.error("❌ Error inesperado creando evento:", error);
            // Revertir cambio local si falla
            setEvents((prev) => prev.filter((e) => e.id !== newEventLocal.id));
            // Re-lanzar el error para que handleSaveEvent pueda manejarlo
            throw error;
        }
    }, []);

    const updateEvent = useCallback(async (id: string, updates: Partial<Omit<Event, 'id'>>) => {
        let previousEvent: Event | undefined;
        // Registrar este cambio para evitar que las suscripciones de tiempo real lo sobrescriban
        if (updates.completed !== undefined || Object.keys(updates).length > 0) {
            recentUpdatesRef.current.set(id, { completed: updates.completed, timestamp: Date.now() });
            // Limpiar entradas antiguas después de 2 segundos (más rápido para mejor sincronización)
            setTimeout(() => {
                recentUpdatesRef.current.delete(id);
            }, 2000);
        }
        // Actualizar estado local INMEDIATAMENTE para respuesta instantánea
        setEvents((prev) => {
            const event = prev.find((e) => e.id === id);
            previousEvent = event;
            // Crear un nuevo array para forzar la actualización de React
            const newEvents = prev.map((event) => (event.id === id ? { ...event, ...updates } : event));
            // Forzar nueva referencia del array
            return [...newEvents];
        });

        if (!supabase) {
            return;
        }

        try {
            const { data, error } = await supabase
                .from('events')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error("Error actualizando evento:", error);
                if (previousEvent) {
                    setEvents((prev) =>
                        prev.map((event) => (event.id === id ? previousEvent! : event))
                    );
                }
                return;
            }

            if (data) {
                // NO actualizar el estado de nuevo - ya lo actualizamos localmente
                // Solo verificar que la actualización fue exitosa
                // Esto evita que Supabase sobrescriba nuestros valores locales (especialmente 'completed')
                console.log('✅ Evento actualizado en Supabase:', id);
            }
        } catch (error) {
            console.error("Error inesperado actualizando evento:", error);
            if (previousEvent) {
                setEvents((prev) =>
                    prev.map((event) => (event.id === id ? previousEvent! : event))
                );
            }
        }
    }, []);

    const deleteEvent = useCallback(async (id: string) => {
        let deletedEvent: Event | undefined;
        setEvents((prev) => {
            const event = prev.find((e) => e.id === id);
            deletedEvent = event;
            return prev.filter((event) => event.id !== id);
        });

        if (!supabase) {
            return;
        }

        try {
            const { error } = await supabase.from('events').delete().eq('id', id);
            if (error) {
                console.error("Error eliminando evento:", error);
                if (deletedEvent) {
                    setEvents((prev) => [...prev, deletedEvent!]);
                }
                return;
            }
        } catch (error) {
            console.error("Error inesperado eliminando evento:", error);
            if (deletedEvent) {
                setEvents((prev) => [...prev, deletedEvent!]);
            }
        }
    }, []);

    const addHabit = useCallback(async (habit: Omit<Habit, 'id' | 'timestamp'>) => {
        // Calcular position: siguiente posición en la categoría
        let newPosition = 0;
        setHabits((prev) => {
            const categoryHabits = prev.filter(h => h.category === habit.category);
            const maxPosition = categoryHabits.reduce((max, h) => Math.max(max, h.position || 0), -1);
            newPosition = maxPosition + 1;
            return prev;
        });

        const newHabitLocal: Habit = { 
            id: `habit-${Date.now()}`, 
            ...habit,
            position: newPosition,
            timestamp: new Date()
        };

        // Actualizar estado local inmediatamente para mejor UX
        setHabits((prev) => [...prev, newHabitLocal]);

        if (!supabase) {
            return;
        }

        try {
            const { data, error } = await supabase
                .from('habits')
                .insert({
                    title: habit.title,
                    description: habit.description,
                    category: habit.category,
                    completed: habit.completed,
                    position: newPosition
                })
                .select()
                .single();

            if (error) {
                console.error("Error creando hábito:", error);
                // Revertir cambio local si falla
                setHabits((prev) => prev.filter((h) => h.id !== newHabitLocal.id));
                return;
            }

            if (data) {
                const realId = String(data.id);
                // Registrar que acabamos de crear este hábito para evitar que el evento de tiempo real lo duplique
                recentUpdatesRef.current.set(realId, { completed: undefined, timestamp: Date.now() });
                // Limpiar después de 5 segundos
                setTimeout(() => {
                    recentUpdatesRef.current.delete(realId);
                }, 5000);
                
                // Reemplazar hábito local con el de la BD
                setHabits((prev) =>
                    prev.map((h) =>
                        h.id === newHabitLocal.id
                            ? {
                                  id: realId,
                                  title: data.title ?? habit.title,
                                  description: data.description ?? habit.description,
                                  category: (data.category ?? habit.category) as HabitCategory,
                                  completed: Boolean(data.completed ?? habit.completed),
                                  position: data.position ?? newPosition,
                                  timestamp: data.created_at ? new Date(data.created_at) : new Date()
                              }
                            : h
                    )
                );
            }
        } catch (error) {
            console.error("Error inesperado creando hábito:", error);
            setHabits((prev) => prev.filter((h) => h.id !== newHabitLocal.id));
        }
    }, []);

    const updateHabit = useCallback(async (id: string, updates: Partial<Omit<Habit, 'id' | 'timestamp'>>) => {
        let previousHabit: Habit | undefined;
        // Registrar este cambio para evitar que las suscripciones de tiempo real lo sobrescriban
        // Registramos cualquier actualización, no solo completed
        recentUpdatesRef.current.set(id, { 
            completed: updates.completed !== undefined ? updates.completed : undefined, 
            timestamp: Date.now() 
        });
        // Limpiar entradas antiguas después de 5 segundos
        setTimeout(() => {
            recentUpdatesRef.current.delete(id);
        }, 5000);
        // Actualizar estado local INMEDIATAMENTE para respuesta instantánea
        setHabits((prev) => {
            const habit = prev.find((h) => h.id === id);
            previousHabit = habit;
            // Crear un nuevo array para forzar la actualización de React
            const newHabits = prev.map((habit) => (habit.id === id ? { ...habit, ...updates } : habit));
            // Forzar nueva referencia del array
            return [...newHabits];
        });

        if (!supabase) {
            return;
        }

        try {
            const { data, error } = await supabase
                .from('habits')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error("Error actualizando hábito:", error);
                // Revertir cambio si falla
                if (previousHabit) {
                    setHabits((prev) =>
                        prev.map((habit) => (habit.id === id ? previousHabit! : habit))
                    );
                }
                return;
            }

            if (data) {
                // NO actualizar el estado de nuevo - ya lo actualizamos localmente
                // Solo verificar que la actualización fue exitosa
                // Esto evita que Supabase sobrescriba nuestros valores locales (especialmente 'completed')
                console.log('✅ Hábito actualizado en Supabase:', id);
            }
        } catch (error) {
            console.error("Error inesperado actualizando hábito:", error);
            if (previousHabit) {
                setHabits((prev) =>
                    prev.map((habit) => (habit.id === id ? previousHabit! : habit))
                );
            }
        }
    }, []);

    const reorderHabits = useCallback(async (category: HabitCategory, habitIds: string[]) => {
        // Actualizar positions localmente
        setHabits((prev) => {
            const updated = prev.map((habit) => {
                if (habit.category === category) {
                    const newIndex = habitIds.indexOf(habit.id);
                    if (newIndex !== -1) {
                        return { ...habit, position: newIndex };
                    }
                }
                return habit;
            });
            return updated;
        });

        if (!supabase) {
            return;
        }

        // Actualizar positions en la base de datos
        try {
            const updates = habitIds.map((habitId, index) => ({
                id: habitId,
                position: index
            }));

            // Actualizar cada hábito
            for (const update of updates) {
                await supabase
                    .from('habits')
                    .update({ position: update.position })
                    .eq('id', update.id);
            }
        } catch (error) {
            console.error("Error reordenando hábitos:", error);
        }
    }, []);

    const deleteHabit = useCallback(async (id: string) => {
        let deletedHabit: Habit | undefined;
        setHabits((prev) => {
            const habit = prev.find((h) => h.id === id);
            deletedHabit = habit;
            return prev.filter((habit) => habit.id !== id);
        });

        if (!supabase) {
            return;
        }

        try {
            const { error } = await supabase.from('habits').delete().eq('id', id);
            if (error) {
                console.error("Error eliminando hábito:", error);
                // Revertir cambio si falla
                if (deletedHabit) {
                    setHabits((prev) => [...prev, deletedHabit!]);
                }
                return;
            }
        } catch (error) {
            console.error("Error inesperado eliminando hábito:", error);
            // Revertir cambio si falla
            if (deletedHabit) {
                setHabits((prev) => [...prev, deletedHabit!]);
            }
        }
    }, []);

    const addProject = useCallback(async (project: Omit<Project, 'id'>) => {
        const newProjectLocal: Project = { 
            id: `project-${Date.now()}`, 
            ...project 
        };

        // Actualizar estado local inmediatamente para mejor UX
        setProjects((prev) => [...prev, newProjectLocal]);

        // Si el proyecto tiene fecha de inicio o fin, crear evento automáticamente
        if (project.start_date || project.end_date) {
            const eventDate = project.start_date || project.end_date;
            if (eventDate) {
                try {
                    await addEvent({
                        title: project.title,
                        description: project.description || `Proyecto: ${project.title}`,
                        event_date: eventDate,
                        event_time: ""
                    });
                    console.log(`✅ Evento creado automáticamente para proyecto: ${project.title} en fecha: ${eventDate}`);
                } catch (error) {
                    console.error("Error creando evento automático para proyecto:", error);
                }
            }
        }

        if (!supabase) {
            return;
        }

        try {
            const { data, error } = await supabase
                .from('projects')
                .insert({
                    title: project.title,
                    description: project.description,
                    start_date: project.start_date,
                    end_date: project.end_date,
                    status: project.status,
                    progress: project.progress,
                    template: project.template
                })
                .select()
                .single();

            if (error) {
                const errorCode = error?.code;
                const errorMessage = error?.message || '';
                
                // Si el error es PGRST205 (tabla no encontrada), mostrar mensaje útil
                if (errorCode === 'PGRST205' || errorMessage.includes('Could not find the table')) {
                    console.error("❌ Error: La tabla 'projects' no existe en Supabase.");
                    console.error("📋 Solución: Ve a Supabase Dashboard > SQL Editor");
                    console.error("📋 Ejecuta el contenido de: supabase/add-projects-table.sql");
                    alert("⚠️ La tabla 'projects' no existe en Supabase.\n\nPor favor, ejecuta el SQL en:\nsupabase/add-projects-table.sql\n\nVe a: Supabase Dashboard > SQL Editor");
                } else {
                    console.error("Error creando proyecto:", error);
                }
                // Revertir cambio local si falla
                setProjects((prev) => prev.filter((p) => p.id !== newProjectLocal.id));
                return;
            }

            if (data) {
                // Reemplazar proyecto local con el de la BD
                setProjects((prev) =>
                    prev.map((p) =>
                        p.id === newProjectLocal.id
                            ? {
                                  id: String(data.id),
                                  title: data.title ?? project.title,
                                  description: data.description ?? project.description,
                                  start_date: data.start_date ?? project.start_date,
                                  end_date: data.end_date ?? project.end_date,
                                  status: (data.status ?? project.status) as ProjectStatus,
                                  progress: Number(data.progress ?? project.progress),
                                  template: data.template ?? project.template,
                                  created_at: data.created_at
                              }
                            : p
                    )
                );
            }
        } catch (error) {
            console.error("Error inesperado creando proyecto:", error);
            setProjects((prev) => prev.filter((p) => p.id !== newProjectLocal.id));
        }
    }, [addEvent, supabase]);

    const updateProject = useCallback(async (id: string, updates: Partial<Omit<Project, 'id'>>) => {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AppDataContext.tsx:1079',message:'updateProject entry',data:{id,updates,projectsCount:projects.length,availableIds:projects.map(p=>p.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        console.log('🔄 ========== INICIO updateProject ==========');
        console.log('🔄 ID:', id);
        console.log('🔄 Updates:', updates);
        
        let previousProject: Project | undefined;
        
        // Actualizar estado local INMEDIATAMENTE para respuesta instantánea
        setProjects((prev) => {
            console.log('🔄 Estado anterior - proyectos:', prev.length);
            const project = prev.find((p) => p.id === id);
            previousProject = project;
            
            if (!project) {
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AppDataContext.tsx:1092',message:'updateProject project not found in state',data:{id,availableIds:prev.map(p=>p.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                // #endregion
                console.error('❌ Proyecto no encontrado en estado para actualizar:', id);
                console.error('📋 IDs disponibles:', prev.map(p => p.id));
                return prev;
            }
            
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AppDataContext.tsx:1098',message:'updateProject project found in state',data:{id:project.id,currentTitle:project.title,newTitle:updates.title},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            console.log('✅ Proyecto encontrado en estado:', {
                id: project.id,
                currentTitle: project.title,
                newTitle: updates.title
            });
            
            // Crear un nuevo array para forzar el re-render
            const updated = prev.map((p) => {
                if (p.id === id) {
                    const updatedProject = { ...p, ...updates };
                    console.log('🔄 Proyecto actualizado en estado local:', {
                        id: updatedProject.id,
                        title: updatedProject.title,
                        description: updatedProject.description?.substring(0, 30)
                    });
                    return updatedProject;
                }
                return p;
            });
            
            console.log('🔄 Estado local actualizado. Total proyectos:', updated.length);
            return updated;
        });

        if (!supabase) {
            console.warn('⚠️ Supabase no está configurado. Los cambios se guardaron solo localmente.');
            console.log('✅ ========== FIN updateProject (solo local) ==========');
            // No lanzar error aquí porque el estado local ya se actualizó
            // El usuario verá los cambios localmente aunque no se guarden en la BD
            return;
        }

        try {
            console.log('📤 Enviando actualización a Supabase...');
            console.log('📤 Tabla: projects');
            console.log('📤 ID:', id);
            console.log('📤 Updates:', JSON.stringify(updates, null, 2));
            
            const { data, error } = await supabase
                .from('projects')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AppDataContext.tsx:1141',message:'updateProject Supabase error',data:{id,errorCode:error.code,errorMessage:error.message,errorDetails:error.details,errorHint:error.hint,updates},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                // #endregion
                
                const errorCode = error?.code;
                const errorMessage = error?.message || '';
                
                // Si el error es PGRST205 (tabla no encontrada), mostrar mensaje útil
                if (errorCode === 'PGRST205' || errorMessage.includes('Could not find the table')) {
                    console.error("❌ Error: La tabla 'projects' no existe en Supabase.");
                    console.error("📋 Solución: Ve a Supabase Dashboard > SQL Editor");
                    console.error("📋 Ejecuta el contenido de: supabase/add-projects-table.sql");
                } else {
                    console.error("❌ Error de Supabase:", error);
                    console.error("❌ Código:", error.code);
                    console.error("❌ Mensaje:", error.message);
                    console.error("❌ Detalles:", error.details);
                    console.error("❌ Hint:", error.hint);
                }
                
                // Revertir cambio local si falla
                if (previousProject) {
                    console.log('🔄 Revirtiendo cambio local...');
                    setProjects((prev) =>
                        prev.map((p) => (p.id === id ? previousProject! : p))
                    );
                }
                
                // Lanzar error para que el componente pueda manejarlo
                const errorMsg = errorCode === 'PGRST205' 
                    ? "La tabla 'projects' no existe en Supabase. Ejecuta supabase/add-projects-table.sql"
                    : (error.message || 'Error desconocido al guardar');
                console.error("❌ Lanzando error:", errorMsg);
                throw new Error(`Error al guardar en la base de datos: ${errorMsg}`);
            }

            if (data) {
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AppDataContext.tsx:1162',message:'updateProject Supabase success',data:{id:data.id,title:data.title,descriptionLength:data.description?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                // #endregion
                console.log('✅ Respuesta de Supabase:', {
                    id: data.id,
                    title: data.title,
                    description: data.description?.substring(0, 50) + '...'
                });
                
                // Actualizar con los datos de la BD para asegurar consistencia
                setProjects((prev) => {
                    // Buscar el proyecto que estamos actualizando
                    const projectIndex = prev.findIndex(p => p.id === id);
                    
                    if (projectIndex === -1) {
                        // #region agent log
                        fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AppDataContext.tsx:1174',message:'updateProject project not found after Supabase update',data:{id,availableIds:prev.map(p=>p.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                        // #endregion
                        console.warn('⚠️ Proyecto no encontrado para actualizar con datos de Supabase:', id);
                        console.warn('📋 IDs disponibles:', prev.map(p => p.id));
                        return prev;
                    }
                    
                    // Crear nueva copia del array para forzar re-render
                    const updated = prev.map((p, index) => {
                        if (index === projectIndex) {
                            const updatedProject = {
                                ...p,
                                title: data.title ?? p.title,
                                description: data.description ?? p.description,
                                start_date: data.start_date ?? p.start_date,
                                end_date: data.end_date ?? p.end_date,
                                status: (data.status ?? p.status) as ProjectStatus,
                                progress: Number(data.progress ?? p.progress),
                                template: data.template ?? p.template
                            };
                            console.log('✅ Proyecto actualizado en estado:', {
                                id: updatedProject.id,
                                title: updatedProject.title,
                                description: updatedProject.description?.substring(0, 30)
                            });
                            return updatedProject;
                        }
                        return p;
                    });
                    
                    // #region agent log
                    fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AppDataContext.tsx:1203',message:'updateProject state updated after Supabase',data:{id,updatedProjectTitle:updated[projectIndex]?.title,updatedProjectDescriptionLength:updated[projectIndex]?.description?.length,totalProjects:updated.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                    // #endregion
                    console.log('✅ Estado actualizado con datos de Supabase. Total proyectos:', updated.length);
                    return updated;
                });
            } else {
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AppDataContext.tsx:1207',message:'updateProject Supabase returned no data',data:{id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                // #endregion
                console.warn('⚠️ Supabase retornó sin datos');
            }
            
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AppDataContext.tsx:1210',message:'updateProject success',data:{id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            console.log('✅ ========== FIN updateProject (éxito) ==========');
        } catch (error) {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AppDataContext.tsx:1212',message:'updateProject exception',data:{id,error:error instanceof Error?error.message:String(error),errorType:typeof error},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            console.error("❌ ========== ERROR en updateProject ==========");
            console.error("❌ Error:", error);
            console.error("❌ Tipo:", typeof error);
            
            // Revertir cambio local si falla
            if (previousProject) {
                console.log('🔄 Revirtiendo cambio local por error...');
                setProjects((prev) =>
                    prev.map((p) => (p.id === id ? previousProject! : p))
                );
            }
            
            // Re-lanzar el error para que el componente pueda manejarlo
            throw error;
        }
    }, [supabase]);

    const deleteProject = useCallback(async (id: string) => {
        let deletedProject: Project | undefined;
        setProjects((prev) => {
            const project = prev.find((p) => p.id === id);
            deletedProject = project;
            return prev.filter((p) => p.id !== id);
        });

        if (!supabase) {
            return;
        }

        try {
            const { error } = await supabase.from('projects').delete().eq('id', id);
            if (error) {
                console.error("Error eliminando proyecto:", error);
                if (deletedProject) {
                    setProjects((prev) => [...prev, deletedProject!]);
                }
                return;
            }
        } catch (error) {
            console.error("Error inesperado eliminando proyecto:", error);
            if (deletedProject) {
                setProjects((prev) => [...prev, deletedProject!]);
            }
        }
    }, []);

    const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
        const newTransaction: Transaction = {
            id: `transaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ...transaction
        };
        
        setTransactions((prev) => [newTransaction, ...prev]);
        
        // Actualizar balance, income y expenses según el tipo de transacción
        if (transaction.amount > 0) {
            setIncome((prev) => prev + transaction.amount);
            setBalance((prev) => prev + transaction.amount);
        } else {
            setExpenses((prev) => prev + Math.abs(transaction.amount));
            setBalance((prev) => prev + transaction.amount);
        }
    }, []);

    const value = useMemo(
        () => ({
            balance,
            income,
            expenses,
            transactions,
            tasks,
            events,
            habits,
            projects,
            addTask,
            updateTask,
            deleteTask,
            addEvent,
            updateEvent,
            deleteEvent,
            addHabit,
            updateHabit,
            deleteHabit,
            reorderHabits,
            addProject,
            updateProject,
            deleteProject,
            addTransaction
        }),
        [addEvent, addTask, addHabit, addProject, addTransaction, balance, deleteEvent, deleteTask, deleteHabit, deleteProject, events, expenses, habits, income, projects, tasks, transactions, updateEvent, updateTask, updateHabit, updateProject, reorderHabits]
    );

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AppDataContext.tsx:AppDataProvider:render',message:'AppDataProvider renderizando',data:{hasValue:!!value,hasChildren:!!children},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    try {
        return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
    } catch (error) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AppDataContext.tsx:AppDataProvider:error',message:'ERROR en AppDataProvider render',data:{error:error instanceof Error?error.message:String(error),stack:error instanceof Error?error.stack:undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        throw error;
    }
}

export function useAppData() {
    const context = useContext(AppDataContext);
    if (!context) {
        throw new Error('useAppData must be used within AppDataProvider');
    }
    return context;
}
