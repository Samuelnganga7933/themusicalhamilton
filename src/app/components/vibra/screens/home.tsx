import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Play, Sparkles } from "lucide-react";
import { useVibra } from "../store";
import { MOMENTS, TRACKS, trackById } from "../data";
import { Art, Card, Pill, Skeleton } from "../primitives";
import { TrackRow } from "../track-row";
import { DUR, EASE, EASE_OUT } from "../motion";

const GREETING = () => {
  const h = new Date().getHours();
  if (h < 5) return "Still awake.";
  if (h < 12) return "Good morning.";
  if (h < 17) return "Good afternoon.";
  if (h < 21) return "Good evening.";
  return "Late night.";
};

const SUBTITLE = () => {
  const h = new Date().getHours();
  if (h < 5) return "The city is quiet. What fits?";
  if (h < 12) return "Let's find your soundtrack.";
  if (h < 17) return "Where should we go today?";
  if (h < 21) return "What feels right now?";
  return "The good stuff comes out at night.";
};

/* ── Destination tile definitions ─────────────────────────────────────── */

interface Destination {
  id: string;
  label: string;
  sub: string;
  glyph: string;
  momentId: string;
  // Very muted tint — dark themes keep it barely perceptible
  hue: string;
}

const DESTINATIONS: Destination[] = [
  {
    id: "focus",
    label: "Focus",
    sub: "Instrumental · steady tempo",
    glyph: "◎",
    momentId: "focus",
    hue: "rgba(60,110,155,0.12)",
  },
  {
    id: "wind",
    label: "Wind Down",
    sub: "Quieter than your average evening",
    glyph: "☾",
    momentId: "wind",
    hue: "rgba(107,90,62,0.10)",
  },
  {
    id: "surprise",
    label: "Surprise Me",
    sub: "One step outside your taste",
    glyph: "↗",
    momentId: "surprise",
    hue: "rgba(47,125,78,0.10)",
  },
  {
    id: "world",
    label: "Take Me Somewhere",
    sub: "Highlife · Ethio-jazz · Nordic folk",
    glyph: "⌖",
    momentId: "world",
    hue: "rgba(180,98,44,0.10)",
  },
  {
    id: "mood",
    label: "Match My Mood",
    sub: "Reads your last few hours",
    glyph: "♡",
    momentId: "mood",
    hue: "rgba(138,140,134,0.10)",
  },
];

/* ── Decorative SVG motifs — one per destination ──────────────────────── */

function DestGlyph({ id, accent }: { id: string; accent: string }) {
  const s = { fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (id === "focus")
    return (
      <svg width="52" height="52" viewBox="0 0 52 52" {...s}>
        <circle cx="26" cy="26" r="18" stroke={accent} strokeWidth="1" opacity="0.25" />
        <circle cx="26" cy="26" r="10" stroke={accent} strokeWidth="1" opacity="0.45" />
        <circle cx="26" cy="26" r="3" fill={accent} opacity="0.7" />
      </svg>
    );
  if (id === "wind")
    return (
      <svg width="52" height="52" viewBox="0 0 52 52" {...s}>
        <path d="M14 26 Q26 10 38 26" stroke={accent} strokeWidth="1" opacity="0.3" />
        <path d="M14 26 Q26 42 38 26" stroke={accent} strokeWidth="1" opacity="0.2" />
        <circle cx="26" cy="26" r="2.5" fill={accent} opacity="0.5" />
      </svg>
    );
  if (id === "surprise")
    return (
      <svg width="52" height="52" viewBox="0 0 52 52" {...s}>
        <line x1="14" y1="38" x2="36" y2="16" stroke={accent} strokeWidth="1" opacity="0.35" />
        <polyline points="28,14 38,14 38,24" stroke={accent} strokeWidth="1.2" opacity="0.6" />
        <circle cx="14" cy="38" r="2.5" fill={accent} opacity="0.4" />
      </svg>
    );
  if (id === "world")
    return (
      <svg width="52" height="52" viewBox="0 0 52 52" {...s}>
        <circle cx="26" cy="26" r="16" stroke={accent} strokeWidth="1" opacity="0.25" />
        <line x1="26" y1="10" x2="26" y2="42" stroke={accent} strokeWidth="1" opacity="0.2" />
        <line x1="10" y1="26" x2="42" y2="26" stroke={accent} strokeWidth="1" opacity="0.2" />
        <ellipse cx="26" cy="26" rx="8" ry="16" stroke={accent} strokeWidth="1" opacity="0.2" />
      </svg>
    );
  // mood
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" {...s}>
      <path
        d="M26 36 C18 28 12 22 18 16 C22 12 26 16 26 16 C26 16 30 12 34 16 C40 22 34 28 26 36Z"
        stroke={accent}
        strokeWidth="1"
        opacity="0.35"
      />
    </svg>
  );
}

