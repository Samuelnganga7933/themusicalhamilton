import { AnimatePresence, motion, Reorder } from "motion/react";
import {
  ChevronDown,
  GripVertical,
  Heart,
  ListMusic,
  Pause,
  Play,
  Repeat,
  Share2,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";
import { useVibra } from "./store";
import { formatTime } from "./data";
import { Art, IconButton } from "./primitives";
import { DUR, EASE, SHARED_SPRING } from "./motion";
import { EqualiserBars } from "./track-row";

// ─── Mini player ─────────────────────────────────────────────────────────────

/**
 * Persistent above the tab bar. Slides up when playback starts, dismisses
 * smoothly when it ends, and hands its artwork to Now Playing via a shared
 * element so the artwork never re-renders mid-transition.
 */
export function MiniPlayer() {
  const { track, playing, toggle, next, progress, m, setNowPlayingOpen, nowPlayingOpen, accent, hasStarted } =
    useVibra();

  const pct = (progress / track.duration) * 100;

  return (
    <AnimatePresence>
      {hasStarted && !nowPlayingOpen && (
        <motion.div
          className="absolute inset-x-3 z-30"
          style={{ bottom: 84 }}
          initial={{ y: m.reduced ? 0 : 74, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ opacity: 0, y: m.reduced || nowPlayingOpen ? 0 : 74 }}
          transition={
            // When Now Playing takes over, the mini player gets out of the way
            // instantly so the artwork has a single owner to animate from.
            nowPlayingOpen
              ? { duration: 0.001 }
              : m.reduced
                ? { duration: 0.18 }
                : { duration: DUR.nav, ease: EASE }
          }
        >
          <div
            className="v-raised relative overflow-hidden"
            style={{ borderRadius: 20, backdropFilter: "blur(24px)" }}
          >
            <button
              type="button"
              onClick={() => setNowPlayingOpen(true)}
              aria-label={`Open now playing: ${track.title}`}
              className="flex w-full items-center gap-3 p-2.5 text-left"
            >
              <motion.div layoutId="player-art" transition={SHARED_SPRING} style={{ borderRadius: 13 }}>
                <Art src={track.art} alt={`${track.album} artwork`} className="h-[46px] w-[46px]" radius={13} />
              </motion.div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {playing && <EqualiserBars />}
                  <p className="truncate text-[14px]" style={{ color: "var(--v-text)" }}>
                    {track.title}
                  </p>
                </div>
                <p className="mt-0.5 truncate text-[12px]" style={{ color: "var(--v-text-3)" }}>
                  {track.artist}
                </p>
              </div>
            </button>

            <div className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
              <IconButton
                label={playing ? "Pause" : "Play"}
                tone="bare"
                size={36}
                onClick={toggle}
              >
                {playing ? (
                  <Pause size={17} fill="var(--v-text)" color="var(--v-text)" />
                ) : (
                  <Play size={17} fill="var(--v-text)" color="var(--v-text)" />
                )}
              </IconButton>
              <IconButton label="Next track" tone="bare" size={36} onClick={next}>
                <SkipForward size={16} color="var(--v-text-2)" />
              </IconButton>
            </div>

            <div className="absolute bottom-0 left-0 h-[2px] w-full" style={{ background: "var(--v-border)" }}>
              <div className="h-full" style={{ width: `${pct}%`, background: accent, transition: "width 1s linear" }} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Now Playing ─────────────────────────────────────────────────────────────

export function NowPlaying() {
  const {
    track,
    playing,
    toggle,
    next,
    prev,
    progress,
    seek,
    liked,
    toggleLike,
    m,
    accent,
    nowPlayingOpen,
    setNowPlayingOpen,
    setQueueOpen,
    resolvedTheme,
  } = useVibra();

  const pct = (progress / track.duration) * 100;
  const isLiked = Boolean(liked[track.id]);

  return (
    <AnimatePresence>
      {nowPlayingOpen && (
        <motion.div
          className="absolute inset-0 z-40 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: m.reduced ? 0.2 : DUR.screen, ease: EASE }}
        >
          {/* Adaptive ground: the tone layer interpolates between album colours
              (a plain background-color animates; a gradient string would snap),
              and a fixed mask fades it into the app background. */}
          <div className="absolute inset-0" style={{ background: "var(--v-bg)" }} />
          <motion.div
            className="absolute inset-0"
            initial={{ backgroundColor: track.tone, opacity: 0 }}
            animate={{
              backgroundColor: track.tone,
              opacity: resolvedTheme === "light" ? 0.2 : 0.35,
            }}
            transition={m.bg}
            style={{
              maskImage: "linear-gradient(180deg, #000 0%, transparent 68%)",
              WebkitMaskImage: "linear-gradient(180deg, #000 0%, transparent 68%)",
            }}
          />
          <motion.div
            key={track.id}
            className="absolute inset-x-0 top-0 h-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: resolvedTheme === "light" ? 0.22 : 0.4 }}
            transition={m.bg}
            style={{
              backgroundImage: `url(${track.art})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(72px) saturate(1.3)",
            }}
          />

          <div className="absolute inset-0">
            <div className="relative flex h-full flex-col px-6 pb-9 pt-12">
              <div className="flex items-center justify-between">
                <IconButton label="Close now playing" tone="bare" onClick={() => setNowPlayingOpen(false)}>
                  <ChevronDown size={22} color="var(--v-text)" />
                </IconButton>
                <div className="text-center">
                  <p
                    className="text-[10px] uppercase"
                    style={{ color: "var(--v-text-3)", letterSpacing: "0.16em" }}
                  >
                    Playing from
                  </p>
                  <p className="mt-0.5 text-[12px]" style={{ color: "var(--v-text-2)" }}>
                    {track.album}
                  </p>
                </div>
                <IconButton label="Share track" tone="bare" onClick={() => {}}>
                  <Share2 size={17} color="var(--v-text-2)" />
                </IconButton>
              </div>

              {/* Artwork enlarges continuously out of the mini player. */}
              <div className="mt-8 flex justify-center">
                <motion.div layoutId="player-art" transition={SHARED_SPRING} style={{ borderRadius: 26, width: "100%" }}>
                  <Art
                    src={track.art}
                    alt={`${track.album} artwork`}
                    className="aspect-square w-full"
                    radius={26}
                    style={{ boxShadow: `0 30px 70px ${track.tone}40, 0 10px 30px rgba(0,0,0,0.4)` }}
                  />
                </motion.div>
              </div>

              <motion.div
                className="mt-auto"
                initial={{ opacity: 0, y: m.reduced ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: m.reduced ? 0 : 0.18, ease: EASE }}
              >
                <div className="flex items-start justify-between gap-4 pt-8">
                  <div className="min-w-0">
                    <h1
                      className="truncate text-[27px]"
                      style={{ color: "var(--v-text)", lineHeight: 1.15, fontWeight: 600 }}
                    >
                      {track.title}
                    </h1>
                    <p className="mt-1 truncate text-[15px]" style={{ color: "var(--v-text-2)" }}>
                      {track.artist}
                    </p>
                  </div>
                  <IconButton
                    label={isLiked ? "Remove from Liked Songs" : "Add to Liked Songs"}
                    tone="bare"
                    onClick={() => toggleLike()}
                  >
                    <Heart
                      size={21}
                      color={isLiked ? accent : "var(--v-text-2)"}
                      fill={isLiked ? accent : "transparent"}
                    />
                  </IconButton>
                </div>

                {/* Scrubber */}
                <div className="mt-7">
                  <div className="relative h-5">
                    <div
                      className="absolute left-0 right-0 top-1/2 -translate-y-1/2 rounded-full"
                      style={{ height: 4, background: "var(--v-border-strong)" }}
                    />
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full"
                      style={{ height: 4, width: `${pct}%`, background: accent, transition: "width 1s linear" }}
                    />
                    <input
                      type="range"
                      aria-label="Seek"
                      min={0}
                      max={track.duration}
                      value={progress}
                      onChange={(e) => seek(Number(e.target.value))}
                      className="absolute inset-0 w-full cursor-pointer opacity-0"
                    />
                    <div
                      className="pointer-events-none absolute top-1/2 -translate-y-1/2 rounded-full"
                      style={{
                        left: `calc(${pct}% - 6px)`,
                        width: 12,
                        height: 12,
                        background: "var(--v-text)",
                        transition: "left 1s linear",
                      }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-[11px] tabular-nums" style={{ color: "var(--v-text-3)" }}>
                    <span>{formatTime(progress)}</span>
                    <span>-{formatTime(track.duration - progress)}</span>
                  </div>
                </div>

                {/* Transport */}
                <div className="mt-6 flex items-center justify-between">
                  <IconButton label="Shuffle" tone="bare" size={40}>
                    <Shuffle size={17} color="var(--v-text-2)" />
                  </IconButton>
                  <IconButton label="Previous track" tone="bare" size={48} onClick={prev}>
                    <SkipBack size={25} fill="var(--v-text)" color="var(--v-text)" />
                  </IconButton>
                  <IconButton label={playing ? "Pause" : "Play"} tone="accent" size={70} onClick={toggle}>
                    {playing ? (
                      <Pause size={26} fill="#0B1B0F" color="#0B1B0F" />
                    ) : (
                      <Play size={26} fill="#0B1B0F" color="#0B1B0F" style={{ marginLeft: 3 }} />
                    )}
                  </IconButton>
                  <IconButton label="Next track" tone="bare" size={48} onClick={next}>
                    <SkipForward size={25} fill="var(--v-text)" color="var(--v-text)" />
                  </IconButton>
                  <IconButton label="Repeat" tone="bare" size={40}>
                    <Repeat size={17} color="var(--v-text-2)" />
                  </IconButton>
                </div>

                <div className="mt-7 flex items-center justify-between">
                  <IconButton label="Volume" tone="bare" size={38}>
                    <Volume2 size={17} color="var(--v-text-3)" />
                  </IconButton>
                  <p className="text-[12px]" style={{ color: "var(--v-text-3)" }}>
                    {track.because}
                  </p>
                  <IconButton label="Open queue" tone="bare" size={38} onClick={() => setQueueOpen(true)}>
                    <ListMusic size={18} color="var(--v-text-2)" />
                  </IconButton>
                </div>
              </motion.div>
            </div>
          </div>

          <QueueSheet />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Queue ───────────────────────────────────────────────────────────────────

/** Bottom sheet on mobile. Rows animate into position; dragging has weight. */
export function QueueSheet() {
  const { queue, setQueue, queueOpen, setQueueOpen, m, track, playing, play } = useVibra();

  return (
    <AnimatePresence>
      {queueOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close queue"
            className="absolute inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.45)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
            onClick={() => setQueueOpen(false)}
          />
          <motion.div
            className="v-raised absolute inset-x-0 bottom-0 z-50 flex flex-col"
            style={{ borderRadius: "26px 26px 0 0", maxHeight: "78%", background: "var(--v-elevated)" }}
            initial={{ y: m.reduced ? 0 : "100%", opacity: m.reduced ? 0 : 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: m.reduced ? 0 : "100%", opacity: m.reduced ? 0 : 1 }}
            transition={m.reduced ? { duration: 0.2 } : { type: "spring", stiffness: 280, damping: 32 }}
            drag={m.reduced ? false : "y"}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110) setQueueOpen(false);
            }}
          >
            <div className="flex justify-center pt-3">
              <span className="block rounded-full" style={{ width: 38, height: 4, background: "var(--v-border-strong)" }} />
            </div>

            <div className="px-6 pb-3 pt-4">
              <h2 className="text-[22px]" style={{ color: "var(--v-text)", fontWeight: 600 }}>
                Queue
              </h2>
              <p className="mt-1 text-[12px]" style={{ color: "var(--v-text-3)" }}>
                Drag to reorder · {queue.length} up next
              </p>
            </div>

            <div className="px-6 pb-2">
              <p className="text-[11px] uppercase" style={{ color: "var(--v-text-3)", letterSpacing: "0.14em" }}>
                Now playing
              </p>
              <div className="mt-2.5 flex items-center gap-3">
                <Art src={track.art} alt={`${track.album} artwork`} className="h-[44px] w-[44px]" radius={11} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px]" style={{ color: "var(--v-text)" }}>
                    {track.title}
                  </p>
                  <p className="truncate text-[12px]" style={{ color: "var(--v-text-3)" }}>
                    {track.artist}
                  </p>
                </div>
                {playing && <EqualiserBars />}
              </div>
            </div>

            <div className="v-scroll flex-1 overflow-y-auto px-6 pb-9 pt-4">
              <p className="text-[11px] uppercase" style={{ color: "var(--v-text-3)", letterSpacing: "0.14em" }}>
                Next up
              </p>
              <Reorder.Group axis="y" values={queue} onReorder={setQueue} className="mt-2.5 space-y-1">
                {queue.map((t) => (
                  <Reorder.Item
                    key={t.id}
                    value={t}
                    className="flex items-center gap-3 py-2"
                    whileDrag={{ scale: 1.02, cursor: "grabbing" }}
                    transition={{ duration: 0.22, ease: EASE }}
                  >
                    <button
                      type="button"
                      onClick={() => play(t.id)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      aria-label={`Play ${t.title}`}
                    >
                      <Art src={t.art} alt={`${t.album} artwork`} className="h-[40px] w-[40px]" radius={10} />
                      <span className="min-w-0">
                        <span className="block truncate text-[14px]" style={{ color: "var(--v-text)" }}>
                          {t.title}
                        </span>
                        <span className="mt-0.5 block truncate text-[12px]" style={{ color: "var(--v-text-3)" }}>
                          {t.artist}
                        </span>
                      </span>
                    </button>
                    <span className="cursor-grab px-1" aria-hidden>
                      <GripVertical size={16} color="var(--v-text-3)" />
                    </span>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
