import { ChangeEvent, DragEvent, useEffect, useRef, useState } from 'react';
import { Image, UploadCloud, XCircle } from 'react-feather';

interface ImageDropzoneProps {
  label: string;
  file: File | null;
  currentImageUrl?: string | null;
  onFileChange: (file: File | null) => void;
  onRemoveImage: () => void;
  disabled?: boolean;
}

export default function ImageDropzone({
  label,
  file,
  currentImageUrl,
  onFileChange,
  onRemoveImage,
  disabled,
}: ImageDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  const handleFileSelection = (selectedFile?: File) => {
    if (!selectedFile || disabled) {
      return;
    }

    if (!selectedFile.type.startsWith('image/')) {
      return;
    }

    onFileChange(selectedFile);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    handleFileSelection(selectedFile);

    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const selectedFile = event.dataTransfer.files?.[0];
    handleFileSelection(selectedFile);
  };

  const displayedPreview = previewUrl || currentImageUrl || null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">{label}</p>

      <div
        role="button"
        tabIndex={0}
        onClick={() => !disabled && fileInputRef.current?.click()}
        onKeyDown={(event) => {
          if ((event.key === 'Enter' || event.key === ' ') && !disabled) {
            event.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!disabled) {
            setIsDragging(true);
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setIsDragging(false);
        }}
        onDrop={handleDrop}
        className={`rounded-md border-2 border-dashed p-4 transition-colors focus:outline-none ${
          isDragging ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
        } ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          disabled={disabled}
          onChange={handleInputChange}
        />

        {displayedPreview ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <img
              src={displayedPreview}
              alt="Course preview"
              className="h-24 w-full rounded-md object-cover border sm:w-40"
            />
            <div className="text-sm text-gray-600">
              <p className="font-semibold text-gray-700">
                {file ? 'New image selected' : 'Current image'}
              </p>
              <p>Drag and drop another image or click to replace.</p>
              <p className="text-xs mt-1">Accepted: JPG, PNG, WEBP (max 5MB)</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <UploadCloud size={18} />
            <p>
              Drag and drop an image here, or click to select one. Accepted:
              JPG, PNG, WEBP (max 5MB)
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <Image size={14} />
          {displayedPreview ? 'Replace image' : 'Choose image'}
        </button>

        {displayedPreview ? (
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            onClick={onRemoveImage}
            disabled={disabled}
          >
            <XCircle size={14} /> Remove image
          </button>
        ) : null}
      </div>
    </div>
  );
}
