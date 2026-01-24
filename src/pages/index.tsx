import { motion, AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
    SFTrash
} from '../components/ui/SFIcons';
import { QuickActionsMenu } from '../components/ui/QuickActionsMenu';
import { useAppData } from '../context/AppDataContext';
import { useToday } from '../hooks/useToday';

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

export const Projects = () => {
    const { projects, addProject, updateProject } = useAppData();
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [projectContent, setProjectContent] = useState("");
    const [projectTitle, setProjectTitle] = useState("");
    const [projectStartDate, setProjectStartDate] = useState<string>("");
    const [projectEndDate, setProjectEndDate] = useState<string>("");
    const [projectStatus, setProjectStatus] = useState<'not-started' | 'in-progress' | 'completed'>('not-started');
    const [projectProgress, setProjectProgress] = useState<number>(0);
    const [pendingNewProject, setPendingNewProject] = useState(false);
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

    const handleAddProject = async () => {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:53',message:'handleAddProject ENTRY',data:{editingProjectId,projectsCount:projects.length,pendingNewProject},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,C'})}).catch(()=>{});
        // #endregion
        
        // Si ya hay un proyecto en edición, guardarlo primero
        if (editingProjectId) {
            await handleSaveProject();
        }
        
        const newProject = {
            title: "",
            description: "",
            status: 'not-started' as const,
            progress: 0
        };
        
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:66',message:'handleAddProject BEFORE_SET_PENDING',data:{newProject},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        
        setPendingNewProject(true);
        
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:69',message:'handleAddProject BEFORE_ADD_PROJECT',data:{pendingNewProject:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        try {
            await addProject(newProject);
            
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:73',message:'handleAddProject AFTER_ADD_PROJECT',data:{projectsCount:projects.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            
            // El formulario se abrirá automáticamente cuando el proyecto se cree
            // gracias al useEffect que detecta pendingNewProject
        } catch (error) {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:78',message:'handleAddProject ERROR',data:{error:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            console.error("❌ Error creando proyecto:", error);
            setPendingNewProject(false);
            alert(`Error al crear el proyecto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    };

    // Efecto para abrir el editor cuando se crea un nuevo proyecto
    useEffect(() => {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:80',message:'useEffect openEditor ENTRY',data:{pendingNewProject,projectsLength:projects.length,editingProjectId,projectsIds:projects.map(p=>p.id),projectsTitles:projects.map(p=>p.title)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B,C,D'})}).catch(()=>{});
        // #endregion
        
        if (pendingNewProject && projects.length > 0) {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:83',message:'useEffect openEditor CONDITION_MET',data:{pendingNewProject,projectsLength:projects.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            
            // Buscar el proyecto más reciente (sin título o con título vacío)
            const newProjects = projects
                .filter(p => (!p.title || p.title === "" || p.title === "Nuevo proyecto") && (!editingProjectId || p.id !== editingProjectId));
            
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:87',message:'useEffect openEditor FILTER_RESULT',data:{newProjectsCount:newProjects.length,newProjectsIds:newProjects.map(p=>p.id),newProjectsTitles:newProjects.map(p=>p.title)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            
            const sortedProjects = newProjects.sort((a, b) => {
                // Ordenar por created_at si existe
                if (a.created_at && b.created_at) {
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                }
                // Si no, usar timestamp del ID
                const aTime = a.id.includes('-') ? parseInt(a.id.split('-')[1] || '0') : 0;
                const bTime = b.id.includes('-') ? parseInt(b.id.split('-')[1] || '0') : 0;
                return bTime - aTime;
            });
            
            if (sortedProjects.length > 0) {
                const newProject = sortedProjects[0];
                
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:100',message:'useEffect openEditor SETTING_EDITING_ID',data:{newProjectId:newProject.id,newProjectTitle:newProject.title,editingProjectIdBefore:editingProjectId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                // #endregion
                
                setEditingProjectId(newProject.id);
                setProjectTitle(newProject.title || "");
                setProjectContent(newProject.description || "");
                setProjectStartDate(newProject.start_date || "");
                setProjectEndDate(newProject.end_date || "");
                setProjectStatus(newProject.status);
                setProjectProgress(newProject.progress);
                setPendingNewProject(false);
                
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:107',message:'useEffect openEditor AFTER_SET',data:{editingProjectIdAfter:newProject.id,pendingNewProjectAfter:false},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                // #endregion
            } else {
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:110',message:'useEffect openEditor NO_PROJECTS_FOUND',data:{projectsCount:projects.length,allProjectsTitles:projects.map(p=>p.title),allProjectsIds:projects.map(p=>p.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                // #endregion
            }
        }
    }, [projects, pendingNewProject, editingProjectId]);

    // Efecto para actualizar editingProjectId si el ID del proyecto cambió (después de guardar en Supabase)
    useEffect(() => {
        if (editingProjectId && editingProjectId.startsWith('project-')) {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:94',message:'useEffect ID sync check',data:{editingProjectId,projectTitle,availableProjects:projects.map(p=>({id:p.id,title:p.title}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            // Si estamos editando un proyecto con ID temporal, buscar si hay uno con ID real
            const projectWithTempId = projects.find(p => p.id === editingProjectId);
            if (!projectWithTempId) {
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:98',message:'useEffect temp ID not found, searching',data:{editingProjectId,projectTitle,availableProjects:projects.map(p=>({id:p.id,title:p.title}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                // #endregion
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
                    // #region agent log
                    fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:120',message:'useEffect updating ID from temp to real',data:{oldId:editingProjectId,newId:recentProject.id,title:recentProject.title},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                    // #endregion
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
        if (editingProjectId && !isSaving) {
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
        }
    };

    const handleSaveProject = async () => {
        console.log('💾 [handleSaveProject] INICIO - Estado actual:', {
            isSaving,
            editingProjectId,
            projectTitle,
            projectContentLength: projectContent.length,
            projectsCount: projects.length,
            projectsIds: projects.map(p => p.id)
        });
        
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:246',message:'handleSaveProject ENTRY',data:{isSaving,editingProjectId,projectTitle,projectContentLength:projectContent.length,projectsCount:projects.length,projectsIds:projects.map(p=>p.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,D'})}).catch(()=>{});
        // #endregion
        
        if (isSaving) {
            console.warn('⚠️ [handleSaveProject] Ya se está guardando, ignorando llamada duplicada');
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:249',message:'handleSaveProject BLOCKED_BY_IS_SAVING',data:{isSaving},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            return;
        }

        if (!editingProjectId) {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:254',message:'handleSaveProject NO_EDITING_ID',data:{editingProjectId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            alert('No hay proyecto seleccionado para guardar');
            return;
        }

        setIsSaving(true);
        
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:260',message:'handleSaveProject SET_IS_SAVING_TRUE',data:{editingProjectId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion

        const titleToSave = projectTitle.trim() || "Sin título";
        const descriptionToSave = projectContent.trim();
        
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:265',message:'handleSaveProject PREPARED_DATA',data:{titleToSave,descriptionToSaveLength:descriptionToSave.length,editingProjectId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion

        // Buscar el proyecto - primero por ID, luego por título si es un ID temporal
        let existingProject = projects.find(p => p.id === editingProjectId);
        let projectIdToUse = editingProjectId;
        
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:271',message:'handleSaveProject PROJECT_SEARCH_BY_ID',data:{editingProjectId,found:!!existingProject,projectIdToUse,allProjectsIds:projects.map(p=>p.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        
        // Si no encontramos el proyecto con el ID actual, buscar el más reciente
        if (!existingProject) {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:276',message:'handleSaveProject PROJECT_NOT_FOUND_SEARCHING_BY_TITLE',data:{editingProjectId,titleToSave,projectsCount:projects.length,allProjectsTitles:projects.map(p=>p.title)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            
            const projectByTitle = projects
                .filter(p => {
                    if (titleToSave && titleToSave !== "Sin título" && titleToSave !== "Nuevo proyecto") {
                        return p.title === titleToSave || !p.title || p.title === "";
                    }
                    return !p.title || p.title === "" || p.title === "Nuevo proyecto";
                })
                .sort((a, b) => {
                    if (a.created_at && b.created_at) {
                        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                    }
                    const aTime = a.id.includes('-') ? parseInt(a.id.split('-')[1] || '0') : 0;
                    const bTime = b.id.includes('-') ? parseInt(b.id.split('-')[1] || '0') : 0;
                    return bTime - aTime;
                })[0];
            
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:293',message:'handleSaveProject PROJECT_SEARCH_BY_TITLE_RESULT',data:{foundByTitle:!!projectByTitle,projectByTitleId:projectByTitle?.id,projectByTitleTitle:projectByTitle?.title},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            
            if (projectByTitle) {
                existingProject = projectByTitle;
                projectIdToUse = projectByTitle.id;
                setEditingProjectId(projectByTitle.id);
                
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:299',message:'handleSaveProject UPDATED_EDITING_ID',data:{oldId:editingProjectId,newId:projectIdToUse},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                // #endregion
            }
        }
        
        if (!existingProject) {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:305',message:'handleSaveProject PROJECT_NOT_FOUND_ERROR',data:{editingProjectId,projectIdToUse,projectsCount:projects.length,allProjectsIds:projects.map(p=>p.id),allProjectsTitles:projects.map(p=>p.title)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            setIsSaving(false);
            alert('Error: El proyecto no se encontró. Por favor, intenta de nuevo.');
            return;
        }

        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:312',message:'handleSaveProject BEFORE_UPDATE_PROJECT',data:{projectIdToUse,titleToSave,descriptionToSaveLength:descriptionToSave.length,existingProjectId:existingProject.id,existingProjectTitle:existingProject.title},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion

        // Cerrar el editor INMEDIATAMENTE para feedback instantáneo
        // El guardado continuará en segundo plano
        setIsSaving(false);
        setEditingProjectId(null);
        setProjectTitle("");
        setProjectContent("");
        setProjectStartDate("");
        setProjectEndDate("");
        setProjectStatus('not-started');
        setProjectProgress(0);
        
        console.log('💾 [handleSaveProject] Formulario cerrado. Guardando proyecto en segundo plano...');
        
        // Guardar en segundo plano (sin await para no bloquear)
        // Usar void para indicar que no esperamos el resultado
        void (async () => {
            try {
                await updateProject(projectIdToUse, {
                    title: titleToSave,
                    description: descriptionToSave,
                    start_date: projectStartDate || undefined,
                    end_date: projectEndDate || undefined,
                    status: projectStatus,
                    progress: projectProgress
                });
                
                console.log('✅ [handleSaveProject] Proyecto guardado exitosamente en segundo plano');
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:352',message:'handleSaveProject UPDATE_PROJECT_SUCCESS_BACKGROUND',data:{projectIdToUse,titleToSave},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                // #endregion
            } catch (error: unknown) {
                console.error('❌ [handleSaveProject] Error al guardar proyecto en segundo plano:', error);
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:358',message:'handleSaveProject UPDATE_PROJECT_ERROR_BACKGROUND',data:{projectIdToUse,error:error instanceof Error?error.message:String(error),errorType:typeof error},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                // #endregion
                const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
                // Mostrar error pero sin volver a abrir el formulario
                alert(`Error al guardar el proyecto: ${errorMessage}`);
            }
        })();
    };

    const handleBackToList = () => {
        setEditingProjectId(null);
        setProjectTitle("");
        setProjectContent("");
        setProjectStartDate("");
        setProjectEndDate("");
        setProjectStatus('not-started');
        setProjectProgress(0);
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
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="date"
                                            value={projectStartDate}
                                            onChange={(e) => {
                                                setProjectStartDate(e.target.value);
                                            }}
                                            style={{
                                                position: 'absolute',
                                                opacity: 0,
                                                width: '100%',
                                                height: '100%',
                                                cursor: 'pointer',
                                                zIndex: 2,
                                                top: 0,
                                                left: 0
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className="link-button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                const input = e.currentTarget.parentElement?.querySelector('input[type="date"]') as HTMLInputElement;
                                                if (input) {
                                                    try {
                                                        input.showPicker?.();
                                                    } catch {
                                                        input.click();
                                                    }
                                                }
                                            }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '8px 12px',
                                                fontSize: '13px',
                                                width: '100%',
                                                justifyContent: 'flex-start',
                                                pointerEvents: 'auto'
                                            }}
                                        >
                                            <SFCalendar size={14} />
                                            <span>
                                                {projectStartDate 
                                                    ? (() => {
                                                        try {
                                                            const date = projectStartDate.includes('T') 
                                                                ? new Date(projectStartDate) 
                                                                : new Date(projectStartDate + 'T00:00:00');
                                                            return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
                                                        } catch {
                                                            return projectStartDate;
                                                        }
                                                    })()
                                                    : 'Seleccionar'
                                                }
                                            </span>
                                        </button>
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
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="date"
                                            value={projectEndDate}
                                            onChange={(e) => {
                                                setProjectEndDate(e.target.value);
                                            }}
                                            style={{
                                                position: 'absolute',
                                                opacity: 0,
                                                width: '100%',
                                                height: '100%',
                                                cursor: 'pointer',
                                                zIndex: 2,
                                                top: 0,
                                                left: 0
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className="link-button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                const input = e.currentTarget.parentElement?.querySelector('input[type="date"]') as HTMLInputElement;
                                                if (input) {
                                                    try {
                                                        input.showPicker?.();
                                                    } catch {
                                                        input.click();
                                                    }
                                                }
                                            }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '8px 12px',
                                                fontSize: '13px',
                                                width: '100%',
                                                justifyContent: 'flex-start',
                                                pointerEvents: 'auto'
                                            }}
                                        >
                                            <SFCalendar size={14} />
                                            <span>
                                                {projectEndDate 
                                                    ? (() => {
                                                        try {
                                                            const date = projectEndDate.includes('T') 
                                                                ? new Date(projectEndDate) 
                                                                : new Date(projectEndDate + 'T00:00:00');
                                                            return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
                                                        } catch {
                                                            return projectEndDate;
                                                        }
                                                    })()
                                                    : 'Seleccionar'
                                                }
                                            </span>
                                        </button>
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
                                        return (
                                            <div 
                                                key={project.id}
                                                className="list-item"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleProjectClick(project.id)}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'transparent';
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
                {/* #region agent log */}
                {(() => {
                    fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:435',message:'RENDER_CHECK_FORM',data:{editingProjectId,willRenderForm:!!editingProjectId,projectTitle,projectContentLength:projectContent.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
                    return null;
                })()}
                {/* #endregion */}
                {editingProjectId && (
                    <>
                        {/* #region agent log */}
                        {(() => {
                            fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:440',message:'RENDER_FORM_VISIBLE',data:{editingProjectId,projectTitle,projectContentLength:projectContent.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
                            return null;
                        })()}
                        {/* #endregion */}
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
            </div>
        </div>
    );
};
export const Finances = () => {
    const { balance, income, expenses, transactions, addTransaction } = useAppData();
    const percentUsed = Math.round((expenses / Math.max(income, 1)) * 100);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showInvestmentsModal, setShowInvestmentsModal] = useState(false);
    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState("");
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');

    const handleAddTransaction = () => {
        if (!amount || !title) return;
        
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) return;

        addTransaction({
            title,
            category: category || 'General',
            amount: transactionType === 'income' ? numAmount : -numAmount
        });

        // Reset form
        setAmount("");
        setTitle("");
        setCategory("");
        setStep(1);
        setShowAddModal(false);
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
                    <div className="hero-card" style={{ 
                        background: 'var(--glass-bg-base)',
                        border: '1px solid var(--glass-border)'
                    }}>
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
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'rgba(41, 151, 255, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(41, 151, 255, 0.2)'
                            }}>
                                <span style={{ color: 'var(--ios-blue)' }}><SFWallet size={24} /></span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Resumen Financiero - Elegante y Contundente */}
                <section className="app-section">
                    <div 
                        className="hero-card" 
                        onClick={() => setShowInvestmentsModal(true)}
                        style={{ 
                            cursor: 'pointer',
                            background: 'var(--glass-bg-base)',
                            border: '1px solid var(--glass-border)',
                            transition: 'all 0.2s ease',
                            padding: '20px'
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
                            gridTemplateColumns: '1.2fr 1fr 1fr',
                            gap: '16px'
                        }}>
                            {/* Ingresos - Más llamativo */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                                padding: '16px',
                                borderRadius: '12px',
                                background: 'rgba(48, 219, 91, 0.06)',
                                border: '1px solid rgba(48, 219, 91, 0.15)'
                            }}>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '10px'
                                }}>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '8px',
                                        background: 'rgba(48, 219, 91, 0.15)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <span style={{ color: 'var(--ios-green)' }}><SFTrendingUp size={18} /></span>
                                    </div>
                                    <span style={{
                                        fontSize: '10px',
                                        fontWeight: '600',
                                        color: 'var(--text-tertiary)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.8px'
                                    }}>
                                        Ingresos
                                    </span>
                                </div>
                                <h3 style={{ 
                                    margin: 0, 
                                    fontSize: '24px', 
                                    fontWeight: '700',
                                    color: 'var(--ios-green)',
                                    lineHeight: '1.1'
                                }}>
                                    ${income.toLocaleString('es-CO')}
                                </h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontSize: '14px', color: 'var(--ios-green)', fontWeight: '600' }}>↑</span>
                                    <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', opacity: 0.8 }}>
                                        {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                    </span>
                                </div>
                            </div>

                            {/* Gastos - Menos llamativo */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                                padding: '16px',
                                borderRadius: '12px',
                                background: 'var(--glass-bg-base)',
                                border: '1px solid var(--glass-border)'
                            }}>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '10px'
                                }}>
                                    <span style={{ color: 'var(--ios-red)', opacity: 0.8 }}><SFArrowDownRight size={16} /></span>
                                    <span style={{
                                        fontSize: '10px',
                                        fontWeight: '600',
                                        color: 'var(--text-tertiary)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.8px',
                                        opacity: 0.8
                                    }}>
                                        Gastos
                                    </span>
                                </div>
                                <h3 style={{ 
                                    margin: 0, 
                                    fontSize: '20px', 
                                    fontWeight: '700',
                                    color: 'var(--ios-red)',
                                    lineHeight: '1.1'
                                }}>
                                    ${expenses.toLocaleString('es-CO')}
                                </h3>
                                <span style={{
                                    fontSize: '10px',
                                    color: 'var(--text-tertiary)',
                                    opacity: 0.7
                                }}>
                                    {percentUsed}%
                                </span>
                            </div>

                            {/* Inversiones - Más llamativo aún */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                                padding: '16px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, rgba(94, 92, 230, 0.12) 0%, rgba(191, 90, 242, 0.08) 100%)',
                                border: '1px solid rgba(94, 92, 230, 0.2)',
                                boxShadow: '0 2px 8px rgba(94, 92, 230, 0.1)'
                            }}>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '10px'
                                }}>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '8px',
                                        background: 'linear-gradient(135deg, rgba(94, 92, 230, 0.25) 0%, rgba(191, 90, 242, 0.25) 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 2px 6px rgba(94, 92, 230, 0.2)'
                                    }}>
                                        <span style={{ color: 'var(--ios-indigo)' }}><SFTrendingUp size={18} /></span>
                                    </div>
                                    <span style={{
                                        fontSize: '10px',
                                        fontWeight: '600',
                                        color: 'var(--ios-indigo)',
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
                                    color: 'var(--ios-indigo)',
                                    lineHeight: '1.1'
                                }}>
                                    $0
                                </h3>
                                <span style={{
                                    fontSize: '10px',
                                    color: 'var(--text-tertiary)',
                                    opacity: 0.7
                                }}>
                                    Sin inversiones
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Movimientos recientes */}
                <section className="app-section">
                    <div className="section-title">
                        <h3>Movimientos recientes</h3>
                        <button 
                            className="icon-button"
                            onClick={() => setShowAddModal(true)}
                            style={{ marginLeft: 'auto' }}
                            aria-label="Agregar movimiento"
                        >
                            <SFPlus size={18} />
                        </button>
                    </div>
                    <div className="list-card">
                        {transactions.length === 0 ? (
                            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                                <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', margin: 0 }}>
                                    No hay movimientos aún
                                </p>
                            </div>
                        ) : (
                            transactions.map((tx) => (
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
                            ))
                        )}
                    </div>
                </section>
            </div>

            {/* Modal para agregar movimiento */}
            {showAddModal && (
                <div className="calendar-backdrop" onClick={() => {
                    setShowAddModal(false);
                    setStep(1);
                    setAmount("");
                    setTitle("");
                    setCategory("");
                }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="calendar-modal-card"
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxWidth: '400px', width: '90%' }}
                    >
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            marginBottom: '20px'
                        }}>
                            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                                {step === 1 ? 'Cantidad' : step === 2 ? 'Nombre' : 'Detalles'}
                            </h2>
                            <button
                                className="icon-button"
                                onClick={() => {
                                    setShowAddModal(false);
                                    setStep(1);
                                    setAmount("");
                                    setTitle("");
                                    setCategory("");
                                }}
                                aria-label="Cerrar"
                            >
                                ×
                            </button>
                        </div>

                        {/* Paso 1: Tipo y Cantidad */}
                        {step === 1 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ 
                                        fontSize: '12px', 
                                        fontWeight: '600', 
                                        color: 'var(--text-tertiary)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        marginBottom: '8px',
                                        display: 'block'
                                    }}>
                                        Tipo
                                    </label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            type="button"
                                            onClick={() => setTransactionType('income')}
                                            style={{
                                                flex: 1,
                                                padding: '12px',
                                                borderRadius: '12px',
                                                border: 'none',
                                                background: transactionType === 'income' 
                                                    ? 'var(--ios-green)' 
                                                    : 'rgba(255, 255, 255, 0.06)',
                                                color: transactionType === 'income' ? '#fff' : 'var(--text-primary)',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            Ingreso
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTransactionType('expense')}
                                            style={{
                                                flex: 1,
                                                padding: '12px',
                                                borderRadius: '12px',
                                                border: 'none',
                                                background: transactionType === 'expense' 
                                                    ? 'var(--ios-red)' 
                                                    : 'rgba(255, 255, 255, 0.06)',
                                                color: transactionType === 'expense' ? '#fff' : 'var(--text-primary)',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            Gasto
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ 
                                        fontSize: '12px', 
                                        fontWeight: '600', 
                                        color: 'var(--text-tertiary)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        marginBottom: '8px',
                                        display: 'block'
                                    }}>
                                        Cantidad
                                    </label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0"
                                        autoFocus
                                        style={{
                                            width: '100%',
                                            padding: '14px',
                                            fontSize: '24px',
                                            fontWeight: '600',
                                            background: 'rgba(255, 255, 255, 0.06)',
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: '12px',
                                            color: 'var(--text-primary)',
                                            outline: 'none',
                                            textAlign: 'center'
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && amount) {
                                                setStep(2);
                                            }
                                        }}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => amount && setStep(2)}
                                    disabled={!amount || parseFloat(amount) <= 0}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        borderRadius: '12px',
                                        border: 'none',
                                        background: amount && parseFloat(amount) > 0 
                                            ? 'var(--ios-blue)' 
                                            : 'rgba(255, 255, 255, 0.06)',
                                        color: amount && parseFloat(amount) > 0 ? '#fff' : 'var(--text-secondary)',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        cursor: amount && parseFloat(amount) > 0 ? 'pointer' : 'not-allowed',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    Continuar
                                </button>
                            </div>
                        )}

                        {/* Paso 2: Nombre */}
                        {step === 2 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ 
                                        fontSize: '12px', 
                                        fontWeight: '600', 
                                        color: 'var(--text-tertiary)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        marginBottom: '8px',
                                        display: 'block'
                                    }}>
                                        Nombre del producto
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Ej: Comida, Transporte, Salario..."
                                        autoFocus
                                        style={{
                                            width: '100%',
                                            padding: '14px',
                                            fontSize: '16px',
                                            background: 'rgba(255, 255, 255, 0.06)',
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: '12px',
                                            color: 'var(--text-primary)',
                                            outline: 'none'
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && title.trim()) {
                                                setStep(3);
                                            }
                                        }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        style={{
                                            flex: 1,
                                            padding: '14px',
                                            borderRadius: '12px',
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
                                        onClick={() => title.trim() && setStep(3)}
                                        disabled={!title.trim()}
                                        style={{
                                            flex: 1,
                                            padding: '14px',
                                            borderRadius: '12px',
                                            border: 'none',
                                            background: title.trim() ? 'var(--ios-blue)' : 'rgba(255, 255, 255, 0.06)',
                                            color: title.trim() ? '#fff' : 'var(--text-secondary)',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            cursor: title.trim() ? 'pointer' : 'not-allowed',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Continuar
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Paso 3: Detalles opcionales */}
                        {step === 3 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ 
                                        fontSize: '12px', 
                                        fontWeight: '600', 
                                        color: 'var(--text-tertiary)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        marginBottom: '8px',
                                        display: 'block'
                                    }}>
                                        Categoría (opcional)
                                    </label>
                                    <input
                                        type="text"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        placeholder="Ej: Alimentación, Transporte..."
                                        autoFocus
                                        style={{
                                            width: '100%',
                                            padding: '14px',
                                            fontSize: '16px',
                                            background: 'rgba(255, 255, 255, 0.06)',
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: '12px',
                                            color: 'var(--text-primary)',
                                            outline: 'none'
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleAddTransaction();
                                            }
                                        }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        style={{
                                            flex: 1,
                                            padding: '14px',
                                            borderRadius: '12px',
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
                                        style={{
                                            flex: 1,
                                            padding: '14px',
                                            borderRadius: '12px',
                                            border: 'none',
                                            background: 'var(--ios-green)',
                                            color: '#fff',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Guardar
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}

            {/* Modal de Resumen Financiero Detallado - Sin Scroll, Bien Organizado */}
            {showInvestmentsModal && (
                <div 
                    className="calendar-backdrop" 
                    onClick={() => setShowInvestmentsModal(false)}
                    style={{ background: 'rgba(0, 0, 0, 0.3)' }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="calendar-modal-card"
                        onClick={(e) => e.stopPropagation()}
                        style={{ 
                            maxWidth: '420px', 
                            width: '90%',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--glass-border)',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        {/* Header compacto */}
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            padding: '12px 16px',
                            borderBottom: '1px solid var(--glass-border)'
                        }}>
                            <h2 style={{ 
                                margin: 0, 
                                fontSize: '16px', 
                                fontWeight: '700',
                                color: 'var(--text-primary)'
                            }}>
                                Resumen Financiero
                            </h2>
                            <button
                                className="icon-button"
                                onClick={() => setShowInvestmentsModal(false)}
                                aria-label="Cerrar"
                                style={{ 
                                    width: '26px', 
                                    height: '26px',
                                    fontSize: '16px'
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {/* Contenido sin scroll - Grid organizado y compacto */}
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '8px',
                            padding: '14px',
                            flex: 1,
                            overflow: 'hidden'
                        }}>
                            {/* Grid de 2 columnas para ingresos y gastos */}
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: '1fr 1fr',
                                gap: '8px'
                            }}>
                                {/* Ingresos - Compacto y elegante */}
                                <div style={{
                                    padding: '10px',
                                    borderRadius: '8px',
                                    background: 'rgba(48, 219, 91, 0.08)',
                                    border: '1px solid rgba(48, 219, 91, 0.2)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    minHeight: '80px'
                                }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '4px',
                                        marginBottom: '4px'
                                    }}>
                                        <span style={{ color: 'var(--ios-green)' }}><SFTrendingUp size={14} /></span>
                                        <span style={{
                                            fontSize: '8px',
                                            fontWeight: '600',
                                            color: 'var(--text-tertiary)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.3px'
                                        }}>
                                            Ingresos
                                        </span>
                                    </div>
                                    <h3 style={{ 
                                        margin: 0, 
                                        fontSize: '18px', 
                                        fontWeight: '700',
                                        color: 'var(--ios-green)',
                                        lineHeight: '1.2',
                                        marginBottom: '2px',
                                        wordBreak: 'break-word',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        ${income.toLocaleString('es-CO')}
                                    </h3>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '2px',
                                        marginTop: 'auto',
                                        paddingTop: '2px'
                                    }}>
                                        <span style={{ fontSize: '9px', color: 'var(--ios-green)', fontWeight: '600' }}>↑</span>
                                        <span style={{ fontSize: '7px', color: 'var(--text-tertiary)', opacity: 0.7, whiteSpace: 'nowrap' }}>
                                            {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>
                                </div>

                                {/* Gastos - Compacto y elegante */}
                                <div style={{
                                    padding: '10px',
                                    borderRadius: '8px',
                                    background: 'var(--glass-bg-base)',
                                    border: '1px solid var(--glass-border)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    minHeight: '80px'
                                }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '4px',
                                        marginBottom: '4px'
                                    }}>
                                        <span style={{ color: 'var(--ios-red)', opacity: 0.8 }}><SFArrowDownRight size={14} /></span>
                                        <span style={{
                                            fontSize: '8px',
                                            fontWeight: '600',
                                            color: 'var(--text-tertiary)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.3px',
                                            opacity: 0.8
                                        }}>
                                            Gastos
                                        </span>
                                    </div>
                                    <h3 style={{ 
                                        margin: 0, 
                                        fontSize: '18px', 
                                        fontWeight: '700',
                                        color: 'var(--ios-red)',
                                        lineHeight: '1.2',
                                        marginBottom: '2px',
                                        wordBreak: 'break-word',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        ${expenses.toLocaleString('es-CO')}
                                    </h3>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '2px',
                                        marginTop: 'auto',
                                        paddingTop: '2px'
                                    }}>
                                        <span style={{ fontSize: '9px', color: 'var(--ios-red)', fontWeight: '600' }}>↓</span>
                                        <span style={{ fontSize: '7px', color: 'var(--text-tertiary)', opacity: 0.7, whiteSpace: 'nowrap' }}>
                                            {percentUsed}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Inversiones - Compacto y destacado */}
                            <div style={{
                                padding: '10px',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, rgba(94, 92, 230, 0.12) 0%, rgba(191, 90, 242, 0.08) 100%)',
                                border: '1px solid rgba(94, 92, 230, 0.25)',
                                boxShadow: '0 2px 6px rgba(94, 92, 230, 0.12)'
                            }}>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    marginBottom: '6px'
                                }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '6px'
                                    }}>
                                        <div style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '6px',
                                            background: 'linear-gradient(135deg, rgba(94, 92, 230, 0.3) 0%, rgba(191, 90, 242, 0.3) 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 2px 4px rgba(94, 92, 230, 0.2)',
                                            flexShrink: 0
                                        }}>
                                            <span style={{ color: 'var(--ios-indigo)' }}><SFTrendingUp size={16} /></span>
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ 
                                                margin: 0, 
                                                fontSize: '9px', 
                                                fontWeight: '600',
                                                color: 'var(--ios-indigo)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.3px',
                                                lineHeight: '1.2'
                                            }}>
                                                Inversiones
                                            </p>
                                        </div>
                                    </div>
                                    <h3 style={{ 
                                        margin: 0, 
                                        fontSize: '20px', 
                                        fontWeight: '700',
                                        color: 'var(--ios-indigo)',
                                        lineHeight: '1.1',
                                        wordBreak: 'break-word',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        $0
                                    </h3>
                                </div>

                                {/* Tipos de Inversión - Ultra compacto */}
                                <div style={{ 
                                    marginTop: '6px', 
                                    paddingTop: '6px', 
                                    borderTop: '1px solid rgba(94, 92, 230, 0.2)',
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr 1fr',
                                    gap: '4px'
                                }}>
                                    <div style={{
                                        padding: '4px 3px',
                                        borderRadius: '5px',
                                        background: 'rgba(94, 92, 230, 0.1)',
                                        border: '1px solid rgba(94, 92, 230, 0.2)',
                                        textAlign: 'center'
                                    }}>
                                        <span style={{ fontSize: '8px', color: 'var(--text-primary)', fontWeight: '500' }}>Acciones</span>
                                    </div>
                                    <div style={{
                                        padding: '4px 3px',
                                        borderRadius: '5px',
                                        background: 'rgba(94, 92, 230, 0.1)',
                                        border: '1px solid rgba(94, 92, 230, 0.2)',
                                        textAlign: 'center'
                                    }}>
                                        <span style={{ fontSize: '8px', color: 'var(--text-primary)', fontWeight: '500' }}>Fondos</span>
                                    </div>
                                    <div style={{
                                        padding: '4px 3px',
                                        borderRadius: '5px',
                                        background: 'rgba(94, 92, 230, 0.1)',
                                        border: '1px solid rgba(94, 92, 230, 0.2)',
                                        textAlign: 'center'
                                    }}>
                                        <span style={{ fontSize: '8px', color: 'var(--text-primary)', fontWeight: '500' }}>Cripto</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
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
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [tasksOpen, setTasksOpen] = useState(false);
    const [editingTaskInModal, setEditingTaskInModal] = useState<string | null>(null);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [completedModalOpen, setCompletedModalOpen] = useState(false);
    const [completedModalFilter, setCompletedModalFilter] = useState<'today' | 'tomorrow' | 'all' | 'tasks' | null>(null);
    const [progressModalOpen, setProgressModalOpen] = useState(false);
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
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editingEventId, setEditingEventId] = useState<string | null>(null);
    const { tasks, events, addTask, updateTask, deleteTask, addEvent, updateEvent, deleteEvent } = useAppData();

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
    
    const completedDayEvents = useMemo(() => {
        if (!Array.isArray(safeEvents)) return [];
        return safeEvents
            .filter((event) => event && event.event_date === todayDateString && event.completed)
            .map((event) => ({
                id: event.id || '',
                title: event.title || '',
                meta: event.description || '',
                time: event.event_time || ''
            }));
    }, [safeEvents, todayDateString]);

    // Todos los eventos completados ordenados por fecha
    const allCompletedEvents = useMemo(() => {
        if (!Array.isArray(safeEvents)) return [];
        return safeEvents
            .filter((event) => event && event.completed && event.event_date)
            .map((event) => ({
                id: event.id || '',
                title: event.title || '',
                meta: event.description || '',
                time: event.event_time || '',
                event_date: event.event_date || ''
            }))
            .sort((a, b) => {
                // Ordenar por fecha (más recientes primero)
                try {
                    const dateA = parseDateFromString(a.event_date);
                    const dateB = parseDateFromString(b.event_date);
                    if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
                    return dateB.getTime() - dateA.getTime();
                } catch (error) {
                    return 0;
                }
            });
    }, [safeEvents, parseDateFromString]);

    // Función para extraer fecha de una tarea desde el campo meta
    const extractTaskDate = useCallback((task: typeof safeTasks[0]): string | null => {
        // Logs de desarrollo deshabilitados para optimizar rendimiento
        if (!task?.meta) return null;
        // El formato puede ser: "Hora · Fecha" o solo "Fecha" o "Hoy - Fecha"
        const meta = task.meta;
        
        try {
            // Si contiene "Hoy", es de hoy
            if (meta.toLowerCase().includes('hoy')) {
                return todayDateString;
            }
            
            // Buscar patrones de fecha YYYY-MM-DD
            const isoDateMatch = meta.match(/(\d{4}-\d{2}-\d{2})/);
            if (isoDateMatch) {
                return isoDateMatch[1];
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
        // #region agent log
        try {
            fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:362',message:'Calculating tomorrowDate',data:{todayValid:today instanceof Date},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        } catch(e) {}
        // #endregion
        try {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const result = formatDateLocal(tomorrow);
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:366',message:'tomorrowDate calculated',data:{result,tomorrowDay:tomorrow.getDate(),todayDay:today.getDate()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            return result;
        } catch (error) {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:372',message:'Error calculating tomorrowDate',data:{error:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            const fallback = new Date();
            fallback.setDate(fallback.getDate() + 1);
            return formatDateLocal(fallback);
        }
    }, [today, formatDateLocal]);

    // Filtrar tareas por fecha
    const todayTasks = useMemo(() => {
        return safeTasks.filter(task => {
            if (!task) return false;
            const taskDate = extractTaskDate(task);
            // Si no tiene fecha en meta, es de hoy (tareas sin fecha son para hoy)
            // Si contiene "Hoy" o la fecha coincide con hoy, es de hoy
            return !taskDate || taskDate === todayDateString || task.meta?.toLowerCase().includes('hoy');
        });
    }, [safeTasks, extractTaskDate, todayDateString]);

    const tomorrowTasks = useMemo(() => {
        return safeTasks.filter(task => {
            if (!task) return false;
            const taskDate = extractTaskDate(task);
            return taskDate === tomorrowDate;
        });
    }, [safeTasks, extractTaskDate, tomorrowDate]);

    // Filtrar tareas: pendientes (no completadas) y completadas
    const pendingTasks = useMemo(() => safeTasks.filter(task => task && !task.completed), [safeTasks]);
    const completedTasks = useMemo(() => safeTasks.filter(task => task && task.completed), [safeTasks]);
    
    // Calcular promedio de tareas por día
    const tasksPerDayAverage = useMemo(() => {
        if (completedTasks.length === 0) return 0;
        
        // Agrupar tareas completadas por fecha
        const tasksByDate = new Map<string, number>();
        
        completedTasks.forEach((task) => {
            if (!task) return;
            const taskDate = extractTaskDate(task);
            if (taskDate) {
                const count = tasksByDate.get(taskDate) || 0;
                tasksByDate.set(taskDate, count + 1);
            }
        });
        
        if (tasksByDate.size === 0) return 0;
        
        // Calcular promedio
        const totalDays = tasksByDate.size;
        const totalTasks = completedTasks.length;
        return totalDays > 0 ? Number((totalTasks / totalDays).toFixed(1)) : 0;
    }, [completedTasks, extractTaskDate]);
    
    // Filtrar tareas de hoy: pendientes y completadas
    const pendingTodayTasks = useMemo(() => todayTasks.filter(task => task && !task.completed), [todayTasks]);
    const completedTodayTasks = useMemo(() => todayTasks.filter(task => task && task.completed), [todayTasks]);
    
    // Filtrar tareas de mañana: completadas (pendientes no se usan actualmente)
    const completedTomorrowTasks = useMemo(() => tomorrowTasks.filter(task => task && task.completed), [tomorrowTasks]);
    
    const visibleTasks = useMemo(() => pendingTasks.slice(0, 3), [pendingTasks]);
    
    // Calcular contadores con useMemo para que se actualicen automáticamente
    const pendingCount = useMemo(() => pendingTasks.length, [pendingTasks]);
    const pendingTodayCount = useMemo(() => pendingTodayTasks.length, [pendingTodayTasks]);
    const completedTodayCount = useMemo(() => completedTodayTasks.length, [completedTodayTasks]);
    // Contar todos los eventos no completados (hoy y futuros)
    const eventsCount = useMemo(() => allUpcomingEvents.length, [allUpcomingEvents.length]);
    // Separar contadores: tareas y eventos son independientes
    const totalTodayCount = useMemo(() => pendingTodayCount, [pendingTodayCount]); // Solo tareas
    
    // Determinar el estado del progreso: 'today', 'tomorrow', 'general'
    const progressState = useMemo(() => {
        // #region agent log
        try {
            fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:457',message:'progressState useMemo start',data:{totalTodayCount,pendingTodayCount,eventsCount,pendingTasksLength:pendingTasks?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        } catch(e) {}
        // #endregion
        try {
            // Solo contar tareas, no eventos
            const totalToday = totalTodayCount + completedTodayCount;
            const hasTodayTasks = totalToday > 0;
            const allTodayCompleted = totalToday > 0 && (pendingTodayCount === 0);
            
            // Obtener todas las fechas únicas de tareas pendientes (excluyendo hoy)
            const uniqueDates = new Set<string>();
            const futureDates = new Set<string>();
            
            pendingTasks.forEach(task => {
                try {
                    const taskDate = extractTaskDate(task);
                    if (taskDate && taskDate !== todayDateString) {
                        uniqueDates.add(taskDate);
                        // Verificar si la fecha es futura (más allá de mañana)
                        const taskDateObj = new Date(taskDate);
                        const tomorrowObj = new Date(tomorrowDate);
                        if (taskDateObj > tomorrowObj) {
                            futureDates.add(taskDate);
                        }
                    }
                } catch (error) {
                    // #region agent log
                    fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:420',message:'Error in progressState forEach',data:{error:String(error),taskId:task?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                    // #endregion
                }
            });
            
            // Si hay tareas para fechas futuras (más allá de mañana), mostrar progreso general
            if (futureDates.size > 0 || uniqueDates.size > 1) {
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:436',message:'progressState: general',data:{uniqueDatesSize:uniqueDates.size,futureDatesSize:futureDates.size},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                // #endregion
                return 'general';
            }
            
            // Si no hay tareas para hoy
            if (!hasTodayTasks) {
                // Verificar si hay tareas para mañana
                const hasTomorrowTasks = tomorrowTasks.length > 0;
                if (hasTomorrowTasks) {
                    // #region agent log
                    fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:430',message:'progressState: tomorrow (no tasks today)',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                    // #endregion
                    return 'tomorrow';
                }
            }
            
            // Si todas las tareas de hoy están completadas
            if (allTodayCompleted) {
                // Verificar si hay tareas pendientes para mañana u otros días
                const hasTomorrowTasks = tomorrowTasks.length > 0;
                
                // Si solo hay tareas para mañana
                if (hasTomorrowTasks && uniqueDates.size === 1 && uniqueDates.has(tomorrowDate)) {
                    // #region agent log
                    fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:430',message:'progressState: tomorrow',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                    // #endregion
                    return 'tomorrow';
                }
                // Si hay tareas para mañana (aunque no haya pendientes, puede haber completadas)
                // pero solo si hay tareas pendientes para mañana
                if (hasTomorrowTasks && tomorrowTasks.some(t => !t.completed)) {
                    return 'tomorrow';
                }
            }
            
            // Por defecto, mostrar progreso de hoy
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:516',message:'progressState: today (default)',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            return 'today';
        } catch (error) {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:520',message:'Error in progressState',data:{error:String(error),errorStack:error instanceof Error ? error.stack : 'no stack'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
            // #endregion
            return 'today';
        }
    }, [totalTodayCount, completedTodayCount, pendingTodayCount, pendingTasks, extractTaskDate, todayDateString, tomorrowDate, tomorrowTasks]);
    
    // Calcular progreso con useMemo para que se actualice automáticamente (solo tareas, no eventos)
    const progressData = useMemo(() => {
        if (progressState === 'today') {
            const total = totalTodayCount + completedTodayCount;
            const completed = completedTodayCount;
            if (total === 0) {
                return { 
                    percentage: 0, 
                    percentageText: '0% completado', 
                    allCompleted: false,
                    label: 'Progreso de hoy',
                    state: 'today'
                };
            }
            const percentage = Math.round((completed / total) * 100);
            const allCompleted = total > 0 && completed === total;
            return { 
                percentage, 
                percentageText: allCompleted ? '100% completado' : `${percentage}% completado`,
                total,
                completed,
                allCompleted,
                label: 'Progreso de hoy',
                state: 'today'
            };
        } else if (progressState === 'tomorrow') {
            const tomorrowPending = tomorrowTasks.filter(t => !t.completed).length;
            const tomorrowCompleted = tomorrowTasks.filter(t => t.completed).length;
            const total = tomorrowPending + tomorrowCompleted;
            const completed = tomorrowCompleted;
            if (total === 0) {
                return {
                    percentage: 0,
                    percentageText: '0% completado',
                    allCompleted: false,
                    label: 'Progreso de mañana',
                    state: 'tomorrow'
                };
            }
            const percentage = Math.round((completed / total) * 100);
            return {
                percentage,
                percentageText: `${percentage}% completado`,
                total,
                completed,
                allCompleted: false,
                label: 'Progreso de mañana',
                state: 'tomorrow'
            };
        } else {
            // Progreso general: calcular sobre todas las tareas pendientes
            const totalPending = pendingTasks.length;
            const totalCompleted = completedTasks.length;
            const total = totalPending + totalCompleted;
            const completed = totalCompleted;
            if (total === 0) {
                return {
                    percentage: 0,
                    percentageText: '0% completado',
                    allCompleted: false,
                    label: 'Progreso general',
                    state: 'general'
                };
            }
            const percentage = Math.round((completed / total) * 100);
            return {
                percentage,
                percentageText: `${percentage}% completado`,
                total,
                completed,
                allCompleted: false,
                label: 'Progreso general',
                state: 'general'
            };
        }
    }, [progressState, totalTodayCount, completedTodayCount, tomorrowTasks, pendingTasks, completedTasks]);
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
        // #region agent log
        try {
            fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:1211',message:'calendarDays useMemo start',data:{hasSelectedMonth:!!selectedMonth,hasToday:!!today,todayValid:today instanceof Date},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        } catch (error) {
            console.error('Error logging calendarDays start:', error);
        }
        // #endregion
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
        setCalendarOpen(true);
    };

    const SwipeCompletedTaskItem = ({
        task
    }: {
        task: { id: string; title: string; meta: string; priority: string; completed?: boolean };
    }) => {
        const [offset, setOffset] = useState(0);
        const [open, setOpen] = useState(false);
        const [isRestoring, setIsRestoring] = useState(false);
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
            // Deslizar de izquierda a derecha (opuesto al normal)
            const next = Math.min(120, Math.max(0, deltaX));
            setOffset(next);
            setOpen(next > 10);
        };

        const onPointerUp = () => {
            if (!draggingRef.current) return;
            draggingRef.current = false;
            if (offset > 60) {
                // Si se deslizó lo suficiente, restaurar la tarea
                handleRestore();
            } else {
                setOffset(0);
                setOpen(false);
            }
        };

        const handleRestore = () => {
            setIsRestoring(true);
            setTimeout(() => {
                setIsExiting(true);
            }, 100);
        };

        const handleAnimationComplete = () => {
            if (isExiting && task?.id) {
                try {
                    updateTask(task.id, { completed: false });
                } catch (error) {
                    console.error("Error restaurando tarea:", error);
                }
            }
        };

        // Para deslizar de izquierda a derecha, el botón debe estar a la izquierda
        const actionsTranslate = offset - 120;

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
                    opacity: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
                    scale: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
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
                <motion.div
                    className="swipe-actions"
                    animate={{ 
                        transform: `translateX(${actionsTranslate}px)`
                    }}
                    transition={{ 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 30 
                    }}
                    style={{ 
                        left: 0,
                        right: 'auto',
                        width: '120px',
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'stretch',
                        gap: 0,
                        padding: 0,
                        pointerEvents: open ? 'auto' : 'none'
                    }}
                >
                    <button
                        className="swipe-action edit"
                        onClick={handleRestore}
                        style={{ 
                            backgroundColor: 'var(--ios-green)',
                            borderRadius: '12px 0 0 12px',
                            width: '100%',
                            border: 'none',
                            padding: '0 10px',
                            fontSize: '10px',
                            fontWeight: '600',
                            color: '#ffffff',
                            cursor: 'pointer'
                        }}
                    >
                        Restaurar
                    </button>
                </motion.div>
                <motion.div
                    className={clsx("list-item swipe-content", open && "open")}
                    animate={{ 
                        transform: `translateX(${offset}px)`,
                        opacity: isRestoring ? 0.6 : 0.7
                    }}
                    transition={{ 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 30 
                    }}
                    style={{ 
                        background: 'transparent',
                        position: 'relative',
                        zIndex: 1
                    }}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                >
                    <div className="list-icon" style={{ backgroundColor: 'transparent', color: 'var(--ios-blue)' }}>
                        <SFCheckCircle size={18} />
                    </div>
                    <div className="list-content">
                        <p style={{ textDecoration: 'line-through', color: 'var(--text-secondary)' }}>{task.title}</p>
                        <span style={{ color: 'var(--text-tertiary)' }}>{task.meta}</span>
                    </div>
                    <span className="list-time" style={{ color: 'var(--text-tertiary)' }}>{task.priority}</span>
                </motion.div>
            </motion.div>
        );
    };

    const SwipeCompletedEventItem = ({
        event
    }: {
        event: { id: string; title: string; meta: string; time: string };
    }) => {
        const [offset, setOffset] = useState(0);
        const [open, setOpen] = useState(false);
        const [isRestoring, setIsRestoring] = useState(false);
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
            // Deslizar de izquierda a derecha (opuesto al normal)
            const next = Math.min(120, Math.max(0, deltaX));
            setOffset(next);
            setOpen(next > 10);
        };

        const onPointerUp = () => {
            if (!draggingRef.current) return;
            draggingRef.current = false;
            if (offset > 60) {
                // Si se deslizó lo suficiente, restaurar el evento
                handleRestore();
            } else {
                setOffset(0);
                setOpen(false);
            }
        };

        const handleRestore = () => {
            setIsRestoring(true);
            setTimeout(() => {
                setIsExiting(true);
            }, 100);
        };

        const handleAnimationComplete = () => {
            if (isExiting && event?.id) {
                try {
                    updateEvent(event.id, { completed: false });
                } catch (error) {
                    console.error("Error restaurando evento:", error);
                }
            }
        };

        // Para deslizar de izquierda a derecha, el botón debe estar a la izquierda
        const actionsTranslate = offset - 120;

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
                    opacity: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
                    scale: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
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
                <motion.div
                    className="swipe-actions"
                    animate={{ 
                        transform: `translateX(${actionsTranslate}px)`
                    }}
                    transition={{ 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 30 
                    }}
                    style={{ 
                        left: 0,
                        right: 'auto',
                        width: '120px',
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'stretch',
                        gap: 0,
                        padding: 0,
                        pointerEvents: open ? 'auto' : 'none'
                    }}
                >
                    <button
                        className="swipe-action edit"
                        onClick={handleRestore}
                        style={{ 
                            backgroundColor: 'var(--ios-green)',
                            borderRadius: '12px 0 0 12px',
                            width: '100%',
                            border: 'none',
                            padding: '0 10px',
                            fontSize: '10px',
                            fontWeight: '600',
                            color: '#ffffff',
                            cursor: 'pointer'
                        }}
                    >
                        Restaurar
                    </button>
                </motion.div>
                <motion.div
                    className={clsx("day-event-item horizontal swipe-content", open && "open")}
                    animate={{ 
                        transform: `translateX(${offset}px)`,
                        opacity: isRestoring ? 0.6 : 0.7
                    }}
                    transition={{ 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 30 
                    }}
                    style={{ 
                        background: 'transparent',
                        position: 'relative',
                        zIndex: 1
                    }}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                >
                    <div className="day-event-badge" style={{ backgroundColor: 'transparent', color: 'var(--ios-blue)' }}>
                        <SFCheckCircle size={16} />
                    </div>
                    <div className="day-event-info">
                        <span className="day-event-title" style={{ textDecoration: 'line-through', color: 'var(--text-secondary)' }}>{event.title}</span>
                        <span className="day-event-meta" style={{ color: 'var(--text-tertiary)' }}>{event.meta}</span>
                        <span className="day-event-time-range" style={{ color: 'var(--text-tertiary)' }}>{event.time}</span>
                    </div>
                </motion.div>
            </motion.div>
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
                        <span>{task?.meta || 'Sin fecha'}</span>
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
        event: { id: string; title: string; meta: string; time: string; event_date?: string };
    }) => {
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
                {/* Progreso de hoy */}
                <section className="app-section">
                    <div className="section-title">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <h3>Completados</h3>
                            <span className="pill" style={{ fontSize: '11px', fontWeight: '500' }}>
                                {progressData.completed} {progressData.completed === 1 ? 'completado' : 'completados'}
                            </span>
                        </div>
                    </div>
                    {/* #region agent log */}
                    {(() => {
                        try {
                            fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835ab84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:1487',message:'Rendering progress card',data:{progressState:progressData.state,allCompleted:progressData.allCompleted,hasProgressData:!!progressData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
                        } catch(e) {}
                        return null;
                    })()}
                    {/* #endregion */}
                    
                    {/* Calcular si todas las tareas de hoy están completadas (solo tareas, no eventos) */}
                    {(() => {
                        const totalToday = totalTodayCount + completedTodayCount;
                        const allTodayCompleted = totalToday > 0 && (pendingTodayCount === 0);
                        
                        return (
                            <>
                                {/* Bloque: Progreso de hoy (siempre visible, pero compacto cuando está completo) */}
                                <div 
                                    className={`hero-card ${allTodayCompleted ? 'hero-card-compact' : ''}`}
                                    style={{ 
                                        cursor: 'pointer',
                                        transition: 'opacity 0.2s ease'
                                    }}
                                    onClick={() => {
                                        setProgressModalOpen(true);
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
                                            <h2 className="hero-title">
                                                {progressData.state === 'today' ? progressData.percentageText : '100% completado'}
                                            </h2>
                                            {allTodayCompleted ? (
                                                null
                                            ) : (completedTodayCount > 0) ? (
                                                <div style={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: '8px',
                                                    flexWrap: 'wrap',
                                                    marginTop: '8px'
                                                }}>
                                                    {completedTodayCount > 0 && (
                                                        <div style={{ 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            gap: '6px',
                                                            color: 'var(--text-secondary)',
                                                            fontSize: '13px'
                                                        }}>
                                                            <SFCheckCircle size={14} className="text-[var(--ios-green)]" />
                                                            <span style={{ fontWeight: '500' }}>
                                                                {completedTodayCount} {completedTodayCount === 1 ? 'tarea completada' : 'tareas completadas'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <p style={{ 
                                                    color: 'var(--text-tertiary)', 
                                                    fontSize: '13px', 
                                                    margin: '8px 0 0 0' 
                                                }}>
                                                    Aún no hay tareas completadas hoy
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="hero-progress">
                                        <div 
                                            className="hero-progress-bar" 
                                            style={{ 
                                                width: `${progressData.state === 'today' ? progressData.percentage : 100}%`,
                                                backgroundColor: 'var(--ios-green)',
                                                transition: 'width 0.3s ease'
                                            }} 
                                        />
                                    </div>
                                </div>
                            </>
                        );
                    })()}
                </section>

                {/* Eventos */}
                <section className="app-section">
                    <div className="hero-card">
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
                                className="hero-icon-button"
                                aria-label="Abrir calendario"
                                onClick={() => setCalendarOpen(true)}
                            >
                                <SFCalendar size={18} />
                            </button>
                        </div>
                        {eventsCount > 0 ? (
                            <div className="day-event-list horizontal">
                                {allUpcomingEvents.filter(event => event && event.id).map((event) => (
                                    <SwipeEventItem key={event.id} event={event} />
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
                    </div>
                </section>

                <section className="app-section">
                    <div className="hero-card">
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
                                aria-label="Agregar tarea"
                                onClick={() => {
                                    if (showTaskForm) {
                                        setShowTaskForm(false);
                                    } else {
                                        handleOpenTaskForm();
                                    }
                                }}
                            >
                                <SFPlus size={18} />
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
                                            // #region agent log
                                            try {
                                                fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:2454',message:'Opening task date picker',data:{hasCalendarDays:!!calendarDays,hasCalendarWeekDays:!!calendarWeekDays,hasCalendarMonths:!!calendarMonths,hasMonthLabel:!!monthLabel,calendarView},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                                            } catch (error) {
                                                console.error('Error logging date picker open:', error);
                                            }
                                            // #endregion
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
                                <div className="section-title">
                                    <h3>{editingEventId ? "Editar evento" : "Nuevo evento"}</h3>
                                    <button
                                        className="link-button"
                                        onClick={() => setCalendarMode("calendar")}
                                    >
                                        Volver
                                    </button>
                                </div>
                                {eventDate && (() => {
                                    const selectedDateString = formatDateLocal(eventDate);
                                    const tasksForDate = safeTasks.filter(task => {
                                        if (!task) return false;
                                        const taskDate = extractTaskDate(task);
                                        return !taskDate || taskDate === selectedDateString || task.meta?.toLowerCase().includes('hoy');
                                    });
                                    
                                    // Filtrar eventos de la fecha seleccionada
                                    const eventsForDate = safeEvents.filter(event => {
                                        if (!event || !event.event_date) return false;
                                        return event.event_date === selectedDateString;
                                    });
                                    
                                    return (
                                        <>
                                            {eventsForDate.length > 0 && (
                                                <div className="list-card" style={{ marginBottom: '16px' }}>
                                                    <div style={{ 
                                                        fontSize: '12px', 
                                                        fontWeight: '600', 
                                                        color: 'var(--text-tertiary)', 
                                                        marginBottom: '8px',
                                                        padding: '0 4px'
                                                    }}>
                                                        Eventos de esta fecha ({eventsForDate.length})
                                                    </div>
                                                    <div>
                                                        {eventsForDate.map((event) => (
                                                            <SwipeEventItem 
                                                                key={event.id} 
                                                                event={{
                                                                    id: event.id || '',
                                                                    title: event.title || '',
                                                                    meta: event.description || '',
                                                                    time: event.event_time || ''
                                                                }} 
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {tasksForDate.length > 0 && (
                                                <div className="list-card" style={{ marginBottom: '16px' }}>
                                                    {tasksForDate.map((task) => (
                                                        <SwipeTaskItem key={task.id} task={task} />
                                                    ))}
                                                </div>
                                            )}
                                            <div className="event-form-card task-form-card">
                                                <div className="event-date-label" style={{ 
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px'
                                                }}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                                    </svg>
                                                    <span>
                                                        {eventDate.toLocaleDateString("es-ES", {
                                                            weekday: "long",
                                                            day: "numeric",
                                                            month: "long"
                                                        })}
                                                    </span>
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
                                                <select
                                                    className="task-input"
                                                    value={eventTime}
                                                    onChange={(event) => setEventTime(event.target.value)}
                                                    style={{ width: '100%' }}
                                                >
                                                    <option value="">Hora</option>
                                                    {timeSlots.map((slot) => (
                                                        <option key={slot} value={slot}>
                                                            {slot}
                                                        </option>
                                                    ))}
                                                </select>
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
                                    );
                                })()}
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
                                        Eventos realizados ({allCompletedEvents.length})
                                    </h4>
                                    
                                    {/* Estadística de tareas por día - Esquina superior derecha */}
                                    <div 
                                        onClick={() => {
                                            setCompletedModalOpen(true);
                                            setCompletedModalFilter('tasks');
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
                                            Promedio
                                        </p>
                                        <p style={{
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            color: 'var(--text-primary)',
                                            margin: 0,
                                            lineHeight: '1.2'
                                        }}>
                                            {tasksPerDayAverage} tareas/día
                                        </p>
                                    </div>
                                </div>
                                {allCompletedEvents.length > 0 ? (
                                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        {allCompletedEvents.map((event) => {
                                            let formattedDate = '';
                                            try {
                                                const eventDate = parseDateFromString(event.event_date);
                                                if (!isNaN(eventDate.getTime())) {
                                                    formattedDate = eventDate.toLocaleDateString('es-ES', {
                                                        day: 'numeric',
                                                        month: 'long'
                                                    });
                                                } else {
                                                    formattedDate = event.event_date;
                                                }
                                            } catch (error) {
                                                formattedDate = event.event_date;
                                            }
                                            
                                            return (
                                                <div
                                                    key={event.id}
                                                    className="list-item"
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '8px',
                                                        padding: '12px',
                                                        borderBottom: '1px solid var(--glass-border)'
                                                    }}
                                                >
                                                    <div style={{
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        color: 'var(--text-secondary)',
                                                        textTransform: 'capitalize'
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
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                                        <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', margin: 0 }}>
                                            No hay eventos completados
                                        </p>
                                    </div>
                                )}
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
                        onClick={() => {
                            setCompletedModalOpen(false);
                            setCompletedModalFilter(null);
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
                            <button
                                className="link-button"
                                onClick={() => {
                                    setCompletedModalOpen(false);
                                    setCompletedModalFilter(null);
                                }}
                                style={{ marginLeft: 'auto' }}
                            >
                                Cerrar
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {(() => {
                                // Filtrar tareas y eventos según el filtro seleccionado
                                let filteredCompletedTasks = completedTasks;
                                let filteredCompletedEvents = completedDayEvents;
                                
                                if (completedModalFilter === 'today') {
                                    // Solo tareas y eventos de hoy
                                    filteredCompletedTasks = completedTodayTasks;
                                    filteredCompletedEvents = completedDayEvents;
                                } else if (completedModalFilter === 'tomorrow') {
                                    // Solo tareas de mañana
                                    filteredCompletedTasks = completedTomorrowTasks;
                                    filteredCompletedEvents = []; // No hay eventos de mañana en este contexto
                                } else if (completedModalFilter === 'tasks') {
                                    // Solo tareas completadas (todas)
                                    filteredCompletedTasks = completedTasks;
                                    filteredCompletedEvents = [];
                                }
                                // Si es 'all' o null, mostrar todos
                                
                                return (
                                    <>
                                        {filteredCompletedTasks.length > 0 && (
                                            <div>
                                                <h4 style={{ 
                                                    fontSize: '13px', 
                                                    fontWeight: '600', 
                                                    color: 'var(--text-secondary)', 
                                                    marginBottom: '12px',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    Tareas completadas ({filteredCompletedTasks.length})
                                                </h4>
                                                <div className="list-card">
                                                    {filteredCompletedTasks.map((task) => (
                                                        <SwipeCompletedTaskItem key={task.id} task={task} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {filteredCompletedEvents.length > 0 && (
                                            <div>
                                                <h4 style={{ 
                                                    fontSize: '13px', 
                                                    fontWeight: '600', 
                                                    color: 'var(--text-secondary)', 
                                                    marginBottom: '12px',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    Eventos completados ({filteredCompletedEvents.length})
                                                </h4>
                                                <div className="list-card">
                                                    {filteredCompletedEvents.map((event) => (
                                                        <SwipeCompletedEventItem key={event.id} event={event} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {filteredCompletedTasks.length === 0 && filteredCompletedEvents.length === 0 && (
                                            <div className="list-card" style={{ padding: '40px 20px', textAlign: 'center' }}>
                                                <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', margin: 0 }}>
                                                    {completedModalFilter === 'today' 
                                                        ? 'No hay tareas o eventos completados hoy'
                                                        : completedModalFilter === 'tomorrow'
                                                        ? 'No hay tareas completadas para mañana'
                                                        : 'No hay tareas o eventos completados'}
                                                </p>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
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
                                                        // #region agent log
                                                        try {
                                                            fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:3342',message:'Calendar day clicked',data:{dayNumber:day.dayNumber,date:day.date?.toISOString(),hasHandleSelectDate:typeof handleSelectDate === 'function'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                                                        } catch (error) {
                                                            console.error('Error logging day click:', error);
                                                        }
                                                        // #endregion
                                                        try {
                                                            if (day.date && handleSelectDate) {
                                                                handleSelectDate(day.date);
                                                                setPickerMode(null);
                                                            }
                                                        } catch (error) {
                                                            // #region agent log
                                                            fetch('http://127.0.0.1:7243/ingest/7f084667-d558-4e71-bb4a-835abfc84ca4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:3348',message:'Error in handleSelectDate',data:{error:error instanceof Error?error.message:String(error),dayNumber:day.dayNumber},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                                                            // #endregion
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
    const [selectedCategory, setSelectedCategory] = useState<HabitCategory | null>(null);
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

    const considerHabits = useMemo(() => 
        habits
            .filter(h => h.category === 'consider')
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
        if (!draggedHabit) return;

        // Obtener los hábitos de la categoría ordenados
        const categoryHabits = draggedHabit.category === 'non-negotiable' 
            ? nonNegotiableHabits 
            : considerHabits;

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
        if (draggedHabit) {
            const categoryHabits = draggedHabit.category === 'non-negotiable' 
                ? nonNegotiableHabits 
                : considerHabits;
            
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
                            {considerHabits.map((habit, index) => (
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
