"use client";

import { useState, useRef } from "react";
import GlassImage from "./GlassImage";

type Props = {
  images: string[];
};

export default function Scene({ images }: Props) {
  const total = images.length;
  const [active, setActive] = useState(0);
  const lock = useRef(false);

  return (
    <group
      onWheel={(e) => {
        if (lock.current) return;
        lock.current = true;

        setActive((prev) =>
          e.deltaY > 0
            ? (prev + 1) % total
            : (prev - 1 + total) % total
        );

        setTimeout(() => {
          lock.current = false;
        }, 350); // must match animation feel
      }}
    >
      {images.map((src, index) => {
        const relative =
          ((index - active) % total + total) % total;

        return (
          <GlassImage
            key={index}
            src={src}
            relativeIndex={relative}
          />
        );
      })}
    </group>
  );
}
