"use client";

import { useThree, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useEffect } from "react";

type Props = {
  src: string;
  relativeIndex: number;
};

export default function GlassImage({
  src,
  relativeIndex,
}: Props) {
  const texture = useTexture(src) as THREE.Texture;
  const { size, viewport } = useThree();

  const meshRef = useRef<THREE.Mesh>(null);
  const target = useRef(new THREE.Vector3());

  if (
    !texture.image ||
    !(texture.image instanceof HTMLImageElement)
  )
    return null;

  const imgWidth = texture.image.naturalWidth;
  const imgHeight = texture.image.naturalHeight;

  const scaleFactor =
    imgHeight > 450 ? 450 / imgHeight : 1;

  const worldHeight =
    imgHeight * scaleFactor * (viewport.height / size.height);
  const worldWidth =
    imgWidth * scaleFactor * (viewport.width / size.width);

  // 🔥 CHAIN SPACING (UNCHANGED)
  const X = 0.135;
  const Y = 0.035;
  const Z = -0.09;

  // 🔥 VISIBILITY WINDOW
  const MAX_VISIBLE = 4;
  const isVisible =
    Math.abs(relativeIndex) <= MAX_VISIBLE;

  // Update target position only when index changes
  useEffect(() => {
    target.current.set(
      relativeIndex * X,
      relativeIndex * Y,
      relativeIndex * Z
    );
  }, [relativeIndex]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // Smooth position animation
    meshRef.current.position.x = THREE.MathUtils.damp(
      meshRef.current.position.x,
      target.current.x,
      8,
      delta
    );
    meshRef.current.position.y = THREE.MathUtils.damp(
      meshRef.current.position.y,
      target.current.y,
      8,
      delta
    );
    meshRef.current.position.z = THREE.MathUtils.damp(
      meshRef.current.position.z,
      target.current.z,
      8,
      delta
    );

    // 🔥 Smooth visibility fade
    const mat =
      meshRef.current
        .material as THREE.MeshPhysicalMaterial;

    mat.opacity = THREE.MathUtils.damp(
      mat.opacity,
      isVisible ? 1 : 0,
      10,
      delta
    );
  });

  return (
    <mesh
      ref={meshRef}
      rotation={[0, -Math.PI / 6, 0]}
      renderOrder={1000 - relativeIndex}
    >
      <boxGeometry args={[worldWidth, worldHeight, 0.004]} />
      <meshPhysicalMaterial
        map={texture}
        transmission={1}
        roughness={0.05}
        thickness={0.004}
        ior={1.5}
        reflectivity={0.35}
        clearcoat={1}
        clearcoatRoughness={0.05}
        transparent
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-1}
        polygonOffsetUnits={-1}
        toneMapped={false}
      />
    </mesh>
  );
}
