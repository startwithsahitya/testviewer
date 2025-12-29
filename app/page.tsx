// Structure: app/page.tsx
// Type: Page
"use client";

import dynamic from "next/dynamic";
import { imagesData } from "../data/images";

const ImageViewer = dynamic(() => import("../components/ImageViewer"), {
  ssr: false,
});

export default function Page() {
  return <ImageViewer images={imagesData} />;
}
