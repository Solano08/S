/**
 * Utilidades de fecha y hora compartidas. Mismo patrón que Agenda (Tareas Puntuales).
 */

export function formatDateLocal(date: Date): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseDateFromString(dateString: string): Date {
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date(dateString);
}

const slots: string[] = [];
for (let hour = 0; hour < 24; hour += 1) {
  for (const minute of [0, 30]) {
    const h = `${hour}`.padStart(2, '0');
    const m = `${minute}`.padStart(2, '0');
    slots.push(`${h}:${m}`);
  }
}
export const timeSlots = slots;
