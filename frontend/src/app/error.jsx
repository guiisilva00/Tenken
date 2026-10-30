'use client';

import FigureError from "@/components/figureError";

export default function Error({ reset }) {
  return <FigureError onRetry={reset} />;
}
