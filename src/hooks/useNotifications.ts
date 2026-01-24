import { useEffect, useCallback } from 'react';
import { usePWA } from './usePWA';

export function useNotifications() {
  const { requestNotificationPermission, sendNotification } = usePWA();

  useEffect(() => {
    // Solicitar permisos al montar el componente
    const initNotifications = async () => {
      if ('Notification' in window && Notification.permission === 'default') {
        // Esperar un poco antes de solicitar permisos para mejor UX
        setTimeout(async () => {
          await requestNotificationPermission();
        }, 2000);
      }
    };

    initNotifications();
  }, [requestNotificationPermission]);

  const notifyTaskCompleted = useCallback(async (taskTitle: string) => {
    await sendNotification('✅ Tarea completada', {
      body: `Has completado: ${taskTitle}`,
      tag: 'task-completed',
      requireInteraction: false,
    });
  }, [sendNotification]);

  const notifyEventReminder = useCallback(async (eventTitle: string, time: string) => {
    await sendNotification('📅 Recordatorio de evento', {
      body: `${eventTitle} - ${time}`,
      tag: 'event-reminder',
      requireInteraction: true,
    });
  }, [sendNotification]);

  const notifyHabitReminder = useCallback(async (habitTitle: string) => {
    await sendNotification('🎯 Recordatorio de hábito', {
      body: `No olvides: ${habitTitle}`,
      tag: 'habit-reminder',
      requireInteraction: false,
    });
  }, [sendNotification]);

  const notifyProjectUpdate = useCallback(async (projectTitle: string, message: string) => {
    await sendNotification(`📁 ${projectTitle}`, {
      body: message,
      tag: 'project-update',
      requireInteraction: false,
    });
  }, [sendNotification]);

  const notifySyncComplete = useCallback(async () => {
    await sendNotification('🔄 Sincronización completada', {
      body: 'Todos tus datos están actualizados',
      tag: 'sync-complete',
      requireInteraction: false,
    });
  }, [sendNotification]);

  return {
    notifyTaskCompleted,
    notifyEventReminder,
    notifyHabitReminder,
    notifyProjectUpdate,
    notifySyncComplete,
  };
}
