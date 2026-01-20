/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

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
    priority: string;
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
};

type AppDataContextValue = {
    balance: number;
    income: number;
    expenses: number;
    transactions: Transaction[];
    tasks: Task[];
    events: Event[];
    habits: Habit[];
    addTask: (task: Omit<Task, 'id'>) => void;
    updateTask: (id: string, updates: Partial<Omit<Task, 'id'>>) => void;
    deleteTask: (id: string) => void;
    addEvent: (event: Omit<Event, 'id'>) => void;
    updateEvent: (id: string, updates: Partial<Omit<Event, 'id'>>) => void;
    deleteEvent: (id: string) => void;
    addHabit: (habit: Omit<Habit, 'id' | 'timestamp'>) => void;
    updateHabit: (id: string, updates: Partial<Omit<Habit, 'id' | 'timestamp'>>) => void;
    deleteHabit: (id: string) => void;
};

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [habits, setHabits] = useState<Habit[]>([]);
    const [balance, setBalance] = useState(0);
    const [income, setIncome] = useState(0);
    const [expenses, setExpenses] = useState(0);
    const loadDataRef = useRef<(() => Promise<void>) | null>(null);
    // Rastrear cambios recientes para evitar que las suscripciones de tiempo real los sobrescriban
    const recentUpdatesRef = useRef<Map<string, { completed?: boolean; timestamp: number }>>(new Map());

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
                const [tasksResult, transactionsResult, eventsResult, overviewResult] = await Promise.all([
                    supabase.from('tasks').select('*').order('created_at', { ascending: true }),
                    supabase.from('transactions').select('*').order('created_at', { ascending: false }),
                    supabase.from('events').select('*').order('event_date', { ascending: true }),
                    supabase.from('app_overview').select('*').order('updated_at', { ascending: false }).limit(1)
                ]);

                if (!active) return;

                if (tasksResult.error) {
                    console.error("Error cargando tareas:", tasksResult.error);
                } else {
                    const loadedTasks = tasksResult.data ?? [];
                    setTasks((prev) => {
                        // Preservar el estado local de completed cuando se recargan los datos
                        const prevTasksMap = new Map(prev.map(t => [t.id, t]));
                        return loadedTasks.map((item) => {
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
                        loadedTransactions.map((item) => ({
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
                    console.log(`📥 Cargados ${loadedEvents.length} eventos desde Supabase`);
                    setEvents((prev) => {
                        // Preservar el estado local de completed cuando se recargan los datos
                        const prevEventsMap = new Map(prev.map(e => [e.id, e]));
                        return loadedEvents.map((item) => {
                            const eventId = String(item.id);
                            const prevEvent = prevEventsMap.get(eventId);
                            return {
                                id: eventId,
                                title: item.title ?? "",
                                description: item.description ?? "",
                                event_date: item.event_date ?? "",
                                event_time: item.event_time ?? "",
                                priority: item.priority ?? "Media",
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
                    console.log(`📥 Cargados ${loadedHabits.length} hábitos desde Supabase`);
                    setHabits((prev) => {
                        // Preservar el estado local de completed cuando se recargan los datos
                        const prevHabitsMap = new Map(prev.map(h => [h.id, h]));
                        return loadedHabits.map((item) => {
                            const habitId = String(item.id);
                            const prevHabit = prevHabitsMap.get(habitId);
                            return {
                                id: habitId,
                                title: item.title ?? "",
                                description: item.description ?? "",
                                category: (item.category ?? 'non-negotiable') as HabitCategory,
                                completed: prevHabit?.completed !== undefined ? prevHabit.completed : Boolean(item.completed ?? false),
                                timestamp: item.created_at ? new Date(item.created_at) : new Date()
                            };
                        });
                    });
                }

                if (overviewResult.error) {
                    console.error("Error cargando resumen:", overviewResult.error);
                } else {
                    const overview = overviewResult.data?.[0];
                    if (overview) {
                        setBalance(Number(overview.balance ?? 0));
                        setIncome(Number(overview.income ?? 0));
                        setExpenses(Number(overview.expenses ?? 0));
                    } else {
                        // Si no hay overview, usar valores por defecto
                        setBalance(880000);
                        setIncome(1100000);
                        setExpenses(229900);
                    }
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
                console.log('🔄 Recargando datos por cambio en tiempo real...');
                loadDataRef.current();
            }
        };

        // Usar un solo canal para todas las suscripciones (mejor práctica)
        const channel = supabase
            .channel('db-changes', {
                config: {
                    broadcast: { self: false }
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
                    console.log('📝 Realtime: cambio en tasks', payload.eventType, payload.new || payload.old);
                    if (payload.eventType === 'UPDATE' && payload.new) {
                        const taskId = String(payload.new.id);
                        const recentUpdate = recentUpdatesRef.current.get(taskId);
                        
                        // Si acabamos de actualizar este item, ignorar el evento de tiempo real
                        if (recentUpdate && Date.now() - recentUpdate.timestamp < 5000) {
                            console.log('⏭️ Ignorando evento de tiempo real para tarea recién actualizada:', taskId);
                            return;
                        }
                        
                        // Actualizar solo el item específico en lugar de recargar todo
                        setTasks((prev) => {
                            const existingTask = prev.find(t => String(t.id) === taskId);
                            if (existingTask) {
                                // Solo actualizar si el item ya existe
                                // IMPORTANTE: Preservar siempre el valor local de completed para evitar que se resetee
                                return prev.map((task) =>
                                    String(task.id) === taskId
                                        ? {
                                              ...task,
                                              title: payload.new.title ?? task.title,
                                              meta: payload.new.meta ?? task.meta,
                                              priority: payload.new.priority ?? task.priority,
                                              // SIEMPRE preservar el valor local de completed (nunca sobrescribirlo desde Supabase)
                                              completed: task.completed
                                          }
                                        : task
                                );
                            }
                            // Si no existe, recargar todo (puede ser un INSERT)
                            reloadData();
                            return prev;
                        });
                    } else {
                        // Para INSERT o DELETE, recargar todo
                        reloadData();
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
                (payload) => {
                    console.log('💰 Realtime: cambio en transactions', payload.eventType, payload.new || payload.old);
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
                    console.log('📅 Realtime: cambio en events', payload.eventType, payload.new || payload.old);
                    if (payload.eventType === 'UPDATE' && payload.new) {
                        const eventId = String(payload.new.id);
                        const recentUpdate = recentUpdatesRef.current.get(eventId);
                        
                        // Si acabamos de actualizar este item, ignorar el evento de tiempo real
                        if (recentUpdate && Date.now() - recentUpdate.timestamp < 5000) {
                            console.log('⏭️ Ignorando evento de tiempo real para evento recién actualizado:', eventId);
                            return;
                        }
                        
                        // Actualizar solo el item específico en lugar de recargar todo
                        setEvents((prev) => {
                            const existingEvent = prev.find(e => String(e.id) === eventId);
                            if (existingEvent) {
                                // Solo actualizar si el item ya existe
                                // IMPORTANTE: Preservar siempre el valor local de completed para evitar que se resetee
                                return prev.map((event) =>
                                    String(event.id) === eventId
                                        ? {
                                              ...event,
                                              title: payload.new.title ?? event.title,
                                              description: payload.new.description ?? event.description,
                                              event_date: payload.new.event_date ?? event.event_date,
                                              event_time: payload.new.event_time ?? event.event_time,
                                              priority: payload.new.priority ?? event.priority,
                                              // SIEMPRE preservar el valor local de completed (nunca sobrescribirlo desde Supabase)
                                              completed: event.completed
                                          }
                                        : event
                                );
                            }
                            // Si no existe, recargar todo (puede ser un INSERT)
                            reloadData();
                            return prev;
                        });
                    } else {
                        // Para INSERT o DELETE, recargar todo
                        reloadData();
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
                        console.log('🔄 Recargando datos para hábitos (caso no manejado)');
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
                (payload) => {
                    console.log('📊 Realtime: cambio en app_overview', payload.eventType, payload.new || payload.old);
                    reloadData();
                }
            )
            .subscribe((status, err) => {
                if (status === 'SUBSCRIBED') {
                    console.log('✅ Realtime: Todas las suscripciones activas');
                } else if (status === 'CHANNEL_ERROR') {
                    console.error('❌ Error en suscripción Realtime:', err);
                } else if (status === 'TIMED_OUT') {
                    console.warn('⏱️ Timeout en suscripción Realtime');
                } else if (status === 'CLOSED') {
                    console.warn('🔒 Canal Realtime cerrado');
                } else {
                    console.log('ℹ️ Estado Realtime:', status);
                }
            });

        return () => {
            active = false;
            // Limpiar suscripción
            channel.unsubscribe();
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
        if (updates.completed !== undefined) {
            recentUpdatesRef.current.set(id, { completed: updates.completed, timestamp: Date.now() });
            // Limpiar entradas antiguas después de 5 segundos
            setTimeout(() => {
                recentUpdatesRef.current.delete(id);
            }, 5000);
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
                    event_time: event.event_time,
                    priority: event.priority
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
                                  event_time: data.event_time ?? event.event_time,
                                  priority: data.priority ?? event.priority
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
        if (updates.completed !== undefined) {
            recentUpdatesRef.current.set(id, { completed: updates.completed, timestamp: Date.now() });
            // Limpiar entradas antiguas después de 5 segundos
            setTimeout(() => {
                recentUpdatesRef.current.delete(id);
            }, 5000);
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
        const newHabitLocal: Habit = { 
            id: `habit-${Date.now()}`, 
            ...habit,
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
                    completed: habit.completed
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

    const value = useMemo(
        () => ({
            balance,
            income,
            expenses,
            transactions,
            tasks,
            events,
            habits,
            addTask,
            updateTask,
            deleteTask,
            addEvent,
            updateEvent,
            deleteEvent,
            addHabit,
            updateHabit,
            deleteHabit
        }),
        [addEvent, addTask, addHabit, balance, deleteEvent, deleteTask, deleteHabit, events, expenses, habits, income, tasks, transactions, updateEvent, updateTask, updateHabit]
    );

    return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
    const context = useContext(AppDataContext);
    if (!context) {
        throw new Error('useAppData must be used within AppDataProvider');
    }
    return context;
}
