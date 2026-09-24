import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search as SearchIcon, X } from "lucide-react";
import { useVibra } from "../store";
import { RECENT_SEARCHES, SEARCH_EXAMPLES, TRACKS, trackById } from "../data";
import { Inset, Skeleton } from "../primitives";
import { TrackRow } from "../track-row";
import { DUR, EASE } from "../motion";

/** Music search with support for track, artist, album, and mood terms. */
export function SearchScreen() {
  const { m, accent, settings } = useVibra();
  const [query, setQuery] = useState("");
  const [committed, setCommitted] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const [focused, setFocused] = useState(false);

  const match = useMemo(() => {
    if (!committed) return null;
    const q = committed.toLowerCase();
    const example = SEARCH_EXAMPLES.find((e) => e.query.toLowerCase() === q);
    if (example) return example;

    const hits = TRACKS.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q),
    );
    return {
      query: committed,
      summary:
        hits.length > 0
          ? `Matched on title, artist and album · ${hits.length} result${hits.length > 1 ? "s" : ""}`
          : "No exact match · try an artist, track, album, or mood",
      trackIds: (hits.length ? hits : TRACKS.slice(0, 3)).map((t) => t.id),
    };
  }, [committed]);

  const run = (q: string) => {
    setQuery(q);
    setCommitted(q);
    setThinking(true);
  };

  useEffect(() => {
    if (!thinking) return;
    const t = window.setTimeout(() => setThinking(false), m.reduced ? 220 : 640);
    return () => window.clearTimeout(t);
  }, [thinking, committed, m.reduced]);

  return (
    <div className="pb-10">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <motion.div className="px-5 pt-3" {...m.riseIn(0)}>
        <p
          className="text-[11px] uppercase"
          style={{ color: "var(--v-text-3)", letterSpacing: "0.16em" }}
        >
            Music search
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
          Search
        </h1>
        <p
          className="mt-2 text-[14px]"
          style={{ color: "var(--v-text-2)", lineHeight: 1.55 }}
        >
          Search by track, artist, album, or mood.
        </p>
      </motion.div>

      {/* ── Search input ─────────────────────────────────────────────── */}
      <motion.div className="mt-6 px-5" {...m.riseIn(0.06)}>
        <motion.div
          animate={{ scale: focused && !m.reduced ? 1.01 : 1 }}
          transition={{ duration: 0.22, ease: EASE }}
        >
          <Inset
            className="flex items-center gap-3 px-5"
            style={{
              height: 60,
              borderRadius: 999,
              boxShadow: focused
                ? `inset 3px 4px 10px var(--v-shade), 0 0 0 1.5px ${accent}55`
                : undefined,
              transition: "box-shadow 200ms cubic-bezier(0.22,0.61,0.36,1)",
            }}
          >
            <SearchIcon size={18} color={focused ? accent : "var(--v-text-3)"} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.trim()) run(query.trim());
              }}
              placeholder="Search tracks, artists, albums…"
              aria-label="Search music"
              className="w-full bg-transparent text-[16px] outline-none"
              style={{ color: "var(--v-text)" }}
            />
            {query && (
              <motion.button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setQuery("");
                  setCommitted(null);
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.15, ease: EASE }}
                className="grid shrink-0 place-items-center rounded-full"
                style={{
                  width: 26,
                  height: 26,
                  background: "var(--v-surface)",
                  border: "1px solid var(--v-border)",
                }}
              >
                <X size={13} color="var(--v-text-3)" />
              </motion.button>
            )}
          </Inset>
        </motion.div>
      </motion.div>

      {/* ── Search summary strip ───────────────────────────────────────── */}
      <div className="min-h-[44px] px-5">
        <AnimatePresence mode="wait">
          {match && (
            <motion.div
              key={match.summary}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={m.crossfade}
              className="mt-5"
            >
              <div
                className="rounded-2xl px-4 py-3.5"
                style={{
                  background: `${accent}10`,
                  border: `1px solid ${accent}22`,
                }}
              >
                <p
                  className="text-[10px] uppercase"
                  style={{ color: accent, letterSpacing: "0.16em", opacity: 0.8 }}
                >
                  Search results
                </p>
                <p
                  className="mt-1.5 text-[14px]"
                  style={{ color: "var(--v-text)", lineHeight: 1.5, letterSpacing: "-0.01em" }}
                >
                  {match.summary}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Empty state: suggestions ──────────────────────────────────── */}
      {!committed ? (
        <div className="mt-6 space-y-8">
          {/* Try asking */}
          <section>
            <p
              className="px-5 text-[11px] uppercase"
              style={{ color: "var(--v-text-3)", letterSpacing: "0.16em" }}
            >
              Try searching for
            </p>

            <div className="mt-4 space-y-2 px-5">
              {SEARCH_EXAMPLES.map((e, i) => (
                <motion.button
                  key={e.query}
                  type="button"
                  onClick={() => run(e.query)}
                  className="w-full text-left"
                  {...m.stagger(i, 0.055, 0.1)}
                  whileHover={m.reduced ? undefined : { x: 3 }}
                  whileTap={m.reduced ? undefined : { scale: 0.985 }}
                  transition={{ duration: DUR.button, ease: EASE }}
                >
                  <div
                    className="flex items-center justify-between gap-3 rounded-2xl px-4 py-4"
                    style={{
                      background: "var(--v-card)",
                      border: "1px solid var(--v-border)",
                      boxShadow: "4px 6px 14px var(--v-shade), -1px -1px 1px var(--v-light)",
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-[16px]"
                        style={{
                          color: "var(--v-text)",
                          fontWeight: 500,
                          letterSpacing: "-0.018em",
                        }}
                      >
                        {e.query}
                      </p>
                      <p
                        className="mt-0.5 truncate text-[12px]"
                        style={{ color: "var(--v-text-3)" }}
                      >
                        {e.summary.split(" · ")[0]}
                      </p>
                    </div>
                    <span
                      style={{ color: "var(--v-text-3)", fontSize: 18, flexShrink: 0 }}
                      aria-hidden
                    >
                      ↗
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </section>

          {/* Recent */}
          <section>
            <p
              className="px-5 text-[11px] uppercase"
              style={{ color: "var(--v-text-3)", letterSpacing: "0.16em" }}
            >
              Recent
            </p>
            <div className="mt-4 flex flex-wrap gap-2 px-5">
              {RECENT_SEARCHES.map((r, i) => (
                <motion.button
                  key={r}
                  type="button"
                  onClick={() => run(r)}
                  className="rounded-full px-4 py-2.5 text-[13px]"
                  style={{
                    background: "var(--v-card)",
                    border: "1px solid var(--v-border)",
                    color: "var(--v-text-2)",
                    boxShadow: "3px 4px 10px var(--v-shade), -1px -1px 1px var(--v-light)",
                  }}
                  {...m.stagger(i, 0.04, 0.22)}
                  whileTap={m.reduced ? undefined : { scale: 0.96 }}
                  transition={{ duration: DUR.button, ease: EASE }}
                >
                  {r}
                </motion.button>
              ))}
            </div>
          </section>
        </div>
      ) : (
        /* ── Results ─────────────────────────────────────────────────── */
        <div className="mt-6">
          {thinking ? (
            <div className="space-y-1 px-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3.5 px-5 py-2.5">
                  <Skeleton style={{ width: 54, height: 54 }} radius={12} />
                  <div className="flex-1 space-y-2">
                    <Skeleton style={{ height: 11, width: "58%" }} radius={999} />
                    <Skeleton style={{ height: 9, width: "38%" }} radius={999} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {match?.trackIds.map((id, i) => (
                <TrackRow key={id} track={trackById(id)} index={i} showReason />
              ))}
              <p
                className="mt-8 px-5 text-[13px]"
                style={{ color: "var(--v-text-3)", lineHeight: 1.65 }}
              >
                Not quite right? Add a detail — a decade, a tempo, a place — and
                search again.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
