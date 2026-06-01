import { useRef, useState, useEffect } from "react";
import { FaFilePdf, FaUpload } from "react-icons/fa";

export default function UploadBox({ accept = ".pdf", file, onFileChange }) {
  const inputRef = useRef();
  const [drag, setDrag] = useState(false);

  useEffect(() => {
    return () => {
      // revokeObjectURL if needed
      if (file && file.preview) URL.revokeObjectURL(file.preview);
    };
  }, [file]);

  function handleDrop(e) {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) onFileChange(f);
  }

  function handleSelect(e) {
    const f = e.target.files && e.target.files[0];
    if (f) onFileChange(f);
  }

  return (
    <div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setDrag(true)}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
        role="button"
        tabIndex={0}
        className={
          "glass-card border border-white/8 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all " +
          (drag ? "ring-2 ring-purple-500/40" : "hover:ring-2 hover:ring-purple-500/20")
        }
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleSelect}
        />

        <div className="text-5xl mb-4 text-purple-400">
          <FaFilePdf />
        </div>

        <div className="text-white font-semibold mb-2">Drag & drop your PDF here</div>
        <div className="text-sm text-gray-400">or click to browse</div>

        <div className="mt-4 text-sm text-gray-400 flex items-center gap-2">
          <FaUpload /> <span>Supports PDF files only</span>
        </div>
      </div>

      {file && (
        <div className="mt-4 p-4 bg-white/3 border border-white/6 rounded-xl flex items-center gap-4">
          <div className="flex-shrink-0 text-3xl text-purple-300">
            <FaFilePdf />
          </div>
          <div className="truncate">
            <div className="font-semibold">{file.name}</div>
            <div className="text-sm text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
          </div>
        </div>
      )}
    </div>
  );
}
