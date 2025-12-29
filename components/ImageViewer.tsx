// Structure: components/ImageViewer.tsx
// Type: Component
"use client";

import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import Scene from "./Scene";
import { ImageItem } from "../types/image";
import { Suspense } from "react";

THREE.Cache.enabled = true;

type Props = {
  images: ImageItem[];
};

export default function ImageViewer({ images }: Props) {
  return (
    <Canvas
      style={{ position: "fixed", inset: 0 }}
      camera={{ position: [0, 1, 3.2], fov: 10 }}
      gl={{ toneMapping: THREE.NoToneMapping }}
      onCreated={({ gl }) => gl.setClearColor("#f4f4f4", 1)}
    >
      <directionalLight position={[3, 2, 5]} intensity={1.5} />
      <directionalLight position={[-2, -1, 3]} intensity={0.6} />

      {/* ✅ REQUIRED for useLoader */}
      <Suspense fallback={null}>
        <Environment preset="studio" />
        <Scene images={images} />
      </Suspense>
    </Canvas>
  );
}
