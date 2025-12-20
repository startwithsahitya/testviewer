"use client";

import { useThree, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useRef } from "react";

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

  // 🔥 SPACING (UNCHANGED)
  const X = 0.135;
  const Y = 0.035;
  const Z = -0.09;

  // 🔥 SLOT LOGIC (YOUR RULES)
  let slot = 0;
  if (relativeIndex === 0) slot = 0;
  else if (relativeIndex % 2 === 1)
    slot = -Math.ceil(relativeIndex / 2);
  else
    slot = Math.ceil(relativeIndex / 2);

  const target = new THREE.Vector3(
    slot * X,
    slot * Y,
    slot * Z
  );

  // ✅ REAL SMOOTH ANIMATION
  useFrame((_, delta) => {
    if (!meshRef.current) return;

    meshRef.current.position.x = THREE.MathUtils.damp(
      meshRef.current.position.x,
      target.x,
      8,
      delta
    );
    meshRef.current.position.y = THREE.MathUtils.damp(
      meshRef.current.position.y,
      target.y,
      8,
      delta
    );
    meshRef.current.position.z = THREE.MathUtils.damp(
      meshRef.current.position.z,
      target.z,
      8,
      delta
    );
  });

  return (
    <mesh
      ref={meshRef}
      rotation={[0, -Math.PI / 6, 0]}
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
        toneMapped={false}
      />
    </mesh>
  );
}
