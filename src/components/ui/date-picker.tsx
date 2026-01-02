import { useRef, useEffect } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import "flatpickr/dist/themes/dark.css";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";

// =====================================================
// Flatpickr DatePicker Component
// =====================================================

interface DatePickerProps {
  value?: string | Date | null;
  onChange?: (date: string) => void;
  placeholder?: string;
  minDate?: string | Date;
  maxDate?: string | Date;
  enableTime?: boolean;
  dateFormat?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  minDate,
  maxDate,
  enableTime = false,
  dateFormat = "Y-m-d",
  className,
  disabled = false,
  id,
  name,
}: DatePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const flatpickrRef = useRef<flatpickr.Instance | null>(null);

  useEffect(() => {
    if (!inputRef.current) return;

    flatpickrRef.current = flatpickr(inputRef.current, {
      dateFormat: enableTime ? `${dateFormat} H:i` : dateFormat,
      enableTime,
      time_24hr: true,
      minDate,
      maxDate,
      defaultDate: value || undefined,
      onChange: (selectedDates, dateStr) => {
        onChange?.(dateStr);
      },
      // Dark theme support
      onReady: () => {
        const isDark = document.documentElement.classList.contains("dark");
        const calendarContainer = document.querySelector(".flatpickr-calendar");
        if (calendarContainer && isDark) {
          calendarContainer.classList.add("dark");
        }
      },
    });

    return () => {
      flatpickrRef.current?.destroy();
    };
  }, []);

  // Update value when prop changes
  useEffect(() => {
    if (flatpickrRef.current && value) {
      flatpickrRef.current.setDate(value, false);
    } else if (flatpickrRef.current && !value) {
      flatpickrRef.current.clear();
    }
  }, [value]);

  // Update options when they change
  useEffect(() => {
    if (flatpickrRef.current) {
      if (minDate) flatpickrRef.current.set("minDate", minDate);
      if (maxDate) flatpickrRef.current.set("maxDate", maxDate);
    }
  }, [minDate, maxDate]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={id}
        name={name}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "pr-10",
          className
        )}
      />
      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
    </div>
  );
}

// =====================================================
// DateRangePicker Component
// =====================================================

interface DateRangePickerProps {
  startValue?: string | Date | null;
  endValue?: string | Date | null;
  onStartChange?: (date: string) => void;
  onEndChange?: (date: string) => void;
  startPlaceholder?: string;
  endPlaceholder?: string;
  minDate?: string | Date;
  maxDate?: string | Date;
  className?: string;
  disabled?: boolean;
}

export function DateRangePicker({
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  startPlaceholder = "Start date",
  endPlaceholder = "End date",
  minDate,
  maxDate,
  className,
  disabled = false,
}: DateRangePickerProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row gap-2", className)}>
      <DatePicker
        value={startValue}
        onChange={onStartChange}
        placeholder={startPlaceholder}
        minDate={minDate}
        maxDate={endValue || maxDate}
        disabled={disabled}
      />
      <span className="hidden sm:flex items-center text-muted-foreground">to</span>
      <DatePicker
        value={endValue}
        onChange={onEndChange}
        placeholder={endPlaceholder}
        minDate={startValue || minDate}
        maxDate={maxDate}
        disabled={disabled}
      />
    </div>
  );
}
