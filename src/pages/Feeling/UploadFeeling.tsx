import React, { useState, useRef } from "react";
import {
  Music,
  Image as ImageIcon,
  Video,
  X,
  CheckCircle2,
  Loader2,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

const UploadFeeling = ({ onUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/api/v1/upload/feeling`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("API failed");

      const data = await response.json();

      const fileData = {
        name: file.name || "Unnamed Feeling",
        type: file.type,
        url: `${API_BASE_URL}${data.media}`,
      };

      setUploadedFile(fileData);
      if (onUpload) onUpload(fileData);
      toast.success("Feeling updated successfully!");
    } catch (error) {
      const fallbackData = {
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
      };
      setUploadedFile(fallbackData);
      if (onUpload) onUpload(fallbackData);
      toast.info("Backend offline: Local preview updated.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const triggerReupload = () => {
    fileInputRef.current?.click();
  };

  return (
    <section
      className="mt-10 p-6 rounded-3xl border-2 border-dashed relative"
      style={{
        background: "var(--pink-50)",
        borderColor: "var(--pink-200)",
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,video/*,audio/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="text-center mb-6">
        <h3 className="text-xl font-display font-semibold text-primary">
          Upload Your Feeling
        </h3>
        <p className="text-sm text-muted-foreground">
          {uploadedFile
            ? "Change your file below"
            : "Attach a photo, video, or voice note"}
        </p>
      </div>

      {!uploadedFile && !uploading ? (
        <div className="relative group">
          <input
            type="file"
            accept="image/*,video/*,audio/*"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="flex flex-col items-center justify-center p-10 rounded-2xl border-2 border-dashed bg-white shadow-sm group-hover:border-primary/50 transition-all">
            <div className="flex gap-4 mb-4">
              <ImageIcon className="text-pink-500 h-6 w-6" />
              <Video className="text-purple-500 h-6 w-6" />
              <Music className="text-blue-500 h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-gray-600">
              Click to upload your feeling
            </p>
          </div>
        </div>
      ) : uploading ? (
        <div className="flex flex-col items-center justify-center p-10 bg-white/50 rounded-2xl border-2 border-dashed">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-2" />
          <p className="text-sm font-medium animate-pulse text-primary">
            Processing File...
          </p>
        </div>
      ) : (
        <div className="animate-in slide-in-from-bottom-4 duration-500 flex flex-col md:flex-row items-center gap-6 bg-white p-6 rounded-2xl shadow-xl border border-primary/10 relative">
          <button
            onClick={() => {
              setUploadedFile(null);
              if (onUpload) onUpload(null);
            }}
            className="absolute -top-2 -right-2 p-1 bg-white border shadow-md rounded-full hover:bg-red-50 group z-20"
          >
            <X className="h-4 w-4 text-gray-400 group-hover:text-red-500" />
          </button>

          <div className="flex items-center gap-4 flex-1 w-full min-w-0">
            {/* UPDATED: Container now has overflow-hidden to clip the image safely */}
            <div className="h-14 w-14 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-gray-100">
              {uploadedFile.type.includes("image") ? (
                <img
                  src={uploadedFile.url}
                  alt="Uploaded Feeling Preview"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    // Fallback to icon if image fails to load via remote URL
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentElement?.classList.add("p-3");
                  }}
                />
              ) : uploadedFile.type.includes("video") ? (
                <Video className="text-primary h-5 w-5" />
              ) : (
                <Music className="text-primary h-5 w-5" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                <p className="text-sm font-bold text-gray-900">Captured!</p>
              </div>
              <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                {uploadedFile.name}
              </p>

              <button
                onClick={triggerReupload}
                className="mt-2 flex items-center gap-1 text-[10px] font-bold text-primary hover:underline uppercase tracking-wider"
              >
                <RefreshCw className="h-3 w-3" /> Reupload
              </button>
            </div>
          </div>

          <ArrowRight className="hidden md:block text-primary h-6 w-6 opacity-30 shrink-0" />

          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="p-2 border-2 border-primary rounded-xl bg-white">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(uploadedFile.url)}`}
                alt="QR"
                className="w-20 h-20"
              />
            </div>
            <span className="text-[10px] font-bold text-primary uppercase">
              Feeling QR
            </span>
          </div>
        </div>
      )}
    </section>
  );
};

export default UploadFeeling;
