import { useMemo, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { formatDateLocal, parseDateFromString } from '../../utils/dateTime';

export type CalendarDatePanelProps = {
  value: string;
  onSelect: (isoDate: string) => void;
  className?: string;
  /**
   * Solo pestañas y rejillas (sin contenedor `calendar-card`).
   * Útil cuando el padre ya aplica `calendar-card` (p. ej. DatePicker inline).
   */
  embedOnly?: boolean;
};

/**
 * Calendario Semana/Mes/Año reutilizable (misma UX que el modal del DatePicker).
 */
export function CalendarDatePanel({
  value,
  onSelect,
  className,
  embedOnly = false,
}: CalendarDatePanelProps) {
  const [view, setView] = useState<'semana' | 'mes' | 'año'>('mes');
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);

  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    if (value) {
      try {
        const d = value.includes('T') ? new Date(value) : parseDateFromString(value);
        setSelectedMonth(new Date(d.getFullYear(), d.getMonth(), 1));
      } catch {
        setSelectedMonth(null);
      }
    }
  }, [value]);

  const dateToUse = selectedMonth ?? today;

  const monthLabel = useMemo(() => {
    const d = dateToUse && !isNaN(dateToUse.getTime()) ? dateToUse : new Date();
    return d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, (c) => c.toUpperCase());
  }, [dateToUse]);

  const calendarDays = useMemo(() => {
    const d = dateToUse && !isNaN(dateToUse.getTime()) ? dateToUse : new Date();
    const year = d.getFullYear();
    const month = d.getMonth();
    const startOfMonth = new Date(year, month, 1);
    const startIndex = (startOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const totalCells = 42;
    return Array.from({ length: totalCells }, (_, i) => {
      let dayNumber = 0;
      let monthOffset = 0;
      if (i < startIndex) {
        dayNumber = daysInPrevMonth - startIndex + i + 1;
        monthOffset = -1;
      } else if (i >= startIndex + daysInMonth) {
        dayNumber = i - (startIndex + daysInMonth) + 1;
        monthOffset = 1;
      } else {
        dayNumber = i - startIndex + 1;
      }
      const dayDate = new Date(year, month + monthOffset, dayNumber);
      const isToday =
        monthOffset === 0 &&
        dayNumber === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();
      const selected = value && (() => {
        try {
          const v = value.includes('T') ? value.slice(0, 10) : value;
          const sel = parseDateFromString(v);
          return dayDate.getDate() === sel.getDate() &&
            dayDate.getMonth() === sel.getMonth() &&
            dayDate.getFullYear() === sel.getFullYear();
        } catch {
          return false;
        }
      })();
      return {
        key: `${year}-${month + monthOffset}-${dayNumber}-${i}`,
        dayNumber,
        isCurrentMonth: monthOffset === 0,
        isToday,
        selected,
        date: dayDate,
      };
    });
  }, [dateToUse, today, value]);

  const calendarWeekDays = useMemo(() => {
    const year = today.getFullYear();
    const month = today.getMonth();
    const currentDay = today.getDate();
    const currentDate = new Date(year, month, currentDay);
    const dayOfWeek = (currentDate.getDay() + 6) % 7;
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDay - dayOfWeek);
    return Array.from({ length: 7 }, (_, i) => {
      const weekDate = new Date(weekStart);
      weekDate.setDate(weekStart.getDate() + i);
      return {
        key: `week-${i}`,
        dayNumber: weekDate.getDate(),
        dayName: weekDate.toLocaleDateString('es-ES', { weekday: 'short' }),
        date: weekDate,
        isToday: weekDate.toDateString() === today.toDateString(),
        selected: value && (() => {
          try {
            const v = value.includes('T') ? value.slice(0, 10) : value;
            const sel = parseDateFromString(v);
            return weekDate.getDate() === sel.getDate() &&
              weekDate.getMonth() === sel.getMonth() &&
              weekDate.getFullYear() === sel.getFullYear();
          } catch {
            return false;
          }
        })(),
      };
    });
  }, [today, value]);

  const calendarMonths = useMemo(() => {
    const names = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return names.map((monthName, i) => ({
      key: `m-${i}`,
      monthNumber: i,
      monthName,
      isCurrentMonth: i === today.getMonth(),
    }));
  }, [today]);

  const handleSelect = useCallback(
    (date: Date) => {
      onSelect(formatDateLocal(date));
    },
    [onSelect]
  );

  const calendarContent = (
    <>
      <div className="calendar-tabs">
        {(['semana', 'mes', 'año'] as const).map((v) => (
          <button
            key={v}
            type="button"
            className={clsx('calendar-tab', view === v && 'calendar-tab-active')}
            onClick={() => setView(v)}
          >
            {v === 'semana' ? 'Semana' : v === 'mes' ? 'Mes' : 'Año'}
          </button>
        ))}
      </div>

      {view === 'mes' && (
        <>
          <div className="calendar-month">{monthLabel}</div>
          <div className="calendar-grid">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((l, i) => (
              <div key={`h-${i}`} className="calendar-day calendar-day-muted calendar-weekday-header">
                {l}
              </div>
            ))}
            {calendarDays.map((day) => (
              <button
                key={day.key}
                type="button"
                className={clsx(
                  'calendar-day',
                  'calendar-day-button',
                  !day.isCurrentMonth && 'calendar-day-muted',
                  day.isToday && 'calendar-day-active',
                  day.selected && 'calendar-day-selected'
                )}
                onClick={() => handleSelect(day.date)}
              >
                {day.dayNumber}
              </button>
            ))}
          </div>
        </>
      )}

      {view === 'semana' && (
        <>
          <div className="calendar-month">{monthLabel}</div>
          <div className="calendar-week-grid">
            {calendarWeekDays.map((day) => (
              <button
                key={day.key}
                type="button"
                className={clsx(
                  'calendar-day',
                  'calendar-day-button',
                  'calendar-week-day',
                  day.isToday && 'calendar-day-active',
                  day.selected && 'calendar-day-selected'
                )}
                onClick={() => handleSelect(day.date)}
              >
                <span className="calendar-week-day-name">{day.dayName}</span>
                <span className="calendar-week-day-number">{day.dayNumber}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {view === 'año' && (
        <>
          <div className="calendar-year-label">{today.getFullYear()}</div>
          <div className="calendar-year-grid">
            {calendarMonths.map((month) => (
              <button
                key={month.key}
                type="button"
                className={clsx('calendar-month-item', month.isCurrentMonth && 'calendar-month-active')}
                onClick={() => {
                  setSelectedMonth(new Date(today.getFullYear(), month.monthNumber, 1));
                  setView('mes');
                }}
              >
                {month.monthName}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );

  if (embedOnly) {
    return (
      <div className={className} onClick={(e) => e.stopPropagation()}>
        {calendarContent}
      </div>
    );
  }

  return (
    <div
      className={clsx('calendar-card', 'calendar-card-compact', className)}
      onClick={(e) => e.stopPropagation()}
    >
      {calendarContent}
    </div>
  );
}

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  /** Si true, el botón usa estilo "task-input" como Agenda. */
  taskStyle?: boolean;
  /**
   * Si true, el calendario se muestra en línea dentro del layout (sin overlay modal).
   */
  inline?: boolean;
}

/**
 * Picker de fecha: botón + calendario Semana/Mes/Año (modal compacto o en línea).
 */
export function DatePicker({
  value,
  onChange,
  placeholder = 'Fecha (opcional)',
  className,
  taskStyle = true,
  inline = false,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const displayLabel = useMemo(() => {
    if (!value) return placeholder;
    try {
      const d = value.includes('T') ? new Date(value) : parseDateFromString(value);
      return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).replace('.', '');
    } catch {
      return value;
    }
  }, [value, placeholder]);

  const buttonClass = taskStyle
    ? clsx('task-input', 'task-input-button', !value && 'task-input-placeholder', className)
    : clsx('link-button', className);

  const motionProps = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 8 },
    transition: { duration: 0.22, ease: [0.2, 0.8, 0.2, 1] as const },
  };

  if (inline) {
    return (
      <div
        className="date-picker-inline-root"
        data-calendar-inline-open={open ? '' : undefined}
      >
        {!open ? (
          <button
            type="button"
            className={buttonClass}
            onClick={() => setOpen(true)}
          >
            {displayLabel}
          </button>
        ) : (
          <motion.div
            className="calendar-card calendar-card-compact date-picker-inline-panel"
            {...motionProps}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="date-picker-inline-toolbar">
              <button
                type="button"
                className="link-button"
                onClick={() => setOpen(false)}
              >
                Cerrar
              </button>
            </div>
            <CalendarDatePanel
              embedOnly
              value={value}
              onSelect={(v) => {
                onChange(v);
                setOpen(false);
              }}
            />
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        className={buttonClass}
        onClick={() => setOpen(true)}
        style={!taskStyle ? { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', fontSize: 13, width: '100%', justifyContent: 'flex-start' } : undefined}
      >
        {displayLabel}
      </button>

      {open && (
        <div className="calendar-modal calendar-modal-compact">
          <button
            type="button"
            className="calendar-backdrop"
            aria-label="Cerrar calendario"
            onClick={() => setOpen(false)}
          />
          <motion.div
            className="calendar-modal-card calendar-modal-card-compact"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <CalendarDatePanel
              value={value}
              onSelect={(v) => {
                onChange(v);
                setOpen(false);
              }}
            />
          </motion.div>
        </div>
      )}
    </>
  );
}
