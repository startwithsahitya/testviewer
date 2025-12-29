"use client";

import { useState, useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import GlassImage from "./GlassImage";
import { hoverables, hoverState } from "./hoverStore";
import { ImageItem } from "../types/image";
import { getCachedImage } from "../utils/imageCache";

type Props = { images: ImageItem[] };

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function buildInitialOrder(count: number) {
  const odds: number[] = [];
  const evens: number[] = [];
  for (let i = 1; i <= count; i++) {
    if (i === 1) continue;
    i % 2 ? odds.push(i) : evens.push(i);
  }
  return [...odds.reverse(), 1, ...evens];
}

export default function Scene({ images }: Props) {
  const { viewport, camera } = useThree();

  const [order, setOrder] = useState(buildInitialOrder(images.length));
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    images.forEach((img) => {
      getCachedImage(img.url).catch(() => {});
    });
  }, [images]);

  // ======================
  // DRAG STATE
  // ======================
  const holding = useRef(false);
  const lastY = useRef(0);
  const acc = useRef(0);

  const ROTATE_THRESHOLD = 26;
  const WHEEL_SENSITIVITY = 0.35;
  const wheelAcc = useRef(0);

  const rotate = (dir: 1 | -1) => {
    setOrder((o) => {
      const n = [...o];
      dir === 1 ? n.push(n.shift()!) : n.unshift(n.pop()!);
      return n;
    });
  };

  // 🔑 CLICK → CHAIN TO CENTER
  const rotateIndexToCenter = (clickedIndex: number) => {
    setOrder((prev) => {
      const next = [...prev];
      const mid = Math.floor(next.length / 2);
      let idx = clickedIndex;

      while (idx !== mid) {
        if (idx > mid) {
          next.push(next.shift()!);
          idx--;
        } else {
          next.unshift(next.pop()!);
          idx++;
        }
      }

      return next;
    });
  };

  // ======================
  // HOVER RAYCAST
  // ======================
  useFrame(() => {
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(
      hoverables.map((h) => h.mesh)
    );

    const id =
      hits.length > 0
        ? hoverables.find((h) => h.mesh === hits[0].object)?.id ?? null
        : null;

    if (id !== hoverState.activeId) {
      hoverables.forEach((h) => h.setHovered(h.id === id));
      hoverState.activeId = id;
    }
  });

  return (
    <>
      {selected && (
        <mesh onClick={() => setSelected(null)}>
          <planeGeometry args={[viewport.width, viewport.height]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      )}

      <mesh
        onPointerDown={(e) => {
          holding.current = true;
          lastY.current = e.clientY;
          acc.current = 0;
        }}
        onPointerMove={(e) => {
          mouse.x = (e.clientX / innerWidth) * 2 - 1;
          mouse.y = -(e.clientY / innerHeight) * 2 + 1;

          if (!holding.current || selected) return;

          acc.current += e.clientY - lastY.current;
          lastY.current = e.clientY;

          if (Math.abs(acc.current) > ROTATE_THRESHOLD) {
            rotate(acc.current > 0 ? 1 : -1);
            acc.current = 0;
          }
        }}
        onPointerUp={() => (holding.current = false)}
        onPointerLeave={() => (holding.current = false)}
        onWheel={(e) => {
          if (selected) return;

          wheelAcc.current += e.deltaY * WHEEL_SENSITIVITY;
          if (Math.abs(wheelAcc.current) > 40) {
            rotate(wheelAcc.current > 0 ? 1 : -1);
            wheelAcc.current = 0;
          }
        }}
      >
        <planeGeometry args={[viewport.width, viewport.height]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {order.map((label, i) => {
        const img = images[label - 1];
        const mid = Math.floor(order.length / 2);
        const relativeIndex = i - mid;
        const isCenter = relativeIndex === 0;

        return (
          <GlassImage
            key={img.id}
            id={img.id}
            url={img.url}
            relativeIndex={relativeIndex}
            isSelected={selected === img.id}
            isHidden={selected !== null && selected !== img.id}
            onClickImage={() => {
              if (isCenter) {
                setSelected((p) => (p === img.id ? null : img.id));
              } else {
                rotateIndexToCenter(i);
              }
            }}
          />
        );
      })}
    </>
  );
}
