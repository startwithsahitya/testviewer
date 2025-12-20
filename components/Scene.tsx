"use client";

import { useState, useRef } from "react";
import { useThree } from "@react-three/fiber";
import GlassImage from "./GlassImage";

type Props = {
  images: string[];
};

function buildInitialOrder(count: number) {
  const odds: number[] = [];
  const evens: number[] = [];

  for (let i = 1; i <= count; i++) {
    if (i === 1) continue;
    if (i % 2 === 1) odds.push(i);
    else evens.push(i);
  }

  return [...odds.reverse(), 1, ...evens];
}

export default function Scene({ images }: Props) {
  const { viewport } = useThree();

  const [order, setOrder] = useState<number[]>(
    buildInitialOrder(images.length)
  );

  // ======================
  // PRESS + MOVE STATE
  // ======================
  const isHolding = useRef(false);
  const lastY = useRef(0);
  const accumulated = useRef(0);

  // ======================
  // TUNING (IMPORTANT)
  // ======================
  const DRAG_SENSITIVITY = 1;   // mouse response
  const PIXELS_PER_STEP = 16;     // smaller = smoother
  const MAX_STEPS_PER_MOVE = 3;   // safety

  const rotateOnce = (dir: 1 | -1) => {
    setOrder((prev) => {
      const next = [...prev];
      if (dir === 1) next.push(next.shift()!);
      else next.unshift(next.pop()!);
      return next;
    });
  };

  return (
    <>
      {/* ======================
         FULLSCREEN HIT PLANE
         ====================== */}
      <mesh
        position={[0, 0, 0]}
        onPointerDown={(e) => {
          isHolding.current = true;
          lastY.current = e.clientY;
          accumulated.current = 0;
          document.body.style.cursor = "grabbing";
        }}
        onPointerMove={(e) => {
          if (!isHolding.current) return;

          const dy = (e.clientY - lastY.current) * DRAG_SENSITIVITY;
          lastY.current = e.clientY;

          accumulated.current += dy;

          let steps = 0;

          while (
            accumulated.current > PIXELS_PER_STEP &&
            steps < MAX_STEPS_PER_MOVE
          ) {
            rotateOnce(1);
            accumulated.current -= PIXELS_PER_STEP;
            steps++;
          }

          while (
            accumulated.current < -PIXELS_PER_STEP &&
            steps < MAX_STEPS_PER_MOVE
          ) {
            rotateOnce(-1);
            accumulated.current += PIXELS_PER_STEP;
            steps++;
          }
        }}
        onPointerUp={() => {
          isHolding.current = false;
          accumulated.current = 0;
          document.body.style.cursor = "default";
        }}
        onPointerLeave={() => {
          isHolding.current = false;
          accumulated.current = 0;
          document.body.style.cursor = "default";
        }}
        onWheel={(e) => {
          rotateOnce(e.deltaY > 0 ? 1 : -1);
        }}
      >
        <planeGeometry args={[viewport.width, viewport.height]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* ======================
         IMAGE CHAIN
         ====================== */}
      {order.map((label, positionIndex) => {
        const imageIndex = label - 1;
        const middle = Math.floor(order.length / 2);

        const relativeIndex =
          positionIndex - middle;

        return (
          <GlassImage
            key={images[imageIndex]}
            src={images[imageIndex]}
            relativeIndex={relativeIndex}
          />
        );
      })}
    </>
  );
}
