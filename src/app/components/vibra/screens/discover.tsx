import { motion } from "motion/react";
import { Play } from "lucide-react";
import { useVibra } from "../store";
import { EDITORIAL, GENRES, TRACKS, trackById } from "../data";
import { Art, Card, Pill } from "../primitives";
import { DUR, EASE } from "../motion";
import { ImageWithFallback } from "../../figma/ImageWithFallback";

/* ── Section: Hero feature story ─────────────────────────────────────── */

function HeroFeature() {
  const { play, m, accent, settings } = useVibra();
  const lead = trackById("t6");

  return (
    <motion.div {...m.riseIn(0.04)} className="px-5">
      <motion.button
        type="button"
        onClick={() => play(lead.id)}
        aria-label={`Play ${lead.title} — ${lead.artist}`}
        className="relative w-full overflow-hidden text-left"
        style={{ borderRadius: settings.radius }}
        whileHover={m.reduced ? undefined : { scale: 1.005 }}
        whileTap={m.reduced ? undefined : { scale: 0.99 }}
        transition={{ duration: DUR.card, ease: EASE }}
      >
        {/* Large artwork */}
        <div className="relative aspect-[3/4] w-full overflow-hidden" style={{ borderRadius: settings.radius }}>
          <ImageWithFallback
            src={lead.art}
            alt={`${lead.album} artwork`}
            className="h-full w-full object-cover"
          />
          {/* Editorial gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(0,0,0,0.82) 100%)",
            }}
          />
          {/* Hairline border */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ boxShadow: "inset 0 0 0 1px var(--v-border)", borderRadius: "inherit" }}
          />

          {/* Text block — overlaid at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p
                  className="text-[10px] uppercase"
                  style={{ color: "rgba(255,255,255,0.55)", letterSpacing: "0.18em" }}
                >
                  Hidden Gem · Under 10K listeners
                </p>
                <h2
                  className="mt-1.5"
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: "#ffffff",
                    lineHeight: 1.12,
                    letterSpacing: "-0.025em",
                    fontFamily: "'Inter Tight', -apple-system, BlinkMacSystemFont, sans-serif",
                  }}
                >
                  {lead.title}
                </h2>
                <p
                  className="mt-1.5 text-[13px]"
                  style={{ color: "rgba(255,255,255,0.65)" }}
                >
                  {lead.artist}
                </p>
                <p
                  className="mt-3 text-[12px]"
                  style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}
                >
                  {EDITORIAL[lead.id]}
                </p>
              </div>

              {/* Play button */}
              <motion.div
                className="grid shrink-0 place-items-center rounded-full"
                style={{
                  width: 48,
                  height: 48,
                  background: accent,
                  boxShadow: `0 8px 24px ${accent}66`,
                  marginTop: 4,
                }}
                whileHover={m.reduced ? undefined : { scale: 1.07 }}
                transition={{ duration: 0.15, ease: EASE }}
                aria-hidden
              >
                <Play size={17} fill="#0B1B0F" color="#0B1B0F" />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
}

/* ── Section: Around the World — asymmetric pair ─────────────────────── */

