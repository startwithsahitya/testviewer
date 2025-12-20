"use client";

import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import Scene from "./Scene";

type Props = {
  images: string[];
};

export default function ImageViewer({ images }: Props) {
  return (
    <Canvas
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
      }}
      camera={{ position: [0, 1, 3.2], fov: 10 }}
      gl={{ toneMapping: THREE.NoToneMapping }}
      onCreated={({ gl }) => gl.setClearColor("#f4f4f4", 1)}
    >
      <directionalLight position={[3, 2, 5]} intensity={1.5} />
      <directionalLight position={[-2, -1, 3]} intensity={0.6} />
      <Environment preset="studio" />

      <Scene images={images} />
    </Canvas>
  );
}
