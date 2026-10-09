import { useEffect, useRef, useState } from "react";

interface ImageUploaderProps {
  value?: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
  className?: string;
}

function isJpgFile(file: File): boolean {
  return (
    file.type === "image/jpeg" &&
    /\.(jpg|jpeg)$/i.test(file.name)
  );
}

async function convertToJpg(file: File): Promise<File> {
  if (file.type === "image/jpeg") {
    return file;
  }

  const bitmap = await createImageBitmap(file);

  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    bitmap.close();
    throw new Error("Cannot create canvas context");
  }

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(bitmap, 0, 0);

  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.9);
  });

  if (!blob) {
    throw new Error("Failed to convert image to JPG");
  }

  return new File(
    [blob],
    "pasted-image.jpg",
    {
      type: "image/jpeg",
      lastModified: Date.now(),
    },
  );
}

export function ImageUploader({
  value = null,
  onChange,
  disabled = false,
  className,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }

    const url = URL.createObjectURL(value);

    setPreview(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [value]);

  const handleFileSelect = (file: File | undefined) => {
    if (!file) {
      return;
    }

    setError(null);

    if (!isJpgFile(file)) {
      setError("Можно загрузить только JPG/JPEG.");
      return;
    }

    onChange(file);
  };

  const handlePaste = async (event: ClipboardEvent) => {
    if (disabled) {
      return;
    }

    const items = event.clipboardData?.items;

    if (!items) {
      return;
    }

    for (const item of items) {
      if (!item.type.startsWith("image/")) {
        continue;
      }

      const file = item.getAsFile();

      if (!file) {
        continue;
      }

      event.preventDefault();

      try {
        setError(null);

        const jpgFile = await convertToJpg(file);

        onChange(jpgFile);
      } catch {
        setError("Не удалось обработать изображение из буфера.");
      }

      return;
    }
  };

  useEffect(() => {
    window.addEventListener("paste", handlePaste);

    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [disabled]);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    handleFileSelect(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleRemove = () => {
    setError(null);
    onChange(null);
  };


    return (
        <div className={className}>
            <input
                ref={inputRef}
                type="file"
                accept=".jpg,.jpeg,image/jpeg"
                onChange={handleInputChange}
                disabled={disabled}
                hidden
            />

            {preview ? (
                <div>
                    <img
                        src={preview}
                        alt="Preview"
                        style={{
                            display: "block",
                            maxWidth: 300,
                            maxHeight: 300,
                            objectFit: "contain",
                        }}
                    />

                    <button
                        type="button"
                        onClick={handleRemove}
                        disabled={disabled}
                    >
                        Удалить
                    </button>
                </div>
            ) : (
                <div
                    role="button"
                    tabIndex={disabled ? -1 : 0}
                    onClick={() => {
                        if (!disabled) {
                            inputRef.current?.click();
                        }
                    }}
                    onKeyDown={(event) => {
                        if (
                            !disabled &&
                            (event.key === "Enter" || event.key === " ")
                        ) {
                            event.preventDefault();
                            inputRef.current?.click();
                        }
                    }}
                    style={{
                        minHeight: 300,
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,

                        border: "2px dashed #bbb",
                        borderRadius: 12,
                        padding: 24,
                        boxSizing: "border-box",

                        cursor: disabled ? "not-allowed" : "pointer",
                        backgroundColor: "#fafafa",
                        color: "#333",

                        transition: "background-color 0.15s, border-color 0.15s",
                    }}
                >
                    <div
                        style={{
                            fontSize: 18,
                            fontWeight: 600,
                        }}
                    >
                        Загрузить JPG
                    </div>

                    <div
                        style={{
                            fontSize: 14,
                            color: "#777",
                        }}
                    >
                        Нажмите здесь или вставьте изображение через Ctrl+V
                    </div>
                </div>
            )}

            {error && (
                <p style={{ color: "red" }}>
                    {error}
                </p>
            )}
        </div>
    );
}