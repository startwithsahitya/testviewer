"use client";

import { useState, useRef } from "react";
import ImageViewer from "@/components/ImageViewer";

export default function Page() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(null);

  return (
    <>
      {/* Input bar */}
      <div
        style={{
          position: "fixed",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          display: "flex",
          gap: "12px",
          padding: "10px 16px",
          border: "1px solid #ccc",
          borderRadius: "999px",
          background: "white",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setImage(URL.createObjectURL(file));
            }
          }}
        />

        <span style={{ fontSize: 12, color: "#666" }}>
          Select one image
        </span>
      </div>

      {/* Viewer */}
      {image && <ImageViewer image={image} />}
    </>
  );
}
