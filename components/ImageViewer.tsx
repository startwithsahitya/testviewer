"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { useTexture, Environment } from "@react-three/drei";
import * as THREE from "three";

function GlassImage({ src }: { src: string }) {
  const texture = useTexture(src) as THREE.Texture;
  const { size, viewport } = useThree();

  if (
    !texture.image ||
    !(texture.image instanceof HTMLImageElement)
  ) {
    return null;
  }

  const imgWidth = texture.image.naturalWidth;
  const imgHeight = texture.image.naturalHeight;

  // ----- constraints -----
  const MAX_HEIGHT_PX = 450;
  const THICKNESS = 0.004;

  const scaleFactor =
    imgHeight > MAX_HEIGHT_PX ? MAX_HEIGHT_PX / imgHeight : 1;

  const worldHeight =
    imgHeight * scaleFactor * (viewport.height / size.height);

  const worldWidth =
    imgWidth * scaleFactor * (viewport.width / size.width);

  return (
    <mesh rotation={[0, -Math.PI / 6, 0]}>
      {/* 3D box gives real thickness */}
      <boxGeometry args={[worldWidth, worldHeight, THICKNESS]} />

      {/* Glass material */}
      <meshPhysicalMaterial
        map={texture}
        transmission={1}
        roughness={0.05}
        thickness={THICKNESS}
        ior={1.5}
        reflectivity={0.35}
        clearcoat={1}
        clearcoatRoughness={0.05}
        transparent
        toneMapped={false}
      />
    </mesh>
  );
}

export default function ImageViewer({ image }: { image: string }) {
  return (
    <Canvas
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
      }}
      camera={{ position: [0, 1, 2], fov: 10 }}
      gl={{ toneMapping: THREE.NoToneMapping }}
      onCreated={({ gl }) => {
        gl.setClearColor("#f4f4f4", 1); // background color
      }}
    >
      {/* Key light for highlights */}
      <directionalLight
        position={[3, 2, 5]}
        intensity={1.5}
      />

      {/* Fill light to avoid dullness */}
      <directionalLight
        position={[-2, -1, 3]}
        intensity={0.6}
      />

      {/* Neutral reflections */}
      <Environment preset="studio" />

      <GlassImage src={image} />
    </Canvas>
  );
}
