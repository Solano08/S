import { motion, AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import {
    SFBriefcase,
    SFArrowUpRight,
    SFCheckCircle,
    SFWallet,
    SFTrendingUp,
    SFArrowDownRight,
    SFCalendar,
    SFPlus,
    SFMinus,
    SFXmark,
    SFTrash,
    SFLock
} from '../components/ui/SFIcons';
import { QuickActionsMenu } from '../components/ui/QuickActionsMenu';
import { DatePicker, CalendarDatePanel } from '../components/ui/DatePicker';
import { TimeSelect } from '../components/ui/TimeSelect';
import { useAppData, type Transaction } from '../context/AppDataContext';
import { useToday } from '../hooks/useToday';
import { useTheme } from '../context/ThemeContext';

export { Home } from './Home';

// Función helper para obtener el color del texto según la prioridad de la tarea
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

const NEW_DRAFT_ID = 'new-draft';

export const Projects = () => {
    const { projects, addProject, updateProject, deleteProject } = useAppData();
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [projectContent, setProjectContent] = useState("");
    const [projectTitle, setProjectTitle] = useState("");
    const [projectStartDate, setProjectStartDate] = useState<string>("");
    const [projectEndDate, setProjectEndDate] = useState<string>("");
    const [projectStatus, setProjectStatus] = useState<'not-started' | 'in-progress' | 'completed'>('not-started');
    const [projectProgress, setProjectProgress] = useState<number>(0);
    const [initialProjectTitle, setInitialProjectTitle] = useState("");
    const [initialProjectContent, setInitialProjectContent] = useState("");
    const [backConfirmOpen, setBackConfirmOpen] = useState(false);
    const [deleteProjectConfirmId, setDeleteProjectConfirmId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Calcular progreso basado en fechas
    const calculatedProgress = useMemo(() => {
        if (!projectStartDate || !projectEndDate) {
            return null; // No hay fechas, no mostrar barra
        }

        try {
            const start = new Date(projectStartDate);
            const end = new Date(projectEndDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);

            const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            const daysPassed = Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

            if (totalDays <= 0) {
                return 100; // Proyecto ya terminado
            }

            if (daysPassed < 0) {
                return 0; // Proyecto aún no ha comenzado
            }

            if (daysPassed >= totalDays) {
                return 100; // Proyecto ya terminado
            }

            return Math.round((daysPassed / totalDays) * 100);
        } catch (error) {
            console.error("Error calculando progreso:", error);
            return null;
        }
    }, [projectStartDate, projectEndDate]);
    
    // Debug: Log cuando cambian los proyectos
    useEffect(() => {
        console.log('📊 Estado de proyectos actualizado:', {
            total: projects.length,
            proyectos: projects.map(p => ({ id: p.id, title: p.title, description: p.description?.substring(0, 30) })),
            editingProjectId,
            mostrarLista: !editingProjectId
        });
    }, [projects, editingProjectId]);

    const handleAddProject = () => {
        setEditingProjectId(NEW_DRAFT_ID);
        setProjectTitle("");
        setProjectContent("");
        setProjectStartDate("");
        setProjectEndDate("");
        setProjectStatus('not-started');
        setProjectProgress(0);
        setInitialProjectTitle("");
        setInitialProjectContent("");
    };

    // Efecto para actualizar editingProjectId si el ID del proyecto cambió (después de guardar en Supabase)
    useEffect(() => {
        if (editingProjectId && editingProjectId !== NEW_DRAFT_ID && editingProjectId.startsWith('project-')) {
            // Si estamos editando un proyecto con ID temporal, buscar si hay uno con ID real
            const projectWithTempId = projects.find(p => p.id === editingProjectId);
            if (!projectWithTempId) {
                // El proyecto con ID temporal ya no existe, buscar el más reciente
                // Buscar por título o por ser el más reciente creado
                const recentProject = projects
                    .filter(p => {
                        // Si tenemos un título, buscar por título
                        if (projectTitle && projectTitle.trim() && projectTitle !== "Nuevo proyecto") {
                            return p.title === projectTitle;
                        }
                        // Si no, buscar proyectos recientes con título "Nuevo proyecto"
                        return p.title === "Nuevo proyecto" || !p.title;
                    })
                    .sort((a, b) => {
                        // Ordenar por created_at si existe, sino por ID
                        if (a.created_at && b.created_at) {
                            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                        }
                        // Si no hay created_at, usar el timestamp del ID temporal
                        const aTime = a.id.includes('-') ? parseInt(a.id.split('-')[1] || '0') : 0;
                        const bTime = b.id.includes('-') ? parseInt(b.id.split('-')[1] || '0') : 0;
                        return bTime - aTime;
                    })[0];
                
                if (recentProject && recentProject.id !== editingProjectId) {
                    console.log('🔄 Actualizando editingProjectId de temporal a real:', {
                        oldId: editingProjectId,
                        newId: recentProject.id,
                        title: recentProject.title
                    });
                    setEditingProjectId(recentProject.id);
                    // También actualizar el título y contenido si están vacíos o son los valores por defecto
                    if ((!projectTitle || projectTitle === "Nuevo proyecto") && recentProject.title && recentProject.title !== "Nuevo proyecto") {
                        setProjectTitle(recentProject.title);
                    }
                    if (!projectContent && recentProject.description) {
                        setProjectContent(recentProject.description);
                    }
                }
            }
        }
    }, [projects, editingProjectId, projectTitle, projectContent]);

    // Efecto para inicializar el título y contenido cuando se selecciona un proyecto para editar
    useEffect(() => {
        if (editingProjectId && editingProjectId !== NEW_DRAFT_ID && !isSaving) {
            const project = projects.find(p => p.id === editingProjectId);
            if (project) {
                // Solo actualizar si estamos cambiando de proyecto (no durante la edición)
                // Esto evita que se sobrescriban los cambios mientras el usuario escribe
                const activeElement = document.activeElement;
                const isUserEditing = activeElement?.tagName === 'INPUT' || 
                                     activeElement?.tagName === 'TEXTAREA' ||
                                     activeElement?.tagName === 'SELECT' ||
                                     activeElement?.tagName === 'TEXTAREA';
                
                // Si el usuario no está escribiendo activamente, sincronizar con el estado
                // PERO solo si los valores locales están vacíos o son diferentes significativamente
                if (!isUserEditing) {
                    // Solo actualizar si los valores locales están vacíos
                    // Esto previene sobrescribir cambios del usuario después de guardar
                    if (!projectTitle.trim() && project.title) {
                        setProjectTitle(project.title);
                    }
                    if (!projectContent.trim() && project.description) {
                        setProjectContent(project.description);
                    }
                    // Sincronizar fechas, estado y progreso siempre que cambie el proyecto
                    if (project.start_date !== projectStartDate) {
                        setProjectStartDate(project.start_date || "");
                    }
                    if (project.end_date !== projectEndDate) {
                        setProjectEndDate(project.end_date || "");
                    }
                    if (project.status !== projectStatus) {
                        setProjectStatus(project.status);
                    }
                    if (project.progress !== projectProgress) {
                        setProjectProgress(project.progress);
                    }
                }
            }
        }
    }, [editingProjectId, projects, isSaving]);

    const handleProjectClick = (projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (project) {
            setEditingProjectId(projectId);
            setProjectTitle(project.title);
            setProjectContent(project.description || "");
            setProjectStartDate(project.start_date || "");
            setProjectEndDate(project.end_date || "");
            setProjectStatus(project.status);
            setProjectProgress(project.progress);
            setInitialProjectTitle(project.title);
            setInitialProjectContent(project.description || "");
        }
    };

    const closeEditor = () => {
        setEditingProjectId(null);
        setProjectTitle("");
        setProjectContent("");
        setProjectStartDate("");
        setProjectEndDate("");
        setProjectStatus('not-started');
        setProjectProgress(0);
        setInitialProjectTitle("");
        setInitialProjectContent("");
        setBackConfirmOpen(false);
    };

    const handleSaveProject = async (): Promise<boolean> => {
        if (isSaving) return false;
        if (!editingProjectId) {
            alert('No hay proyecto seleccionado para guardar');
            return false;
        }

        setIsSaving(true);
        const titleToSave = projectTitle.trim() || "Sin título";
        const descriptionToSave = projectContent.trim();

        try {
            if (editingProjectId === NEW_DRAFT_ID) {
                await addProject({
                    title: titleToSave,
                    description: descriptionToSave,
                    start_date: projectStartDate || undefined,
                    end_date: projectEndDate || undefined,
                    status: projectStatus,
                    progress: projectProgress
                });
            } else {
                const existingProject = projects.find(p => p.id === editingProjectId);
                if (!existingProject) {
                    alert('Error: El proyecto no se encontró. Por favor, intenta de nuevo.');
                    setIsSaving(false);
                    return false;
                }
                await updateProject(editingProjectId, {
                    title: titleToSave,
                    description: descriptionToSave,
                    start_date: projectStartDate || undefined,
                    end_date: projectEndDate || undefined,
                    status: projectStatus,
                    progress: projectProgress
                });
            }
            closeEditor();
            return true;
        } catch (error: unknown) {
            console.error('Error al guardar proyecto:', error);
            alert(`Error al guardar el proyecto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const hasProjectContent = () => !!(projectTitle.trim() || projectContent.trim());
    const hasUnsavedChanges = () => {
        if (editingProjectId === NEW_DRAFT_ID) return false;
        return projectTitle.trim() !== initialProjectTitle.trim() ||
            projectContent.trim() !== (initialProjectContent || "").trim();
    };

    const handleBackToList = () => {
        const isNewDraft = editingProjectId === NEW_DRAFT_ID;
        const showPrompt = (isNewDraft && hasProjectContent()) || (!isNewDraft && hasUnsavedChanges());
        if (showPrompt) {
            setBackConfirmOpen(true);
            return;
        }
        closeEditor();
    };

    const handleBackConfirmGuardar = async () => {
        const ok = await handleSaveProject();
        if (ok) setBackConfirmOpen(false);
    };

    const handleBackConfirmDescartar = () => {
        setBackConfirmOpen(false);
        closeEditor();
    };

    const handleBackConfirmCancelar = () => {
        setBackConfirmOpen(false);
    };

    // Calcular estadísticas de proyectos
    const projectsStats = useMemo(() => {
        console.log('📊 Calculando estadísticas de proyectos. Total:', projects.length);
        const inProgress = projects.filter(p => p.status === 'in-progress').length;
        const notStarted = projects.filter(p => p.status === 'not-started').length;
        const completed = projects.filter(p => p.status === 'completed').length;
        const totalProgress = projects.length > 0
            ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
            : 0;
        
        return {
            total: projects.length,
            inProgress,
            notStarted,
            completed,
            averageProgress: totalProgress
        };
    }, [projects]);

    return (
        <div className="app-screen">
            <header className="app-header">
                <div className="app-title-group">
                    <span className="app-date">Proyectos</span>
                    <h1 className="app-title">Activos y en progreso</h1>
                    <span className="app-subtitle">Prioriza, monitorea y cierra</span>
                </div>
            </header>

            <div className="app-content">
                {/* Bloque de resumen - Se muestra cuando NO hay proyecto en edición */}
                {!editingProjectId && (
                    <section className="app-section">
                        <div className="hero-card">
                            <div className="hero-header">
                                <div>
                                    <p className="hero-eyebrow">Resumen</p>
                                    <h2 className="hero-title">{projectsStats.total} {projectsStats.total === 1 ? 'proyecto activo' : 'proyectos activos'}</h2>
                                </div>
                                <div className="hero-icon">
                                    <SFBriefcase size={18} />
                                </div>
                            </div>
                            <div className="hero-metrics">
                                <div>
                                    <span className="hero-metric-value">{projectsStats.inProgress}</span>
                                    <span className="hero-metric-label">En curso</span>
                                </div>
                                <div>
                                    <span className="hero-metric-value">{projectsStats.notStarted}</span>
                                    <span className="hero-metric-label">Por iniciar</span>
                                </div>
                                <div>
                                    <span className="hero-metric-value">{projectsStats.averageProgress}%</span>
                                    <span className="hero-metric-label">Completado</span>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Barra de herramientas - Se muestra cuando hay proyecto en edición */}
                {editingProjectId && (
                    <section className="app-section">
                        <div className="hero-card" style={{ padding: '16px' }}>
                            <div style={{ 
                                display: 'flex', 
                                flexWrap: 'wrap', 
                                gap: '12px', 
                                alignItems: 'center' 
                            }}>
                                {/* Fecha de inicio */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '140px' }}>
                                    <label style={{ 
                                        fontSize: '11px', 
                                        fontWeight: '600', 
                                        color: 'var(--text-tertiary)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        Inicio
                                    </label>
                                    <div className="task-picker">
                                        <DatePicker
                                            value={projectStartDate}
                                            onChange={setProjectStartDate}
                                            placeholder="Seleccionar"
                                            taskStyle={true}
                                        />
                                    </div>
                                </div>

                                {/* Fecha de entrega */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '140px' }}>
                                    <label style={{ 
                                        fontSize: '11px', 
                                        fontWeight: '600', 
                                        color: 'var(--text-tertiary)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        Entrega
                                    </label>
                                    <div className="task-picker">
                                        <DatePicker
                                            value={projectEndDate}
                                            onChange={setProjectEndDate}
                                            placeholder="Seleccionar"
                                            taskStyle={true}
                                        />
                                    </div>
                                </div>

                                {/* Estado */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '140px' }}>
                                    <label style={{ 
                                        fontSize: '11px', 
                                        fontWeight: '600', 
                                        color: 'var(--text-tertiary)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        Estado
                                    </label>
                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                        {(['not-started', 'in-progress', 'completed'] as const).map((status) => {
                                            const labels = {
                                                'not-started': 'Por iniciar',
                                                'in-progress': 'En curso',
                                                'completed': 'Completado'
                                            };
                                            const isActive = projectStatus === status;
                                            return (
                                                <button
                                                    key={status}
                                                    type="button"
                                                    onClick={() => setProjectStatus(status)}
                                                    className={isActive ? 'chip' : ''}
                                                    style={{
                                                        fontSize: '11px',
                                                        fontWeight: '600',
                                                        padding: '6px 12px',
                                                        borderRadius: '999px',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        background: isActive 
                                                            ? 'rgba(255, 255, 255, 0.15)' 
                                                            : 'rgba(255, 255, 255, 0.06)',
                                                        color: isActive 
                                                            ? 'var(--text-primary)' 
                                                            : 'var(--text-secondary)',
                                                        opacity: isActive ? 1 : 0.7
                                                    }}
                                                >
                                                    {labels[status]}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Progreso - Solo mostrar si hay fechas */}
                                {calculatedProgress !== null ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '140px', flex: 1 }}>
                                        <label style={{ 
                                            fontSize: '11px', 
                                            fontWeight: '600', 
                                            color: 'var(--text-tertiary)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            Progreso: {calculatedProgress}%
                                        </label>
                                        <div className="hero-progress">
                                            <div 
                                                className="hero-progress-bar" 
                                                style={{ 
                                                    width: `${calculatedProgress}%`,
                                                    backgroundColor: 'var(--ios-green)',
                                                    transition: 'width 0.3s ease'
                                                }} 
                                            />
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </section>
                )}

                {/* Vista de lista de proyectos - Se muestra cuando NO hay proyecto en edición */}
                {!editingProjectId && (
                    <section className="app-section">
                        <div className="section-title">
                            <h3>Proyectos</h3>
                            <button
                                className="icon-button"
                                aria-label="Agregar proyecto"
                                onClick={handleAddProject}
                            >
                                <SFPlus size={18} />
                            </button>
                        </div>
                        {projects.length === 0 ? (
                            <div className="list-card" style={{ padding: '40px 20px', textAlign: 'center' }}>
                                <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', margin: 0 }}>
                                    No hay proyectos aún. Haz clic en el botón + para crear uno.
                                </p>
                            </div>
                        ) : (
                            <div className="list-card">
                                {projects.length > 0 ? (
                                    projects.map((project) => {
                                        let longPressTimer: ReturnType<typeof setTimeout> | null = null;
                                        let hasLongPressed = false;

                                        const handleLongPressStart = (e: React.TouchEvent | React.MouseEvent) => {
                                            e.preventDefault();
                                            hasLongPressed = false;
                                            longPressTimer = setTimeout(() => {
                                                hasLongPressed = true;
                                                setDeleteProjectConfirmId(project.id);
                                                longPressTimer = null;
                                            }, 500); // 500ms para long press
                                        };

                                        const handleLongPressEnd = () => {
                                            if (longPressTimer) {
                                                clearTimeout(longPressTimer);
                                                longPressTimer = null;
                                            }
                                        };

                                        return (
                                            <div 
                                                key={project.id}
                                                className="list-item"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => {
                                                    if (!hasLongPressed) {
                                                        handleLongPressEnd();
                                                        handleProjectClick(project.id);
                                                    }
                                                    hasLongPressed = false;
                                                }}
                                                onTouchStart={handleLongPressStart}
                                                onTouchEnd={handleLongPressEnd}
                                                onMouseDown={handleLongPressStart}
                                                onMouseUp={handleLongPressEnd}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'transparent';
                                                    handleLongPressEnd();
                                                }}
                                            >
                                                <div className="list-icon">
                                                    <SFBriefcase size={18} />
                                                </div>
                                                <div className="list-content">
                                                    <p>{project.title || 'Sin título'}</p>
                                                    <span>{project.description || 'Sin descripción'}</span>
                                                </div>
                                                <SFArrowUpRight size={16} className="text-[var(--text-tertiary)]" />
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div style={{ padding: '20px', textAlign: 'center' }}>
                                        <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', margin: 0 }}>
                                            No hay proyectos para mostrar
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>
                )}

                {/* Vista de edición (bloc de notas) */}
                {editingProjectId && (
                    <>
                        <section className="app-section" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div className="section-title">
                            <button
                                className="link-button"
                                onClick={handleBackToList}
                                style={{ fontSize: '14px', fontWeight: '600' }}
                            >
                                ← Regresar
                            </button>
                            <button
                                type="button"
                                className="link-button"
                                onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    
                                    if (isSaving) {
                                        return;
                                    }
                                    
                                    await handleSaveProject();
                                }}
                                disabled={isSaving}
                                style={{ 
                                    fontSize: '14px', 
                                    fontWeight: '600',
                                    opacity: isSaving ? 0.5 : 1,
                                    cursor: isSaving ? 'not-allowed' : 'pointer',
                                    pointerEvents: isSaving ? 'none' : 'auto'
                                }}
                            >
                                {isSaving ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                        <div style={{ 
                            flex: 1, 
                            display: 'flex', 
                            flexDirection: 'column',
                            gap: '12px'
                        }}>
                            <input
                                type="text"
                                className="task-input"
                                placeholder="Título del proyecto"
                                value={projectTitle}
                                onChange={(e) => setProjectTitle(e.target.value)}
                                style={{
                                    fontSize: '20px',
                                    fontWeight: '700',
                                    padding: '12px 16px'
                                }}
                            />
                            <textarea
                                className="task-input"
                                placeholder="Escribe aquí tu proyecto..."
                                value={projectContent}
                                onChange={(e) => setProjectContent(e.target.value)}
                                style={{
                                    flex: 1,
                                    minHeight: '400px',
                                    fontSize: '15px',
                                    lineHeight: '1.6',
                                    padding: '16px',
                                    resize: 'none',
                                    fontFamily: 'inherit',
                                    background: 'transparent',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '12px',
                                    color: 'var(--text-primary)',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </section>
                    </>
                )}

                {/* Modal: ¿Desea guardar antes de salir? */}
                {backConfirmOpen && (
                    <div
                        className="calendar-backdrop"
                        onClick={handleBackConfirmCancelar}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 300,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '20px',
                            background: 'rgba(0,0,0,0.4)'
                        }}
                    >
                        <div
                            className="glass-card"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                maxWidth: '340px',
                                width: '100%',
                                padding: '24px',
                                borderRadius: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '20px'
                            }}
                        >
                            <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                                ¿Desea guardar el proyecto antes de salir?
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <button
                                    type="button"
                                    onClick={handleBackConfirmGuardar}
                                    disabled={isSaving}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        border: 'none',
                                        background: 'var(--ios-blue)',
                                        color: '#fff',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        cursor: isSaving ? 'not-allowed' : 'pointer',
                                        opacity: isSaving ? 0.7 : 1
                                    }}
                                >
                                    {isSaving ? 'Guardando...' : 'Guardar'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleBackConfirmDescartar}
                                    disabled={isSaving}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        border: '1px solid var(--glass-border)',
                                        background: 'transparent',
                                        color: 'var(--text-primary)',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        cursor: isSaving ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    Descartar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleBackConfirmCancelar}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        border: 'none',
                                        background: 'rgba(255,255,255,0.06)',
                                        color: 'var(--text-secondary)',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal eliminar proyecto (misma ventana que tarea puntual) */}
                {deleteProjectConfirmId && (
                    <div className="calendar-modal">
                        <button
                            className="calendar-backdrop"
                            aria-label="Cerrar confirmación"
                            onClick={() => setDeleteProjectConfirmId(null)}
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
                                    ¿Eliminar proyecto?
                                </h3>
                                <p style={{
                                    fontSize: '14px',
                                    color: 'var(--text-secondary)',
                                    margin: '0 0 28px 0',
                                    lineHeight: '1.5',
                                    padding: '0 8px'
                                }}>
                                    Esta acción no se puede deshacer. El proyecto se eliminará permanentemente.
                                </p>
                                <div style={{
                                    display: 'flex',
                                    gap: '10px',
                                    justifyContent: 'center'
                                }}>
                                    <button
                                        className="link-button"
                                        onClick={() => setDeleteProjectConfirmId(null)}
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
                                            deleteProject(deleteProjectConfirmId);
                                            setDeleteProjectConfirmId(null);
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
            </div>
        </div>
    );
};
const INVESTMENT_CATEGORIES = [
    { id: 'home', label: 'Casa', icon: '🏠' },
    { id: 'clothing', label: 'Ropa', icon: '👕' },
    {
        id: 'crypto',
        label: 'Cripto',
        icon: '₿',
        subcategories: [
            { id: 'BTC', label: 'Bitcoin', icon: '₿' },
            { id: 'ETH', label: 'Ethereum', icon: 'Ξ' },
            { id: 'SOL', label: 'Solana', icon: '◎' },
            { id: 'USDT', label: 'USDT', icon: '₮' },
            { id: 'BNB', label: 'BNB', icon: '🟡' }
        ]
    },
    { id: 'cars', label: 'Carros', icon: '🚗' },
    { id: 'food', label: 'Comida', icon: '🍔' },
    { id: 'shopping', label: 'Compras', icon: '🛍️' },
    {
        id: 'entertainment',
        label: 'Entretenimiento',
        icon: '🎬',
        subcategories: [
            { id: 'Spotify', label: 'Spotify', icon: '🎧' },
            { id: 'Netflix', label: 'Netflix', icon: '🎬' },
            { id: 'Disney+', label: 'Disney+', icon: '🏰' },
            { id: 'Prime', label: 'Prime Video', icon: '📦' },
            { id: 'AppleTV', label: 'Apple TV', icon: '🍎' }
        ]
    },
    { id: 'services', label: 'Servicios', icon: '🔧' },
    { id: 'stocks', label: 'Acciones', icon: '📈' },
    { id: 'land', label: 'Terrenos', icon: '🏞️' },
    { id: 'realestate', label: 'Inmuebles', icon: '🏢' },
    { id: 'business', label: 'Negocios', icon: '💼' },
    { id: 'etf', label: 'ETF', icon: '📊' },
    { id: 'gold', label: 'Oro', icon: '🥇' },
    { id: 'emergency', label: 'Fondo emergencia', icon: '🛡️' },
    { id: 'savings', label: 'Ahorros', icon: '🐷' },
];

/** Gastos de consumo (compras); no van en el bloque de inversiones */
const PURCHASE_SPENDING_CATEGORIES = ['Ropa', 'Comida', 'Compras'] as const;

/** Suscripciones y servicios; se muestran en Balance General como Servicios */
const SERVICE_SPENDING_CATEGORIES = ['Entretenimiento', 'Servicios'] as const;

function formatTransactionDate(iso?: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}

function PurchaseDetailRow({
    tx,
    onTitleCommit,
}: {
    tx: Transaction;
    onTitleCommit: (id: string, title: string) => void;
}) {
    const titleRef = useRef<HTMLParagraphElement>(null);

    useLayoutEffect(() => {
        const el = titleRef.current;
        if (!el || document.activeElement === el) return;
        el.textContent = tx.title;
    }, [tx.id, tx.title]);

    const dateStr = formatTransactionDate(tx.created_at);

    return (
        <div className="list-item">
            <div className="list-icon">
                <SFTrendingUp size={18} className="text-blue-500" />
            </div>
            <div className="list-content">
                <p
                    ref={titleRef}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                        const v = e.currentTarget.innerText.trim();
                        if (!v) {
                            e.currentTarget.textContent = tx.title;
                            return;
                        }
                        if (v !== tx.title) onTitleCommit(tx.id, v);
                    }}
                    style={{
                        margin: 0,
                        outline: 'none',
                        cursor: 'text',
                        wordBreak: 'break-word',
                    }}
                />
                <span>
                    {tx.category}
                    {dateStr ? ` · ${dateStr}` : ''}
                </span>
            </div>
            <span className="list-time positive">${Math.abs(tx.amount).toLocaleString('es-CO')}</span>
        </div>
    );
}

export const Finances = () => {
    const { balance, income, expenses, transactions, addTransaction, updateTransaction } = useAppData();
    
    const realInvestmentCategories = ['Cripto', 'Casa', 'Carros', 'Acciones', 'Terrenos', 'Inmuebles', 'Negocios', 'ETF', 'Oro', 'Fondo emergencia', 'Ahorros'];
    const investmentRegistryCategories = [...realInvestmentCategories, 'Inversión', 'Inversiones'];
    
    // Calcular inversiones totales (solo inversiones reales)
    const investmentsTotal = useMemo(() => {
        return (transactions || [])
            .filter(t => realInvestmentCategories.includes(t.category))
            .reduce((acc, t) => acc + Math.abs(t.amount), 0);
    }, [transactions]);

    // Agrupar inversiones por tipo y sumar montos
    const groupedInvestments = useMemo(() => {
        const filtered = (transactions || []).filter(t => 
            realInvestmentCategories.includes(t.category)
        );
        
        // Agrupar por título (que es el nombre de la inversión, ej: "Bitcoin", "Solana", "Casa")
        const grouped = new Map<string, { title: string; category: string; totalAmount: number; icon: string }>();
        
        filtered.forEach(t => {
            const key = t.title; // Usar el título como clave (ej: "Bitcoin", "Solana")
            const existing = grouped.get(key);
            
            // Buscar el icono correspondiente
            const categoryData = INVESTMENT_CATEGORIES.find(cat => 
                cat.label === t.category || 
                cat.subcategories?.some(sub => sub.label === t.title)
            );
            const subcategoryData = categoryData?.subcategories?.find(sub => sub.label === t.title);
            const icon = subcategoryData?.icon || categoryData?.icon || '💰';
            
            if (existing) {
                // Sumar al monto existente
                existing.totalAmount += Math.abs(t.amount);
            } else {
                // Crear nueva entrada
                grouped.set(key, {
                    title: t.title,
                    category: t.category,
                    totalAmount: Math.abs(t.amount),
                    icon: icon
                });
            }
        });
        
        // Convertir a array y ordenar por monto total (mayor a menor)
        return Array.from(grouped.values()).sort((a, b) => b.totalAmount - a.totalAmount);
    }, [transactions]);

    const servicesTotal = useMemo(() => {
        return (transactions || [])
            .filter((t) => (SERVICE_SPENDING_CATEGORIES as readonly string[]).includes(t.category))
            .reduce((acc, t) => acc + Math.abs(t.amount), 0);
    }, [transactions]);

    const groupedServices = useMemo(() => {
        const filtered = (transactions || []).filter((t) =>
            (SERVICE_SPENDING_CATEGORIES as readonly string[]).includes(t.category)
        );
        const grouped = new Map<string, { title: string; category: string; totalAmount: number; icon: string }>();
        filtered.forEach((t) => {
            const key = t.title;
            const existing = grouped.get(key);
            const categoryData = INVESTMENT_CATEGORIES.find(
                (cat) =>
                    cat.label === t.category || cat.subcategories?.some((sub) => sub.label === t.title)
            );
            const subcategoryData = categoryData?.subcategories?.find((sub) => sub.label === t.title);
            const icon = subcategoryData?.icon || categoryData?.icon || '🔧';
            if (existing) {
                existing.totalAmount += Math.abs(t.amount);
            } else {
                grouped.set(key, {
                    title: t.title,
                    category: t.category,
                    totalAmount: Math.abs(t.amount),
                    icon,
                });
            }
        });
        return Array.from(grouped.values()).sort((a, b) => b.totalAmount - a.totalAmount);
    }, [transactions]);

    const investmentTransactions = useMemo(() => {
        const filtered = (transactions || []).filter(t => investmentRegistryCategories.includes(t.category));
        return filtered;
    }, [transactions]);

    const investmentCategorySummaries = useMemo(() => {
        const filtered = (transactions || []).filter((t) => investmentRegistryCategories.includes(t.category));
        const byCat = new Map<string, number>();
        filtered.forEach((t) => {
            byCat.set(t.category, (byCat.get(t.category) ?? 0) + Math.abs(t.amount));
        });
        return Array.from(byCat.entries())
            .map(([category, total]) => {
                const catDef = INVESTMENT_CATEGORIES.find((c) => c.label === category);
                return { category, total, icon: catDef?.icon ?? '💰' };
            })
            .filter((s) => s.total > 0)
            .sort((a, b) => b.total - a.total);
    }, [transactions]);

    const purchaseCategorySummaries = useMemo(() => {
        const filtered = (transactions || []).filter(t =>
            (PURCHASE_SPENDING_CATEGORIES as readonly string[]).includes(t.category)
        );
        const byCat = new Map<string, number>();
        filtered.forEach(t => {
            byCat.set(t.category, (byCat.get(t.category) ?? 0) + Math.abs(t.amount));
        });
        return (PURCHASE_SPENDING_CATEGORIES as readonly string[])
            .map(cat => {
                const catDef = INVESTMENT_CATEGORIES.find(c => c.label === cat);
                return {
                    category: cat,
                    total: byCat.get(cat) ?? 0,
                    icon: catDef?.icon ?? '🛒',
                };
            })
            .filter(s => s.total > 0)
            .sort((a, b) => b.total - a.total);
    }, [transactions]);

    const percentUsed = Math.round((expenses / Math.max(income, 1)) * 100);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showInvestmentsModal, setShowInvestmentsModal] = useState(false);
    const [showPurchasesModal, setShowPurchasesModal] = useState(false);
    const [purchasesModalCategory, setPurchasesModalCategory] = useState<string | null>(null);
    const [showInvestmentsRegistryModal, setShowInvestmentsRegistryModal] = useState(false);
    const [investmentsRegistryModalCategory, setInvestmentsRegistryModalCategory] = useState<string | null>(null);
    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<typeof INVESTMENT_CATEGORIES[0] | null>(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState<{id: string, label: string, icon: string} | null>(null);
    const [balanceCalculatorOpen, setBalanceCalculatorOpen] = useState(false);
    const [balanceCalculatorValueCOP, setBalanceCalculatorValueCOP] = useState(0);
    const [balanceCalculatorValueUSD, setBalanceCalculatorValueUSD] = useState(0);
    const [currency, setCurrency] = useState<'COP' | 'USD'>('COP');
    const [exchangeRate, setExchangeRate] = useState(4100); // Valor por defecto
    const [isEditingBalance, setIsEditingBalance] = useState(false);
    const [tempBalanceInput, setTempBalanceInput] = useState('');
    const [calculatorMode, setCalculatorMode] = useState<'balance' | 'investment'>('balance');
    const [minusButtonActive, setMinusButtonActive] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { theme } = useTheme();
    const investmentTitleEditableRef = useRef<HTMLParagraphElement>(null);

    useLayoutEffect(() => {
        if (!balanceCalculatorOpen || calculatorMode !== 'investment' || !selectedCategory) return;
        const el = investmentTitleEditableRef.current;
        if (!el) return;
        const base = (selectedSubcategory?.label || selectedCategory.label).trim();
        el.textContent = base;
    }, [balanceCalculatorOpen, calculatorMode, selectedCategory, selectedSubcategory]);

    const purchasesModalDetailTransactions = useMemo(() => {
        if (!purchasesModalCategory) return [];
        return (transactions || []).filter(
            t => t.category === purchasesModalCategory && (PURCHASE_SPENDING_CATEGORIES as readonly string[]).includes(t.category)
        );
    }, [transactions, purchasesModalCategory]);

    const investmentsRegistryDetailTransactions = useMemo(() => {
        if (!investmentsRegistryModalCategory) return [];
        return (transactions || []).filter(
            (t) =>
                t.category === investmentsRegistryModalCategory &&
                investmentRegistryCategories.includes(t.category)
        );
    }, [transactions, investmentsRegistryModalCategory]);

    // Obtener tasa de cambio real
    useEffect(() => {
        if (balanceCalculatorOpen) {
            fetch('https://api.exchangerate-api.com/v4/latest/USD')
                .then(res => res.json())
                .then(data => {
                    if (data && data.rates && data.rates.COP) {
                        setExchangeRate(data.rates.COP);
                    }
                })
                .catch(err => console.error('Error fetching exchange rate:', err));
        }
    }, [balanceCalculatorOpen]);

    const handleAddTransaction = () => {
        if (!amount || !selectedCategory) return;
        
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) return;

        addTransaction({
            title: selectedSubcategory?.label || selectedCategory.label,
            category: selectedCategory.label,
            amount: -numAmount // Siempre negativo como gasto/inversión (salida de dinero)
        });

        // Reset form
        setAmount("");
        setSelectedCategory(null);
        setSelectedSubcategory(null);
        setStep(1);
        setShowAddModal(false);
    };

    const handleSaveBalanceUpdate = () => {
        const currentValue = currency === 'USD' ? balanceCalculatorValueUSD : balanceCalculatorValueCOP;
        if (currentValue <= 0) return;
        
        setIsSaving(true);
        
        let amountInCOP = currentValue;
        
        // Si es USD, convertir a COP para guardar en la base de datos (que maneja COP)
        if (currency === 'USD') {
            amountInCOP = balanceCalculatorValueUSD * exchangeRate;
        } else {
            amountInCOP = balanceCalculatorValueCOP;
        }

        if (calculatorMode === 'investment') {
            // Guardar como inversión
            if (!selectedCategory) {
                setIsSaving(false);
                return;
            }
            
            const fallbackTitle = (selectedSubcategory?.label || selectedCategory.label).trim();
            const editedTitle = investmentTitleEditableRef.current?.innerText?.trim() ?? '';
            addTransaction({
                title: editedTitle.length > 0 ? editedTitle : fallbackTitle,
                category: selectedCategory.label,
                amount: -amountInCOP // Negativo como inversión (salida de dinero)
            });

            // Reset form
            setAmount("");
            setSelectedCategory(null);
            setSelectedSubcategory(null);
            setStep(1);
            setShowAddModal(false);
        } else {
            // Guardar como ingreso
            addTransaction({
                title: 'Ingreso registrado',
                category: 'Ingreso',
                amount: amountInCOP
            });
        }

        // Reset calculator después de un pequeño delay para mostrar el estado verde
        setTimeout(() => {
            setBalanceCalculatorValueCOP(0);
            setBalanceCalculatorValueUSD(0);
            setCurrency('COP');
            setBalanceCalculatorOpen(false);
            setCalculatorMode('balance');
            setIsSaving(false);
        }, 300);
    };

    return (
        <div className="app-screen">
            <header className="app-header">
                <div className="app-title-group">
                    <span className="app-date">Finanzas</span>
                    <h1 className="app-title">Control claro y simple</h1>
                    <span className="app-subtitle">Balance, ingresos y gastos</span>
                </div>
            </header>

            <div className="app-content">
                {/* Balance actual - Mejorado */}
                <section className="app-section">
                    <div 
                        className="hero-card" 
                        onClick={() => {
                            setCalculatorMode('balance');
                            setBalanceCalculatorValueCOP(0);
                            setBalanceCalculatorValueUSD(0);
                            setIsSaving(false);
                            setBalanceCalculatorOpen(true);
                        }}
                        style={{ 
                            background: 'var(--glass-bg-base)',
                            border: '1px solid var(--glass-border)',
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                                <p style={{ 
                                    margin: 0, 
                                    fontSize: '11px', 
                                    fontWeight: '600',
                                    color: 'var(--text-tertiary)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    marginBottom: '8px'
                                }}>
                                    Balance actual
                                </p>
                                <h2 style={{ 
                                    margin: 0, 
                                    fontSize: '32px', 
                                    fontWeight: '700',
                                    color: 'var(--text-primary)',
                                    lineHeight: '1.2',
                                    marginBottom: '6px'
                                }}>
                                    ${balance.toLocaleString('es-CO')}
                                </h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                                    <span style={{
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: percentUsed > 80 ? 'var(--ios-red)' : percentUsed > 50 ? 'var(--ios-orange)' : 'var(--ios-green)'
                                    }}>
                                        {percentUsed > 80 ? '↓' : percentUsed > 50 ? '→' : '↑'}
                                    </span>
                                    <span style={{
                                        fontSize: '12px',
                                        color: 'var(--text-secondary)'
                                    }}>
                                        {percentUsed}% usado
                                    </span>
                                </div>
                            </div>
                            <div className="hero-icon" style={{
                                width: '48px',
                                height: '48px'
                            }}>
                                <SFWallet size={24} />
                            </div>
                        </div>
                    </div>
                </section>

                    {/* Resumen Financiero - Balance General */}
                <section className="app-section">
                    <div className="section-title mb-2">
                        <h3>Balance General</h3>
                    </div>
                    <div 
                        className="hero-card"
                        onClick={() => setShowInvestmentsModal(true)}
                        style={{ 
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.borderColor = 'var(--glass-shine)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = 'var(--glass-border)';
                        }}
                    >
                        {/* Grid con jerarquía visual */}
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr',
                            gap: '16px'
                        }}>
                            {/* Servicios (gastos) */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                                padding: '0'
                            }}>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '10px'
                                }}>
                                    <span style={{ color: 'var(--ios-red)' }}><SFArrowDownRight size={18} /></span>
                                    <span style={{
                                        fontSize: '10px',
                                        fontWeight: '600',
                                        color: 'var(--text-tertiary)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.8px'
                                    }}>
                                        Servicios
                                    </span>
                                </div>
                                <h3 style={{ 
                                    margin: 0, 
                                    fontSize: '24px', 
                                    fontWeight: '700',
                                    color: 'var(--ios-red)',
                                    lineHeight: '1.1'
                                }}>
                                    ${servicesTotal.toLocaleString('es-CO')}
                                </h3>
                                <span style={{
                                    fontSize: '10px',
                                    color: 'var(--text-tertiary)',
                                    opacity: 0.8
                                }}>
                                    Gastos en servicios
                                </span>
                            </div>

                            {/* Inversiones */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                                padding: '0'
                            }}>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '10px'
                                }}>
                                    <span style={{ color: 'var(--ios-blue)' }}><SFTrendingUp size={18} /></span>
                                    <span style={{
                                        fontSize: '10px',
                                        fontWeight: '600',
                                        color: 'var(--text-tertiary)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.8px'
                                    }}>
                                        Inversiones
                                    </span>
                                </div>
                                <h3 style={{ 
                                    margin: 0, 
                                    fontSize: '24px', 
                                    fontWeight: '700',
                                    color: 'var(--ios-blue)',
                                    lineHeight: '1.1'
                                }}>
                                    ${investmentsTotal.toLocaleString('es-CO')}
                                </h3>
                                <span style={{
                                    fontSize: '10px',
                                    color: 'var(--text-tertiary)',
                                    opacity: 0.8
                                }}>
                                    Total invertido
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Registro de Inversiones */}
                <section className="app-section">
                    <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3>Registro de inversiones</h3>
                        {investmentTransactions.length > 0 && (
                            <button
                                className="hero-icon-button"
                                onClick={() => setShowAddModal(true)}
                                aria-label="Agregar inversión"
                            >
                                <SFPlus size={18} />
                            </button>
                        )}
                    </div>
                    <div className="list-card">
                        {investmentTransactions.length === 0 ? (
                            <div 
                                onClick={() => setShowAddModal(true)}
                                style={{ 
                                    padding: '20px', 
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    background: 'transparent'
                                }}
                            >
                                <button className="hero-icon-button" style={{ width: '40px', height: '40px' }} aria-label="Agregar inversión">
                                    <SFPlus size={20} />
                                </button>
                            </div>
                        ) : (
                            <>
                                {investmentTransactions.slice(0, 3).map((tx) => (
                                    <div className="list-item" key={tx.id}>
                                        <div className="list-icon">
                                            <SFTrendingUp size={18} className="text-blue-500" />
                                        </div>
                                        <div className="list-content">
                                            <p>{tx.title}</p>
                                            <span>
                                                {tx.category}
                                                {formatTransactionDate(tx.created_at)
                                                    ? ` · ${formatTransactionDate(tx.created_at)}`
                                                    : ''}
                                            </span>
                                        </div>
                                        <span className="list-time positive">
                                            ${Math.abs(tx.amount).toLocaleString('es-CO')}
                                        </span>
                                    </div>
                                ))}
                                {investmentTransactions.length > 3 && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setInvestmentsRegistryModalCategory(null);
                                            setShowInvestmentsRegistryModal(true);
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            marginTop: '8px',
                                            background: 'transparent',
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: '12px',
                                            color: 'var(--text-primary)',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Ver más
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setPurchasesModalCategory(null);
                            setShowPurchasesModal(true);
                        }}
                        style={{
                            marginTop: '14px',
                            padding: '6px 0',
                            background: 'none',
                            border: 'none',
                            color: 'var(--ios-blue)',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            textAlign: 'left',
                            display: 'block',
                            width: '100%',
                        }}
                    >
                        Registro de compras
                    </button>
                </section>
            </div>

            {/* Calculadora de Balance (Bottom Sheet) - solo en modo ingresos (raíz) */}
            <AnimatePresence>
                {balanceCalculatorOpen && calculatorMode === 'balance' && (
                    <div 
                        className="calendar-backdrop" 
                        onClick={() => {
                            setBalanceCalculatorOpen(false);
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
                                {/* Header con selector de moneda y conversión (solo ingresos) */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '4px', background: 'rgba(118, 118, 128, 0.12)', padding: '3px', borderRadius: '10px' }}>
                                        <button
                                            onClick={() => {
                                                setCurrency('USD');
                                                setBalanceCalculatorValueUSD(0);
                                            }}
                                            style={{
                                                padding: '6px 14px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                background: currency === 'USD' ? 'var(--bg-primary)' : 'transparent',
                                                color: currency === 'USD' ? 'var(--text-primary)' : 'var(--text-secondary)',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                boxShadow: currency === 'USD' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.05 }}>
                                                <span style={{ fontSize: '16px', marginBottom: '2px' }}>🇺🇸</span>
                                                <span style={{ fontSize: '11px', fontWeight: 700 }}>
                                                    Dólares <span style={{ fontSize: '9px', fontWeight: 700, opacity: 0.8 }}>(USD)</span>
                                                </span>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setCurrency('COP');
                                                setBalanceCalculatorValueCOP(0);
                                            }}
                                            style={{
                                                padding: '6px 14px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                background: currency === 'COP' ? 'var(--bg-primary)' : 'transparent',
                                                color: currency === 'COP' ? 'var(--text-primary)' : 'var(--text-secondary)',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                boxShadow: currency === 'COP' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.05 }}>
                                                <span style={{ fontSize: '16px', marginBottom: '2px' }}>🇨🇴</span>
                                                <span style={{ fontSize: '11px', fontWeight: 700 }}>
                                                    Colombia <span style={{ fontSize: '9px', fontWeight: 700, opacity: 0.8 }}>(COP)</span>
                                                </span>
                                            </div>
                                        </button>
                                    </div>

                                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Conversión estimada
                                        </span>
                                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                                            {currency === 'USD' 
                                                ? `≈ $${(balanceCalculatorValueUSD * exchangeRate).toLocaleString('es-CO')} COP`
                                                : `≈ $${(balanceCalculatorValueCOP / exchangeRate).toLocaleString('en-US', { maximumFractionDigits: 2 })} USD`
                                            }
                                        </span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '4px 0' }}>
                                    <button
                                        onClick={() => {
                                            setMinusButtonActive(true);
                                            const decrement = currency === 'USD' ? 20 : 20000;
                                            if (currency === 'USD') {
                                                setBalanceCalculatorValueUSD(prev => Math.max(0, prev - decrement));
                                            } else {
                                                setBalanceCalculatorValueCOP(prev => Math.max(0, prev - decrement));
                                            }
                                            setTimeout(() => setMinusButtonActive(false), 200);
                                        }}
                                        onMouseDown={() => setMinusButtonActive(true)}
                                        onMouseUp={() => setTimeout(() => setMinusButtonActive(false), 200)}
                                        onTouchStart={() => setMinusButtonActive(true)}
                                        onTouchEnd={() => setTimeout(() => setMinusButtonActive(false), 200)}
                                        style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '50%',
                                            border: 'none',
                                            background: 'transparent',
                                            fontSize: '24px',
                                            color: theme === 'dark' 
                                                ? (minusButtonActive ? '#ff453a' : '#fff')
                                                : '#000',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'color 0.15s ease'
                                        }}
                                        className="calculator-minus-btn"
                                    >
                                        <SFMinus size={24} />
                                    </button>

                                    <div style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
                                        {isEditingBalance ? (
                                            <input
                                                type="number"
                                                value={tempBalanceInput}
                                                onChange={(e) => setTempBalanceInput(e.target.value)}
                                                onBlur={() => {
                                                    const val = parseFloat(tempBalanceInput);
                                                    if (!isNaN(val) && val >= 0) {
                                                        if (currency === 'USD') {
                                                            setBalanceCalculatorValueUSD(val);
                                                        } else {
                                                            setBalanceCalculatorValueCOP(val);
                                                        }
                                                    }
                                                    setIsEditingBalance(false);
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const val = parseFloat(tempBalanceInput);
                                                        if (!isNaN(val) && val >= 0) {
                                                            if (currency === 'USD') {
                                                                setBalanceCalculatorValueUSD(val);
                                                            } else {
                                                                setBalanceCalculatorValueCOP(val);
                                                            }
                                                        }
                                                        setIsEditingBalance(false);
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
                                                    const currentValue = currency === 'USD' ? balanceCalculatorValueUSD : balanceCalculatorValueCOP;
                                                    setTempBalanceInput(currentValue.toString());
                                                    setIsEditingBalance(true);
                                                }}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <span style={{ fontSize: '36px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-1px' }}>
                                                    {currency === 'USD' ? '$' : ''}
                                                    {(currency === 'USD' ? balanceCalculatorValueUSD : balanceCalculatorValueCOP).toLocaleString(currency === 'USD' ? 'en-US' : 'es-CO')}
                                                </span>
                                                <p style={{ margin: '2px 0 0', fontSize: '14px', color: 'var(--text-tertiary)' }}>
                                                    {currency === 'USD' ? 'Dólares' : 'Pesos Colombianos'}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => {
                                            const increment = currency === 'USD' ? 100 : 100000;
                                            if (currency === 'USD') {
                                                setBalanceCalculatorValueUSD(prev => prev + increment);
                                            } else {
                                                setBalanceCalculatorValueCOP(prev => prev + increment);
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
                                        className="calculator-plus-btn"
                                    >
                                        <SFPlus size={24} />
                                    </button>
                                </div>

                                <button
                                    onClick={handleSaveBalanceUpdate}
                                    disabled={(currency === 'USD' ? balanceCalculatorValueUSD : balanceCalculatorValueCOP) <= 0 || isSaving}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '12px',
                                        background: isSaving ? 'var(--ios-green)' : 'rgba(255, 255, 255, 0.1)',
                                        color: isSaving ? '#fff' : 'var(--text-tertiary)',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        border: 'none',
                                        cursor: (currency === 'USD' ? balanceCalculatorValueUSD : balanceCalculatorValueCOP) > 0 && !isSaving ? 'pointer' : 'not-allowed',
                                        boxShadow: isSaving ? '0 4px 12px rgba(48, 219, 91, 0.25)' : 'none',
                                        marginBottom: '0',
                                        opacity: (currency === 'USD' ? balanceCalculatorValueUSD : balanceCalculatorValueCOP) > 0 ? 1 : 0.5,
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    Guardar Ingreso
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Vista Completa para agregar movimiento (Tipo Grid) */}
            {showAddModal && (
                <div 
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 50,
                        background: 'var(--bg-primary)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{ 
                        padding: '16px 20px',
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        borderBottom: '1px solid var(--glass-border)'
                    }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                {step === 1 ? 'Seleccionar Inversión' : step === 2 ? 'Detalle' : 'Monto'}
                            </h2>
                        </div>
                        <button
                            onClick={() => {
                                setShowAddModal(false);
                                setStep(1);
                                setAmount("");
                                setSelectedCategory(null);
                                setSelectedSubcategory(null);
                            }}
                            style={{ 
                                background: 'rgba(128,128,128,0.1)', 
                                border: 'none', 
                                width: '32px', 
                                height: '32px', 
                                borderRadius: '50%',
                                fontSize: '20px',
                                color: 'var(--text-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            ×
                        </button>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '20px', position: 'relative' }}>
                        {/* Paso 1: Selección de Categoría (Grid Uniforme) */}
                        {step === 1 && (
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(3, 1fr)', 
                                gap: '16px',
                                maxWidth: '600px',
                                margin: '0 auto'
                            }}>
                                {INVESTMENT_CATEGORIES.map((cat) => (
                                    <motion.button
                                        key={cat.id}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            setSelectedCategory(cat);
                                            if (cat.subcategories) {
                                                setStep(2);
                                            } else {
                                                setCalculatorMode('investment');
                                                setBalanceCalculatorValueCOP(0);
                                                setBalanceCalculatorValueUSD(0);
                                                setIsSaving(false);
                                                setBalanceCalculatorOpen(true);
                                            }
                                        }}
                                        style={{
                                            aspectRatio: '1',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '12px',
                                            borderRadius: '20px',
                                            border: '1px solid var(--glass-border)',
                                            background: 'rgba(255, 255, 255, 0.03)',
                                            color: 'var(--text-primary)',
                                            cursor: 'pointer',
                                            padding: '10px'
                                        }}
                                    >
                                        <span style={{ fontSize: '36px' }}>{cat.icon}</span>
                                        <span style={{ fontSize: '13px', fontWeight: '600' }}>{cat.label}</span>
                                    </motion.button>
                                ))}
                            </div>
                        )}

                        {/* Paso 2: Selección de Subcategoría (Grid Uniforme) */}
                        {step === 2 && selectedCategory && (
                            <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <button
                                    onClick={() => {
                                        setStep(1);
                                        setSelectedCategory(null);
                                        setSelectedSubcategory(null);
                                    }}
                                    style={{
                                        marginBottom: '20px',
                                        padding: '12px 20px',
                                        borderRadius: '12px',
                                        border: '1px solid var(--glass-border)',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        color: 'var(--text-primary)',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        alignSelf: 'flex-start'
                                    }}
                                >
                                    ← Volver a categorías
                                </button>
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(3, 1fr)', 
                                    gap: '16px',
                                    marginBottom: '20px'
                                }}>
                                    {selectedCategory.subcategories?.map((sub) => (
                                        <motion.button
                                            key={sub.id}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                setSelectedSubcategory(sub);
                                                setCalculatorMode('investment');
                                                setBalanceCalculatorValueCOP(0);
                                                setBalanceCalculatorValueUSD(0);
                                                setIsSaving(false);
                                                setBalanceCalculatorOpen(true);
                                            }}
                                            style={{
                                                aspectRatio: '1',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '12px',
                                                borderRadius: '20px',
                                                border: '1px solid var(--glass-border)',
                                                background: 'rgba(255, 255, 255, 0.03)',
                                                color: 'var(--text-primary)',
                                                cursor: 'pointer',
                                                padding: '10px'
                                            }}
                                        >
                                            <span style={{ fontSize: '36px' }}>{sub.icon}</span>
                                            <span style={{ fontSize: '13px', fontWeight: '600' }}>{sub.label}</span>
                                        </motion.button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => {
                                        setStep(1);
                                        setSelectedCategory(null);
                                    }}
                                    style={{
                                        marginTop: 'auto',
                                        padding: '16px',
                                        background: 'transparent',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '16px',
                                        color: 'var(--text-primary)',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ← Volver a categorías
                                </button>
                            </div>
                        )}

                        {/* Paso 3 eliminado - ahora se usa la calculadora */}
                        {false && (
                            <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div style={{ textAlign: 'center', padding: '30px', background: 'rgba(255,255,255,0.03)', borderRadius: '24px' }}>
                                    <span style={{ fontSize: '64px', display: 'block', marginBottom: '16px' }}>
                                        {selectedSubcategory?.icon || selectedCategory?.icon || '💰'}
                                    </span>
                                    <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                        {selectedSubcategory?.label || selectedCategory?.label || 'Inversión'}
                                    </p>
                                </div>

                                <div>
                                    <label style={{ 
                                        fontSize: '14px', 
                                        fontWeight: '600', 
                                        color: 'var(--text-tertiary)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        marginBottom: '12px',
                                        display: 'block'
                                    }}>
                                        Monto a invertir
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ 
                                            position: 'absolute', 
                                            left: '20px', 
                                            top: '50%', 
                                            transform: 'translateY(-50%)', 
                                            fontSize: '32px', 
                                            color: 'var(--text-tertiary)',
                                            fontWeight: '600'
                                        }}>$</span>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0"
                                            autoFocus
                                            style={{
                                                width: '100%',
                                                padding: '24px 24px 24px 50px',
                                                fontSize: '40px',
                                                fontWeight: '700',
                                                background: 'rgba(255, 255, 255, 0.06)',
                                                border: '1px solid var(--glass-border)',
                                                borderRadius: '24px',
                                                color: 'var(--text-primary)',
                                                outline: 'none',
                                                textAlign: 'left'
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleAddTransaction();
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (selectedCategory?.subcategories) {
                                                setStep(2);
                                                setSelectedSubcategory(null);
                                            } else {
                                                setStep(1);
                                                setSelectedCategory(null);
                                            }
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: '18px',
                                            borderRadius: '20px',
                                            border: '1px solid var(--glass-border)',
                                            background: 'transparent',
                                            color: 'var(--text-primary)',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Atrás
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleAddTransaction}
                                        disabled={!amount || parseFloat(amount) <= 0}
                                        style={{
                                            flex: 1,
                                            padding: '18px',
                                            borderRadius: '20px',
                                            border: 'none',
                                            background: amount && parseFloat(amount) > 0 ? 'var(--ios-blue)' : 'rgba(255, 255, 255, 0.1)',
                                            color: amount && parseFloat(amount) > 0 ? '#fff' : 'var(--text-tertiary)',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            cursor: amount && parseFloat(amount) > 0 ? 'pointer' : 'not-allowed',
                                            transition: 'all 0.2s',
                                            boxShadow: amount && parseFloat(amount) > 0 ? '0 8px 24px rgba(41, 151, 255, 0.3)' : 'none'
                                        }}
                                    >
                                        Confirmar
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Calculadora inversiones: overlay desenfoca fondo del modal (categorías), no vista principal */}
                        {balanceCalculatorOpen && calculatorMode === 'investment' && (
                            <AnimatePresence>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    onClick={() => setBalanceCalculatorOpen(false)}
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        zIndex: 20,
                                        display: 'flex',
                                        alignItems: 'flex-end',
                                        justifyContent: 'center',
                                        paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
                                        background: 'rgba(0,0,0,0.35)',
                                        backdropFilter: 'blur(20px)',
                                        WebkitBackdropFilter: 'blur(20px)',
                                    }}
                                >
                                    <motion.div
                                        initial={{ y: '100%', opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: '100%', opacity: 0 }}
                                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                        onClick={(e) => e.stopPropagation()}
                                        style={{
                                            width: '100%',
                                            maxWidth: '100%',
                                            borderRadius: '24px 24px 0 0',
                                            padding: '20px 24px',
                                            background: 'var(--bg-secondary)',
                                            borderTop: '1px solid var(--glass-border)',
                                            boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
                                        }}
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            {selectedCategory && (
                                                <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', marginBottom: '8px' }}>
                                                    <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>
                                                        {selectedSubcategory?.icon || selectedCategory.icon}
                                                    </span>
                                                    <p
                                                        ref={investmentTitleEditableRef}
                                                        contentEditable
                                                        suppressContentEditableWarning
                                                        style={{
                                                            margin: 0,
                                                            fontSize: '16px',
                                                            fontWeight: '600',
                                                            color: 'var(--text-primary)',
                                                            outline: 'none',
                                                            minHeight: '1.35em',
                                                            cursor: 'text',
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', gap: '4px', background: 'rgba(118, 118, 128, 0.12)', padding: '3px', borderRadius: '10px' }}>
                                                    <button
                                                        onClick={() => { setCurrency('USD'); setBalanceCalculatorValueUSD(0); }}
                                                        style={{ padding: '6px 16px', borderRadius: '8px', border: 'none', background: currency === 'USD' ? 'var(--bg-primary)' : 'transparent', color: currency === 'USD' ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: '13px', fontWeight: '600', boxShadow: currency === 'USD' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer' }}
                                                    >USD</button>
                                                    <button
                                                        onClick={() => { setCurrency('COP'); setBalanceCalculatorValueCOP(0); }}
                                                        style={{ padding: '6px 16px', borderRadius: '8px', border: 'none', background: currency === 'COP' ? 'var(--bg-primary)' : 'transparent', color: currency === 'COP' ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: '13px', fontWeight: '600', boxShadow: currency === 'COP' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer' }}
                                                    >COP</button>
                                                </div>
                                                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                                                    {currency === 'USD' ? `≈ $${(balanceCalculatorValueUSD * exchangeRate).toLocaleString('es-CO')} COP` : `≈ $${(balanceCalculatorValueCOP / exchangeRate).toLocaleString('en-US', { maximumFractionDigits: 2 })} USD`}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '4px 0' }}>
                                                <button
                                                    onClick={() => {
                                                        setMinusButtonActive(true);
                                                        const dec = currency === 'USD' ? 10 : 10000;
                                                        if (currency === 'USD') setBalanceCalculatorValueUSD(p => Math.max(0, p - dec));
                                                        else setBalanceCalculatorValueCOP(p => Math.max(0, p - dec));
                                                        setTimeout(() => setMinusButtonActive(false), 200);
                                                    }}
                                                    style={{ width: '50px', height: '50px', borderRadius: '50%', border: 'none', background: 'transparent', fontSize: '24px', color: theme === 'dark' ? (minusButtonActive ? '#ff453a' : '#fff') : '#000', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                ><SFMinus size={24} /></button>
                                                <div style={{ flex: 1, textAlign: 'center' }}>
                                                    <span style={{ fontSize: '36px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                                        {currency === 'USD' ? '$' : ''}{(currency === 'USD' ? balanceCalculatorValueUSD : balanceCalculatorValueCOP).toLocaleString(currency === 'USD' ? 'en-US' : 'es-CO')}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const inc = currency === 'USD' ? 100 : 50000;
                                                        if (currency === 'USD') setBalanceCalculatorValueUSD(p => p + inc);
                                                        else setBalanceCalculatorValueCOP(p => p + inc);
                                                    }}
                                                    style={{ width: '50px', height: '50px', borderRadius: '50%', border: 'none', background: 'transparent', fontSize: '24px', color: 'var(--ios-blue)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                ><SFPlus size={24} /></button>
                                            </div>
                                            <button
                                                onClick={handleSaveBalanceUpdate}
                                                disabled={(currency === 'USD' ? balanceCalculatorValueUSD : balanceCalculatorValueCOP) <= 0 || isSaving}
                                                style={{
                                                    width: '100%', padding: '10px', borderRadius: '12px',
                                                    background: isSaving ? 'var(--ios-green)' : 'rgba(255, 255, 255, 0.1)',
                                                    color: isSaving ? '#fff' : 'var(--text-tertiary)', fontSize: '14px', fontWeight: '600', border: 'none',
                                                    cursor: (currency === 'USD' ? balanceCalculatorValueUSD : balanceCalculatorValueCOP) > 0 && !isSaving ? 'pointer' : 'not-allowed',
                                                    opacity: (currency === 'USD' ? balanceCalculatorValueUSD : balanceCalculatorValueCOP) > 0 ? 1 : 0.5,
                                                }}
                                            >
                                                {isSaving ? 'Guardando...' : 'Guardar Inversión'}
                                            </button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            )}

            {/* Modal de Resumen Financiero Detallado - Full Screen Elegante */}
            <AnimatePresence>
                {showInvestmentsModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 1000,
                            background: 'var(--bg-primary)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Header elegante */}
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            padding: '20px 24px',
                            borderBottom: '1px solid var(--glass-border)',
                            background: 'var(--bg-secondary)'
                        }}>
                            <div>
                                <h2 style={{ 
                                    margin: 0, 
                                    fontSize: '24px', 
                                    fontWeight: '700',
                                    color: 'var(--text-primary)',
                                    marginBottom: '4px'
                                }}>
                                    Resumen Financiero
                                </h2>
                                <p style={{
                                    margin: 0,
                                    fontSize: '14px',
                                    color: 'var(--text-tertiary)',
                                    fontWeight: '500'
                                }}>
                                    Balance General
                                </p>
                            </div>
                            <button
                                onClick={() => setShowInvestmentsModal(false)}
                                aria-label="Cerrar"
                                style={{ 
                                    width: '36px', 
                                    height: '36px',
                                    borderRadius: '10px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid var(--glass-border)',
                                    color: 'var(--text-primary)',
                                    fontSize: '20px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {/* Contenido con scroll: Servicios | Inversiones en dos columnas */}
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '24px',
                            padding: '24px',
                            flex: 1,
                            overflowY: 'auto',
                            background: 'var(--bg-primary)'
                        }}>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                                    gap: '20px',
                                    alignItems: 'start',
                                }}
                            >
                                {/* Columna Servicios */}
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '16px',
                                        minWidth: 0,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '10px',
                                            padding: '0',
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                            }}
                                        >
                                            <span style={{ color: 'var(--ios-red)' }}>
                                                <SFArrowDownRight size={18} />
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: '10px',
                                                    fontWeight: '600',
                                                    color: 'var(--text-tertiary)',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.8px',
                                                }}
                                            >
                                                Servicios
                                            </span>
                                        </div>
                                        <h3
                                            style={{
                                                margin: 0,
                                                fontSize: '24px',
                                                fontWeight: '700',
                                                color: 'var(--ios-red)',
                                                lineHeight: '1.1',
                                            }}
                                        >
                                            ${servicesTotal.toLocaleString('es-CO')}
                                        </h3>
                                        <span
                                            style={{
                                                fontSize: '10px',
                                                color: 'var(--text-tertiary)',
                                                opacity: 0.8,
                                            }}
                                        >
                                            Gastos en servicios
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(108px, 1fr))',
                                            gap: '14px',
                                        }}
                                    >
                                        {groupedServices.length > 0 ? (
                                            groupedServices.map((row, index) => (
                                                <div
                                                    key={`${row.title}-svc-${index}`}
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        padding: '0',
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            fontSize: '30px',
                                                            textAlign: 'center',
                                                            lineHeight: '1',
                                                        }}
                                                    >
                                                        {row.icon}
                                                    </div>
                                                    <p
                                                        style={{
                                                            margin: 0,
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            color: 'var(--text-primary)',
                                                            textAlign: 'center',
                                                            lineHeight: '1.3',
                                                        }}
                                                    >
                                                        {row.title}
                                                    </p>
                                                    <p
                                                        style={{
                                                            margin: 0,
                                                            fontSize: '15px',
                                                            fontWeight: '700',
                                                            color: 'var(--ios-red)',
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        ${row.totalAmount.toLocaleString('es-CO')}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <div
                                                style={{
                                                    gridColumn: '1 / -1',
                                                    padding: '20px 12px',
                                                    textAlign: 'center',
                                                    color: 'var(--text-tertiary)',
                                                    fontSize: '13px',
                                                }}
                                            >
                                                No hay gastos en servicios registrados
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Columna Inversiones */}
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '16px',
                                        minWidth: 0,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '10px',
                                            padding: '0',
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                            }}
                                        >
                                            <span style={{ color: 'var(--ios-blue)' }}>
                                                <SFTrendingUp size={18} />
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: '10px',
                                                    fontWeight: '600',
                                                    color: 'var(--text-tertiary)',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.8px',
                                                }}
                                            >
                                                Inversiones
                                            </span>
                                        </div>
                                        <h3
                                            style={{
                                                margin: 0,
                                                fontSize: '24px',
                                                fontWeight: '700',
                                                color: 'var(--ios-blue)',
                                                lineHeight: '1.1',
                                            }}
                                        >
                                            ${investmentsTotal.toLocaleString('es-CO')}
                                        </h3>
                                        <span
                                            style={{
                                                fontSize: '10px',
                                                color: 'var(--text-tertiary)',
                                                opacity: 0.8,
                                            }}
                                        >
                                            Total invertido
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(108px, 1fr))',
                                            gap: '14px',
                                        }}
                                    >
                                        {groupedInvestments.length > 0 ? (
                                            groupedInvestments.map((inv, index) => (
                                                <div
                                                    key={`${inv.title}-${index}`}
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        padding: '0',
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            fontSize: '30px',
                                                            textAlign: 'center',
                                                            lineHeight: '1',
                                                        }}
                                                    >
                                                        {inv.icon}
                                                    </div>
                                                    <p
                                                        style={{
                                                            margin: 0,
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            color: 'var(--text-primary)',
                                                            textAlign: 'center',
                                                            lineHeight: '1.3',
                                                        }}
                                                    >
                                                        {inv.title}
                                                    </p>
                                                    <p
                                                        style={{
                                                            margin: 0,
                                                            fontSize: '15px',
                                                            fontWeight: '700',
                                                            color: 'var(--ios-blue)',
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        ${inv.totalAmount.toLocaleString('es-CO')}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <div
                                                style={{
                                                    gridColumn: '1 / -1',
                                                    padding: '20px 12px',
                                                    textAlign: 'center',
                                                    color: 'var(--text-tertiary)',
                                                    fontSize: '13px',
                                                }}
                                            >
                                                No hay inversiones registradas
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showPurchasesModal && (
                    <motion.div
                        key="purchases-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 1100,
                            background: 'rgba(0,0,0,0.45)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '16px',
                            paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
                        }}
                        onClick={() => {
                            setShowPurchasesModal(false);
                            setPurchasesModalCategory(null);
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.96, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.96, opacity: 0 }}
                            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                width: '100%',
                                maxWidth: '420px',
                                maxHeight: 'min(85vh, 620px)',
                                display: 'flex',
                                flexDirection: 'column',
                                background: 'var(--bg-secondary)',
                                borderRadius: '20px',
                                border: '1px solid var(--glass-border)',
                                boxShadow: '0 16px 48px rgba(0,0,0,0.25)',
                                overflow: 'hidden',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '12px',
                                    padding: '16px 18px',
                                    borderBottom: '1px solid var(--glass-border)',
                                    flexShrink: 0,
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                    {purchasesModalCategory ? (
                                        <button
                                            type="button"
                                            onClick={() => setPurchasesModalCategory(null)}
                                            style={{
                                                padding: '8px 10px',
                                                borderRadius: '10px',
                                                border: '1px solid var(--glass-border)',
                                                background: 'rgba(255,255,255,0.06)',
                                                color: 'var(--ios-blue)',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                flexShrink: 0,
                                            }}
                                        >
                                            Volver
                                        </button>
                                    ) : null}
                                    <h2
                                        style={{
                                            margin: 0,
                                            fontSize: '18px',
                                            fontWeight: '700',
                                            color: 'var(--text-primary)',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {purchasesModalCategory ? (
                                            <>
                                                <span style={{ marginRight: '8px' }}>
                                                    {INVESTMENT_CATEGORIES.find((c) => c.label === purchasesModalCategory)?.icon ?? '🛒'}
                                                </span>
                                                {purchasesModalCategory}
                                            </>
                                        ) : (
                                            'Registro de compras'
                                        )}
                                    </h2>
                                </div>
                                <button
                                    type="button"
                                    aria-label="Cerrar"
                                    onClick={() => {
                                        setShowPurchasesModal(false);
                                        setPurchasesModalCategory(null);
                                    }}
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '10px',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid var(--glass-border)',
                                        color: 'var(--text-primary)',
                                        fontSize: '20px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                            <div
                                style={{
                                    overflowY: 'auto',
                                    flex: 1,
                                    padding: '12px 16px 16px',
                                }}
                            >
                                {!purchasesModalCategory ? (
                                    purchaseCategorySummaries.length === 0 ? (
                                        <p
                                            style={{
                                                margin: '16px 0',
                                                textAlign: 'center',
                                                color: 'var(--text-tertiary)',
                                                fontSize: '14px',
                                            }}
                                        >
                                            No hay compras registradas en ropa, comida o compras.
                                        </p>
                                    ) : (
                                        <div className="list-card" style={{ margin: 0 }}>
                                            {purchaseCategorySummaries.map((s) => (
                                                <button
                                                    key={s.category}
                                                    type="button"
                                                    onClick={() => setPurchasesModalCategory(s.category)}
                                                    className="list-item"
                                                    style={{
                                                        width: '100%',
                                                        border: 'none',
                                                        background: 'transparent',
                                                        cursor: 'pointer',
                                                        textAlign: 'left',
                                                    }}
                                                >
                                                    <div
                                                        className="list-icon"
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '18px',
                                                        }}
                                                    >
                                                        {s.icon}
                                                    </div>
                                                    <div className="list-content">
                                                        <p>{s.category}</p>
                                                        <span>Toca para ver movimientos</span>
                                                    </div>
                                                    <span className="list-time positive">
                                                        ${s.total.toLocaleString('es-CO')}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )
                                ) : purchasesModalDetailTransactions.length === 0 ? (
                                    <p
                                        style={{
                                            margin: '16px 0',
                                            textAlign: 'center',
                                            color: 'var(--text-tertiary)',
                                            fontSize: '14px',
                                        }}
                                    >
                                        No hay movimientos en esta categoría.
                                    </p>
                                ) : (
                                    <div className="list-card" style={{ margin: 0 }}>
                                        {purchasesModalDetailTransactions.map((tx) => (
                                            <PurchaseDetailRow
                                                key={tx.id}
                                                tx={tx}
                                                onTitleCommit={(id, title) => updateTransaction(id, { title })}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showInvestmentsRegistryModal && (
                    <motion.div
                        key="investments-registry-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 1100,
                            background: 'rgba(0,0,0,0.45)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '16px',
                            paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
                        }}
                        onClick={() => {
                            setShowInvestmentsRegistryModal(false);
                            setInvestmentsRegistryModalCategory(null);
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.96, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.96, opacity: 0 }}
                            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                width: '100%',
                                maxWidth: '420px',
                                maxHeight: 'min(85vh, 620px)',
                                display: 'flex',
                                flexDirection: 'column',
                                background: 'var(--bg-secondary)',
                                borderRadius: '20px',
                                border: '1px solid var(--glass-border)',
                                boxShadow: '0 16px 48px rgba(0,0,0,0.25)',
                                overflow: 'hidden',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '12px',
                                    padding: '16px 18px',
                                    borderBottom: '1px solid var(--glass-border)',
                                    flexShrink: 0,
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                    {investmentsRegistryModalCategory ? (
                                        <button
                                            type="button"
                                            onClick={() => setInvestmentsRegistryModalCategory(null)}
                                            style={{
                                                padding: '8px 10px',
                                                borderRadius: '10px',
                                                border: '1px solid var(--glass-border)',
                                                background: 'rgba(255,255,255,0.06)',
                                                color: 'var(--ios-blue)',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                flexShrink: 0,
                                            }}
                                        >
                                            Volver
                                        </button>
                                    ) : null}
                                    <h2
                                        style={{
                                            margin: 0,
                                            fontSize: '18px',
                                            fontWeight: '700',
                                            color: 'var(--text-primary)',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {investmentsRegistryModalCategory ? (
                                            <>
                                                <span style={{ marginRight: '8px' }}>
                                                    {INVESTMENT_CATEGORIES.find((c) => c.label === investmentsRegistryModalCategory)
                                                        ?.icon ?? '💰'}
                                                </span>
                                                {investmentsRegistryModalCategory}
                                            </>
                                        ) : (
                                            'Registro de inversiones'
                                        )}
                                    </h2>
                                </div>
                                <button
                                    type="button"
                                    aria-label="Cerrar"
                                    onClick={() => {
                                        setShowInvestmentsRegistryModal(false);
                                        setInvestmentsRegistryModalCategory(null);
                                    }}
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '10px',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid var(--glass-border)',
                                        color: 'var(--text-primary)',
                                        fontSize: '20px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                            <div
                                style={{
                                    overflowY: 'auto',
                                    flex: 1,
                                    padding: '12px 16px 16px',
                                }}
                            >
                                {!investmentsRegistryModalCategory ? (
                                    investmentCategorySummaries.length === 0 ? (
                                        <p
                                            style={{
                                                margin: '16px 0',
                                                textAlign: 'center',
                                                color: 'var(--text-tertiary)',
                                                fontSize: '14px',
                                            }}
                                        >
                                            No hay inversiones registradas.
                                        </p>
                                    ) : (
                                        <div className="list-card" style={{ margin: 0 }}>
                                            {investmentCategorySummaries.map((s) => (
                                                <button
                                                    key={s.category}
                                                    type="button"
                                                    onClick={() => setInvestmentsRegistryModalCategory(s.category)}
                                                    className="list-item"
                                                    style={{
                                                        width: '100%',
                                                        border: 'none',
                                                        background: 'transparent',
                                                        cursor: 'pointer',
                                                        textAlign: 'left',
                                                    }}
                                                >
                                                    <div
                                                        className="list-icon"
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '18px',
                                                        }}
                                                    >
                                                        {s.icon}
                                                    </div>
                                                    <div className="list-content">
                                                        <p>{s.category}</p>
                                                        <span>Toca para ver movimientos</span>
                                                    </div>
                                                    <span className="list-time positive">
                                                        ${s.total.toLocaleString('es-CO')}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )
                                ) : investmentsRegistryDetailTransactions.length === 0 ? (
                                    <p
                                        style={{
                                            margin: '16px 0',
                                            textAlign: 'center',
                                            color: 'var(--text-tertiary)',
                                            fontSize: '14px',
                                        }}
                                    >
                                        No hay movimientos en esta categoría.
                                    </p>
                                ) : (
                                    <div className="list-card" style={{ margin: 0 }}>
                                        {investmentsRegistryDetailTransactions.map((tx) => (
                                            <PurchaseDetailRow
                                                key={tx.id}
                                                tx={tx}
                                                onTitleCommit={(id, title) => updateTransaction(id, { title })}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const Calendar = () => {
    // Logs de desarrollo deshabilitados para optimizar rendimiento
    const todayHook = useToday();
    // Validación defensiva para asegurar que today sea una fecha válida
    const today = (todayHook && todayHook instanceof Date && !isNaN(todayHook.getTime())) 
        ? todayHook 
        : new Date();
    // Logs de desarrollo deshabilitados
    const { theme } = useTheme();
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [tasksOpen, setTasksOpen] = useState(false);
    const [editingTaskInModal, setEditingTaskInModal] = useState<string | null>(null);
    const [showTaskForm, setShowTaskForm] = useState(false);
    /** Calendario a pantalla completa dentro de la tarjeta de tareas puntuales */
    const [pickingTaskDate, setPickingTaskDate] = useState(false);
    const taskPunctualCalendarShellRef = useRef<HTMLDivElement | null>(null);
    const taskPunctualHeroCardRef = useRef<HTMLDivElement | null>(null);
    const prevShowTaskFormForScrollRef = useRef(false);
    /** Hero Eventos: default = resumen; pick-date = calendario inline; form = 3 bloques nuevo evento */
    const [eventHeroPhase, setEventHeroPhase] = useState<'default' | 'pick-date' | 'form'>('default');
    const eventsHeroCardRef = useRef<HTMLDivElement | null>(null);
    const eventsHeroCalendarShellRef = useRef<HTMLDivElement | null>(null);
    // completedModalOpen removed as it is now unused
    const [completedModalFilter, setCompletedModalFilter] = useState<'today' | 'tomorrow' | 'all' | 'tasks' | 'events' | null>(null);
    const [progressModalOpen, setProgressModalOpen] = useState(false);
    const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ type: 'task' | 'event'; id: string } | null>(null);
    const [taskTitle, setTaskTitle] = useState("");
    const [taskDate, setTaskDate] = useState("");
    const [taskDateIso, setTaskDateIso] = useState("");
    const [taskTime, setTaskTime] = useState("");
    const [taskPriority, setTaskPriority] = useState("Media");
    const [taskRecurringDays, setTaskRecurringDays] = useState<number[]>([]); // 0=Dom, 1=Lun, ..., 6=Sáb
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [pickerMode, setPickerMode] = useState<"date" | "time" | null>(null);
    const [calendarMode, setCalendarMode] = useState<"calendar" | "event">("calendar");
    const [calendarView, setCalendarView] = useState<"semana" | "mes" | "año">("mes");
    const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);
    const [eventDate, setEventDate] = useState<Date | null>(null);
    const [eventTitle, setEventTitle] = useState("");
    const [eventDescription, setEventDescription] = useState("");
    const [eventTime, setEventTime] = useState("");
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editingEventId, setEditingEventId] = useState<string | null>(null);
    const [eventsBlockUnlocked, setEventsBlockUnlocked] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);
    const [pinInput, setPinInput] = useState('');
    const { tasks, events, addTask, updateTask, deleteTask, addEvent, updateEvent, deleteEvent } = useAppData();

    // PIN para desbloquear eventos:
    // - Primera vez: crear PIN (setup) y confirmar (confirm)
    // - Luego: ingresar PIN (unlock)
    const [pinMode, setPinMode] = useState<'setup' | 'confirm' | 'unlock'>('unlock');
    const [pinFirstEntry, setPinFirstEntry] = useState('');
    // pinError se usa solo para un “flash” visual (sin texto)
    const [pinError, setPinError] = useState<string | null>(null);

    const getStoredPin = useCallback((): string | null => {
        try {
            return localStorage.getItem('events-pin');
        } catch {
            return null;
        }
    }, []);

    const closePinModal = useCallback(() => {
        setShowPinModal(false);
        setPinInput('');
        setPinFirstEntry('');
        setPinError(null);
        setPinMode('unlock');
    }, []);

    const openPinModalForEvents = useCallback(() => {
        const stored = getStoredPin();
        setPinInput('');
        setPinFirstEntry('');
        setPinError(null);
        setPinMode(stored ? 'unlock' : 'setup');
        setShowPinModal(true);
    }, [getStoredPin]);

    const processEnteredPin = useCallback((entered: string) => {
        const stored = getStoredPin();

        if (pinMode === 'unlock') {
            if (stored && entered === stored) {
                setEventsBlockUnlocked(true);
                closePinModal();
            } else {
                // error sutil (sin texto en UI)
                setPinError('1');
                setPinInput('');
            }
            return;
        }

        if (pinMode === 'setup') {
            setPinFirstEntry(entered);
            setPinInput('');
            setPinError(null);
            setPinMode('confirm');
            return;
        }

        // confirm
        if (entered === pinFirstEntry && entered.length === 4) {
            try {
                localStorage.setItem('events-pin', pinFirstEntry);
            } catch {
                // si no hay localStorage, igual desbloqueamos esta sesión
            }
            setEventsBlockUnlocked(true);
            closePinModal();
        } else {
            // error sutil (sin texto en UI)
            setPinError('1');
            setPinInput('');
            setPinFirstEntry('');
            setPinMode('setup');
        }
    }, [closePinModal, getStoredPin, pinFirstEntry, pinMode]);

    const handlePinInput = useCallback((digit: string) => {
        if (pinInput.length >= 4) return;
        setPinError(null);
        const next = `${pinInput}${digit}`;
        setPinInput(next);
        if (next.length === 4) {
            // dejar que se pinte el último punto
            setTimeout(() => processEnteredPin(next), 90);
        }
    }, [pinInput, processEnteredPin]);

    const handlePinBackspace = useCallback(() => {
        setPinError(null);
        setPinInput(prev => prev.slice(0, -1));
    }, []);

    // Logs de desarrollo deshabilitados para optimizar rendimiento

    // Validaciones defensivas para evitar errores - usar useMemo para reactividad
    const safeTasks = useMemo(() => {
        // Logs de desarrollo deshabilitados
        return Array.isArray(tasks) ? tasks : [];
    }, [tasks]);
    const safeEvents = useMemo(() => {
        // Logs de desarrollo deshabilitados
        return Array.isArray(events) ? events : [];
    }, [events]);

    // Filtrar eventos del día actual (usando hora local, no UTC)
    const formatDateLocal = useCallback((date: Date) => {
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
    }, []);

    // Función helper para parsear fechas desde strings "YYYY-MM-DD" sin problemas de zona horaria
    const parseDateFromString = useCallback((dateString: string): Date => {
        // Si el string está en formato "YYYY-MM-DD", parsearlo correctamente
        const parts = dateString.split('-');
        if (parts.length === 3) {
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // Los meses en Date son 0-indexed
            const day = parseInt(parts[2], 10);
            // Crear fecha en hora local (no UTC) para evitar problemas de zona horaria
            return new Date(year, month, day);
        }
        // Si no está en el formato esperado, intentar parsearlo normalmente
        return new Date(dateString);
    }, []);

    const taskDateButtonLabel = useMemo(() => {
        if (!taskDateIso) return 'Fecha (opcional)';
        try {
            const d = parseDateFromString(taskDateIso);
            return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).replace('.', '');
        } catch {
            return taskDateIso;
        }
    }, [taskDateIso, parseDateFromString]);

    const todayDateString = useMemo(() => formatDateLocal(today), [today, formatDateLocal]);
    // Eventos de hoy (para compatibilidad con código existente)
    const dayEvents = useMemo(() => {
        if (!Array.isArray(safeEvents)) {
            console.log('⚠️ safeEvents no es un array:', safeEvents);
            return [];
        }
        const filtered = safeEvents
            .filter((event) => {
                if (!event) return false;
                const matches = event.event_date === todayDateString && !event.completed;
                if (matches) {
                    console.log('✅ Evento encontrado para hoy:', {
                        id: event.id,
                        title: event.title,
                        event_date: event.event_date,
                        todayDateString: todayDateString
                    });
                }
                return matches;
            })
            .map((event) => ({
                id: event.id || '',
                title: event.title || '',
                meta: event.description || '',
                time: event.event_time || '',
                event_date: event.event_date || ''
            }));
        console.log(`📅 Eventos de hoy (${todayDateString}):`, filtered.length, 'de', safeEvents.length, 'total');
        return filtered;
    }, [safeEvents, todayDateString]);

    // Todos los eventos no completados (para mostrar en el bloque de eventos)
    const allUpcomingEvents = useMemo(() => {
        if (!Array.isArray(safeEvents)) return [];
        return safeEvents
            .filter((event) => {
                if (!event || event.completed) return false;
                // Solo mostrar eventos de hoy o futuros
                const eventDate = event.event_date;
                if (!eventDate) return false;
                // Comparar fechas: si es hoy o futuro, incluirlo
                const eventDateObj = parseDateFromString(eventDate);
                const todayDateObj = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                return eventDateObj >= todayDateObj;
            })
            .sort((a, b) => {
                // Ordenar por fecha (más cercanos primero)
                const dateA = parseDateFromString(a.event_date || '');
                const dateB = parseDateFromString(b.event_date || '');
                return dateA.getTime() - dateB.getTime();
            })
            .map((event) => ({
                id: event.id || '',
                title: event.title || '',
                meta: event.description || '',
                time: event.event_time || '',
                event_date: event.event_date || ''
            }));
    }, [safeEvents, today, parseDateFromString]);
    

    // Todos los eventos completados (histórico); sin exigir event_date
    const allCompletedEvents = useMemo(() => {
        if (!Array.isArray(safeEvents)) return [];
        return safeEvents
            .filter((event) => event && event.completed)
            .map((event) => ({
                id: event.id || '',
                title: event.title || '',
                meta: event.description || '',
                time: event.event_time || '',
                event_date: event.event_date || ''
            }))
            .sort((a, b) => {
                try {
                    const tA = a.event_date ? parseDateFromString(a.event_date).getTime() : NaN;
                    const tB = b.event_date ? parseDateFromString(b.event_date).getTime() : NaN;
                    const validA = !isNaN(tA);
                    const validB = !isNaN(tB);
                    if (validA && validB) return tB - tA;
                    if (validA && !validB) return -1;
                    if (!validA && validB) return 1;
                    return 0;
                } catch {
                    return 0;
                }
            });
    }, [safeEvents, parseDateFromString]);

    /** Hoy solo si la tarea es de hoy; si no, la fecha real (ej. "27 de enero"). */
    const getTaskMetaDisplay = useCallback((meta: string | undefined, todayStr: string): string => {
        if (!meta) return 'Sin fecha';
        const isoMatch = meta.match(/(\d{4}-\d{2}-\d{2})/);
        const iso = isoMatch?.[1];
        const parts = meta.split(' · ').map(p => p.trim()).filter(Boolean);
        const lastIsIso = /^\d{4}-\d{2}-\d{2}$/.test(parts[parts.length - 1] || '');
        const rest = lastIsIso && parts.length > 1 ? parts.slice(0, -1) : parts;
        let time = '';
        if (rest.length >= 2 && /^\d{2}:\d{2}$/.test(rest[0])) time = rest[0];
        if (!iso) return rest.join(' · ') || meta.replace(/\s·\s\d{4}-\d{2}-\d{2}$/, '').trim() || 'Sin fecha';
        const isToday = iso === todayStr;
        const dateObj = parseDateFromString(iso);
        const dateLabel = isToday ? 'Hoy' : dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
        if (time) return `${time} · ${dateLabel}`;
        return dateLabel;
    }, [parseDateFromString]);

    // Función para extraer fecha de una tarea desde el campo meta
    const extractTaskDate = useCallback((task: typeof safeTasks[0]): string | null => {
        if (!task?.meta) return null;
        const meta = task.meta;

        try {
            // Recurrentes: el día lo define RECURRING:, no la fecha ISO auxiliar del meta
            if (meta.includes('RECURRING:')) {
                return null;
            }

            // Preferir la última fecha ISO (formato guardado: "… · YYYY-MM-DD" es la fecha de la tarea)
            const isoDates = Array.from(meta.matchAll(/(\d{4}-\d{2}-\d{2})/g), (m) => m[1]);
            if (isoDates.length > 0) {
                return isoDates[isoDates.length - 1];
            }

            // Texto "Hoy" sin ISO (meta legacy)
            if (meta.toLowerCase().includes('hoy')) {
                return todayDateString;
            }

            // Buscar patrones de fecha DD MMM (ej: "15 ene")
            const shortDateMatch = meta.match(/(\d{1,2})\s+(\w{3})/);
            if (shortDateMatch) {
                const day = shortDateMatch[1];
                const monthName = shortDateMatch[2].toLowerCase();
                const monthMap: { [key: string]: string } = {
                    'ene': '01', 'feb': '02', 'mar': '03', 'abr': '04', 'may': '05', 'jun': '06',
                    'jul': '07', 'ago': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dic': '12'
                };
                const month = monthMap[monthName];
                if (month) {
                    const year = today.getFullYear();
                    return `${year}-${month}-${day.padStart(2, '0')}`;
                }
            }
            
            // Buscar patrones de fecha DD/MM/YYYY
            const slashDateMatch = meta.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
            if (slashDateMatch) {
                const day = slashDateMatch[1].padStart(2, '0');
                const month = slashDateMatch[2].padStart(2, '0');
                const year = slashDateMatch[3];
                return `${year}-${month}-${day}`;
            }
        } catch (error) {
            // Error silenciado para optimizar rendimiento
            return null;
        }
        
        return null;
    }, [todayDateString, today]);

    // Calcular fecha de mañana
    const tomorrowDate = useMemo(() => {
        try {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const result = formatDateLocal(tomorrow);
            return result;
        } catch (error) {
            const fallback = new Date();
            fallback.setDate(fallback.getDate() + 1);
            return formatDateLocal(fallback);
        }
    }, [today, formatDateLocal]);

    /**
     * Tareas puntuales con fecha explícita = hoy (sin recurrentes).
     * El progreso del hero y "N tareas completadas" reflejan solo esas tareas;
     * las recurrentes viven en otro flujo y mezclarlas daba 2/3 en vez de 1/2, etc.
     */
    const tasksForCalendarDay = useMemo(() => {
        return safeTasks.filter((task) => {
            if (!task) return false;
            if (task.meta?.includes('RECURRING:')) return false;
            const d = extractTaskDate(task);
            return d === todayDateString;
        });
    }, [safeTasks, todayDateString, extractTaskDate]);

    const completedOnCalendarDayCount = useMemo(
        () => tasksForCalendarDay.filter((t) => t.completed).length,
        [tasksForCalendarDay]
    );

    const tomorrowTasks = useMemo(() => {
        return safeTasks.filter(task => {
            if (!task) return false;
            const taskDate = extractTaskDate(task);
            return taskDate === tomorrowDate;
        });
    }, [safeTasks, extractTaskDate, tomorrowDate]);

    // Filtrar tareas: pendientes (no completadas) y completadas
    // Para tareas recurrentes, solo mostrar las del día actual
    const pendingTasks = useMemo(() => {
        const todayDayOfWeek = today.getDay();
        return safeTasks.filter(task => {
            if (!task || task.completed) return false;
            
            // Verificar si es una tarea recurrente
            const recurringMatch = task.meta?.match(/RECURRING:([0-6,]+)/);
            if (recurringMatch) {
                const recurringDays = recurringMatch[1].split(',').map(d => parseInt(d, 10));
                // Solo incluir si el día de hoy está en los días recurrentes
                return recurringDays.includes(todayDayOfWeek);
            }
            
            const taskDate = extractTaskDate(task);
            return taskDate === null || taskDate === todayDateString;
        });
    }, [safeTasks, today, todayDateString, extractTaskDate]);
    
    /** Modal Progreso: todas las tareas con completed=true (histórico en BD). */
    const allCompletedTasksHistory = useMemo(
        () => safeTasks.filter((task) => task && task.completed),
        [safeTasks]
    );

    /** Fecha ISO para agrupar en modal / promedio: extractTaskDate o primer ISO en meta (recurrentes). */
    const resolveTaskHistoryDate = useCallback((task: typeof safeTasks[0]): string | null => {
        if (!task) return null;
        const fromExtract = extractTaskDate(task);
        if (fromExtract) return fromExtract;
        const iso = task.meta?.match(/(\d{4}-\d{2}-\d{2})/)?.[1];
        return iso ?? null;
    }, [extractTaskDate]);

    // Promedio tareas/día sobre tareas con fecha asociable (histórico)
    const tasksPerDayAverage = useMemo(() => {
        if (allCompletedTasksHistory.length === 0) return 0;
        const tasksByDate = new Map<string, number>();
        allCompletedTasksHistory.forEach((task) => {
            if (!task) return;
            const taskDate = resolveTaskHistoryDate(task);
            if (taskDate) {
                tasksByDate.set(taskDate, (tasksByDate.get(taskDate) || 0) + 1);
            }
        });
        if (tasksByDate.size === 0) return 0;
        let totalWithDate = 0;
        tasksByDate.forEach((n) => {
            totalWithDate += n;
        });
        return Number((totalWithDate / tasksByDate.size).toFixed(1));
    }, [allCompletedTasksHistory, resolveTaskHistoryDate]);
    
    const visibleTasks = useMemo(() => pendingTasks.slice(0, 3), [pendingTasks]);
    
    // Calcular contadores con useMemo para que se actualicen automáticamente
    const pendingCount = useMemo(() => pendingTasks.length, [pendingTasks]);
    // Contar todos los eventos no completados (hoy y futuros)
    const eventsCount = useMemo(() => allUpcomingEvents.length, [allUpcomingEvents.length]);
    
    // Progreso y texto "completadas": solo tareas puntuales de hoy (tasksForCalendarDay).
    const progressData = useMemo(() => {
        const total = tasksForCalendarDay.length;
        const completed = tasksForCalendarDay.filter((t) => t.completed).length;
        if (total === 0) {
            return {
                percentage: 0,
                percentageText: '0% completado',
                total: 0,
                completed: 0,
                allCompleted: false,
                label: 'Progreso de hoy',
                state: 'today' as const
            };
        }
        const percentage = Math.round((completed / total) * 100);
        const allCompleted = completed === total;
        return {
            percentage,
            percentageText: allCompleted ? '100% completado' : `${percentage}% completado`,
            total,
            completed,
            allCompleted,
            label: 'Progreso de hoy',
            state: 'today' as const
        };
    }, [tasksForCalendarDay]);
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

    // calendarYears removido - no se usa actualmente
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
            const totalPending = pendingCount || 0; // Solo tareas, no eventos
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
        // Solo limpiar campos si no estamos editando un evento
        if (!calendarOpen || editingEventId) return;
        setCalendarMode("calendar");
        setEventDate(null);
        setEventTitle("");
        setEventDescription("");
        setEventTime("");
        setEditingEventId(null);
    }, [calendarOpen, editingEventId]);

    const handleSaveTask = () => {
        // Validar que el título esté presente
        if (!taskTitle.trim()) {
            alert("Por favor, ingresa un título para la tarea");
            return;
        }

        const dateToUse: Date = taskDateIso ? parseDateFromString(taskDateIso) : today;
        const formattedDate = dateToUse.toLocaleDateString("es-ES", { day: "numeric", month: "short" }).replace(".", "");

        // Determinar si es "hoy"
        const isToday = dateToUse.getDate() === today.getDate() &&
            dateToUse.getMonth() === today.getMonth() &&
            dateToUse.getFullYear() === today.getFullYear();

        const isoDate = formatDateLocal(dateToUse);
        
        // Si hay días recurrentes seleccionados, crear una sola tarea con patrón de recurrencia
        if (taskRecurringDays.length > 0) {
            // Formatear meta con días recurrentes: hora · RECURRING:0,1,2 · YYYY-MM-DD (fecha base)
            let meta = "";
            const daysStr = taskRecurringDays.sort((a, b) => a - b).join(',');
            if (taskTime) {
                meta = `${taskTime} · RECURRING:${daysStr} · ${isoDate}`;
            } else {
                meta = `RECURRING:${daysStr} · ${isoDate}`;
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
        } else {
            // Tarea normal (sin recurrencia)
            let meta = "";
            if (taskTime) {
                if (isToday) {
                    meta = `${taskTime} · Hoy · ${isoDate}`;
                } else {
                    meta = `${taskTime} · ${formattedDate} · ${isoDate}`;
                }
            } else if (isToday) {
                meta = `Hoy - ${formattedDate} · ${isoDate}`;
            } else {
                meta = `${formattedDate} · ${isoDate}`;
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
        }

        setEditingTaskId(null);
        setTaskTitle("");
        setTaskDate("");
        setTaskDateIso("");
        setTaskTime("");
        setTaskPriority("Media");
        setTaskRecurringDays([]);
        setPickerMode(null);
        setSelectedDate(null);
        setShowTaskForm(false);
        setPickingTaskDate(false);
        if (editingTaskInModal) setEditingTaskInModal(null);
    };

    const handleOpenTaskForm = () => {
        setEditingTaskId(null);
        setTaskTitle("");
        setTaskDate("");
        setTaskDateIso("");
        setTaskTime("");
        setTaskPriority("Media");
        setTaskRecurringDays([]);
        setPickerMode(null);
        setSelectedDate(null);
        setPickingTaskDate(false);
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

    useEffect(() => {
        if (!pickingTaskDate) return;
        const t = window.setTimeout(() => {
            taskPunctualCalendarShellRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
                inline: 'nearest',
            });
        }, 120);
        return () => window.clearTimeout(t);
    }, [pickingTaskDate]);

    useEffect(() => {
        if (pickingTaskDate) {
            prevShowTaskFormForScrollRef.current = showTaskForm;
            return;
        }
        const justOpened = showTaskForm && !prevShowTaskFormForScrollRef.current;
        prevShowTaskFormForScrollRef.current = showTaskForm;
        if (!justOpened) return;
        const t = window.setTimeout(() => {
            taskPunctualHeroCardRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
                inline: 'nearest',
            });
        }, 230);
        return () => window.clearTimeout(t);
    }, [showTaskForm, pickingTaskDate]);

    const resetHeroEventFlow = useCallback(() => {
        setEventHeroPhase('default');
        setEditingEventId(null);
        setEventTitle('');
        setEventDescription('');
        setEventTime('');
        setEventDate(null);
        setCalendarMode('calendar');
    }, []);

    useEffect(() => {
        if (eventHeroPhase === 'default') return;
        const delay = eventHeroPhase === 'form' ? 160 : 120;
        const phase = eventHeroPhase;
        const t = window.setTimeout(() => {
            if (phase === 'pick-date') {
                eventsHeroCalendarShellRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest',
                });
            } else {
                eventsHeroCardRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest',
                });
            }
        }, delay);
        return () => window.clearTimeout(t);
    }, [eventHeroPhase]);

    const handleSaveEvent = async () => {
        console.log('🔵 handleSaveEvent llamado', { eventTitle, eventDate, editingEventId });
        
        if (!eventTitle.trim()) {
            console.warn('⚠️ El título del evento está vacío');
            alert('Por favor, ingresa un título para el evento');
            return;
        }
        
        // Validar que haya una fecha seleccionada
        if (!eventDate || !(eventDate instanceof Date) || isNaN(eventDate.getTime())) {
            console.warn('⚠️ No hay fecha seleccionada');
            alert('Por favor, selecciona una fecha para el evento');
            return;
        }
        
        // Usar la función formatDateLocal ya definida en el componente
        const eventDateString = formatDateLocal(eventDate);
        
        // Validar que el formato de fecha sea correcto (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(eventDateString)) {
            console.error('❌ Formato de fecha inválido:', eventDateString);
            alert('Error: La fecha no tiene el formato correcto. Por favor, intenta de nuevo.');
            return;
        }
        
        console.log('📅 Guardando evento:', {
            title: eventTitle.trim(),
            description: eventDescription.trim() || "Sin descripción",
            event_time: eventTime || "Sin hora",
            event_date: eventDateString,
            eventDateOriginal: eventDate,
            eventDateISO: eventDate?.toISOString(),
            eventDateStringFormatted: eventDateString
        });
        
        try {
            const eventData = {
                title: eventTitle.trim(),
                description: eventDescription.trim() || "Sin descripción",
                event_time: eventTime || "Sin hora",
                event_date: eventDateString
            };
            
            if (editingEventId) {
                console.log('✏️ Actualizando evento:', editingEventId);
                await updateEvent(editingEventId, eventData);
                console.log('✅ Evento actualizado exitosamente');
            } else {
                console.log('➕ Agregando nuevo evento con datos:', eventData);
                console.log('📋 Verificando eventos antes de agregar:', safeEvents.length);
                await addEvent(eventData);
                console.log('✅ Evento agregado exitosamente');
                // Esperar un momento para que el estado se actualice
                setTimeout(() => {
                    console.log('📋 Eventos después de agregar:', safeEvents.length);
                }, 100);
            }
            
            // Limpiar formulario y cerrar modal solo si se guardó correctamente
            console.log('🧹 Limpiando formulario y cerrando modal');
            setEditingEventId(null);
            setEventTitle("");
            setEventDescription("");
            setEventTime("");
            setEventDate(null);
            setCalendarMode("calendar");
            setCalendarOpen(false);
            setEventHeroPhase('default');
            console.log('✅ Modal cerrado y formulario limpiado');
        } catch (error) {
            console.error("❌ Error guardando evento:", error);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            console.error("❌ Detalles del error:", {
                message: errorMessage,
                eventTitle: eventTitle.trim(),
                eventDate: eventDateString,
                eventDateObject: eventDate
            });
            alert(`Error al guardar el evento: ${errorMessage}`);
        }
    };
    const handleEditTask = (id: string) => {
        const task = safeTasks.find((item) => item && item.id === id);
        if (!task) return;
        setEditingTaskId(id);
        setTaskTitle(task.title);
        
        // Parsear meta: "hora · fecha · YYYY-MM-DD" o "Hoy - fecha · YYYY-MM-DD" o "fecha · YYYY-MM-DD"
        const meta = task.meta || "";
        let parsedDate = "";
        let parsedTime = "";
        let dateForPicker: Date | null = null;
        const parts = meta.split(" · ").map(p => p.trim()).filter(Boolean);
        const lastPart = parts[parts.length - 1];
        const isIso = /^\d{4}-\d{2}-\d{2}$/.test(lastPart || "");
        const displayParts = isIso && parts.length > 1 ? parts.slice(0, -1) : parts;

        if (displayParts.length >= 2 && /^\d{2}:\d{2}$/.test(displayParts[0])) {
            parsedTime = displayParts[0];
            parsedDate = displayParts[1];
        } else if (displayParts.length >= 1) {
            parsedDate = displayParts[0];
        }
        if (meta.includes(" - ")) {
            const [_, afterDash] = meta.split(" - ");
            if (afterDash) {
                const beforeIso = afterDash.split(" · ")[0]?.trim() || "";
                if (beforeIso) parsedDate = beforeIso;
            }
        }
        if (isIso && lastPart) {
            dateForPicker = parseDateFromString(lastPart);
        }

        setTaskDate(parsedDate);
        setTaskTime(parsedTime);
        setTaskDateIso(isIso && lastPart ? lastPart : "");
        setTaskPriority(task.priority || "Media");
        setPickerMode(null);
        if (dateForPicker) setSelectedDate(dateForPicker);
        else setSelectedDate(null);
        setShowTaskForm(true);
    };

    const handleDeleteTask = (id: string) => {
        setDeleteConfirmModal({ type: 'task', id });
    };

    const handleEditEvent = (id: string) => {
        const event = safeEvents.find((item) => item && item.id === id);
        if (!event) return;
        setEditingEventId(id);
        setEventTitle(event.title || "");
        setEventDescription(event.description || "");
        setEventTime(event.event_time || "");
        // Parsear la fecha correctamente para evitar problemas de zona horaria
        const parsedDate = event.event_date ? parseDateFromString(event.event_date) : today;
        setEventDate(parsedDate);
        setCalendarMode("event");
        setEventHeroPhase('default');
        setCalendarOpen(true);
    };

    const ROW_RADIUS = 12;

    const StaticCompletedTaskItem = ({
        task,
        isFirst,
        isLast,
        isOnly
    }: {
        task: { id: string; title: string; meta: string; priority: string; completed?: boolean };
        isFirst?: boolean;
        isLast?: boolean;
        isOnly?: boolean;
    }) => {
        const radius = isOnly ? ROW_RADIUS : isFirst ? `${ROW_RADIUS}px ${ROW_RADIUS}px 0 0` : isLast ? `0 0 ${ROW_RADIUS}px ${ROW_RADIUS}px` : 0;
        return (
            <div
                className="list-item"
                style={{
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: radius,
                    overflow: 'hidden'
                }}
            >
                <div className="list-icon" style={{ backgroundColor: 'transparent', color: 'var(--ios-green)' }}>
                    <SFCheckCircle size={18} />
                </div>
                <div className="list-content">
                    <p style={{ textDecoration: 'none', color: 'var(--text-primary)', fontWeight: '500' }}>{task.title}</p>
                    <span style={{ color: 'var(--text-tertiary)' }}>{getTaskMetaDisplay(task.meta, todayDateString)}</span>
                </div>
                <span className="list-time" style={{ color: 'var(--text-tertiary)' }}>{task.priority}</span>
            </div>
        );
    };

    const StaticCompletedEventItem = ({
        event,
        isFirst,
        isLast,
        isOnly
    }: {
        event: { id: string; title: string; meta: string; time: string; event_date?: string };
        isFirst?: boolean;
        isLast?: boolean;
        isOnly?: boolean;
    }) => {
        let formattedDate = '';
        try {
            if (event.event_date) {
                const eventDate = parseDateFromString(event.event_date);
                if (!isNaN(eventDate.getTime())) {
                    formattedDate = eventDate.toLocaleDateString('es-ES', {
                        day: 'numeric',
                        weekday: 'short'
                    });
                } else {
                    formattedDate = event.event_date;
                }
            }
        } catch (error) {
            formattedDate = event.event_date || '';
        }

        const radius = isOnly ? ROW_RADIUS : isFirst ? `${ROW_RADIUS}px ${ROW_RADIUS}px 0 0` : isLast ? `0 0 ${ROW_RADIUS}px ${ROW_RADIUS}px` : 0;
        return (
            <div
                className="list-item"
                style={{
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: radius,
                    overflow: 'hidden'
                }}
            >
                <div style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    textTransform: 'capitalize',
                    minWidth: '40px',
                    textAlign: 'center',
                    lineHeight: '1.2'
                }}>
                    {formattedDate}
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{
                        margin: 0,
                        fontSize: '15px',
                        fontWeight: '500',
                        color: 'var(--text-primary)'
                    }}>
                        {event.title}
                    </p>
                    {event.meta && (
                        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', display: 'block', marginTop: '2px' }}>
                            {event.meta}
                        </span>
                    )}
                </div>
                {event.time && (
                    <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                        {event.time}
                    </span>
                )}
            </div>
        );
    };


    const SwipeTaskItem = ({
        task
    }: {
        task: { id: string; title: string; meta: string; priority: string; completed?: boolean };
    }) => {
        const [offset, setOffset] = useState(0);
        const [open, setOpen] = useState(false);
        const [isCompleting, setIsCompleting] = useState(false);
        const startXRef = useRef<number | null>(null);
        const draggingRef = useRef(false);
        
        // Obtener el estado actual de la tarea desde safeTasks
        const currentTask = safeTasks.find(t => t && t.id === task.id);
        const isCompleted = currentTask?.completed ?? task.completed ?? false;

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
            
            try {
                // Toggle del estado completado
                updateTask(task.id, { completed: !isCompleted });
                setIsCompleting(false);
            } catch (error) {
                console.error("Error completando/restaurando tarea:", error);
                setIsCompleting(false);
            }
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
                    style={{ 
                        transform: `translateX(${offset}px)`,
                        transition: open ? 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)' : 'transform 0.25s cubic-bezier(0.0, 0.0, 0.2, 1)'
                    }}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                >
                    <button
                        className={clsx("task-complete-button", (isCompleting || isCompleted) && "task-complete-button-active")}
                        onClick={handleCompleteTask}
                        aria-label={isCompleted ? "Restaurar tarea" : "Completar tarea"}
                        disabled={isCompleting}
                    >
                        <SFCheckCircle size={16} className={clsx("task-complete-icon", (isCompleting || isCompleted) && "task-complete-icon-active")} />
                    </button>
                    <div className="list-content">
                        <p>{task?.title || 'Sin título'}</p>
                        <span>{getTaskMetaDisplay(task?.meta, todayDateString)}</span>
                    </div>
                    <span 
                        className="list-time" 
                        style={{ color: getTaskPriorityColor(task?.priority || 'Media') }}
                    >
                        {task?.priority || 'Media'}
                    </span>
                </div>
            </div>
        );
    };

    const SwipeEventItem = ({
        event
    }: {
        event: { id: string; title: string; meta: string; time: string; event_date?: string; completed?: boolean };
    }) => {
        const isCompleted = Boolean(event.completed);
        return (
            <div 
                className="day-event-item horizontal"
                onClick={() => handleEditEvent(event.id)}
                style={{ 
                    cursor: 'pointer',
                    userSelect: 'none',
                    WebkitUserSelect: 'none'
                }}
            >
                <button
                    type="button"
                    className={clsx("task-complete-button", isCompleted && "task-complete-button-active")}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (event?.id) {
                            try {
                                updateEvent(event.id, { completed: !isCompleted });
                            } catch (error) {
                                console.error("Error actualizando estado del evento:", error);
                            }
                        }
                    }}
                    aria-label={isCompleted ? "Marcar como pendiente" : "Completar evento"}
                >
                    <SFCheckCircle size={16} className={clsx("task-complete-icon", isCompleted && "task-complete-icon-active")} />
                </button>
                <div className="day-event-badge">
                    {event?.event_date ? (() => {
                        const eventDate = parseDateFromString(event.event_date);
                        return eventDate.getDate();
                    })() : ((today && today instanceof Date && !isNaN(today.getTime())) ? today.getDate() : new Date().getDate())}
                </div>
                <div className="day-event-info">
                    <span
                        className="day-event-title"
                        style={{
                            textDecoration: isCompleted ? 'line-through' : undefined,
                            opacity: isCompleted ? 0.72 : 1,
                        }}
                    >
                        {event?.title || 'Sin título'}
                    </span>
                    <span className="day-event-meta">
                        {event?.event_date ? (() => {
                            const eventDate = parseDateFromString(event.event_date);
                            const isToday = formatDateLocal(eventDate) === todayDateString;
                            if (isToday) {
                                // Si es hoy, mostrar descripción
                                return event?.meta || 'Sin descripción';
                            } else {
                                // Si es futuro, mostrar fecha formateada
                                const dateLabel = eventDate.toLocaleDateString("es-ES", {
                                    day: "numeric",
                                    month: "short"
                                });
                                // Si hay descripción, mostrarla también
                                const meta = event?.meta ? ` · ${event.meta}` : '';
                                return `${dateLabel}${meta}`;
                            }
                        })() : (event?.meta || 'Sin descripción')}
                    </span>
                    <span className="day-event-time-range">{event?.time || 'Sin hora'}</span>
                </div>
            </div>
        );
    };

    // Asegurar que el componente siempre se renderice correctamente
    // No retornar early para evitar problemas de renderizado

    // ========== OPTIMIZACIONES DE RENDIMIENTO ==========
    // Pre-calcular Map de tareas por fecha (una sola vez) - Reservado para uso futuro
    // const tasksByDateMap = useMemo(() => {
    //     const map = new Map<string, typeof safeTasks>();
    //     safeTasks.forEach((task) => {
    //         if (!task) return;
    //         const taskDate = extractTaskDate(task);
    //         if (!taskDate) return;
    //         if (!map.has(taskDate)) {
    //             map.set(taskDate, []);
    //         }
    //         map.get(taskDate)!.push(task);
    //     });
    //     return map;
    // }, [safeTasks, extractTaskDate]);

    // ========== FIN OPTIMIZACIONES ==========

    /** useHeroCalendarForDate: al pulsar la fecha se muestra el calendario que sustituye el bloque (hero), sin modal. */
    const renderEventDayBlocks = (onVolver: () => void, useHeroCalendarForDate = false) => {
        if (!eventDate) return null;
        const selectedDateString = formatDateLocal(eventDate);
        const eventsOnDate = safeEvents.filter(
            (ev) => ev && ev.event_date && ev.event_date === selectedDateString
        );
        const sortByTime = <T extends { event_time?: string }>(arr: T[]) =>
            [...arr].sort((a, b) => (a.event_time || '').localeCompare(b.event_time || ''));
        const eventsCompletedForDate = sortByTime(eventsOnDate.filter((ev) => Boolean(ev.completed)));
        const eventsPendingForDate = sortByTime(eventsOnDate.filter((ev) => !ev.completed));

        const blockLabelStyle: React.CSSProperties = {
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            marginBottom: '10px',
            letterSpacing: '-0.2px',
        };
        const subsectionStyle: React.CSSProperties = {
            fontSize: '12px',
            fontWeight: '600',
            color: 'var(--text-tertiary)',
            marginBottom: '8px',
            padding: '0 4px',
        };
        const emptyHintStyle: React.CSSProperties = {
            fontSize: '13px',
            color: 'var(--text-tertiary)',
            margin: 0,
            padding: '6px 4px 2px',
        };

        const mapToSwipeEvent = (ev: (typeof eventsOnDate)[0]) => (
            <SwipeEventItem
                key={ev.id}
                event={{
                    id: ev.id || '',
                    title: ev.title || '',
                    meta: ev.description || '',
                    time: ev.event_time || '',
                    event_date: ev.event_date,
                    completed: Boolean(ev.completed),
                }}
            />
        );

        return (
            <>
                <div className="section-title">
                    <h3>{editingEventId ? 'Editar evento' : 'Nuevo evento'}</h3>
                    <button type="button" className="link-button" onClick={onVolver}>
                        Volver
                    </button>
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <div style={blockLabelStyle}>Añadir nuevo evento</div>
                    <div className="event-form-card task-form-card">
                        <div className="task-form-row">
                            <div className="task-picker">
                                {useHeroCalendarForDate ? (
                                    <button
                                        type="button"
                                        className={clsx('task-input', 'task-input-button')}
                                        onClick={() => setEventHeroPhase('pick-date')}
                                    >
                                        {eventDate.toLocaleDateString('es-ES', {
                                            day: 'numeric',
                                            month: 'short',
                                        }).replace('.', '')}
                                    </button>
                                ) : (
                                    <DatePicker
                                        value={eventDate ? formatDateLocal(eventDate) : ''}
                                        onChange={(v) => setEventDate(parseDateFromString(v))}
                                        placeholder="Fecha"
                                        taskStyle={true}
                                    />
                                )}
                            </div>
                            <div className="task-picker">
                                <TimeSelect value={eventTime} onChange={setEventTime} placeholder="Hora" />
                            </div>
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
                        <div className="event-actions">
                            <button type="button" className="task-add-button" onClick={handleSaveEvent}>
                                Guardar evento
                            </button>
                        </div>
                    </div>
                </div>

                <div className="list-card" style={{ marginBottom: '16px' }}>
                    <div style={subsectionStyle}>
                        Eventos realizados esta fecha ({eventsCompletedForDate.length})
                    </div>
                    {eventsCompletedForDate.length > 0 ? (
                        <div>{eventsCompletedForDate.map(mapToSwipeEvent)}</div>
                    ) : (
                        <p style={emptyHintStyle}>Ningún evento completado este día.</p>
                    )}
                </div>

                <div className="list-card" style={{ marginBottom: '4px' }}>
                    <div style={subsectionStyle}>
                        Eventos no realizados esta fecha ({eventsPendingForDate.length})
                    </div>
                    {eventsPendingForDate.length > 0 ? (
                        <div>{eventsPendingForDate.map(mapToSwipeEvent)}</div>
                    ) : (
                        <p style={emptyHintStyle}>No hay eventos pendientes este día.</p>
                    )}
                </div>
            </>
        );
    };

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
            </header>

            <div className="app-content">
                <section className="app-section">
                    <div
                        className={`hero-card ${progressData.allCompleted ? 'hero-card-compact' : ''}`}
                        style={{
                            cursor: 'pointer',
                            transition: 'opacity 0.2s ease',
                        }}
                        onClick={() => {
                            setProgressModalOpen(true);
                            setCompletedModalFilter('events');
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '0.8';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '1';
                        }}
                    >
                        <div className="hero-header">
                            <div>
                                <p className="hero-eyebrow">Progreso de hoy</p>
                                <h2 className="hero-title">{progressData.percentageText}</h2>
                                {progressData.allCompleted ? null : completedOnCalendarDayCount > 0 ? (
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            flexWrap: 'wrap',
                                            marginTop: '8px',
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                color: 'var(--text-secondary)',
                                                fontSize: '13px',
                                            }}
                                        >
                                            <SFCheckCircle size={14} className="text-[var(--ios-green)]" />
                                            <span style={{ fontWeight: '500' }}>
                                                {completedOnCalendarDayCount}{' '}
                                                {completedOnCalendarDayCount === 1 ? 'tarea completada' : 'tareas completadas'}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <p style={{ color: 'var(--text-tertiary)', fontSize: '13px', margin: '8px 0 0 0' }}>
                                        Aún no hay tareas completadas hoy
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
                                    transition: 'width 0.3s ease',
                                }}
                            />
                        </div>
                    </div>
                </section>

                {/* Eventos */}
                <section className="app-section">
                    <div ref={eventsHeroCardRef} className="hero-card events-hero-card" style={{ position: 'relative', overflow: 'hidden' }}>
                        <div
                            style={{
                                filter: eventsBlockUnlocked ? 'none' : 'blur(12px)',
                                pointerEvents: eventsBlockUnlocked ? 'auto' : 'none',
                                userSelect: eventsBlockUnlocked ? 'auto' : 'none',
                                WebkitUserSelect: eventsBlockUnlocked ? 'auto' : 'none',
                                transition: 'filter 0.3s ease'
                            }}
                        >
                            <div className="hero-header">
                                <div>
                                    <p className="hero-eyebrow">Eventos</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                        <h2 className="hero-title">
                                            {eventsCount} {eventsCount === 1 ? 'evento' : 'eventos'}
                                        </h2>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="hero-icon"
                                    aria-label={
                                        eventHeroPhase === 'default'
                                            ? 'Elegir fecha para nuevo evento'
                                            : 'Cerrar'
                                    }
                                    onClick={() => {
                                        if (eventHeroPhase === 'default') {
                                            setEditingEventId(null);
                                            setEventTitle('');
                                            setEventDescription('');
                                            setEventTime('');
                                            setEventDate(null);
                                            setCalendarMode('calendar');
                                            setEventHeroPhase('pick-date');
                                            return;
                                        }
                                        resetHeroEventFlow();
                                    }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {eventHeroPhase === 'default' ? (
                                        <SFCalendar size={18} />
                                    ) : (
                                        <SFXmark size={18} />
                                    )}
                                </button>
                            </div>
                            {eventHeroPhase === 'default' && (
                                <>
                            {eventsCount > 0 ? (
                                <div className="day-event-list horizontal">
                                    {allUpcomingEvents.filter(event => event && event.id).map((event) => (
                                        <div 
                                            key={event.id}
                                            className="day-event-item horizontal"
                                            style={{ 
                                                cursor: 'default',
                                                userSelect: 'none',
                                                WebkitUserSelect: 'none'
                                            }}
                                        >
                                            <div className="day-event-badge">
                                                {event?.event_date ? (() => {
                                                    const eventDate = parseDateFromString(event.event_date);
                                                    return eventDate.getDate();
                                                })() : ((today && today instanceof Date && !isNaN(today.getTime())) ? today.getDate() : new Date().getDate())}
                                            </div>
                                            <div className="day-event-info">
                                                <span className="day-event-title">{event?.title || 'Sin título'}</span>
                                                <span className="day-event-meta">
                                                    {event?.event_date ? (() => {
                                                        const eventDate = parseDateFromString(event.event_date);
                                                        const isToday = formatDateLocal(eventDate) === todayDateString;
                                                        if (isToday) {
                                                            return event?.meta || 'Sin descripción';
                                                        } else {
                                                            const dateLabel = eventDate.toLocaleDateString("es-ES", {
                                                                day: "numeric",
                                                                month: "short"
                                                            });
                                                            const meta = event?.meta ? ` · ${event.meta}` : '';
                                                            return `${dateLabel}${meta}`;
                                                        }
                                                    })() : (event?.meta || 'Sin descripción')}
                                                </span>
                                                <span className="day-event-time-range">{event?.time || 'Sin hora'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ 
                                    color: 'var(--text-tertiary)', 
                                    fontSize: '13px', 
                                    margin: '12px 0 0 0',
                                    padding: '0 4px'
                                }}>
                                    No hay eventos programados para hoy
                                </p>
                            )}
                                </>
                            )}
                            {eventHeroPhase === 'pick-date' && (
                                <motion.div
                                    ref={eventsHeroCalendarShellRef}
                                    className="task-punctual-calendar-shell"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
                                >
                                    <CalendarDatePanel
                                        value={eventDate ? formatDateLocal(eventDate) : ''}
                                        onSelect={(v) => {
                                            setEditingEventId(null);
                                            setEventTitle('');
                                            setEventDescription('');
                                            setEventTime('');
                                            setEventDate(parseDateFromString(v));
                                            setCalendarMode('event');
                                            setEventHeroPhase('form');
                                        }}
                                        className="task-punctual-calendar-panel"
                                    />
                                </motion.div>
                            )}
                            {eventHeroPhase === 'form' && eventDate ? (
                                <div className="events-hero-form-wrap">
                                    {renderEventDayBlocks(() => setEventHeroPhase('pick-date'), true)}
                                </div>
                            ) : null}
                        </div>
                        {!eventsBlockUnlocked && (
                            <div
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: theme === 'light' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.25)',
                                    backdropFilter: 'blur(10px)',
                                    WebkitBackdropFilter: 'blur(10px)',
                                    zIndex: 10,
                                    pointerEvents: 'auto',
                                    transition: 'opacity 0.25s var(--ease-ios-out)'
                                }}
                                onClick={() => {
                                    // Si está abierto el PIN inline, tocar afuera lo cierra
                                    if (showPinModal) closePinModal();
                                }}
                            >
                                <AnimatePresence initial={false} mode="wait">
                                    {!showPinModal ? (
                                        <motion.button
                                            key="lock"
                                            type="button"
                                            aria-label="Desbloquear con PIN"
                                            onClick={(e) => { e.stopPropagation(); openPinModalForEvents(); }}
                                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPinModalForEvents(); } }}
                                            className="faceid-lock-button"
                                            initial={{ opacity: 0, scale: 0.96, y: 2 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.96, y: 2 }}
                                            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
                                            style={{
                                                transition: 'transform 0.2s var(--ease-ios-out), opacity 0.2s var(--ease-ios-out)'
                                            }}
                                        >
                                            <span className="faceid-lock-button-icon">
                                                <SFLock size={28} />
                                            </span>
                                        </motion.button>
                                    ) : (
                                        <motion.div
                                            key="pin"
                                            initial={{ opacity: 0, scale: 0.98, y: 4 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.98, y: 4 }}
                                            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
                                            onClick={(e) => e.stopPropagation()}
                                            style={{
                                                width: 'min(260px, 90%)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '2px 0',
                                                // sin “tarjeta”: todo integrado sobre el blur
                                                background: 'transparent'
                                            }}
                                        >
                                            {/* Barra de texto (input) que abre teclado del iPhone */}
                                            <input
                                                className="events-pin-input"
                                                type="tel"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                maxLength={4}
                                                autoFocus
                                                value={pinInput}
                                                onChange={(e) => {
                                                    // Mantener solo dígitos y máximo 4
                                                    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 4);
                                                    setPinError(null);
                                                    setPinInput(cleaned);
                                                    if (cleaned.length === 4) {
                                                        setTimeout(() => processEnteredPin(cleaned), 60);
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Escape') {
                                                        e.preventDefault();
                                                        closePinModal();
                                                    }
                                                }}
                                                placeholder={
                                                    pinMode === 'setup'
                                                        ? 'Registra tu código'
                                                        : pinMode === 'confirm'
                                                            ? 'Confirma tu código'
                                                            : ''
                                                }
                                                aria-label="PIN de 4 dígitos"
                                                style={{
                                                    width: '100%',
                                                    height: '34px',
                                                    borderRadius: '999px',
                                                    border: `1px solid ${
                                                        pinError
                                                            ? 'rgba(255, 69, 58, 0.55)'
                                                            : theme === 'light'
                                                                ? 'rgba(0,0,0,0.10)'
                                                                : 'rgba(255,255,255,0.12)'
                                                    }`,
                                                    background: theme === 'light'
                                                        ? 'rgba(255,255,255,0.20)'
                                                        : 'rgba(0,0,0,0.18)',
                                                    color: 'var(--text-primary)',
                                                    fontSize: '13px',
                                                    fontWeight: '700',
                                                    fontFamily: 'inherit',
                                                    textAlign: 'center',
                                                    outline: 'none',
                                                    caretColor: 'var(--ios-blue)',
                                                    letterSpacing: '4px',
                                                    padding: '0',
                                                    lineHeight: '34px',
                                                    backdropFilter: 'blur(10px)',
                                                    WebkitBackdropFilter: 'blur(10px)',
                                                    transition: 'border-color 0.18s var(--ease-ios-out), background 0.18s var(--ease-ios-out)'
                                                }}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </section>

                <section className="app-section">
                    <div ref={taskPunctualHeroCardRef} className="hero-card task-punctual-hero-card">
                        <div className="hero-header">
                            <div>
                                <p className="hero-eyebrow">
                                    {pendingCount > 0 ? (
                                        <>{pendingCount} {pendingCount === 1 ? 'tarea' : 'tareas'}</>
                                    ) : (
                                        <>0 tareas</>
                                    )}
                                </p>
                                <h2 className="hero-title">Tareas puntuales</h2>
                            </div>
                            <button
                                className="hero-icon-button"
                                aria-label={
                                    pickingTaskDate
                                        ? "Cerrar calendario"
                                        : showTaskForm
                                            ? "Ocultar formulario de tarea"
                                            : "Agregar tarea"
                                }
                                onClick={() => {
                                    if (pickingTaskDate) {
                                        setPickingTaskDate(false);
                                        return;
                                    }
                                    if (showTaskForm) {
                                        setShowTaskForm(false);
                                        setPickingTaskDate(false);
                                    } else {
                                        handleOpenTaskForm();
                                    }
                                }}
                            >
                                {pickingTaskDate ? <SFXmark size={18} /> : <SFPlus size={18} />}
                            </button>
                        </div>
                    {pickingTaskDate ? (
                        <motion.div
                            ref={taskPunctualCalendarShellRef}
                            key="punctual-calendar"
                            className="task-punctual-calendar-shell"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
                        >
                            <CalendarDatePanel
                                value={taskDateIso}
                                onSelect={(v) => {
                                    setTaskDateIso(v);
                                    setPickingTaskDate(false);
                                }}
                                className="task-punctual-calendar-panel"
                            />
                        </motion.div>
                    ) : (
                        <>
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
                                            !taskDateIso && "task-input-placeholder"
                                        )}
                                        onClick={() => setPickingTaskDate(true)}
                                    >
                                        {taskDateButtonLabel}
                                    </button>
                                </div>
                                <div className="task-picker">
                                    <TimeSelect value={taskTime} onChange={setTaskTime} placeholder="Hora" />
                                </div>
                            </div>
                            
                            {/* Selector de días recurrentes */}
                            <div style={{ marginBottom: '12px' }}>
                                <div style={{ 
                                    fontSize: '12px', 
                                    fontWeight: '600', 
                                    color: 'var(--text-secondary)', 
                                    marginBottom: '8px',
                                    padding: '0 4px'
                                }}>
                                    Repetir en días específicos (opcional)
                                </div>
                                <div style={{
                                    display: 'flex',
                                    gap: '8px',
                                    flexWrap: 'wrap'
                                }}>
                                    {[
                                        { label: 'D', value: 0, full: 'Dom' },
                                        { label: 'L', value: 1, full: 'Lun' },
                                        { label: 'M', value: 2, full: 'Mar' },
                                        { label: 'X', value: 3, full: 'Mié' },
                                        { label: 'J', value: 4, full: 'Jue' },
                                        { label: 'V', value: 5, full: 'Vie' },
                                        { label: 'S', value: 6, full: 'Sáb' }
                                    ].map((day) => {
                                        const isSelected = taskRecurringDays.includes(day.value);
                                        return (
                                            <button
                                                key={day.value}
                                                type="button"
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setTaskRecurringDays(prev => prev.filter(d => d !== day.value));
                                                    } else {
                                                        setTaskRecurringDays(prev => [...prev, day.value]);
                                                    }
                                                }}
                                                style={{
                                                    minWidth: '40px',
                                                    height: '40px',
                                                    borderRadius: '10px',
                                                    border: `1.5px solid ${isSelected ? 'var(--ios-blue)' : 'var(--glass-border)'}`,
                                                    background: isSelected 
                                                        ? (theme === 'light' ? 'rgba(41, 151, 255, 0.15)' : 'rgba(41, 151, 255, 0.25)')
                                                        : (theme === 'light' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.05)'),
                                                    color: isSelected ? 'var(--ios-blue)' : 'var(--text-primary)',
                                                    fontSize: '14px',
                                                    fontWeight: isSelected ? '600' : '500',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s var(--ease-ios-out)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flex: 1,
                                                    maxWidth: '48px'
                                                }}
                                                onMouseDown={(e) => {
                                                    e.currentTarget.style.transform = 'scale(0.95)';
                                                }}
                                                onMouseUp={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                }}
                                                title={day.full}
                                            >
                                                {day.label}
                                            </button>
                                        );
                                    })}
                                </div>
                                {taskRecurringDays.length > 0 && (
                                    <div style={{
                                        fontSize: '11px',
                                        color: 'var(--text-tertiary)',
                                        marginTop: '6px',
                                        padding: '0 4px'
                                    }}>
                                        La tarea aparecerá todos los {taskRecurringDays.sort((a, b) => a - b).map(d => ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][d]).join(', ')}
                                    </div>
                                )}
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
                        {pendingCount > 0 ? (
                            <>
                                <div className="day-event-list horizontal">
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
                        ) : (
                            <p style={{ 
                                color: 'var(--text-tertiary)', 
                                fontSize: '13px', 
                                margin: '12px 0 0 0',
                                padding: '0 4px'
                            }}>
                                No hay tareas puntuales
                            </p>
                        )}
                        </>
                    )}
                    </div>
                </section>
                
                {/* Espacio blanco al final para indicar que puede haber más contenido */}
                <div style={{ 
                    height: '32px', 
                    width: '100%',
                    flexShrink: 0
                }} />
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
                                                            console.log('📅 Fecha seleccionada del calendario (mes):', day.date, 'Formato:', formatDateLocal(day.date));
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
                                                            console.log('📅 Fecha seleccionada del calendario (semana):', day.date, 'Formato:', formatDateLocal(day.date));
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
                                {eventDate
                                    ? renderEventDayBlocks(() => setCalendarMode('calendar'))
                                    : null}
                                {!eventDate && (
                                    <div className="event-form-card task-form-card">
                                        <div className="event-date-label" style={{ 
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            color: 'var(--text-tertiary)',
                                            opacity: 0.7
                                        }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                                <line x1="3" y1="10" x2="21" y2="10"></line>
                                            </svg>
                                            <span>Selecciona una fecha</span>
                                        </div>
                                    </div>
                                )}
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

            {progressModalOpen && (
                <div className="calendar-modal">
                    <button
                        className="calendar-backdrop"
                        aria-label="Cerrar progreso"
                        onClick={() => {
                            setProgressModalOpen(false);
                        }}
                    />
                    <motion.div
                        className="calendar-modal-card"
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.98 }}
                        transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
                    >
                        <div className="section-title">
                            <h3>Progreso</h3>
                            <button
                                className="link-button"
                                onClick={() => {
                                    setProgressModalOpen(false);
                                }}
                                style={{ marginLeft: 'auto' }}
                            >
                                Cerrar
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* Lista de eventos completados */}
                            <div className="list-card" style={{ position: 'relative', padding: '16px' }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '12px'
                                }}>
                                    <h4 style={{
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: 'var(--text-secondary)',
                                        margin: 0,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        {completedModalFilter === 'tasks' 
                                            ? `Tareas realizadas (${allCompletedTasksHistory.length})` 
                                            : `Eventos realizados (${allCompletedEvents.length})`}
                                    </h4>
                                    
                                    {/* Estadística de tareas por día - Esquina superior derecha */}
                                    <div 
                                        onClick={() => {
                                            if (completedModalFilter === 'tasks') {
                                                setCompletedModalFilter('events');
                                            } else {
                                                setCompletedModalFilter('tasks');
                                            }
                                        }}
                                        style={{
                                            background: 'var(--glass-bg-strong)',
                                            backdropFilter: 'blur(12px) saturate(180%)',
                                            WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                                            border: '0.5px solid var(--glass-border)',
                                            borderRadius: '6px',
                                            padding: '4px 8px',
                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                                            flexShrink: 0,
                                            cursor: 'pointer',
                                            userSelect: 'none',
                                            WebkitUserSelect: 'none',
                                            transition: 'transform 0.15s, box-shadow 0.15s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        <p style={{
                                            fontSize: '7px',
                                            fontWeight: '600',
                                            color: 'var(--text-secondary)',
                                            marginBottom: '1px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.2px',
                                            lineHeight: '1'
                                        }}>
                                            {completedModalFilter === 'tasks' ? 'Eventos' : 'Promedio'}
                                        </p>
                                        <p style={{
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            color: 'var(--text-primary)',
                                            margin: 0,
                                            lineHeight: '1.2'
                                        }}>
                                            {completedModalFilter === 'tasks' ? 'Ver eventos' : `${tasksPerDayAverage} tareas/día`}
                                        </p>
                                    </div>
                                </div>
                                {completedModalFilter === 'tasks' ? (
                                    // Vista de Tareas Completadas (histórico)
                                    allCompletedTasksHistory.length > 0 ? (
                                        <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
                                            {(() => {
                                                const groups: { [key: string]: typeof allCompletedTasksHistory } = {};
                                                allCompletedTasksHistory.forEach((task) => {
                                                    const dateStr = resolveTaskHistoryDate(task);
                                                    const dateObj = dateStr ? parseDateFromString(dateStr) : null;
                                                    const monthKey = dateObj && !isNaN(dateObj.getTime())
                                                        ? dateObj.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
                                                        : 'Sin fecha';
                                                    if (!groups[monthKey]) groups[monthKey] = [];
                                                    groups[monthKey].push(task);
                                                });

                                                return Object.entries(groups).map(([month, tasks]) => (
                                                    <div key={month} style={{ marginBottom: '20px' }}>
                                                        <h5 style={{
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            color: 'var(--text-tertiary)',
                                                            marginBottom: '8px',
                                                            textTransform: 'capitalize',
                                                            paddingLeft: '4px',
                                                            letterSpacing: '0.5px'
                                                        }}>
                                                            {month}
                                                        </h5>
                                                        <div className="list-card" style={{ gap: '8px', overflow: 'hidden', padding: 0 }}>
                                                            {tasks.map((task, index) => {
                                                                const isFirst = index === 0;
                                                                const isLast = index === tasks.length - 1;
                                                                const isOnly = tasks.length === 1;
                                                                return (
                                                                    <div key={task.id} style={{ overflow: 'hidden' }}>
                                                                        <StaticCompletedTaskItem task={task} isFirst={isFirst} isLast={isLast} isOnly={isOnly} />
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    ) : (
                                        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                                            <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', margin: 0 }}>
                                                No hay tareas completadas
                                            </p>
                                        </div>
                                    )
                                ) : (
                                    // Vista de Eventos Completados (Default)
                                    allCompletedEvents.length > 0 ? (
                                        <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
                                            {(() => {
                                                const groups: { [key: string]: typeof allCompletedEvents } = {};
                                                allCompletedEvents.forEach(event => {
                                                    let dateObj: Date | null = null;
                                                    if (event.event_date) {
                                                        dateObj = parseDateFromString(event.event_date);
                                                    }
                                                    
                                                    const monthKey = dateObj && !isNaN(dateObj.getTime())
                                                        ? dateObj.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
                                                        : 'Sin fecha';
                                                        
                                                    if (!groups[monthKey]) groups[monthKey] = [];
                                                    groups[monthKey].push(event);
                                                });

                                                return Object.entries(groups).map(([month, events]) => (
                                                    <div key={month} style={{ marginBottom: '20px' }}>
                                                        <h5 style={{
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            color: 'var(--text-tertiary)',
                                                            marginBottom: '8px',
                                                            textTransform: 'capitalize',
                                                            paddingLeft: '4px',
                                                            letterSpacing: '0.5px'
                                                        }}>
                                                            {month}
                                                        </h5>
                                                        <div className="list-card" style={{ gap: '8px', overflow: 'hidden', padding: 0 }}>
                                                            {events.map((event, index) => {
                                                                const isFirst = index === 0;
                                                                const isLast = index === events.length - 1;
                                                                const isOnly = events.length === 1;
                                                                return (
                                                                    <div key={event.id} style={{ overflow: 'hidden' }}>
                                                                        <StaticCompletedEventItem event={event} isFirst={isFirst} isLast={isLast} isOnly={isOnly} />
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    ) : (
                                        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                                            <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', margin: 0 }}>
                                                No hay eventos completados
                                            </p>
                                        </div>
                                    )
                                )}
                            </div>
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
                            setTaskDateIso("");
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
                                            setTaskDateIso("");
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
                                            <DatePicker
                                                value={taskDateIso}
                                                onChange={setTaskDateIso}
                                                placeholder="Fecha (opcional)"
                                                taskStyle={true}
                                                inline
                                            />
                                        </div>
                                        <div className="task-picker">
                                            <TimeSelect value={taskTime} onChange={setTaskTime} placeholder="Hora" />
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

            {pickerMode === "date" && (
                <div className="calendar-modal calendar-modal-compact">
                    <button
                        className="calendar-backdrop"
                        aria-label="Cerrar calendario"
                        onClick={() => setPickerMode(null)}
                    />
                    <motion.div
                        className="calendar-modal-card calendar-modal-card-compact"
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.98 }}
                        transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="calendar-card calendar-card-compact">
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
                            {calendarView === "mes" && calendarDays && calendarDays.length > 0 && (
                                <>
                                    <div className="calendar-month">{monthLabel || 'Mes'}</div>
                                    <div className="calendar-grid">
                                        {["L", "M", "M", "J", "V", "S", "D"].map((label, index) => (
                                            <div
                                                key={`${label}-${index}`}
                                                className="calendar-day calendar-day-muted calendar-weekday-header"
                                            >
                                                {label}
                                            </div>
                                        ))}
                                        {calendarDays.map((day) => {
                                            if (!day || !day.date || !day.key) {
                                                return null;
                                            }
                                            return (
                                                <button
                                                    key={day.key}
                                                    type="button"
                                                    className={clsx(
                                                        "calendar-day",
                                                        "calendar-day-button",
                                                        !day.isCurrentMonth && "calendar-day-muted",
                                                        day.isToday && "calendar-day-active",
                                                        selectedDate &&
                                                            day.date.toDateString() === selectedDate.toDateString() &&
                                                            "calendar-day-selected"
                                                    )}
                                                    onClick={() => {
                                                        try {
                                                            if (day.date && handleSelectDate) {
                                                                handleSelectDate(day.date);
                                                                setPickerMode(null);
                                                            }
                                                        } catch (error) {
                                                            console.error('Error en handleSelectDate:', error);
                                                        }
                                                    }}
                                                >
                                                    {day.dayNumber}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                            {calendarView === "semana" && calendarWeekDays && calendarWeekDays.length > 0 && (
                                <>
                                    <div className="calendar-month">
                                        {today.toLocaleDateString("es-ES", {
                                            month: "long",
                                            year: "numeric"
                                        })}
                                    </div>
                                    <div className="calendar-week-grid">
                                        {calendarWeekDays.map((day) => {
                                            if (!day || !day.date) return null;
                                            return (
                                                <button
                                                    key={day.key}
                                                    type="button"
                                                    className={clsx(
                                                        "calendar-day",
                                                        "calendar-day-button",
                                                        "calendar-week-day",
                                                        day.isToday && "calendar-day-active",
                                                        selectedDate &&
                                                            day.date.toDateString() === selectedDate.toDateString() &&
                                                            "calendar-day-selected"
                                                    )}
                                                    onClick={() => {
                                                        try {
                                                            handleSelectDate(day.date);
                                                            setPickerMode(null);
                                                        } catch (error) {
                                                            console.error('Error en handleSelectDate (semana):', error);
                                                        }
                                                    }}
                                                >
                                                    <span className="calendar-week-day-name">{day.dayName}</span>
                                                    <span className="calendar-week-day-number">{day.dayNumber}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                            {calendarView === "año" && calendarMonths && calendarMonths.length > 0 && (
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
                                                {month.monthName}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
            {pickerMode === "time" && (
                <div className="task-picker-overlay" onClick={() => setPickerMode(null)}>
                    <div className="task-picker-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="mini-picker-panel mini-picker-panel-full">
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
                        </div>
                    </div>
                </div>
            )}

            {/* PIN inline se renderiza dentro del overlay de Eventos */}
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
    position?: number;
};

export const Ideas = () => {
    const { habits, addHabit, updateHabit, deleteHabit, reorderHabits } = useAppData();
    const [currentTitle, setCurrentTitle] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<'non-negotiable' | null>(null);
    const [editingHabit, setEditingHabit] = useState<string | null>(null);
    const [editingRoutineItem, setEditingRoutineItem] = useState<{ period: 'morning' | 'day' | 'night', index: number } | null>(null);
    const [editingRoutineItemValue, setEditingRoutineItemValue] = useState('');
    const [draggedHabitId, setDraggedHabitId] = useState<string | null>(null);
    const [dragOverHabitId, setDragOverHabitId] = useState<string | null>(null);
    
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
        habits
            .filter(h => h.category === 'non-negotiable')
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0)), 
        [habits]
    );

    // basicRoutineHabits removido - no se usa actualmente

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
                category: 'non-negotiable',
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


    const handleCancelEdit = () => {
        setEditingHabit(null);
        setCurrentTitle("");
    };

    const handleDeleteHabit = (habitId: string) => {
        deleteHabit(habitId);
    };

    const handleNewHabit = () => {
        setSelectedCategory('non-negotiable');
        setCurrentTitle("");
        setEditingHabit(null);
    };

    // Funciones para drag and drop - sin animaciones, reordenamiento en tiempo real
    const lastDragOverIndex = useRef<number | null>(null);
    
    const handleDragStart = (e: React.DragEvent, habitId: string) => {
        setDraggedHabitId(habitId);
        lastDragOverIndex.current = null;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', habitId);
        
        // Crear una imagen personalizada para el drag (transparente para evitar el recuadro negro)
        const dragImage = document.createElement('div');
        dragImage.style.position = 'absolute';
        dragImage.style.top = '-1000px';
        dragImage.style.width = '200px';
        dragImage.style.height = '50px';
        dragImage.style.background = 'transparent';
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 0, 0);
        
        // Limpiar después de un momento
        setTimeout(() => {
            document.body.removeChild(dragImage);
        }, 0);
    };

    const handleDragOver = (e: React.DragEvent, habitId: string, index: number) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
        
        if (!draggedHabitId || draggedHabitId === habitId) {
            return;
        }

        const draggedHabit = habits.find(h => h.id === draggedHabitId);
        if (!draggedHabit || draggedHabit.category !== 'non-negotiable') return;

        const categoryHabits = nonNegotiableHabits;

        const draggedIndex = categoryHabits.findIndex(h => h.id === draggedHabitId);
        
        if (draggedIndex === -1 || index < 0 || index >= categoryHabits.length) {
            return;
        }

        // Solo actualizar si el índice cambió para evitar re-renders innecesarios
        if (lastDragOverIndex.current === index && dragOverHabitId === habitId) {
            return;
        }

        lastDragOverIndex.current = index;
        setDragOverHabitId(habitId);

        // Si el índice es diferente, reordenar
        if (draggedIndex !== index) {
            // Reordenar array inmediatamente sin animaciones
            const newHabits = [...categoryHabits];
            const [removed] = newHabits.splice(draggedIndex, 1);
            newHabits.splice(index, 0, removed);

            // Actualizar positions inmediatamente
            const habitIds = newHabits.map(h => h.id);
            reorderHabits(draggedHabit.category, habitIds);
        }
    };

    const handleDrop = (e: React.DragEvent, targetHabitId: string) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!draggedHabitId || draggedHabitId === targetHabitId) {
            lastDragOverIndex.current = null;
            setDragOverHabitId(null);
            setDraggedHabitId(null);
            return;
        }

        // Asegurar que el reordenamiento final se complete
        const draggedHabit = habits.find(h => h.id === draggedHabitId);
        if (draggedHabit && draggedHabit.category === 'non-negotiable') {
            const categoryHabits = nonNegotiableHabits;
            
            const draggedIndex = categoryHabits.findIndex(h => h.id === draggedHabitId);
            const targetIndex = categoryHabits.findIndex(h => h.id === targetHabitId);
            
            if (draggedIndex !== -1 && targetIndex !== -1 && draggedIndex !== targetIndex) {
                const newHabits = [...categoryHabits];
                const [removed] = newHabits.splice(draggedIndex, 1);
                newHabits.splice(targetIndex, 0, removed);
                const habitIds = newHabits.map(h => h.id);
                reorderHabits(draggedHabit.category, habitIds);
            }
        }
        
        lastDragOverIndex.current = null;
        setDragOverHabitId(null);
        setDraggedHabitId(null);
    };

    // Funciones para edición inline de rutina básica
    const handleEditRoutineItem = (period: 'morning' | 'day' | 'night', index: number) => {
        const item = basicRoutine[period].items[index];
        setEditingRoutineItem({ period, index });
        setEditingRoutineItemValue(item);
    };

    const handleSaveRoutineItem = () => {
        if (editingRoutineItem && editingRoutineItemValue.trim()) {
            setBasicRoutine(prev => ({
                ...prev,
                [editingRoutineItem.period]: {
                    ...prev[editingRoutineItem.period],
                    items: prev[editingRoutineItem.period].items.map((item, idx) => 
                        idx === editingRoutineItem.index ? editingRoutineItemValue.trim() : item
                    )
                }
            }));
        }
        setEditingRoutineItem(null);
        setEditingRoutineItemValue('');
    };

    const handleCancelRoutineItemEdit = () => {
        setEditingRoutineItem(null);
        setEditingRoutineItemValue('');
    };

    // Función para dividir texto en dos líneas si es muy largo
    const splitTextIntoLines = (text: string, maxChars: number = 40): { firstLine: string; secondLine: string | null } => {
        if (text.length <= maxChars) {
            return { firstLine: text, secondLine: null };
        }
        
        // Buscar el último espacio antes del límite para no cortar palabras
        const lastSpaceIndex = text.lastIndexOf(' ', maxChars);
        const splitIndex = lastSpaceIndex > maxChars * 0.6 ? lastSpaceIndex : maxChars;
        
        return {
            firstLine: text.substring(0, splitIndex).trim(),
            secondLine: text.substring(splitIndex).trim()
        };
    };

    // Componente para renderizar un hábito
    const HabitItem = ({ 
        habit, 
        isBeingEdited,
        onEdit,
        onDelete,
        onSaveEdit,
        onCancelEdit,
        editValue,
        onEditValueChange,
        onDragStart,
        onDragOver,
        onDrop,
        isDragging,
        dragOver,
        index
    }: { 
        habit: Habit;
        isBeingEdited: boolean;
        onEdit: (id: string) => void;
        onDelete: (id: string) => void;
        onSaveEdit: () => void;
        onCancelEdit: () => void;
        editValue: string;
        onEditValueChange: (value: string) => void;
        onDragStart: (e: React.DragEvent, habitId: string) => void;
        onDragOver: (e: React.DragEvent, habitId: string, index: number) => void;
        onDrop: (e: React.DragEvent, habitId: string) => void;
        isDragging: boolean;
        dragOver: boolean;
        index: number;
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
                            flex: 1,
                            background: 'transparent',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            fontSize: '14px',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            fontFamily: 'inherit'
                        }}
                    />
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
                </div>
            );
        }

        const { firstLine, secondLine } = splitTextIntoLines(habit.title);

        return (
            <div 
                className="list-item"
                draggable={!isBeingEdited}
                onDragStart={(e) => {
                    e.stopPropagation();
                    onDragStart(e, habit.id);
                }}
                onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDragOver(e, habit.id, index);
                }}
                onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDrop(e, habit.id);
                }}
                onDragEnd={(e) => {
                    e.stopPropagation();
                    setDraggedHabitId(null);
                    setDragOverHabitId(null);
                }}
                style={{
                    opacity: isDragging ? 0.6 : 1,
                    transform: isDragging ? 'scale(0.98)' : 'scale(1)',
                    cursor: isBeingEdited ? 'default' : 'grab',
                    borderTop: dragOver ? '2px solid var(--ios-blue)' : 'none',
                    backgroundColor: dragOver ? 'rgba(41, 151, 255, 0.08)' : 'transparent',
                    borderRadius: dragOver ? '8px' : '0',
                    userSelect: 'none',
                    transition: 'opacity 0.2s ease, transform 0.2s ease, background-color 0.2s ease, border-radius 0.2s ease',
                    boxShadow: isDragging ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none'
                }}
            >
                <div 
                    className="list-content" 
                    style={{ 
                        flex: 1,
                        cursor: isBeingEdited ? 'text' : 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: secondLine ? '1px' : '0',
                        pointerEvents: isDragging ? 'none' : 'auto',
                        transition: 'background-color 0.2s ease'
                    }}
                    onClick={() => {
                        if (!isDragging && !isBeingEdited) {
                            onEdit(habit.id);
                        }
                    }}
                    onDragStart={(e) => e.preventDefault()}
                    onMouseEnter={(e) => {
                        if (!isDragging) {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.borderRadius = '6px';
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                    }}
                >
                    <p style={{ 
                        margin: 0,
                        fontWeight: '600',
                        padding: '2px 4px 0 4px',
                        transition: 'background 0.2s',
                        fontSize: '14px',
                        lineHeight: '1.3',
                        color: 'var(--text-primary)'
                    }}>
                        {firstLine}
                    </p>
                    {secondLine && (
                        <p style={{ 
                            margin: 0,
                            fontWeight: '400',
                            padding: '0 4px 2px 4px',
                            fontSize: '12px',
                            lineHeight: '1.2',
                            color: 'var(--text-secondary)',
                            opacity: 0.65
                        }}>
                            {secondLine}
                        </p>
                    )}
                </div>
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
                {/* Hábitos no negociables — bloque principal */}
                <section className="app-section">
                    <div className="hero-card habits-non-negotiable-card">
                        <div className="hero-header habits-non-negotiable-header">
                            <div className="habits-non-negotiable-heading">
                                <div className="habits-non-negotiable-icon-wrap" aria-hidden>
                                    <SFLock size={18} />
                                </div>
                                <div className="habits-non-negotiable-text">
                                    <p className="habits-non-negotiable-eyebrow">Prioridad máxima</p>
                                    <h2 className="habits-non-negotiable-title">Hábitos no negociables</h2>
                                    <p className="habits-non-negotiable-desc">
                                        Lo que cuidas pase lo que pase. Pocos, claros y sin excusas.
                                    </p>
                                </div>
                            </div>
                            <div className="habits-non-negotiable-actions">
                                <span className="habits-non-negotiable-count" aria-live="polite">
                                    {nonNegotiableHabits.length}
                                </span>
                                <button
                                    type="button"
                                    className="icon-button habits-non-negotiable-add"
                                    aria-label="Agregar hábito no negociable"
                                    onClick={() => {
                                        if (selectedCategory === 'non-negotiable') {
                                            setSelectedCategory(null);
                                        } else {
                                            handleNewHabit();
                                        }
                                    }}
                                >
                                    <SFPlus size={18} />
                                </button>
                            </div>
                        </div>

                        {nonNegotiableHabits.length === 0 && selectedCategory !== 'non-negotiable' ? (
                            <div className="habits-non-negotiable-empty">
                                <p className="habits-non-negotiable-empty-title">Aún no hay hábitos anclados</p>
                                <p className="habits-non-negotiable-empty-hint">
                                    Usa el botón + para fijar el primero. Arrastra para ordenar cuando tengas varios.
                                </p>
                            </div>
                        ) : (
                            <div className="habits-non-negotiable-inner">
                                <AnimatePresence>
                                    {selectedCategory === 'non-negotiable' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2 }}
                                            style={{ overflow: 'hidden' }}
                                        >
                                            <div className="list-item habits-non-negotiable-new-row">
                                                <input
                                                    className="task-input"
                                                    placeholder="Nombre del hábito…"
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
                                {nonNegotiableHabits.map((habit, index) => (
                                    <HabitItem
                                        key={habit.id}
                                        habit={habit}
                                        isBeingEdited={editingHabit === habit.id}
                                        onEdit={handleEditHabit}
                                        onDelete={handleDeleteHabit}
                                        onSaveEdit={handleSaveEdit}
                                        onCancelEdit={handleCancelEdit}
                                        editValue={currentTitle}
                                        onEditValueChange={setCurrentTitle}
                                        onDragStart={handleDragStart}
                                        onDragOver={handleDragOver}
                                        onDrop={handleDrop}
                                        isDragging={draggedHabitId === habit.id}
                                        dragOver={dragOverHabitId === habit.id}
                                        index={index}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Rutina Básica */}
                <section className="app-section">
                    <div className="section-title">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <h3>Rutina Básica</h3>
                        </div>
                    </div>
                    <div className="list-card">
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
                                {basicRoutine.morning.items.map((item, index) => {
                                    const isEditing = editingRoutineItem?.period === 'morning' && editingRoutineItem?.index === index;
                                    return (
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
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editingRoutineItemValue}
                                                    onChange={(e) => setEditingRoutineItemValue(e.target.value)}
                                                    onBlur={handleSaveRoutineItem}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleSaveRoutineItem();
                                                        } else if (e.key === 'Escape') {
                                                            handleCancelRoutineItemEdit();
                                                        }
                                                    }}
                                                    autoFocus
                                                    style={{
                                                        flex: 1,
                                                        background: 'transparent',
                                                        border: '1px solid var(--glass-border)',
                                                        borderRadius: '6px',
                                                        padding: '4px 8px',
                                                        fontSize: '14px',
                                                        color: 'var(--text-primary)',
                                                        outline: 'none',
                                                        fontFamily: 'inherit'
                                                    }}
                                                />
                                            ) : (
                                                <span 
                                                    style={{ 
                                                        flex: 1,
                                                        cursor: 'pointer',
                                                        padding: '2px 4px',
                                                        borderRadius: '4px',
                                                        transition: 'background 0.2s'
                                                    }}
                                                    onClick={() => handleEditRoutineItem('morning', index)}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'transparent';
                                                    }}
                                                >
                                                    {item}
                                                </span>
                                            )}
                                        </li>
                                    );
                                })}
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
                                {basicRoutine.day.items.map((item, index) => {
                                    const isEditing = editingRoutineItem?.period === 'day' && editingRoutineItem?.index === index;
                                    return (
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
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editingRoutineItemValue}
                                                    onChange={(e) => setEditingRoutineItemValue(e.target.value)}
                                                    onBlur={handleSaveRoutineItem}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleSaveRoutineItem();
                                                        } else if (e.key === 'Escape') {
                                                            handleCancelRoutineItemEdit();
                                                        }
                                                    }}
                                                    autoFocus
                                                    style={{
                                                        flex: 1,
                                                        background: 'transparent',
                                                        border: '1px solid var(--glass-border)',
                                                        borderRadius: '6px',
                                                        padding: '4px 8px',
                                                        fontSize: '14px',
                                                        color: 'var(--text-primary)',
                                                        outline: 'none',
                                                        fontFamily: 'inherit'
                                                    }}
                                                />
                                            ) : (
                                                <span 
                                                    style={{ 
                                                        flex: 1,
                                                        cursor: 'pointer',
                                                        padding: '2px 4px',
                                                        borderRadius: '4px',
                                                        transition: 'background 0.2s'
                                                    }}
                                                    onClick={() => handleEditRoutineItem('day', index)}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'transparent';
                                                    }}
                                                >
                                                    {item}
                                                </span>
                                            )}
                                        </li>
                                    );
                                })}
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
                                {basicRoutine.night.items.map((item, index) => {
                                    const isEditing = editingRoutineItem?.period === 'night' && editingRoutineItem?.index === index;
                                    return (
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
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editingRoutineItemValue}
                                                    onChange={(e) => setEditingRoutineItemValue(e.target.value)}
                                                    onBlur={handleSaveRoutineItem}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleSaveRoutineItem();
                                                        } else if (e.key === 'Escape') {
                                                            handleCancelRoutineItemEdit();
                                                        }
                                                    }}
                                                    autoFocus
                                                    style={{
                                                        flex: 1,
                                                        background: 'transparent',
                                                        border: '1px solid var(--glass-border)',
                                                        borderRadius: '6px',
                                                        padding: '4px 8px',
                                                        fontSize: '14px',
                                                        color: 'var(--text-primary)',
                                                        outline: 'none',
                                                        fontFamily: 'inherit'
                                                    }}
                                                />
                                            ) : (
                                                <span 
                                                    style={{ 
                                                        flex: 1,
                                                        cursor: 'pointer',
                                                        padding: '2px 4px',
                                                        borderRadius: '4px',
                                                        transition: 'background 0.2s'
                                                    }}
                                                    onClick={() => handleEditRoutineItem('night', index)}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'transparent';
                                                    }}
                                                >
                                                    {item}
                                                </span>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
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
