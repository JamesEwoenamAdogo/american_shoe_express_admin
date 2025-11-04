// HeroImagesPage.tsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type ImageItem = {
  _id: string;
  image: string;
};

const HeroImagesPage: React.FC = () => {
  const { toast } = useToast();

  const [desktopImages, setDesktopImages] = useState<ImageItem[]>([]);
  const [mobileImages, setMobileImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const desktopInputRef = useRef<HTMLInputElement | null>(null);
  const mobileInputRef = useRef<HTMLInputElement | null>(null);

  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewType, setPreviewType] = useState<"desktop" | "mobile" | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/all-hero-images");
      if (res.data.success) {
        setDesktopImages(res.data.desktop ?? []);
        setMobileImages(res.data.mobile ?? []);
      }
    } catch {
      toast({ title: "Failed to fetch hero images", variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => { fetchImages(); }, []);

  const uploadFile = async (file: File, type: "desktop" | "mobile") => {
    const fd = new FormData();
    fd.append("image", file);

    setUploading(true);
    try {
      const endpoint = type === "desktop" ? "/add-desktop-hero-image" : "/add-mobile-hero-image";
      const res = await axios.post(endpoint, fd);

      if (res.data.success) {
        toast({ title: `${type} image uploaded successfully.` });
        fetchImages();
      }
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    }
    setUploading(false);
  };

  const handleFileChosen = (file: File | undefined, type: "desktop" | "mobile") => {
    if (!file) return;
    setPreviewFile(file);
    setPreviewType(type);
    setPreviewOpen(true);
  };

  const confirmPreviewUpload = async () => {
    if (previewFile && previewType) await uploadFile(previewFile, previewType);
    setPreviewOpen(false);
    setPreviewFile(null);
    setPreviewType(null);
  };

  const handleUpdate = async (id: string, type: "desktop" | "mobile") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      if (!input.files?.[0]) return;
      const fd = new FormData();
      fd.append("image", input.files[0]);
      setUploading(true);
      try {
        const endpoint =
          type === "desktop"
            ? `/update-desktop-hero-image/${id}`
            : `/update-mobile-hero-image/${id}`;
        const res = await axios.put(endpoint, fd);
        if (res.data.success) {
          toast({ title: `${type} image updated successfully.` });
          fetchImages();
        }
      } catch {
        toast({ title: "Update failed", variant: "destructive" });
      }
      setUploading(false);
    };
    input.click();
  };

  const handleDelete = async (id: string, type: "desktop" | "mobile") => {
    if (!confirm("Delete this image?")) return;
    setUploading(true);
    try {
      const endpoint =
        type === "desktop"
          ? `/delete-desktop-hero-image/${id}`
          : `/delete-mobile-hero-image/${id}`;
      const res = await axios.delete(endpoint);
      if (res.data.success) {
        toast({ title: "Image deleted successfully." });
        fetchImages();
      }
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
    setUploading(false);
  };

  const SkeletonCard = () => (
    <div className="animate-pulse border rounded-md p-3">
      <div className="bg-gray-200 h-40 w-full mb-3 rounded" />
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Hero Banner Images</h1>

      {/* DESKTOP HERO SECTION */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Desktop Hero</h2>

          {/* Hide button if one image exists */}
          {desktopImages.length < 1 && (
            <Button onClick={() => desktopInputRef.current?.click()} disabled={uploading}>
              Pick Desktop Image
            </Button>
          )}

          <input
            ref={desktopInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChosen(e.target.files?.[0], "desktop")}
          />
        </div>

        {/* Hide drop zone if one image exists */}
        {desktopImages.length < 1 && (
          <div
            className="border-dashed border-2 border-gray-300 rounded-md p-6 text-center cursor-pointer"
            onClick={() => desktopInputRef.current?.click()}
          >
            Drag & drop or click to upload desktop image
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {loading
            ? [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
            : desktopImages.map((item) => (
                <div key={item._id} className="border rounded-md p-3 shadow-sm">
                  <img src={item.image} className="w-full h-40 object-cover rounded" />
                  <div className="flex justify-between mt-3">
                    <Button size="sm" onClick={() => handleUpdate(item._id, "desktop")}>Update</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(item._id, "desktop")}>Delete</Button>
                  </div>
                </div>
              ))}
        </div>
      </section>

      {/* MOBILE HERO SECTION */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Mobile Hero</h2>

          {/* Hide button if one image exists */}
          {mobileImages.length < 1 && (
            <Button onClick={() => mobileInputRef.current?.click()} disabled={uploading}>
              Pick Mobile Image
            </Button>
          )}

          <input
            ref={mobileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChosen(e.target.files?.[0], "mobile")}
          />
        </div>

        {/* Hide drop zone if one image exists */}
        {mobileImages.length < 1 && (
          <div
            className="border-dashed border-2 border-gray-300 rounded-md p-6 text-center cursor-pointer"
            onClick={() => mobileInputRef.current?.click()}
          >
            Drag & drop or click to upload mobile image
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {loading
            ? [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
            : mobileImages.map((item) => (
                <div key={item._id} className="border rounded-md p-3 shadow-sm">
                  <img src={item.image} className="w-full h-40 object-cover rounded" />
                  <div className="flex justify-between mt-3">
                    <Button size="sm" onClick={() => handleUpdate(item._id, "mobile")}>Update</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(item._id, "mobile")}>Delete</Button>
                  </div>
                </div>
              ))}
        </div>
      </section>

      {/* PREVIEW MODAL */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Preview & Upload</DialogTitle></DialogHeader>

          {previewFile && (
            <>
              <img src={URL.createObjectURL(previewFile)} className="w-full max-h-96 object-contain rounded" />
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="ghost" onClick={() => setPreviewOpen(false)}>Cancel</Button>
                <Button onClick={confirmPreviewUpload} disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HeroImagesPage;
