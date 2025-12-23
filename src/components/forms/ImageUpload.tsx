import { useState, useRef, useCallback } from "react";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// =============================================
// API INTEGRATION PLACEHOLDER
// For uploading images to a server:
// const formData = new FormData();
// files.forEach(file => formData.append('images', file));
// await api.post('/api/upload', formData, {
//   headers: { 'Content-Type': 'multipart/form-data' }
// });
// =============================================

export interface ExistingImage {
  id: string;
  url: string;
  name: string;
}

interface ImageUploadProps {
  label: string;
  required?: boolean;
  accept?: string;
  multiple?: boolean;
  value?: File[];
  existingImages?: ExistingImage[];
  onFilesChange: (files: File[]) => void;
  onRemoveExisting?: (imageId: string) => void;
  error?: string;
  hint?: string;
  maxSize?: number; // in MB
  className?: string;
}

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const DEFAULT_MAX_SIZE = 5; // 5MB

export function ImageUpload({
  label,
  required,
  accept = ".jpg,.jpeg,.png",
  multiple = true,
  value = [],
  existingImages = [],
  onFilesChange,
  onRemoveExisting,
  error,
  hint,
  maxSize = DEFAULT_MAX_SIZE,
  className,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Only JPEG, JPG, and PNG files are allowed";
    }
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }
    return null;
  }, [maxSize]);

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;

    const newFiles: File[] = [];
    let hasError = false;

    Array.from(fileList).forEach((file) => {
      const validationResult = validateFile(file);
      if (validationResult) {
        setValidationError(validationResult);
        hasError = true;
      } else {
        newFiles.push(file);
      }
    });

    if (!hasError) {
      setValidationError(null);
    }

    if (newFiles.length > 0) {
      if (multiple) {
        onFilesChange([...value, ...newFiles]);
      } else {
        onFilesChange([newFiles[0]]);
      }
    }
  }, [value, multiple, onFilesChange, validateFile]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeNewFile = (index: number) => {
    const newFiles = [...value];
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  const displayError = validationError || error;

  return (
    <div className={cn("space-y-3", className)}>
      <Label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer",
          "flex flex-col items-center justify-center gap-2",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-secondary/50",
          displayError && "border-destructive"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
        />
        
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Upload className="w-6 h-6 text-primary" />
        </div>
        
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            Drag & drop images or{" "}
            <span className="text-primary">click to browse</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            JPEG, JPG, PNG only (max {maxSize}MB per file)
          </p>
        </div>
      </div>

      {/* Hint */}
      {hint && !displayError && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}

      {/* Error */}
      {displayError && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="w-4 h-4" />
          {displayError}
        </div>
      )}

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Current Images
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {existingImages.map((image) => (
              <div
                key={image.id}
                className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-secondary"
              >
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-full object-cover"
                />
                {onRemoveExisting && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveExisting(image.id);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                  <p className="text-[10px] text-white truncate">{image.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New File Previews */}
      {value.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            New Images to Upload
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {value.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-secondary"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNewFile(index);
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                  <p className="text-[10px] text-white truncate">{file.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state for previews */}
      {value.length === 0 && existingImages.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ImageIcon className="w-4 h-4" />
          <span>No images selected</span>
        </div>
      )}
    </div>
  );
}