/* ── Large destination tile ───────────────────────────────────────────── */

function DestinationTile({
  dest,
  index,
  isOpen,
  onTap,
}: {
  dest: Destination;
  index: number;
  isOpen: boolean;
  onTap: () => void;
}) {
  const { m, accent, settings } = useVibra();

  return (
    <motion.div
      {...m.stagger(index, 0.07, 0.18)}
      layout="position"
    >
      <motion.button
        type="button"
        onClick={onTap}
        aria-expanded={isOpen}
        className="relative w-full overflow-hidden text-left"
        style={{
          borderRadius: settings.radius,
          background: isOpen
            ? `color-mix(in srgb, ${dest.hue.replace("0.1", "0.18").replace("0.12", "0.22")} 100%, var(--v-card))`
            : "var(--v-card)",
          border: `1px solid ${isOpen ? `${accent}28` : "var(--v-border)"}`,
          boxShadow: isOpen
            ? `0 12px 32px var(--v-shade), -1px -1px 1px var(--v-light), 0 0 0 1px ${accent}14`
            : "4px 6px 16px var(--v-shade), -1px -1px 1px var(--v-light)",
        }}
        whileHover={m.reduced ? undefined : { y: -2, scale: 1.005 }}
        whileTap={m.reduced ? undefined : { scale: 0.985, y: 0 }}
        transition={{ duration: DUR.card, ease: EASE }}
      >
        {/* Subtle background hue wash */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: dest.hue, opacity: isOpen ? 1.5 : 1 }}
        />

        <div className="relative flex items-center justify-between gap-4 px-5 py-5">
          {/* Text */}
          <div className="min-w-0 flex-1">
            <p
              className="text-[20px]"
              style={{
                color: "var(--v-text)",
                fontWeight: 600,
                letterSpacing: "-0.022em",
                lineHeight: 1.15,
                fontFamily: "'Inter Tight', -apple-system, BlinkMacSystemFont, sans-serif",
              }}
            >
              {dest.label}
            </p>
            <p
              className="mt-1 text-[12px]"
              style={{ color: "var(--v-text-3)", letterSpacing: "0.01em" }}
            >
              {dest.sub}
            </p>
          </div>

          {/* Decorative motif */}
          <div className="shrink-0 opacity-90">
            <DestGlyph id={dest.id} accent={isOpen ? accent : "var(--v-text-3)"} />
          </div>
        </div>

        {/* Open indicator line */}
        {isOpen && (
          <motion.div
            className="absolute bottom-0 left-5 right-5 h-px"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            style={{ background: `${accent}33`, transformOrigin: "left" }}
            transition={{ duration: 0.3, ease: EASE }}
          />
        )}
      </motion.button>
    </motion.div>
  );
}

/* ── Main screen ──────────────────────────────────────────────────────── */

