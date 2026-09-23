import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Check, Mail } from "lucide-react";
import { useVibra } from "../store";
import { Art, Card, IconButton, Inset } from "../primitives";
import { ONBOARDING_TASTES, ARTISTS } from "../data";
import { DUR, EASE, EASE_OUT } from "../motion";

/** The mark: a quiet aperture ring. No orb, no gradient blob. */
export function VibraMark({ size = 56 }: { size?: number }) {
  const { accent } = useVibra();
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" aria-hidden>
      <circle cx="28" cy="28" r="26" stroke="var(--v-border-strong)" strokeWidth="1" />
      <path d="M28 14v28" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M19 20v16M37 20v16" stroke="var(--v-text-2)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M10.5 25v6M45.5 25v6" stroke="var(--v-text-3)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── Splash ──────────────────────────────────────────────────────────────────

export function SplashScreen() {
  const { go, m } = useVibra();

  // Fades in, holds, then hands off to Login. No bounce, no progress bar.
  useEffect(() => {
    const id = window.setTimeout(() => go("login"), m.reduced ? 900 : 2100);
    return () => window.clearTimeout(id);
  }, [go, m.reduced]);

  return (
    <div className="relative flex h-full flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: m.reduced ? 1 : 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: m.reduced ? 0.25 : DUR.splash, ease: EASE_OUT }}
      >
        <VibraMark size={64} />
      </motion.div>
      <motion.h1
        className="mt-7 text-[30px]"
        style={{ color: "var(--v-text)", letterSpacing: "-0.03em", fontWeight: 600 }}
        initial={{ opacity: 0, y: m.reduced ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: m.reduced ? 0 : 0.24, ease: EASE_OUT }}
      >
        Vibra
      </motion.h1>
      <motion.p
        className="mt-2 text-[13px]"
        style={{ color: "var(--v-text-3)", letterSpacing: "0.06em" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: m.reduced ? 0 : 0.5, ease: EASE }}
      >
        Find what to play next
      </motion.p>
    </div>
  );
}

// ─── Login ───────────────────────────────────────────────────────────────────

export function LoginScreen() {
  const { go, m, accent } = useVibra();
  const [email, setEmail] = useState("");

  return (
    <div className="flex h-full flex-col justify-end px-7 pb-10">
      <motion.div {...m.settle(0.05)} className="mb-auto mt-16">
        <VibraMark size={44} />
        <h1
          className="mt-8 text-[38px]"
          style={{ color: "var(--v-text)", lineHeight: 1.04, fontWeight: 600 }}
        >
          Music you
          <br />
          haven't met yet.
        </h1>
        <p className="mt-4 max-w-[17rem] text-[14px]" style={{ color: "var(--v-text-2)", lineHeight: 1.55 }}>
          Vibra learns how you listen and answers one question well — what should
          I play right now?
        </p>
      </motion.div>

      <motion.div {...m.riseIn(0.16)} className="space-y-3">
        <Inset className="flex items-center gap-3 px-4" style={{ height: 54 }}>
          <Mail size={17} color="var(--v-text-3)" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            aria-label="Email address"
            className="w-full bg-transparent text-[15px] outline-none"
            style={{ color: "var(--v-text)" }}
          />
        </Inset>

        <motion.button
          type="button"
          onClick={() => go("onboarding")}
          className="grid w-full place-items-center text-[15px]"
          style={{
            height: 54,
            borderRadius: 999,
            background: accent,
            color: "#0B1B0F",
            boxShadow: `0 10px 26px ${accent}3D`,
          }}
          whileTap={m.reduced ? undefined : { scale: 0.985 }}
          transition={{ duration: DUR.button, ease: EASE }}
        >
          Continue
        </motion.button>

        <div className="flex items-center gap-3 py-1">
          <span className="h-px flex-1" style={{ background: "var(--v-border)" }} />
          <span className="text-[11px]" style={{ color: "var(--v-text-3)" }}>
            or
          </span>
          <span className="h-px flex-1" style={{ background: "var(--v-border)" }} />
        </div>

        <div className="flex gap-3">
          {[
            { label: "Continue with a passkey", glyph: "Passkey" },
            { label: "Continue with a phone number", glyph: "Phone" },
          ].map((p) => (
            <motion.button
              key={p.label}
              type="button"
              onClick={() => go("onboarding")}
              aria-label={p.label}
              className="v-raised-soft grid flex-1 place-items-center"
              style={{ height: 52, borderRadius: 999 }}
              whileTap={m.reduced ? undefined : { scale: 0.98 }}
              transition={{ duration: DUR.button, ease: EASE }}
            >
              <span className="text-[13px]" style={{ color: "var(--v-text-2)" }}>
                {p.glyph}
              </span>
            </motion.button>
          ))}
        </div>

        <p className="pt-2 text-center text-[11px]" style={{ color: "var(--v-text-3)" }}>
          By continuing you agree to our Terms and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}

// ─── Onboarding ──────────────────────────────────────────────────────────────

const STEPS = [
  {
    kicker: "Step 1 of 3",
    title: "What do you reach for?",
    note: "Pick three or more. You can change this any time.",
  },
  {
    kicker: "Step 2 of 3",
    title: "Anyone you already love?",
    note: "We'll use these as a starting point, not a ceiling.",
  },
  {
    kicker: "Step 3 of 3",
    title: "When do you listen?",
    note: "Moments on your Home screen adapt to this.",
  },
];

const TIMES = [
  { id: "morning", label: "Mornings", note: "Kitchen, commute" },
  { id: "deep", label: "Deep work", note: "Instrumental only" },
  { id: "evening", label: "Evenings", note: "Cooking, unwinding" },
  { id: "late", label: "Late night", note: "Low volume, low tempo" },
];

export function OnboardingScreen() {
  const { go, m, accent, play } = useVibra();
  const [step, setStep] = useState(0);
  const [tastes, setTastes] = useState<string[]>(["Alté", "Ambient Jazz"]);
  const [artists, setArtists] = useState<string[]>(["a1"]);
  const [times, setTimes] = useState<string[]>(["evening"]);

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) =>
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const finish = () => {
    play("t1");
    go("home");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="px-7 pb-5 pt-14">
        <div className="mb-7 flex gap-1.5">
          {STEPS.map((_, i) => (
            <motion.span
              key={i}
              className="h-[3px] flex-1 rounded-full"
              animate={{ background: i <= step ? accent : "var(--v-border-strong)" }}
              transition={{ duration: 0.4, ease: EASE }}
            />
          ))}
        </div>
        <motion.div key={step} {...m.riseIn(0, 8)}>
          <p
            className="text-[11px] uppercase"
            style={{ color: "var(--v-text-3)", letterSpacing: "0.14em" }}
          >
            {STEPS[step].kicker}
          </p>
          <h1
            className="mt-2 text-[30px]"
            style={{ color: "var(--v-text)", lineHeight: 1.1, fontWeight: 600 }}
          >
            {STEPS[step].title}
          </h1>
          <p className="mt-2.5 text-[13px]" style={{ color: "var(--v-text-2)" }}>
            {STEPS[step].note}
          </p>
        </motion.div>
      </div>

      <div className="v-scroll flex-1 overflow-y-auto px-7 pb-4">
        {step === 0 && (
          <div className="flex flex-wrap gap-2.5">
            {ONBOARDING_TASTES.map((t, i) => {
              const on = tastes.includes(t);
              return (
                <motion.button
                  key={t}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(tastes, setTastes, t)}
                  className={on ? "" : "v-raised-soft"}
                  style={{
                    padding: "11px 17px",
                    borderRadius: 999,
                    fontSize: 14,
                    background: on ? accent : undefined,
                    color: on ? "#0B1B0F" : "var(--v-text-2)",
                    boxShadow: on ? `0 6px 18px ${accent}33` : undefined,
                  }}
                  {...m.stagger(i, 0.03)}
                  whileTap={m.reduced ? undefined : { scale: 0.96 }}
                >
                  {t}
                </motion.button>
              );
            })}
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-3 gap-3">
            {ARTISTS.map((a, i) => {
              const on = artists.includes(a.id);
              return (
                <motion.button
                  key={a.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(artists, setArtists, a.id)}
                  className="text-left"
                  {...m.stagger(i, 0.04)}
                  whileTap={m.reduced ? undefined : { scale: 0.97 }}
                >
                  <div className="relative">
                    <Art src={a.art} alt={a.name} radius={999} className="aspect-square w-full" />
                    <motion.span
                      className="absolute inset-0 grid place-items-center rounded-full"
                      animate={{ opacity: on ? 1 : 0 }}
                      transition={{ duration: 0.2, ease: EASE }}
                      style={{ background: "rgba(0,0,0,0.45)", boxShadow: `inset 0 0 0 2px ${accent}` }}
                    >
                      <Check size={20} color={accent} />
                    </motion.span>
                  </div>
                  <p className="mt-2 truncate text-[12px]" style={{ color: "var(--v-text)" }}>
                    {a.name}
                  </p>
                </motion.button>
              );
            })}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            {TIMES.map((t, i) => {
              const on = times.includes(t.id);
              return (
                <motion.div key={t.id} {...m.stagger(i, 0.05)}>
                  <Card
                    onClick={() => toggle(times, setTimes, t.id)}
                    label={t.label}
                    style={on ? { boxShadow: `0 0 0 1.5px ${accent}, 0 8px 22px var(--v-shade)` } : undefined}
                  >
                    <div className="flex items-center justify-between px-5 py-4">
                      <div>
                        <p className="text-[15px]" style={{ color: "var(--v-text)" }}>
                          {t.label}
                        </p>
                        <p className="mt-0.5 text-[12px]" style={{ color: "var(--v-text-3)" }}>
                          {t.note}
                        </p>
                      </div>
                      <motion.span
                        className="grid place-items-center rounded-full"
                        style={{
                          width: 24,
                          height: 24,
                          border: `1px solid ${on ? accent : "var(--v-border-strong)"}`,
                          background: on ? accent : "transparent",
                        }}
                        animate={{ scale: on ? 1 : 0.96 }}
                        transition={{ duration: 0.18, ease: EASE }}
                      >
                        {on && <Check size={13} color="#0B1B0F" />}
                      </motion.span>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 px-7 pb-10 pt-4">
        {step > 0 && (
          <IconButton label="Previous step" onClick={() => setStep(step - 1)} size={52}>
            <span style={{ fontSize: 18, color: "var(--v-text-2)" }}>‹</span>
          </IconButton>
        )}
        <motion.button
          type="button"
          onClick={() => (step === 2 ? finish() : setStep(step + 1))}
          className="grid flex-1 place-items-center text-[15px]"
          style={{
            height: 54,
            borderRadius: 999,
            background: accent,
            color: "#0B1B0F",
            boxShadow: `0 10px 26px ${accent}3D`,
          }}
          whileTap={m.reduced ? undefined : { scale: 0.985 }}
          transition={{ duration: DUR.button, ease: EASE }}
        >
          {step === 2 ? "Start listening" : "Continue"}
        </motion.button>
      </div>
    </div>
  );
}
