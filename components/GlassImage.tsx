"use client";

import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRef, useEffect, useState } from "react";
import { hoverables } from "./hoverStore";
import { getCachedImage } from "../utils/imageCache";

type Props = {
  id: string;
  url: string;
  relativeIndex: number;
  isSelected: boolean;
  isHidden: boolean;
  onClickImage: (relativeIndex: number) => void;
};

export default function GlassImage({
  id,
  url,
  relativeIndex,
  isSelected,
  isHidden,
  onClickImage,
}: Props) {
  const { size, viewport } = useThree();

  const groupRef = useRef<THREE.Group>(null);
  const hitRef = useRef<THREE.Mesh>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const textureRef = useRef<THREE.Texture | null>(null);

  const [dims, setDims] = useState({ w: 0.9, h: 0.6 });
  const [loaded, setLoaded] = useState(false);

  const baseTarget = useRef(new THREE.Vector3());
  const visibleRef = useRef(true);

  const [hovered, setHovered] = useState(false);
  const hoverAmount = useRef(0);

  // ✅ TRUE CENTER
  const isCenter = relativeIndex === 0 && !isSelected;

  // ======================
  // IMAGE LOAD
  // ======================
  useEffect(() => {
    let cancelled = false;

    getCachedImage(url).then((blob) => {
      if (cancelled) return;

      const img = new Image();
      img.src = URL.createObjectURL(blob);

      img.onload = () => {
        if (cancelled) return;

        const scale =
          img.naturalHeight > 380 ? 380 / img.naturalHeight : 1;

        const worldW =
          img.naturalWidth * scale * (viewport.width / size.width);
        const worldH =
          img.naturalHeight * scale * (viewport.height / size.height);

        setDims({ w: worldW, h: worldH });

        const tex = new THREE.Texture(img);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;

        textureRef.current = tex;

        if (materialRef.current) {
          materialRef.current.map = tex;
          materialRef.current.needsUpdate = true;
        }

        setLoaded(true);
      };
    });

    return () => {
      cancelled = true;
      textureRef.current?.dispose();
      textureRef.current = null;
    };
  }, [url, size, viewport]);

  // ======================
  // BASE STACK POSITION
  // ======================
  useEffect(() => {
    baseTarget.current.set(
      relativeIndex * 0.13,
      relativeIndex * 0.035,
      relativeIndex * -0.09
    );

    visibleRef.current =
      Math.abs(relativeIndex) <= 6 && !isHidden;
  }, [relativeIndex, isHidden]);

  // ======================
  // HOVER STORE
  // ======================
  useEffect(() => {
    if (!hitRef.current) return;

    const entry = { id, mesh: hitRef.current, setHovered };
    hoverables.push(entry);

    return () => {
      const i = hoverables.indexOf(entry);
      if (i !== -1) hoverables.splice(i, 1);
    };
  }, [id]);

  // ======================
  // ANIMATION LOOP
  // ======================
  useFrame((_, delta) => {
    if (!groupRef.current || !meshRef.current) return;

    meshRef.current.visible = visibleRef.current;

    hoverAmount.current = THREE.MathUtils.damp(
      hoverAmount.current,
      hovered && !isCenter && !isSelected ? 1 : 0,
      6,
      delta
    );

    const hx = hoverAmount.current * 0.01;
    const hy = hoverAmount.current * 0.02;

    // CENTER DOMINANCE (YOUR VALUES)
    const centerZBoost = isCenter ? 0.15 : 0;
    const centerYLift = isCenter ? 0.05 : 0;

    // 🔑 EXPLICIT CENTER-ONLY SPACING
    let centerSpacingZ = 0;
    if (!isCenter && Math.abs(relativeIndex) === 1) {
      centerSpacingZ = -0.08;
    }

    const tx =
      isSelected ? 0 : baseTarget.current.x + hx;

    const ty =
      isSelected
        ? 0
        : baseTarget.current.y + hy + centerYLift;

    const tz =
      isSelected
        ? 0
        : baseTarget.current.z + centerZBoost + centerSpacingZ;

    groupRef.current.position.x = THREE.MathUtils.damp(
      groupRef.current.position.x,
      tx,
      8,
      delta
    );
    groupRef.current.position.y = THREE.MathUtils.damp(
      groupRef.current.position.y,
      ty,
      8,
      delta
    );
    groupRef.current.position.z = THREE.MathUtils.damp(
      groupRef.current.position.z,
      tz,
      8,
      delta
    );

    const baseScale = isCenter ? 1.3 : 1;
    const hoverScale = 1 + hoverAmount.current * 0.02;
    const selectedScale = isSelected ? 1.18 : 1;

    const s = baseScale * hoverScale * selectedScale;

    groupRef.current.scale.x = THREE.MathUtils.damp(
      groupRef.current.scale.x,
      s,
      8,
      delta
    );
    groupRef.current.scale.y = THREE.MathUtils.damp(
      groupRef.current.scale.y,
      s,
      8,
      delta
    );
  });

  return (
    <group ref={groupRef} renderOrder={2000 - relativeIndex}>
      <mesh ref={hitRef}>
        <planeGeometry args={[dims.w * 1.25, dims.h * 1.25]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClickImage(relativeIndex);
        }}
      >
        <boxGeometry args={[dims.w, dims.h, 0.004]} />
        <meshBasicMaterial
          ref={materialRef}
          map={textureRef.current ?? null}
          opacity={loaded ? 1 : 0}
        />
      </mesh>
    </group>
  );
}
