import { useState } from "react";
import { motion } from "motion/react";
import { VibraProvider, useVibra, type Screen, type ThemeMode } from "./components/vibra/store";
import { PhoneShell, type Platform } from "./components/vibra/shell";
import { VibraMark } from "./components/vibra/screens/entry";
import { EASE } from "./components/vibra/motion";

/**
 * Vibra — an AI-native music discovery app.
 *
 * The product itself is the phone. Everything outside the device is a thin
 * inspector so the full flow (splash → login → onboarding → app), both
 * platforms, and all three themes can be reviewed without hunting for them.
 */
export default function App() {
  const [platform, setPlatform] = useState<Platform>("ios");

  return (
    <VibraProvider>
      <div
        className="min-h-screen w-full"
        style={{
          background: "radial-gradient(120% 90% at 50% 0%, #1A1A1D 0%, #0B0B0C 60%, #070708 100%)",
        }}
      >
        <div className="mx-auto flex max-w-[1180px] flex-col items-center gap-10 px-6 py-10 lg:flex-row lg:items-start lg:justify-center lg:gap-16 lg:py-16">
          <Inspector platform={platform} setPlatform={setPlatform} />
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="shrink-0"
          >
            <PhoneShell platform={platform} />
          </motion.div>
        </div>
      </div>
    </VibraProvider>
  );
}

const FLOW: { id: Screen; label: string }[] = [
  { id: "splash", label: "Splash" },
  { id: "login", label: "Login" },
  { id: "onboarding", label: "Onboarding" },
  { id: "home", label: "Home" },
  { id: "discover", label: "Discover" },
  { id: "search", label: "Search" },
  { id: "library", label: "Library" },
  { id: "profile", label: "Profile" },
  { id: "appearance", label: "Appearance" },
  { id: "backgrounds", label: "Backgrounds" },
];

const THEMES: { id: ThemeMode; label: string }[] = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "oled", label: "OLED" },
  { id: "system", label: "System" },
];

function Inspector({
  platform,
  setPlatform,
}: {
  platform: Platform;
  setPlatform: (p: Platform) => void;
}) {
  const { screen, go, settings, set, accent, setNowPlayingOpen, setQueueOpen, play, hasStarted } =
    useVibra();

  return (
    <div className="w-full max-w-[320px] shrink-0 text-[#E8E6E1]">
      <div className="flex items-center gap-3">
        <VibraMark size={34} />
        <div>
          <h1 className="text-[20px]" style={{ fontWeight: 600, letterSpacing: "-0.02em" }}>
            Vibra
          </h1>
          <p className="text-[12px] text-[#8B8B87]">AI-native music discovery</p>
        </div>
      </div>

      <p className="mt-5 text-[13px] leading-relaxed text-[#9A9A95]">
        Playback stays familiar. Discovery is the product — Moments, Today's Pick,
        and natural-language search do the deciding.
      </p>

      <Group label="Platform">
        {(["ios", "android"] as Platform[]).map((p) => (
          <Chip key={p} on={platform === p} onClick={() => setPlatform(p)} accent={accent}>
            {p === "ios" ? "iOS" : "Android"}
          </Chip>
        ))}
      </Group>

      <Group label="Theme">
        {THEMES.map((t) => (
          <Chip key={t.id} on={settings.theme === t.id} onClick={() => set("theme", t.id)} accent={accent}>
            {t.label}
          </Chip>
        ))}
      </Group>

      <Group label="Flow">
        {FLOW.map((f) => (
          <Chip key={f.id} on={screen === f.id} onClick={() => go(f.id)} accent={accent}>
            {f.label}
          </Chip>
        ))}
      </Group>

      <Group label="Player">
        <Chip
          on={false}
          accent={accent}
          onClick={() => {
            if (!hasStarted) play("t1");
            setNowPlayingOpen(true);
          }}
        >
          Now Playing
        </Chip>
        <Chip
          on={false}
          accent={accent}
          onClick={() => {
            if (!hasStarted) play("t1");
            setNowPlayingOpen(true);
            setQueueOpen(true);
          }}
        >
          Queue
        </Chip>
        <Chip
          on={settings.reducedMotion}
          accent={accent}
          onClick={() => set("reducedMotion", !settings.reducedMotion)}
        >
          Reduce Motion
        </Chip>
      </Group>

      <p className="mt-8 text-[11px] leading-relaxed text-[#6E6E6A]">
        Motion budget — taps 120ms · buttons 180ms · cards 240ms · navigation
        300ms · screens 440ms · backgrounds 900ms. Reduce Motion replaces every
        transition with a crossfade.
      </p>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-7">
      <p className="text-[10px] uppercase text-[#6E6E6A]" style={{ letterSpacing: "0.16em" }}>
        {label}
      </p>
      <div className="mt-2.5 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  children,
  on,
  onClick,
  accent,
}: {
  children: React.ReactNode;
  on: boolean;
  onClick: () => void;
  accent: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className="rounded-full px-3 py-1.5 text-[12px]"
      style={{
        background: on ? accent : "rgba(255,255,255,0.05)",
        color: on ? "#0B1B0F" : "#B6B6B1",
        border: `1px solid ${on ? accent : "rgba(255,255,255,0.08)"}`,
      }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.15, ease: EASE }}
    >
      {children}
    </motion.button>
  );
}
