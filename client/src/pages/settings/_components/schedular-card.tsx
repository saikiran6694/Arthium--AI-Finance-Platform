import { useState, useMemo, useEffect } from 'react';
import * as Tabs from "@radix-ui/react-tabs";
import { Button } from "@/components/ui/button";
import * as Select from '@radix-ui/react-select';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import {
  Clock, Calendar, Globe, Check, ChevronDown,
  CalendarDays, Repeat, Loader2, AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  useGetScheduledReportTimeQuery,
  useScheduleReportMutation,
} from '@/features/user/userAPI';

// ─── Constants ────────────────────────────────────────────────────────────

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver',
  'America/Los_Angeles', 'Europe/London', 'Europe/Paris',
  'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney',
];

const DAYS_OF_WEEK = [
  { id: 0, label: 'Sun', short: 'Su' },
  { id: 1, label: 'Mon', short: 'M'  },
  { id: 2, label: 'Tue', short: 'T'  },
  { id: 3, label: 'Wed', short: 'W'  },
  { id: 4, label: 'Thu', short: 'Th' },
  { id: 5, label: 'Fri', short: 'F'  },
  { id: 6, label: 'Sat', short: 'Sa' },
];

// ─── Cron utilities ───────────────────────────────────────────────────────

/**
 * Build a cron expression from the current UI state.
 * Recurring → `<min> <hour> * * <days>`    e.g. "0 9 * * 1,2,3,4,5"
 * One-time  → `<min> <hour> <day> <month> *`  e.g. "0 9 15 3 *"
 */
function buildCron(opts: {
  scheduleType: string;
  time: string;
  date: string;
  selectedDays: string[];
}): string {
  const { scheduleType, time, date, selectedDays } = opts;
  if (!time) return '* * * * *';
  const [hours, minutes] = time.split(':');

  if (scheduleType === 'once') {
    if (!date) return '* * * * *';
    const [, month, day] = date.split('-');
    return `${parseInt(minutes)} ${parseInt(hours)} ${parseInt(day)} ${parseInt(month)} *`;
  }

  if (selectedDays.length === 0) return '* * * * *';
  return `${parseInt(minutes)} ${parseInt(hours)} * * ${[...selectedDays].sort((a, b) => +a - +b).join(',')}`;
}

interface ParsedCron {
  scheduleType: 'once' | 'recurring';
  time: string;         // "HH:MM"
  date: string;         // "YYYY-MM-DD" (one-time only)
  selectedDays: string[];
}

/**
 * Reverse a cron expression back into UI fields.
 * Returns null for unrecognised patterns — caller falls back to defaults.
 */
