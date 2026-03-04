import { timeSlots } from '../../utils/dateTime';
import clsx from 'clsx';

interface TimeSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

/**
 * Select de hora igual al de Agenda (Tareas Puntuales). Opciones cada 30 min.
 */
export function TimeSelect({
  value,
  onChange,
  placeholder = 'Hora',
  className,
  id,
}: TimeSelectProps) {
  return (
    <select
      id={id}
      className={clsx('task-input', className)}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
      {timeSlots.map((slot) => (
        <option key={slot} value={slot}>
          {slot}
        </option>
      ))}
    </select>
  );
}
