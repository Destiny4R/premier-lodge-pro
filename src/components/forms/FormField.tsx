import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface BaseFieldProps {
  name: string;
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

interface InputFieldProps extends BaseFieldProps {
  type: "text" | "email" | "password" | "number" | "tel" | "date" | "time" | "datetime-local";
  placeholder?: string;
  value?: string | number;
  onChange?: (value: string) => void;
  min?: number;
  max?: number;
  step?: number;
}

interface TextareaFieldProps extends BaseFieldProps {
  type: "textarea";
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  rows?: number;
}

interface SelectFieldProps extends BaseFieldProps {
  type: "select";
  options: Option[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

interface CheckboxFieldProps extends BaseFieldProps {
  type: "checkbox";
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export type FormFieldProps =
  | InputFieldProps
  | TextareaFieldProps
  | SelectFieldProps
  | CheckboxFieldProps;

export function FormField(props: FormFieldProps) {
  const { name, label, error, required, className, disabled } = props;

  const renderField = () => {
    switch (props.type) {
      case "textarea":
        return (
          <Textarea
            id={name}
            name={name}
            placeholder={props.placeholder}
            value={props.value || ""}
            onChange={(e) => props.onChange?.(e.target.value)}
            rows={props.rows || 3}
            disabled={disabled}
            className={cn(
              "bg-secondary border-border",
              error && "border-destructive"
            )}
          />
        );

      case "select":
        return (
          <Select
            value={props.value}
            onValueChange={props.onChange}
            disabled={disabled}
          >
            <SelectTrigger
              className={cn(
                "bg-secondary border-border",
                error && "border-destructive"
              )}
            >
              <SelectValue placeholder={props.placeholder || "Select..."} />
            </SelectTrigger>
            <SelectContent>
              {props.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "checkbox":
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={name}
              name={name}
              checked={props.checked || false}
              onChange={(e) => props.onChange?.(e.target.checked)}
              disabled={disabled}
              className="h-4 w-4 rounded border-border bg-secondary text-primary focus:ring-primary"
            />
            <Label htmlFor={name} className="text-sm font-normal">
              {label}
            </Label>
          </div>
        );

      default:
        return (
          <Input
            id={name}
            name={name}
            type={props.type}
            placeholder={props.placeholder}
            value={props.value || ""}
            onChange={(e) => props.onChange?.(e.target.value)}
            min={props.min}
            max={props.max}
            step={props.step}
            disabled={disabled}
            className={cn(
              "bg-secondary border-border",
              error && "border-destructive"
            )}
          />
        );
    }
  };

  if (props.type === "checkbox") {
    return (
      <div className={cn("space-y-1", className)}>
        {renderField()}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={name} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {renderField()}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
