import { useCallback, useState } from "react";
import { Upload, X, Image as ImageIcon, Video as VideoIcon, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface MediaUploadZoneProps {
  files: File[];
  existingUrls?: string[];
  onFilesChange: (files: File[]) => void;
  onUrlsChange?: (urls: string[]) => void;
  maxFiles?: number;
  uploading?: boolean;
  uploadProgress?: number;
}

const MediaUploadZone = ({
  files,
  existingUrls = [],
  onFilesChange,
  onUrlsChange,
  maxFiles = 10,
  uploading = false,
  uploadProgress = 0,
}: MediaUploadZoneProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);

  const totalFiles = files.length + existingUrls.length;

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file: File): string | null => {
    const validImageTypes = ["image/jpeg", "image/png", "image/webp"];
    const validVideoTypes = ["video/mp4", "video/quicktime", "video/webm"];
    const maxImageSize = 50 * 1024 * 1024; // 50MB
    const maxVideoSize = 500 * 1024 * 1024; // 500MB

    if (![...validImageTypes, ...validVideoTypes].includes(file.type)) {
      return "Invalid file type. Only JPG, PNG, WEBP, MP4, MOV, WEBM are allowed.";
    }

    if (validImageTypes.includes(file.type) && file.size > maxImageSize) {
      return "Image size must be less than 50MB";
    }

    if (validVideoTypes.includes(file.type) && file.size > maxVideoSize) {
      return "Video size must be less than 500MB";
    }

    return null;
  };

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;

    const fileArray = Array.from(newFiles);
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of fileArray) {
      if (totalFiles + validFiles.length >= maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`);
        break;
      }

      const error = validateFile(file);
      if (error) {
        alert(error);
        continue;
      }

      validFiles.push(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        setPreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    }

    if (validFiles.length > 0) {
      onFilesChange([...files, ...validFiles]);
    }
  }, [files, totalFiles, maxFiles, onFilesChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  }, [handleFiles]);

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    onFilesChange(newFiles);
    setPreviews(newPreviews);
  };

  const removeExistingUrl = (index: number) => {
    if (onUrlsChange) {
      const newUrls = existingUrls.filter((_, i) => i !== index);
      onUrlsChange(newUrls);
    }
  };

  const isVideo = (file: File) => file.type.startsWith("video/");
  const isVideoUrl = (url: string) => url.includes(".mp4") || url.includes(".mov") || url.includes(".webm");

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      {totalFiles < maxFiles && (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
            dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
            uploading && "opacity-50 pointer-events-none"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          <input
            id="file-upload"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
            onChange={handleChange}
            className="hidden"
          />
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Drag & drop or click to browse</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Upload up to {maxFiles} images or videos
          </p>
          <p className="text-xs text-muted-foreground">
            Images: JPG, PNG, WEBP (max 50MB) • Videos: MP4, MOV, WEBM (max 500MB)
          </p>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading files...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}

      {/* File Counter */}
      {totalFiles > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">
            {totalFiles} / {maxFiles} files uploaded
          </p>
          {totalFiles > 0 && (
            <Badge variant="secondary">
              First item is cover
            </Badge>
          )}
        </div>
      )}

      {/* Preview Grid */}
      {totalFiles > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Existing URLs */}
          {existingUrls.map((url, index) => (
            <div key={`existing-${index}`} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
              {isVideoUrl(url) ? (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <VideoIcon className="h-12 w-12 text-muted-foreground" />
                  <video src={url} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                </div>
              ) : (
                <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
              )}
              {index === 0 && files.length === 0 && (
                <Badge className="absolute top-2 left-2" variant="default">Cover</Badge>
              )}
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeExistingUrl(index)}
              >
                <X className="h-3 w-3" />
              </Button>
              <div className="absolute bottom-2 left-2">
                <GripVertical className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}

          {/* New Files */}
          {files.map((file, index) => (
            <div key={`new-${index}`} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
              {isVideo(file) ? (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <VideoIcon className="h-12 w-12 text-muted-foreground" />
                  {previews[index] && (
                    <video src={previews[index]} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                  )}
                </div>
              ) : (
                previews[index] ? (
                  <img src={previews[index]} alt={file.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )
              )}
              {index === 0 && existingUrls.length === 0 && (
                <Badge className="absolute top-2 left-2" variant="default">Cover</Badge>
              )}
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFile(index)}
              >
                <X className="h-3 w-3" />
              </Button>
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-xs text-white truncate bg-black/50 px-2 py-1 rounded">
                  {file.name}
                </p>
              </div>
              <div className="absolute top-2 left-2">
                <GripVertical className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaUploadZone;
