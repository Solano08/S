import { useMemo, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { formatDateLocal, parseDateFromString } from '../../utils/dateTime';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  /** Si true, el botón usa estilo "task-input" como Agenda. */
  taskStyle?: boolean;
}

/**
 * Picker de fecha igual al de Agenda (Tareas Puntuales): botón + modal calendario Semana/Mes/Año.
 */
export function DatePicker({
  value,
  onChange,
  placeholder = 'Fecha (opcional)',
  className,
  taskStyle = true,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'semana' | 'mes' | 'año'>('mes');
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);

  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    if (open && value) {
      try {
        const d = value.includes('T') ? new Date(value) : parseDateFromString(value);
        setSelectedMonth(new Date(d.getFullYear(), d.getMonth(), 1));
      } catch {
        setSelectedMonth(null);
      }
    }
  }, [open, value]);
  const dateToUse = selectedMonth ?? today;

  const displayLabel = useMemo(() => {
    if (!value) return placeholder;
    try {
      const d = value.includes('T') ? new Date(value) : parseDateFromString(value);
      return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).replace('.', '');
    } catch {
      return value;
    }
  }, [value, placeholder]);

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
      onChange(formatDateLocal(date));
      setOpen(false);
    },
    [onChange]
  );

  const buttonClass = taskStyle
    ? clsx('task-input', 'task-input-button', !value && 'task-input-placeholder', className)
    : clsx('link-button', className);

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
            <div className="calendar-card calendar-card-compact">
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
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
