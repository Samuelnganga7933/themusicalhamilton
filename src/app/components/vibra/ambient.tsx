import { motion } from "motion/react";
import { useVibra, type VideoScene } from "./store";
import { EASE } from "./motion";

/**
 * Ambient background layer.
 *
 * Cinematic scenes are rendered as extremely slow compositing layers rather
 * than shipped video files — same visual result, no download, and the motion
 * budget stays under our control. Everything here is peripheral: it pauses in
 * battery saver, stops under Reduce Motion, and dims behind content.
 */

interface Layer {
  css: string;
  /** Seconds for one full loop. Deliberately long. */
  period: number;
  drift: [number, number];
  scale?: [number, number];
  opacity: number;
}

const SCENES: Record<VideoScene, Layer[]> = {
  rain: [
    {
      css: "radial-gradient(120% 80% at 20% 0%, #1E2A33 0%, transparent 60%)",
      period: 78,
      drift: [0, 4],
      opacity: 0.9,
    },
    {
      css: "repeating-linear-gradient(102deg, rgba(190,210,225,0.10) 0 1px, transparent 1px 9px)",
      period: 9,
      drift: [-6, 26],
      opacity: 0.5,
    },
  ],
  ocean: [
    {
      css: "radial-gradient(140% 90% at 50% 100%, #123040 0%, transparent 62%)",
      period: 92,
      drift: [0, -5],
      scale: [1, 1.08],
      opacity: 0.95,
    },
    {
      css: "repeating-linear-gradient(178deg, rgba(120,180,200,0.07) 0 2px, transparent 2px 22px)",
      period: 46,
      drift: [0, 8],
      opacity: 0.6,
    },
  ],
  forest: [
    {
      css: "radial-gradient(110% 80% at 70% 10%, #1B2B1E 0%, transparent 58%)",
      period: 86,
      drift: [4, 3],
      opacity: 0.92,
    },
    {
      css: "radial-gradient(60% 50% at 20% 80%, rgba(120,170,110,0.14) 0%, transparent 70%)",
      period: 64,
      drift: [-5, -4],
      opacity: 0.7,
    },
  ],
  clouds: [
    {
      css: "radial-gradient(120% 70% at 30% 20%, #2A2E33 0%, transparent 64%)",
      period: 110,
      drift: [8, 2],
      scale: [1, 1.1],
      opacity: 0.9,
    },
    {
      css: "radial-gradient(90% 60% at 80% 70%, rgba(220,225,230,0.10) 0%, transparent 70%)",
      period: 96,
      drift: [-7, 3],
      opacity: 0.65,
    },
  ],
  aurora: [
    {
      css: "radial-gradient(100% 60% at 25% 15%, rgba(52,199,89,0.20) 0%, transparent 62%)",
      period: 74,
      drift: [6, 5],
      scale: [1, 1.12],
      opacity: 0.85,
    },
    {
      css: "radial-gradient(80% 55% at 75% 30%, rgba(90,160,190,0.16) 0%, transparent 68%)",
      period: 88,
      drift: [-6, -4],
      opacity: 0.7,
    },
  ],
  space: [
    {
      css: "radial-gradient(90% 60% at 60% 12%, #191A22 0%, transparent 60%)",
      period: 140,
      drift: [2, 2],
      opacity: 0.95,
    },
    {
      css: "radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.5) 50%, transparent 51%), radial-gradient(1px 1px at 70% 18%, rgba(255,255,255,0.4) 50%, transparent 51%), radial-gradient(1px 1px at 44% 62%, rgba(255,255,255,0.35) 50%, transparent 51%), radial-gradient(1px 1px at 84% 74%, rgba(255,255,255,0.3) 50%, transparent 51%)",
      period: 160,
      drift: [3, -3],
      opacity: 0.9,
    },
  ],
  city: [
    {
      css: "radial-gradient(120% 60% at 50% 100%, #2B2118 0%, transparent 58%)",
      period: 82,
      drift: [0, -3],
      opacity: 0.9,
    },
    {
      css: "radial-gradient(50% 30% at 18% 88%, rgba(217,130,43,0.18) 0%, transparent 70%), radial-gradient(45% 28% at 82% 92%, rgba(200,90,60,0.14) 0%, transparent 70%)",
      period: 58,
      drift: [5, 0],
      opacity: 0.75,
    },
  ],
};