function WorldSection() {
  const { play, m, settings } = useVibra();
  const tracks = ["t2", "t5", "t1", "t7"].map(trackById);
  const [tall, small1, small2, small3] = tracks;

  return (
    <motion.section {...m.riseIn(0.16)} className="px-5">
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <p
            className="text-[11px] uppercase"
            style={{ color: "var(--v-text-3)", letterSpacing: "0.16em" }}
          >
            Accra · Lisbon · Osaka
          </p>
          <h2
            className="mt-1"
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "var(--v-text)",
              lineHeight: 1.12,
              letterSpacing: "-0.022em",
              fontFamily: "'Inter Tight', -apple-system, BlinkMacSystemFont, sans-serif",
            }}
          >
            Around the World
          </h2>
        </div>
      </div>

      {/* Asymmetric: one tall left, stack of smalls right */}
      <div className="flex gap-3" style={{ height: 320 }}>
        {/* Tall left */}
        <Card
          className="relative flex-1 overflow-hidden p-0"
          onClick={() => play(tall.id)}
          label={`Play ${tall.title}`}
        >
          <div className="relative h-full overflow-hidden" style={{ borderRadius: settings.radius }}>
            <ImageWithFallback
              src={tall.art}
              alt={`${tall.album} artwork`}
              className="h-full w-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.72) 100%)",
              }}
            />
            <div className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 0 0 1px var(--v-border)", borderRadius: "inherit" }} />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="truncate text-[15px]" style={{ fontWeight: 600, color: "#fff", letterSpacing: "-0.015em" }}>
                {tall.album}
              </p>
              <p className="mt-0.5 truncate text-[12px]" style={{ color: "rgba(255,255,255,0.6)" }}>
                {tall.artist}
              </p>
            </div>
          </div>
        </Card>

        {/* Right: three small stacked */}
        <div className="flex w-[44%] flex-col gap-2.5">
          {[small1, small2, small3].map((t, i) => (
            <motion.div
              key={t.id}
              className="relative flex-1 overflow-hidden"
              {...m.stagger(i, 0.05, 0.18)}
              style={{ borderRadius: settings.radius - 4 }}
            >
              <Card
                className="relative h-full overflow-hidden p-0"
                onClick={() => play(t.id)}
                label={`Play ${t.title}`}
              >
                <div className="relative h-full overflow-hidden" style={{ borderRadius: settings.radius - 4 }}>
                  <ImageWithFallback
                    src={t.art}
                    alt={`${t.album} artwork`}
                    className="h-full w-full object-cover"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "linear-gradient(180deg, rgba(0,0,0,0) 20%, rgba(0,0,0,0.7) 100%)",
                    }}
                  />
                  <div className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 0 0 1px var(--v-border)", borderRadius: "inherit" }} />
                  <div className="absolute bottom-2.5 left-3 right-3">
                    <p className="truncate text-[12px]" style={{ fontWeight: 600, color: "#fff" }}>
                      {t.title}
                    </p>
                    <p className="truncate text-[11px]" style={{ color: "rgba(255,255,255,0.55)" }}>
                      {t.artist}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

/* ── Section: New This Week ───────────────────────────────────────────── */

function NewThisWeek() {
  const { play, m, settings, accent } = useVibra();
  const tracks = ["t8", "t1", "t5", "t2"].map(trackById);

  return (
    <motion.section {...m.riseIn(0.24)} className="px-5">
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <p
            className="text-[11px] uppercase"
            style={{ color: "var(--v-text-3)", letterSpacing: "0.16em" }}
          >
            Friday, 1 August 2026
          </p>
          <h2
            className="mt-1"
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "var(--v-text)",
              lineHeight: 1.12,
              letterSpacing: "-0.022em",
              fontFamily: "'Inter Tight', -apple-system, BlinkMacSystemFont, sans-serif",
            }}
          >
            New This Week
          </h2>
        </div>
        <button
          type="button"
          className="text-[12px]"
          style={{ color: "var(--v-text-3)" }}
        >
          See all
        </button>
      </div>

      {/* Staggered list — editorial rows */}
      <div className="space-y-0">
        {tracks.map((t, i) => (
          <motion.button
            key={t.id}
            type="button"
            onClick={() => play(t.id)}
            aria-label={`Play ${t.title} by ${t.artist}`}
            className="flex w-full items-center gap-4 py-3 text-left"
            style={{
              borderBottom: i < tracks.length - 1 ? "1px solid var(--v-border)" : "none",
            }}
            {...m.stagger(i, 0.06, 0.28)}
            whileTap={m.reduced ? undefined : { scale: 0.98 }}
            transition={{ duration: DUR.button, ease: EASE }}
          >
            <div
              className="relative shrink-0 overflow-hidden"
              style={{ width: 54, height: 54, borderRadius: 12, background: "var(--v-surface)" }}
            >
              <ImageWithFallback src={t.art} alt={`${t.album} artwork`} className="h-full w-full object-cover" />
              <div className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 0 0 1px var(--v-border)", borderRadius: 12 }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px]" style={{ fontWeight: 500, color: "var(--v-text)" }}>
                {t.title}
              </p>
              <p className="mt-0.5 truncate text-[12px]" style={{ color: "var(--v-text-3)" }}>
                {t.artist}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <p className="text-[11px]" style={{ color: "var(--v-text-3)" }}>
                {Math.floor(t.duration / 60)}:{String(t.duration % 60).padStart(2, "0")}
              </p>
              {i === 0 && (
                <span
                  className="rounded-full px-2 py-0.5 text-[10px]"
                  style={{
                    background: `${accent}1F`,
                    color: accent,
                    border: `1px solid ${accent}33`,
                    letterSpacing: "0.04em",
                  }}
                >
                  NEW
                </span>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </motion.section>
  );
}

/* ── Section: Genres — large typographic tiles ───────────────────────── */

function GenresSection() {
  const { play, m, settings } = useVibra();

  return (
    <motion.section {...m.riseIn(0.32)} className="px-5">
      <div className="mb-4">
        <p
          className="text-[11px] uppercase"
          style={{ color: "var(--v-text-3)", letterSpacing: "0.16em" }}
        >
          23 rooms
        </p>
        <h2
          className="mt-1"
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "var(--v-text)",
            lineHeight: 1.12,
            letterSpacing: "-0.022em",
            fontFamily: "'Inter Tight', -apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          Genres
        </h2>
      </div>

      {/* Masonry-ish two-column grid with varied heights */}
      <div className="grid grid-cols-2 gap-2.5">
        {GENRES.map((g, i) => {
          const tall = i === 0 || i === 3;
          return (
            <motion.button
              key={g.name}
              type="button"
              onClick={() => play("t2")}
              aria-label={`Browse ${g.name}`}
              className="relative overflow-hidden text-left"
              style={{
                height: tall ? 110 : 88,
                borderRadius: settings.radius - 4,
                background: "var(--v-card)",
                border: "1px solid var(--v-border)",
                boxShadow: "4px 6px 14px var(--v-shade), -1px -1px 1px var(--v-light)",
              }}
              {...m.stagger(i, 0.04, 0.34)}
              whileHover={m.reduced ? undefined : { scale: 1.02 }}
              whileTap={m.reduced ? undefined : { scale: 0.97 }}
              transition={{ duration: DUR.button, ease: EASE }}
            >
              {/* Color wash */}
              <div
                className="absolute inset-0"
                style={{ background: `${g.tone}18` }}
              />
              {/* Decorative circle */}
              <div
                className="absolute -right-5 -top-5"
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 999,
                  background: `${g.tone}22`,
                }}
                aria-hidden
              />
              <div className="relative p-4">
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "var(--v-text)",
                    letterSpacing: "-0.015em",
                    fontFamily: "'Inter Tight', -apple-system, BlinkMacSystemFont, sans-serif",
                  }}
                >
                  {g.name}
                </p>
                <p className="mt-1 text-[11px]" style={{ color: "var(--v-text-3)" }}>
                  {g.count} releases
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.section>
  );
}

/* ── Section: Editors' Picks — editorial list ────────────────────────── */

function EditorsSection() {
  const { play, m, settings } = useVibra();
  const tracks = ["t3", "t4", "t7"].map(trackById);

  return (
    <motion.section {...m.riseIn(0.38)} className="px-5">
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <p
            className="text-[11px] uppercase"
            style={{ color: "var(--v-text-3)", letterSpacing: "0.16em" }}
          >
            Chosen by the Vibra desk
          </p>
          <h2
            className="mt-1"
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "var(--v-text)",
              lineHeight: 1.12,
              letterSpacing: "-0.022em",
              fontFamily: "'Inter Tight', -apple-system, BlinkMacSystemFont, sans-serif",
            }}
          >
            Editors&apos; Picks
          </h2>
        </div>
        <Pill tone="gold">Vol. 34</Pill>
      </div>

      <div className="space-y-3">
        {tracks.map((t, i) => (
          <motion.div key={t.id} {...m.stagger(i, 0.07, 0.4)}>
            <Card
              className="flex gap-4 overflow-hidden p-3"
              onClick={() => play(t.id)}
              label={`Play ${t.title}`}
              soft
            >
              <div
                className="relative shrink-0 overflow-hidden"
                style={{ width: 72, height: 72, borderRadius: settings.radius - 8 }}
              >
                <ImageWithFallback src={t.art} alt={`${t.album} artwork`} className="h-full w-full object-cover" />
                <div className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 0 0 1px var(--v-border)", borderRadius: "inherit" }} />
              </div>
              <div className="min-w-0 flex-1 py-1">
                <p
                  className="truncate"
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "var(--v-text)",
                    letterSpacing: "-0.015em",
                  }}
                >
                  {t.title}
                </p>
                <p className="mt-0.5 text-[12px]" style={{ color: "var(--v-text-2)" }}>
                  {t.artist} · {t.year}
                </p>
                <p
                  className="mt-2 text-[12px]"
                  style={{ color: "var(--v-text-3)", lineHeight: 1.55 }}
                >
                  {(EDITORIAL[t.id] ?? t.because).slice(0, 60)}…
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

/* ── Section: Editor's Picks ─────────────────────────────────────────── */

function EditorsPicksSection() {
  const { play, m, accent, settings } = useVibra();
  const tracks = ["t7", "t2", "t4", "t6"].map(trackById);

  return (
    <motion.section {...m.riseIn(0.44)} className="px-5">
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <p
            className="text-[11px] uppercase"
            style={{ color: accent, letterSpacing: "0.16em", opacity: 0.85 }}
          >
            Built from 214 listens
          </p>
          <h2
            className="mt-1"
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "var(--v-text)",
              lineHeight: 1.12,
              letterSpacing: "-0.022em",
              fontFamily: "'Inter Tight', -apple-system, BlinkMacSystemFont, sans-serif",
            }}
          >
            Editor's Picks
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {tracks.map((t, i) => (
          <motion.div key={t.id} {...m.stagger(i, 0.05, 0.46)}>
            <Card
              className="overflow-hidden p-2.5"
              onClick={() => play(t.id)}
              label={`Play ${t.title}`}
              soft
            >
              <div
                className="relative overflow-hidden"
                style={{ borderRadius: settings.radius - 6, background: "var(--v-surface)" }}
              >
                <ImageWithFallback
                  src={t.art}
                  alt={`${t.album} artwork`}
                  className="aspect-square w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 0 0 1px var(--v-border)", borderRadius: "inherit" }} />
              </div>
              <div className="px-0.5 pb-0.5 pt-3">
                <p className="truncate text-[13px]" style={{ fontWeight: 500, color: "var(--v-text)" }}>
                  {t.title}
                </p>
                <p className="mt-0.5 truncate text-[11px]" style={{ color: "var(--v-text-3)" }}>
                  {t.artist}
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

/* ── Main screen ──────────────────────────────────────────────────────── */

export function DiscoverScreen() {
  const { m } = useVibra();

  return (
    <div className="space-y-10 pb-10">
      {/* Header */}
      <motion.div className="px-5 pt-3" {...m.riseIn(0)}>
        <p
          className="text-[11px] uppercase"
          style={{ color: "var(--v-text-3)", letterSpacing: "0.16em" }}
        >
          Issue 34 · August 2026
        </p>
        <h1
          className="mt-2"
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: "var(--v-text)",
            lineHeight: 1.06,
            letterSpacing: "-0.03em",
            fontFamily: "'Inter Tight', -apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          Discover
        </h1>
        <p
          className="mt-2.5 text-[14px]"
          style={{ color: "var(--v-text-2)", lineHeight: 1.55, maxWidth: "18rem" }}
        >
          Six rooms, edited weekly. Read a little, then listen.
        </p>
      </motion.div>

      <HeroFeature />
      <WorldSection />
      <NewThisWeek />
      <GenresSection />
      <EditorsSection />
      <EditorsPicksSection />
    </div>
  );
}
