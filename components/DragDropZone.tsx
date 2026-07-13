"use client";

import React, { useState, useRef } from "react";
import { Upload, File, X } from "lucide-react";

interface DragDropZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
}

export function DragDropZone({
  onFileSelect,
  accept = ".csv,.xlsx,.pdf,.zip,.jpg,.jpeg,.png",
  maxSizeMB = 10,
  label = "Seret & letakkan file di sini, atau klik untuk memilih",
}: DragDropZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const validateAndSelectFile = (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`Ukuran file melebihi batas maksimal ${maxSizeMB}MB.`);
      return;
    }
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSelectFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={onButtonClick}
      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px]
        ${
          isDragActive
            ? "border-amber-500 bg-amber-500/5"
            : selectedFile
            ? "border-emerald-500/50 bg-emerald-500/5"
            : "border-slate-700 hover:border-slate-600 bg-slate-900/20"
        }
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={handleChange}
      />

      {selectedFile ? (
        <div className="flex items-center gap-3 w-full max-w-xs bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60 text-left relative animate-in fade-in duration-200">
          <div className="w-8 h-8 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <File size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-200 truncate">{selectedFile.name}</p>
            <p className="text-[10px] text-slate-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
          </div>
          <button
            onClick={removeFile}
            className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-colors absolute right-2 top-1/2 -translate-y-1/2"
            title="Hapus file"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <>
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-3 group-hover:scale-110 transition-transform">
            <Upload size={18} />
          </div>
          <p className="text-xs text-slate-300 font-medium px-2 leading-relaxed">{label}</p>
          <p className="text-[10px] text-slate-500 mt-1">Maksimal {maxSizeMB}MB • Format: {accept}</p>
        </>
      )}
    </div>
  );
}