export function AmbientBackground({ dim = false }: { dim?: boolean }) {
  const { settings, resolvedTheme, accent, track, bgActive, m } = useVibra();
  const { background, scene, motion: intensity } = settings;

  if (background === "none") {
    return <div className="absolute inset-0" style={{ background: "var(--v-bg)" }} />;
  }

  // Reading dim: the layer steps back so text always wins on contrast.
  const wash = dim ? 0.4 : 1;
  const strength = Math.max(0.15, intensity) * wash;

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: "var(--v-bg)" }}>
      {background === "gradient" && (
        <>
          <motion.div
            className="absolute -inset-1/4"
            style={{
              background: `radial-gradient(45% 35% at 30% 20%, ${accent}1F 0%, transparent 70%)`,
              opacity: 0.9 * wash,
            }}
            animate={bgActive ? { x: [0, 26, 0], y: [0, -18, 0] } : {}}
            transition={{ duration: 64 / Math.max(intensity, 0.2), repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -inset-1/4"
            style={{
              background:
                "radial-gradient(40% 32% at 78% 72%, rgba(201,169,97,0.13) 0%, transparent 72%)",
              opacity: 0.9 * wash,
            }}
            animate={bgActive ? { x: [0, -22, 0], y: [0, 20, 0] } : {}}
            transition={{ duration: 86 / Math.max(intensity, 0.2), repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      {background === "album" && (
        <motion.div
          key={track.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: (resolvedTheme === "light" ? 0.3 : 0.55) * wash }}
          transition={m.bg}
          style={{
            backgroundImage: `url(${track.art})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(64px) saturate(1.25)",
            transform: "scale(1.35)",
          }}
        />
      )}

      {background === "static" && (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(168deg, var(--v-bg-deep) 0%, var(--v-bg) 52%, ${accent}0D 100%)`,
            opacity: wash,
          }}
        />
      )}

      {background === "video" &&
        SCENES[scene].map((layer, i) => (
          <motion.div
            key={`${scene}-${i}`}
            className="absolute -inset-8"
            style={{ background: layer.css, opacity: layer.opacity * strength }}
            initial={{ opacity: 0 }}
            animate={
              bgActive
                ? {
                    opacity: layer.opacity * strength,
                    x: [0, layer.drift[0] * 6, 0],
                    y: [0, layer.drift[1] * 6, 0],
                    scale: layer.scale ?? 1,
                  }
                : { opacity: layer.opacity * strength * 0.8 }
            }
            transition={
              bgActive
                ? {
                    opacity: { duration: 0.9, ease: EASE },
                    x: { duration: layer.period, repeat: Infinity, ease: "easeInOut" },
                    y: { duration: layer.period, repeat: Infinity, ease: "easeInOut" },
                    scale: { duration: layer.period * 1.4, repeat: Infinity, ease: "easeInOut" },
                  }
                : { duration: 0.9, ease: EASE }
            }
          />
        ))}

      {/* Content legibility scrim — cards always sit on a calm ground. */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, transparent 0%, var(--v-bg) 130%)`,
          opacity: 0.55 + (1 - settings.transparency) * 0.35,
        }}
      />
    </div>
  );
}

/** Miniature live preview used by the background picker. */
export function ScenePreview({ scene }: { scene: VideoScene }) {
  const { bgActive } = useVibra();
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: "#0E1115" }}>
      {SCENES[scene].map((layer, i) => (
        <motion.div
          key={i}
          className="absolute -inset-4"
          style={{ background: layer.css, opacity: layer.opacity }}
          animate={bgActive ? { x: [0, layer.drift[0] * 3, 0], y: [0, layer.drift[1] * 3, 0] } : {}}
          transition={{ duration: layer.period / 4, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