export function HomeScreen() {
  const { m, go, play, accent, settings, user } = useVibra();
  const [openDest, setOpenDest] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pick = trackById("t6");

  const tapDest = (id: string) => {
    if (openDest === id) {
      setOpenDest(null);
      return;
    }
    setOpenDest(id);
    setLoading(true);
    window.setTimeout(() => setLoading(false), m.reduced ? 200 : 680);
  };

  const openMoment = MOMENTS.find((x) => x.id === openDest);

  return (
    <div className="pb-10">
      {/* ── Greeting ──────────────────────────────────────────────── */}
      <motion.div className="px-6 pt-4" {...m.riseIn(0)}>
        <p
          className="text-[11px] uppercase"
          style={{ color: "var(--v-text-3)", letterSpacing: "0.16em" }}
        >
          Thursday · August 2026
        </p>

          <h1
          className="mt-2"
          style={{
            fontSize: 36,
            color: "var(--v-text)",
            lineHeight: 1.06,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            fontFamily: "'Inter Tight', -apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
            {user?.displayName
              ? `${GREETING().replace(/\.$/, "")}, ${user.displayName.split(" ")[0]}.`
              : GREETING()}
          <br />
          <span
            style={{
              color: "var(--v-text-2)",
              fontWeight: 400,
              fontSize: 28,
              letterSpacing: "-0.022em",
            }}
          >
            {SUBTITLE()}
          </span>
        </h1>
      </motion.div>

      {/* ── Five destinations ──────────────────────────────────────── */}
      <motion.div
        {...m.riseIn(0.1)}
        className="mt-9 px-5"
      >
        <p
          className="mb-4 text-[11px] uppercase"
          style={{ color: "var(--v-text-3)", letterSpacing: "0.16em" }}
        >
          Where to?
        </p>
        <div className="space-y-2.5">
          {DESTINATIONS.map((dest, i) => (
            <DestinationTile
              key={dest.id}
              dest={dest}
              index={i}
              isOpen={openDest === dest.id}
              onTap={() => tapDest(dest.id)}
            />
          ))}
        </div>
      </motion.div>

      {/* ── Recommendation panel — slides in below the open tile ───── */}
      <AnimatePresence mode="wait">
        {openMoment && (
          <motion.div
            key={openMoment.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: m.reduced ? 0.18 : 0.36, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="px-5 pt-4">
              <Pill tone="accent">
                <Sparkles size={11} /> {openMoment.caption}
              </Pill>
            </div>
            <div className="mt-2">
              {loading
                ? [0, 1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-3.5 px-5 py-2.5">
                      <Skeleton style={{ width: 54, height: 54 }} radius={12} />
                      <div className="flex-1 space-y-2">
                        <Skeleton style={{ height: 11, width: "52%" }} radius={999} />
                        <Skeleton style={{ height: 9, width: "34%" }} radius={999} />
                      </div>
                    </div>
                  ))
                : openMoment.seed.map((id, i) => (
                    <TrackRow key={id} track={trackById(id)} index={i} showReason />
                  ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Divider ────────────────────────────────────────────────── */}
      <motion.div
        {...m.riseIn(0.55)}
        className="mx-5 mt-10"
        style={{ height: 1, background: "var(--v-border)" }}
      />

      {/* ── Today's Pick ───────────────────────────────────────────── */}
      <motion.section {...m.riseIn(0.6)} className="px-5 pt-8">
        <div className="mb-1 flex items-baseline justify-between">
          <p
            className="text-[11px] uppercase"
            style={{ color: "var(--v-text-3)", letterSpacing: "0.16em" }}
          >
            Today's Pick
          </p>
          <Pill tone="gold">Hidden gem</Pill>
        </div>
        <h2
          className="mb-5"
          style={{
            fontSize: 26,
            fontWeight: 600,
            color: "var(--v-text)",
            lineHeight: 1.12,
            letterSpacing: "-0.022em",
            fontFamily: "'Inter Tight', -apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          {pick.title}
        </h2>

        <Card className="overflow-hidden p-3">
          <motion.div {...m.settle(0.64)}>
            <Art
              src={pick.art}
              alt={`${pick.album} artwork`}
              className="aspect-[16/9] w-full"
              radius={settings.radius - 4}
            />
          </motion.div>

          <div className="px-1.5 pb-2 pt-4">
            <p className="text-[13px]" style={{ color: "var(--v-text-2)" }}>
              {pick.artist} · {pick.year}
            </p>
            <motion.p
              className="mt-3 text-[14px]"
              style={{ color: "var(--v-text)", lineHeight: 1.65 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.55, delay: m.reduced ? 0 : 0.82, ease: EASE_OUT }}
            >
              {pick.because} Chosen from {TRACKS.length * 1140} releases this month.
            </motion.p>

            <motion.button
              type="button"
              onClick={() => play(pick.id)}
              className="mt-5 flex w-full items-center justify-center gap-2.5 text-[15px]"
              style={{
                height: 52,
                borderRadius: 999,
                background: accent,
                color: "#0B1B0F",
                fontWeight: 600,
                letterSpacing: "-0.01em",
                boxShadow: `0 10px 28px ${accent}35`,
              }}
              whileHover={m.reduced ? undefined : { scale: 1.015 }}
              whileTap={m.reduced ? undefined : { scale: 0.982 }}
              transition={{ duration: DUR.button, ease: EASE }}
            >
              <Play size={15} fill="#0B1B0F" />
              Play Bitter Orange
            </motion.button>
          </div>
        </Card>
      </motion.section>
    </div>
  );
}
