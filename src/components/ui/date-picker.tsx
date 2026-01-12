import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";

// =====================================================
// React DatePicker wrapper
// =====================================================

interface DatePickerProps {
  value?: string | Date | null;
  onChange?: (date: Date | null) => void;
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
  dateFormat = "yyyy-MM-dd",
  className,
  disabled = false,
  id,
  name,
}: DatePickerProps) {
  // Normalize incoming values to Date | null
  const selected: Date | null = value ? (typeof value === "string" ? new Date(value) : value) : null;
  const _min = typeof minDate === "string" ? new Date(minDate) : (minDate as Date | undefined) || undefined;
  const _max = typeof maxDate === "string" ? new Date(maxDate) : (maxDate as Date | undefined) || undefined;

  useEffect(() => {
    // noop; kept for parity with previous implementation if side-effects are needed later
  }, []);

  return (
    <div className="relative">
      <ReactDatePicker
        selected={selected}
        onChange={(d: Date | null) => onChange?.(d)}
        placeholderText={placeholder}
        minDate={_min}
        maxDate={_max}
        showTimeSelect={enableTime}
        dateFormat={enableTime ? `${dateFormat} HH:mm` : dateFormat}
        disabled={disabled}
        id={id}
        name={name}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
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
  onStartChange?: (date: Date | null) => void;
  onEndChange?: (date: Date | null) => void;
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