function parseCron(cron: string): ParsedCron | null {
  if (!cron || cron === '* * * * *') return null;

  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return null;

  const [min, hour, dom, month, dow] = parts;
  const minuteNum = parseInt(min);
  const hourNum   = parseInt(hour);
  if (isNaN(minuteNum) || isNaN(hourNum)) return null;

  const time = `${String(hourNum).padStart(2, '0')}:${String(minuteNum).padStart(2, '0')}`;

  // Recurring: dom === '*', month === '*', dow has actual day numbers
  if (dom === '*' && month === '*' && dow !== '*') {
    const selectedDays = dow.split(',').filter(Boolean);
    return { scheduleType: 'recurring', time, date: '', selectedDays };
  }

  // One-time: dow === '*', dom and month are numbers
  if (dow === '*' && dom !== '*' && month !== '*') {
    const dayNum   = parseInt(dom);
    const monthNum = parseInt(month);
    if (isNaN(dayNum) || isNaN(monthNum)) return null;
    const year = new Date().getFullYear();
    const date = `${year}-${String(monthNum).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    return { scheduleType: 'once', time, date, selectedDays: [] };
  }

  return null;
}

// ─── Component ────────────────────────────────────────────────────────────

export default function SchedulerCard() {
  const [scheduleType, setScheduleType] = useState<'once' | 'recurring'>('once');
  const [timezone, setTimezone]         = useState('UTC');
  const [date, setDate]                 = useState('');
  const [time, setTime]                 = useState('09:00');
  const [selectedDays, setSelectedDays] = useState<string[]>(['1', '2', '3', '4', '5']);
  const [hydrated, setHydrated]         = useState(false);

  // ── Fetch saved schedule ──────────────────────────────────────────────
  const {
    data: savedSchedule,
    isLoading: isFetching,
    isError: fetchError,
  } = useGetScheduledReportTimeQuery();

  // ── Populate fields when API data arrives ─────────────────────────────
  useEffect(() => {
    if (hydrated) return;

    // Still loading — wait
    if (isFetching) return;

    if (savedSchedule) {
      const parsed = parseCron(savedSchedule.scheduled_time);
      if (parsed) {
        setScheduleType(parsed.scheduleType);
        setTime(parsed.time);
        if (parsed.date)             setDate(parsed.date);
        if (parsed.selectedDays.length) setSelectedDays(parsed.selectedDays);
      } else {
        // Cron exists but format unrecognised — just set a safe default date
        setDate(new Date().toISOString().split('T')[0]);
      }
      if (savedSchedule.timezone) setTimezone(savedSchedule.timezone);
    } else {
      // No saved schedule or fetch error — seed date to today
      setDate(new Date().toISOString().split('T')[0]);
    }

    setHydrated(true);
  }, [savedSchedule, isFetching, hydrated]);

  // ── Save ──────────────────────────────────────────────────────────────
  const [scheduleReport, { isLoading: isSaving }] = useScheduleReportMutation();

  const cronExpression = useMemo(() =>
    buildCron({ scheduleType, time, date, selectedDays }),
  [scheduleType, time, date, selectedDays]);

  const humanReadableSummary = useMemo(() => {
    if (!time) return 'Please select a time.';
    if (scheduleType === 'once') {
      if (!date) return 'Please select a date.';
      return `Runs once on ${date} at ${time} (${timezone})`;
    }
    if (selectedDays.length === 0) return 'Please select at least one day.';
    if (selectedDays.length === 7) return `Runs every day at ${time} (${timezone})`;
    const dayNames = [...selectedDays]
      .sort((a, b) => +a - +b)
      .map(d => DAYS_OF_WEEK.find(dw => dw.id.toString() === d)?.label)
      .join(', ');
    return `Runs every ${dayNames} at ${time} (${timezone})`;
  }, [scheduleType, timezone, date, time, selectedDays]);

  const handleSave = () => {
    if (scheduleType === 'once' && !date) {
      toast.error('Please select a date.');
      return;
    }
    if (scheduleType === 'recurring' && selectedDays.length === 0) {
      toast.error('Please select at least one day.');
      return;
    }

    scheduleReport({ timezone, scheduled_time: cronExpression })
      .unwrap()
      .then(() => toast.success('Schedule saved successfully!'))
      .catch(err => toast.error(err?.data?.message || 'Failed to save schedule.'));
  };

  // ── States ────────────────────────────────────────────────────────────

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <p className="text-sm">Loading schedule…</p>
        </div>
      </div>
    );
  }

  // Removed the fetchError early return so the UI renders even if the fetch fails.
  // The useEffect will handle setting the default date to today when savedSchedule is undefined.

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {fetchError && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>Could not load existing schedule. You can create a new one.</span>
        </div>
      )}
      <Tabs.Root
        value={scheduleType}
        onValueChange={v => setScheduleType(v as 'once' | 'recurring')}
      >
        {/* Tab bar */}
        <Tabs.List className="grid grid-cols-2 rounded-lg bg-muted p-1 gap-1">
          {([
            { value: 'recurring', icon: <Repeat className="w-3.5 h-3.5" />,      label: 'Recurring' },
            { value: 'once',      icon: <CalendarDays className="w-3.5 h-3.5" />, label: 'One-time'  },
          ] as const).map(tab => (
            <Tabs.Trigger
              key={tab.value}
              value={tab.value}
              className={cn(
                'flex items-center justify-center gap-2 rounded-md py-2 px-3 text-sm font-medium',
                'text-muted-foreground transition-all duration-150 outline-none',
                'data-[state=active]:bg-background data-[state=active]:text-foreground',
                'data-[state=active]:shadow-sm hover:text-foreground',
              )}
            >
              {tab.icon}
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {/* Shared: timezone + time */}
        <div className="pt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Timezone */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1.5 text-foreground">
                <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                Timezone
              </label>
              <Select.Root value={timezone} onValueChange={setTimezone}>
                <Select.Trigger className={cn(
                  'w-full inline-flex items-center justify-between',
                  'border border-input bg-transparent rounded-md',
                  'px-3 py-2 text-sm h-9 text-foreground',
                  'focus-visible:outline-none focus-visible:ring-[3px]',
                  'focus-visible:ring-ring/50 focus-visible:border-ring',
                  'transition-shadow',
                )}>
                  <Select.Value placeholder="Select timezone" />
                  <Select.Icon>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className={cn(
                    'overflow-hidden rounded-lg border border-border shadow-md z-50',
                    'bg-popover text-popover-foreground',
                  )}>
                    <Select.Viewport className="p-1">
                      {TIMEZONES.map(tz => (
                        <Select.Item
                          key={tz}
                          value={tz}
                          className={cn(
                            'relative flex items-center px-8 py-2 text-sm rounded-md',
                            'outline-none cursor-pointer select-none transition-colors',
                            'hover:bg-accent hover:text-accent-foreground',
                            'data-[state=checked]:bg-primary/10 data-[state=checked]:text-primary',
                          )}
                        >
                          <Select.ItemText>{tz}</Select.ItemText>
                          <Select.ItemIndicator className="absolute left-2 text-primary">
                            <Check className="w-3.5 h-3.5" />
                          </Select.ItemIndicator>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>

            {/* Time */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1.5 text-foreground">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className={cn(
                  'w-full h-9 rounded-md border border-input bg-transparent',
                  'px-3 py-1 text-sm text-foreground transition-shadow',
                  'focus-visible:outline-none focus-visible:ring-[3px]',
                  'focus-visible:ring-ring/50 focus-visible:border-ring',
                  'dark:bg-input/30 [color-scheme:light] dark:[color-scheme:dark]',
                )}
              />
            </div>
          </div>

          {/* One-time: date picker */}
          <Tabs.Content value="once" className="space-y-2 outline-none">
            <label className="text-sm font-medium flex items-center gap-1.5 text-foreground">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className={cn(
                'w-full h-9 rounded-md border border-input bg-transparent',
                'px-3 py-1 text-sm text-foreground transition-shadow',
                'focus-visible:outline-none focus-visible:ring-[3px]',
                'focus-visible:ring-ring/50 focus-visible:border-ring',
                'dark:bg-input/30 [color-scheme:light] dark:[color-scheme:dark]',
              )}
            />
          </Tabs.Content>

          {/* Recurring: day picker */}
          <Tabs.Content value="recurring" className="space-y-3 outline-none">
            <label className="text-sm font-medium text-foreground">
              Repeat on
            </label>
            <ToggleGroup.Root
              type="multiple"
              value={selectedDays}
              onValueChange={v => setSelectedDays(v.length ? v : selectedDays)}
              className="flex flex-wrap gap-2 mt-2"
            >
              {DAYS_OF_WEEK.map(day => (
                <ToggleGroup.Item
                  key={day.id}
                  value={day.id.toString()}
                  aria-label={day.label}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    'text-xs font-semibold border transition-all duration-150',
                    'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                    'border-border text-muted-foreground bg-background',
                    'hover:bg-muted hover:text-foreground',
                    'data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
                    'data-[state=on]:border-primary data-[state=on]:shadow-sm',
                  )}
                >
                  {day.short}
                </ToggleGroup.Item>
              ))}
            </ToggleGroup.Root>
          </Tabs.Content>
        </div>

        {/* Summary */}
        <div className="mt-6 rounded-lg border border-border bg-muted/40 p-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Summary
          </p>
          <p className="text-sm font-medium text-foreground">{humanReadableSummary}</p>
          <div className="pt-3 border-t border-border flex items-center gap-2">
            <span className="text-[10px] font-mono font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded uppercase tracking-wide">
              cron
            </span>
            <code className="text-sm font-mono text-foreground">{cronExpression}</code>
          </div>
        </div>

        {/* Save */}
        <div className="pt-4">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            type="button"
            className="w-full text-white"
          >
            {isSaving
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Check className="w-4 h-4" />}
            {isSaving ? 'Saving…' : 'Save Schedule'}
          </Button>
        </div>
      </Tabs.Root>
    </div>
  );
}