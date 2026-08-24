import { useEffect, useRef } from 'react';
import { useLoadingStore } from '@/stores/loadingStore';
import { useSettingsStore } from '@/stores/settingsStore';

export function ApiLoader() {
  const isLoading = useLoadingStore((state) => state.pendingRequests > 0);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex h-screen w-screen items-center justify-center bg-white/95 dark:bg-slate-950/95">
      <ConcentricRingsLoader />
    </div>
  );
}

interface ConcentricRingsLoaderProps {
  size?: number;
  showText?: boolean;
  rings?: number;
  text?: string;
}

function ConcentricRingsLoader({ size = 120, showText = true, rings = 4, text = 'Loading...' }: ConcentricRingsLoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const themeColor = useSettingsStore((state) => state.themeColor);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    canvas.width = size;
    canvas.height = size;
    const center = size / 2;
    const activeColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    const ringColor = activeColor ? `hsl(${activeColor})` : 'hsl(217 91% 45%)';
    let time = 0;

    const animate = () => {
      context.clearRect(0, 0, size, size);
      for (let ring = 0; ring < rings; ring += 1) {
        const baseRadius = size * 0.1 + ring * size * 0.15;
        const pulse = Math.sin(time * 0.03 - ring * 0.5) * size * 0.05;
        const radius = Math.min(baseRadius + pulse, size / 2 - 2);
        const opacity = 0.2 + Math.sin(time * 0.03 - ring * 0.5) * 0.3;

        context.beginPath();
        context.arc(center, center, radius, 0, Math.PI * 2);
        context.strokeStyle = ringColor;
        context.globalAlpha = opacity;
        context.lineWidth = 2;
        context.stroke();
        context.globalAlpha = 1;

        for (let dot = 0; dot < 8; dot += 1) {
          const angle = (dot / 8) * Math.PI * 2 + time * 0.02 * (ring % 2 ? 1 : -1);
          context.beginPath();
          context.arc(center + Math.cos(angle) * radius, center + Math.sin(angle) * radius, 2, 0, Math.PI * 2);
          context.fillStyle = ringColor;
          context.fill();
        }
      }

      const centerPulse = Math.sin(time * 0.05) * 0.3 + 0.7;
      context.beginPath();
      context.arc(center, center, 5 * centerPulse, 0, Math.PI * 2);
      context.fillStyle = ringColor;
      context.fill();
      time += 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      if (animationRef.current !== undefined) cancelAnimationFrame(animationRef.current);
    };
  }, [size, rings, themeColor]);

  return (
    <div className="flex flex-col items-center gap-1.5" role="status" aria-live="polite">
      <canvas ref={canvasRef} width={size} height={size} aria-hidden="true" />
      {showText && text && <span className="text-sm font-medium text-foreground/70 dark:text-white/70">{text}</span>}
    </div>
  );
}

export { ConcentricRingsLoader };
export default ConcentricRingsLoader;
