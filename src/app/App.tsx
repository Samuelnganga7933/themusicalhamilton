import { useState } from "react";
import { VibraProvider } from "./components/vibra/store";
import { PhoneShell, WebShell, type Platform } from "./components/vibra/shell";

/**
 * Vibra is one product with two presentations:
 * desktop browsers get the wide web shell, while phones get the full-screen
 * native-style shell. Both surfaces share the same store and screen flow.
 */
export default function App() {
  const [platform] = useState<Platform>(() =>
    typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent) ? "android" : "ios",
  );

  return (
    <VibraProvider>
      <div className="min-h-screen w-full bg-[#070708]">
        <div className="hidden min-h-screen md:block">
          <WebShell />
        </div>
        <div className="min-h-screen md:hidden">
          <PhoneShell platform={platform} fullScreen />
        </div>
      </div>
    </VibraProvider>
  );
}
