"use client";

import { useState } from "react";
import ImageViewer from "@/components/ImageViewer";

export default function Page() {
  const [images, setImages] = useState<string[]>([]);

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          padding: "10px 16px",
          border: "1px solid #ccc",
          borderRadius: "999px",
          background: "white",
        }}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            setImages(files.map((f) => URL.createObjectURL(f)));
          }}
        />
      </div>

      {images.length > 0 && <ImageViewer images={images} />}
    </>
  );
}
