import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Sequence,
  Img,
  staticFile,
  Audio,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin", "latin-ext"],
});

// ─── Brand Colors ───────────────────────────────────────────
const C = {
  orange: "#F97316",
  orangeGlow: "#FB923C",
  teal: "#0D9488",
  dark: "#0A0A0A",
  darkCard: "#161616",
  white: "#FFFFFF",
  lightBg: "#F5F5F5",
  whatsapp: "#25D366",
  red: "#EF4444",
  green: "#10B981",
  blue: "#3B82F6",
  purple: "#7C3AED",
  muted: "#9CA3AF",
  border: "#2A2A2A",
};

// ─── Timing (frames at 30fps) ──────────────────────────────
const T = {
  HOOK: { start: 0, dur: 250 },
  PAIN: { start: 250, dur: 285 },
  REVEAL: { start: 535, dur: 120 },
  DASHBOARD: { start: 655, dur: 330 },
  MOBILE: { start: 985, dur: 225 },
  HOW: { start: 1210, dur: 270 },
  CTA: { start: 1480, dur: 320 },
};

// 60s at 30fps = 1800 total frames (timings fitted to DE audio)

// ─── Helpers ────────────────────────────────────────────────
const ease = (t: number) =>
  interpolate(t, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

function useSpring(
  delay: number,
  config = { damping: 18, stiffness: 120, mass: 0.8 }
) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config });
}

function FadeIn({
  children,
  delay = 0,
  direction = "up",
  distance = 40,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  style?: React.CSSProperties;
}) {
  const progress = useSpring(delay);
  const translateMap = {
    up: `translateY(${interpolate(progress, [0, 1], [distance, 0])}px)`,
    down: `translateY(${interpolate(progress, [0, 1], [-distance, 0])}px)`,
    left: `translateX(${interpolate(progress, [0, 1], [distance, 0])}px)`,
    right: `translateX(${interpolate(progress, [0, 1], [-distance, 0])}px)`,
    none: "none",
  };
  return (
    <div
      style={{
        opacity: ease(progress),
        transform: translateMap[direction],
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Counter({
  target,
  delay = 0,
  suffix = "",
  prefix = "",
  style,
}: {
  target: number;
  delay?: number;
  suffix?: string;
  prefix?: string;
  style?: React.CSSProperties;
}) {
  const progress = useSpring(delay, {
    damping: 30,
    stiffness: 60,
    mass: 1,
  });
  const value = Math.round(interpolate(progress, [0, 1], [0, target]));
  return (
    <span style={style}>
      {prefix}
      {value}
      {suffix}
    </span>
  );
}

// ─── Scene: Global crossfade layer ─────────────────────────
function SceneFade({
  sceneStart,
  sceneDur,
  fadeIn = 15,
  fadeOut = 15,
  children,
}: {
  sceneStart: number;
  sceneDur: number;
  fadeIn?: number;
  fadeOut?: number;
  children: React.ReactNode;
}) {
  const frame = useCurrentFrame();
  const local = frame - sceneStart;

  if (local < 0 || local > sceneDur) return null;

  let opacity = 1;
  if (fadeIn > 0 && local < fadeIn) {
    opacity = interpolate(local, [0, fadeIn], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }
  if (fadeOut > 0 && local > sceneDur - fadeOut) {
    opacity = interpolate(local, [sceneDur - fadeOut, sceneDur], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }

  return (
    <AbsoluteFill style={{ opacity }}>
      {children}
    </AbsoluteFill>
  );
}

// ═══════════════════════════════════════════════════════════
//  SCENE 1: HOOK — WhatsApp Chaos
// ═══════════════════════════════════════════════════════════
const MESSAGES = [
  { text: "Kannst du morgen arbeiten? Dringend!", x: 120, y: 180, delay: 8, rot: -2 },
  { text: "Bin krank, komme heute nicht", x: 680, y: 120, delay: 16, rot: 1.5 },
  { text: "Wer ist für Glovo verfügbar?", x: 350, y: 340, delay: 24, rot: -1 },
  { text: "SCHON WIEDER DOPPELBUCHUNG 😤", x: 900, y: 280, delay: 32, rot: 2 },
  { text: "Kunde braucht den Bericht JETZT", x: 180, y: 500, delay: 40, rot: -1.5 },
  { text: "Jemand frei dieses Wochenende??", x: 750, y: 450, delay: 48, rot: 0.5 },
  { text: "Sorry Chef, wieder nicht erschienen", x: 480, y: 620, delay: 56, rot: -2.5 },
  { text: "Wo ist der João??", x: 1050, y: 520, delay: 64, rot: 1 },
  { text: "Brauche 5 Leute bis 6 Uhr!!", x: 300, y: 750, delay: 72, rot: -0.5 },
  { text: "In welche Gruppe poste ich das?", x: 820, y: 680, delay: 80, rot: 2 },
  { text: "Hab ich Pedro schon gesagt!", x: 1150, y: 380, delay: 88, rot: -1 },
  { text: "Kann jemand für Ana einspringen?", x: 550, y: 160, delay: 96, rot: 1.5 },
];

function SceneHook() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.dark,
        fontFamily,
        overflow: "hidden",
      }}
    >
      {/* Subtle grid pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${C.border} 1px, transparent 1px), linear-gradient(90deg, ${C.border} 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          opacity: 0.15,
        }}
      />

      {/* Floating WhatsApp messages */}
      {MESSAGES.map((msg, i) => {
        const s = spring({
          frame: frame - msg.delay,
          fps,
          config: { damping: 12, stiffness: 150, mass: 0.6 },
        });
        const shake =
          frame > msg.delay + 20
            ? Math.sin((frame - msg.delay) * 0.15) * 1.5
            : 0;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: msg.x,
              top: msg.y,
              transform: `scale(${ease(s)}) rotate(${msg.rot + shake}deg)`,
              opacity: ease(s),
              backgroundColor: C.whatsapp,
              color: C.white,
              padding: "12px 20px",
              borderRadius: "18px 18px 18px 4px",
              fontSize: 18,
              fontWeight: 500,
              maxWidth: 320,
              boxShadow: `0 4px 20px ${C.whatsapp}33`,
              whiteSpace: "nowrap",
            }}
          >
            {msg.text}
          </div>
        );
      })}

      {/* Notification counter */}
      <FadeIn delay={60} style={{ position: "absolute", bottom: 180, width: "100%", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 16 }}>
          <span
            style={{
              backgroundColor: C.red,
              color: C.white,
              padding: "6px 16px",
              borderRadius: 20,
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            47 Gruppen
          </span>
          <span style={{ color: C.muted, fontSize: 20 }}>·</span>
          <span
            style={{
              backgroundColor: C.red,
              color: C.white,
              padding: "6px 16px",
              borderRadius: 20,
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            <Counter target={238} delay={65} /> ungelesen
          </span>
        </div>
      </FadeIn>

      {/* "Kommt dir das bekannt vor?" */}
      <FadeIn delay={110} style={{ position: "absolute", bottom: 80, width: "100%", textAlign: "center" }}>
        <span
          style={{
            color: C.white,
            fontSize: 52,
            fontWeight: 800,
            letterSpacing: -1,
          }}
        >
          Kommt dir das bekannt vor?
        </span>
      </FadeIn>
    </AbsoluteFill>
  );
}

// ═══════════════════════════════════════════════════════════
//  SCENE 2: PAIN POINTS
// ═══════════════════════════════════════════════════════════
const PAINS = [
  { icon: "⚠️", text: "Ausfälle ohne Vorwarnung", color: C.red },
  { icon: "💬", text: "WhatsApp ist dein 'System'", color: C.whatsapp },
  { icon: "📅", text: "Ständige Doppelbuchungen", color: C.orange },
  { icon: "📊", text: "Null Daten für Kunden", color: C.blue },
  { icon: "😤", text: "Unzufriedene Kunden", color: C.purple },
  { icon: "⏰", text: "Stundenlange Schichtkoordination", color: C.red },
];

function ScenePain() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.dark,
        fontFamily,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        padding: "60px 200px",
      }}
    >
      {/* Header */}
      <FadeIn delay={5} style={{ marginBottom: 20 }}>
        <span style={{ color: C.orange, fontSize: 18, fontWeight: 600, textTransform: "uppercase", letterSpacing: 4 }}>
          Der tägliche Alltag
        </span>
      </FadeIn>

      {/* Pain cards */}
      {PAINS.map((pain, i) => {
        const delay = 20 + i * 30;
        const s = spring({
          frame: frame - delay,
          fps,
          config: { damping: 16, stiffness: 130, mass: 0.7 },
        });

        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              width: "100%",
              maxWidth: 800,
              padding: "20px 32px",
              backgroundColor: C.darkCard,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              borderLeft: `4px solid ${pain.color}`,
              transform: `translateX(${interpolate(ease(s), [0, 1], [80, 0])}px)`,
              opacity: ease(s),
            }}
          >
            <span style={{ fontSize: 36 }}>{pain.icon}</span>
            <span style={{ color: C.white, fontSize: 28, fontWeight: 600 }}>
              {pain.text}
            </span>
          </div>
        );
      })}

      {/* Bottom text */}
      <FadeIn delay={210} style={{ marginTop: 20 }}>
        <span style={{ color: C.muted, fontSize: 22, fontStyle: "italic" }}>
          Du verdienst bessere Werkzeuge.
        </span>
      </FadeIn>
    </AbsoluteFill>
  );
}

// ═══════════════════════════════════════════════════════════
//  SCENE 3: SOLUTION REVEAL
// ═══════════════════════════════════════════════════════════
function SceneReveal() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Horizontal line animation
  const lineProgress = spring({
    frame: frame - 15,
    fps,
    config: { damping: 30, stiffness: 80, mass: 1 },
  });

  const logoScale = spring({
    frame: frame - 40,
    fps,
    config: { damping: 14, stiffness: 100, mass: 0.8 },
  });

  const taglineOpacity = spring({
    frame: frame - 60,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  // Orange glow pulse
  const glowPulse = Math.sin(frame * 0.08) * 0.3 + 0.7;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.dark,
        fontFamily,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Radial glow */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.orange}15, transparent 70%)`,
          opacity: glowPulse * ease(logoScale),
        }}
      />

      {/* Logo */}
      <div
        style={{
          transform: `scale(${interpolate(ease(logoScale), [0, 1], [0.5, 1])})`,
          opacity: ease(logoScale),
          marginBottom: 24,
        }}
      >
        <Img
          src={staticFile("logo-white.svg")}
          style={{ width: 100, height: 100 }}
        />
      </div>

      {/* Brand name */}
      <FadeIn delay={45}>
        <span
          style={{
            color: C.white,
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: -2,
          }}
        >
          Tra<span style={{ color: C.teal }}>gg</span>o
        </span>
      </FadeIn>

      {/* Horizontal line */}
      <div
        style={{
          width: interpolate(ease(lineProgress), [0, 1], [0, 500]),
          height: 3,
          backgroundColor: C.orange,
          marginTop: 24,
          marginBottom: 24,
          borderRadius: 2,
          boxShadow: `0 0 20px ${C.orange}66`,
        }}
      />

      {/* Tagline */}
      <div style={{ opacity: ease(taglineOpacity) }}>
        <span
          style={{
            color: C.muted,
            fontSize: 30,
            fontWeight: 400,
            letterSpacing: 1,
          }}
        >
          Eine Plattform. Volle Kontrolle.
        </span>
      </div>
    </AbsoluteFill>
  );
}

// ═══════════════════════════════════════════════════════════
//  SCENE 4: DASHBOARD SHOWCASE
// ═══════════════════════════════════════════════════════════
const STATS = [
  { label: "Aktive Mitarbeiter", value: 128, suffix: "", color: C.green },
  { label: "Verfügbarkeitsrate", value: 94, suffix: "%", color: C.blue },
  { label: "Aktive Partner", value: 12, suffix: "", color: C.purple },
  { label: "Schichten Heute", value: 47, suffix: "", color: C.orange },
];

const AVAILABILITY_GRID: Array<{ name: string; slots: number[] }> = [
  { name: "Ana S.", slots: [1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0] },
  { name: "Pedro M.", slots: [0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1] },
  { name: "João C.", slots: [1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1] },
  { name: "Maria L.", slots: [1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1] },
  { name: "Carlos R.", slots: [0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1] },
  { name: "Sofia A.", slots: [1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0] },
];

const HOURS = ["06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17"];

function SceneDashboard() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sidebarSlide = spring({
    frame: frame - 5,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.lightBg,
        fontFamily,
        overflow: "hidden",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          position: "absolute",
          left: interpolate(ease(sidebarSlide), [0, 1], [-260, 0]),
          top: 0,
          bottom: 0,
          width: 260,
          backgroundColor: C.dark,
          display: "flex",
          flexDirection: "column",
          padding: "32px 20px",
          gap: 8,
          borderRight: `1px solid ${C.border}`,
        }}
      >
        {/* Logo area */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32, padding: "0 8px" }}>
          <Img src={staticFile("logo-white.svg")} style={{ width: 32, height: 32 }} />
          <span style={{ color: C.white, fontSize: 20, fontWeight: 700 }}>
            Tra<span style={{ color: C.teal }}>gg</span>o
          </span>
        </div>
        {/* Nav items */}
        {["Dashboard", "Mitarbeiter", "Verfügbarkeit", "Partner", "Zonen", "Ausschreibungen", "Einstellungen"].map(
          (item, i) => {
            const isActive = item === "Verfügbarkeit";
            return (
              <FadeIn key={item} delay={20 + i * 8} direction="left" distance={20}>
                <div
                  style={{
                    padding: "10px 16px",
                    borderRadius: 8,
                    backgroundColor: isActive ? C.orange : "transparent",
                    color: isActive ? C.white : C.muted,
                    fontSize: 15,
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {item}
                </div>
              </FadeIn>
            );
          }
        )}
      </div>

      {/* Main content */}
      <div
        style={{
          position: "absolute",
          left: 260,
          right: 0,
          top: 0,
          bottom: 0,
          padding: "32px 40px",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <FadeIn delay={20}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ color: C.dark, fontSize: 32, fontWeight: 700, margin: 0 }}>
              Verfügbarkeit der Mitarbeiter
            </h1>
            <p style={{ color: C.muted, fontSize: 15, margin: "4px 0 0 0" }}>
              Echtzeit-Übersicht aller Mitarbeiter und Schichten
            </p>
          </div>
        </FadeIn>

        {/* Stat cards */}
        <div style={{ display: "flex", gap: 20, marginBottom: 28 }}>
          {STATS.map((stat, i) => (
            <FadeIn key={stat.label} delay={35 + i * 12} direction="up" distance={30}>
              <div
                style={{
                  backgroundColor: C.white,
                  borderRadius: 12,
                  padding: "20px 28px",
                  flex: 1,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  borderTop: `3px solid ${stat.color}`,
                  minWidth: 200,
                }}
              >
                <div style={{ color: C.muted, fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
                  {stat.label}
                </div>
                <div style={{ color: C.dark, fontSize: 36, fontWeight: 800 }}>
                  <Counter target={stat.value} delay={40 + i * 12} suffix={stat.suffix} />
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Availability grid */}
        <FadeIn delay={90} direction="up" distance={20}>
          <div
            style={{
              backgroundColor: C.white,
              borderRadius: 12,
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <span style={{ color: C.dark, fontSize: 18, fontWeight: 600 }}>
                Heutiger Zeitplan
              </span>
              <span style={{ color: C.orange, fontSize: 14, fontWeight: 500 }}>
                Alles anzeigen &rarr;
              </span>
            </div>

            {/* Hour headers */}
            <div style={{ display: "flex", marginBottom: 8, paddingLeft: 100 }}>
              {HOURS.map((h) => (
                <div
                  key={h}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    color: C.muted,
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                >
                  {h}:00
                </div>
              ))}
            </div>

            {/* Worker rows */}
            {AVAILABILITY_GRID.map((worker, wi) => (
              <div
                key={worker.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <div
                  style={{
                    width: 100,
                    color: C.dark,
                    fontSize: 13,
                    fontWeight: 500,
                    paddingRight: 12,
                  }}
                >
                  {worker.name}
                </div>
                {worker.slots.map((slot, si) => {
                  const cellDelay = 110 + wi * 8 + si * 3;
                  const cellSpring = spring({
                    frame: frame - cellDelay,
                    fps,
                    config: { damping: 15, stiffness: 200 },
                  });

                  return (
                    <div
                      key={si}
                      style={{
                        flex: 1,
                        height: 32,
                        margin: "0 2px",
                        borderRadius: 4,
                        backgroundColor:
                          slot === 1 ? C.green : `${C.red}22`,
                        opacity: ease(cellSpring),
                        transform: `scaleY(${ease(cellSpring)})`,
                        border: slot === 1 ? "none" : `1px solid ${C.red}33`,
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Floating overlay text */}
        <FadeIn delay={260} style={{ position: "absolute", right: 60, bottom: 40 }}>
          <div
            style={{
              backgroundColor: `${C.dark}ee`,
              color: C.white,
              padding: "16px 28px",
              borderRadius: 12,
              fontSize: 18,
              fontWeight: 500,
              border: `1px solid ${C.orange}44`,
              boxShadow: `0 8px 32px ${C.dark}88`,
            }}
          >
            Echtzeit. Jeder Mitarbeiter. Jede Schicht. ✓
          </div>
        </FadeIn>
      </div>
    </AbsoluteFill>
  );
}

// ═══════════════════════════════════════════════════════════
//  SCENE 5: MOBILE APP
// ═══════════════════════════════════════════════════════════
function SceneMobile() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phoneScale = spring({
    frame: frame - 10,
    fps,
    config: { damping: 16, stiffness: 100, mass: 0.9 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.dark,
        fontFamily,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 100,
        padding: "0 120px",
      }}
    >
      {/* Phone mockup */}
      <div
        style={{
          transform: `scale(${interpolate(ease(phoneScale), [0, 1], [0.8, 1])})`,
          opacity: ease(phoneScale),
        }}
      >
        <div
          style={{
            width: 320,
            height: 640,
            backgroundColor: "#1A1A2E",
            borderRadius: 40,
            border: "4px solid #333",
            overflow: "hidden",
            boxShadow: `0 20px 60px ${C.dark}, 0 0 40px ${C.purple}22`,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Phone header */}
          <div
            style={{
              padding: "20px 20px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              borderBottom: "1px solid #2A2A3E",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                backgroundColor: C.purple,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: C.white,
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              JS
            </div>
            <div>
              <div style={{ color: C.white, fontSize: 15, fontWeight: 600 }}>
                João Silva
              </div>
              <div style={{ color: C.muted, fontSize: 11 }}>Mitarbeiter</div>
            </div>
          </div>

          {/* Today's availability */}
          <div style={{ padding: "16px 20px" }}>
            <div
              style={{
                color: C.muted,
                fontSize: 11,
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 12,
              }}
            >
              Heutige Verfügbarkeit
            </div>

            {/* Time slots */}
            {[
              { time: "06:00 - 10:00", status: "Verfügbar", color: C.green },
              { time: "10:00 - 14:00", status: "Zugewiesen", color: C.blue, partner: "Uber Eats" },
              { time: "14:00 - 18:00", status: "Verfügbar", color: C.green },
            ].map((slot, i) => (
              <FadeIn key={i} delay={30 + i * 20} direction="left" distance={20}>
                <div
                  style={{
                    backgroundColor: "#222240",
                    borderRadius: 12,
                    padding: "14px 16px",
                    marginBottom: 8,
                    borderLeft: `3px solid ${slot.color}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ color: C.white, fontSize: 14, fontWeight: 600 }}>
                      {slot.time}
                    </div>
                    {slot.partner && (
                      <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>
                        {slot.partner}
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      backgroundColor: `${slot.color}22`,
                      color: slot.color,
                      padding: "4px 10px",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {slot.status}
                  </div>
                </div>
              </FadeIn>
            ))}

            {/* Confirm button */}
            <FadeIn delay={100}>
              <div
                style={{
                  marginTop: 16,
                  backgroundColor: C.green,
                  color: C.white,
                  padding: "14px",
                  borderRadius: 12,
                  textAlign: "center",
                  fontSize: 15,
                  fontWeight: 700,
                  boxShadow: `0 4px 16px ${C.green}44`,
                }}
              >
                ✓ Verfügbarkeit bestätigen
              </div>
            </FadeIn>
          </div>
        </div>
      </div>

      {/* Benefits text */}
      <div style={{ maxWidth: 500 }}>
        <FadeIn delay={40}>
          <span
            style={{
              color: C.orange,
              fontSize: 16,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 3,
            }}
          >
            Mitarbeiter-App
          </span>
        </FadeIn>

        <FadeIn delay={55}>
          <h2
            style={{
              color: C.white,
              fontSize: 44,
              fontWeight: 800,
              lineHeight: 1.2,
              margin: "16px 0 32px",
              letterSpacing: -1,
            }}
          >
            Einfacher als
            <br />
            <span style={{ color: C.whatsapp, textDecoration: "line-through", opacity: 0.5 }}>
              WhatsApp
            </span>
          </h2>
        </FadeIn>

        {[
          "Mitarbeiter bestätigen in Sekunden",
          "Automatische Schichtbenachrichtigungen",
          "Keine Telefonate mehr",
          "Eine App für alle Kunden",
        ].map((benefit, i) => (
          <FadeIn key={i} delay={80 + i * 25} direction="left" distance={30}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  backgroundColor: `${C.green}22`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: C.green,
                  fontSize: 14,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                ✓
              </div>
              <span style={{ color: C.white, fontSize: 20, fontWeight: 500 }}>
                {benefit}
              </span>
            </div>
          </FadeIn>
        ))}
      </div>
    </AbsoluteFill>
  );
}

// ═══════════════════════════════════════════════════════════
//  SCENE 6: HOW IT WORKS
// ═══════════════════════════════════════════════════════════
const STEPS = [
  {
    num: "01",
    title: "Team registrieren",
    desc: "Mitarbeiter in Minuten importieren. Zonen, Rollen und Präferenzen festlegen.",
    icon: "👥",
  },
  {
    num: "02",
    title: "Mitarbeiter nutzen die App",
    desc: "Verfügbarkeit bestätigen, Schichten sehen, benachrichtigt werden. So einfach.",
    icon: "📱",
  },
  {
    num: "03",
    title: "Du siehst alles",
    desc: "Echtzeit-Dashboard. Automatische Berichte. Volle Kontrolle.",
    icon: "📊",
  },
];

function SceneHowItWorks() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.white,
        fontFamily,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 120px",
      }}
    >
      {/* Header */}
      <FadeIn delay={5}>
        <span
          style={{
            color: C.orange,
            fontSize: 16,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 4,
          }}
        >
          So funktioniert's
        </span>
      </FadeIn>
      <FadeIn delay={15}>
        <h2
          style={{
            color: C.dark,
            fontSize: 48,
            fontWeight: 800,
            margin: "12px 0 60px",
            letterSpacing: -1,
          }}
        >
          Drei Schritte zur Kontrolle
        </h2>
      </FadeIn>

      {/* Steps */}
      <div style={{ display: "flex", gap: 50, alignItems: "flex-start" }}>
        {STEPS.map((step, i) => {
          const delay = 40 + i * 45;
          const s = spring({
            frame: frame - delay,
            fps,
            config: { damping: 16, stiffness: 100, mass: 0.8 },
          });

          // Connecting line
          const lineDelay = delay + 30;
          const lineProgress = spring({
            frame: frame - lineDelay,
            fps,
            config: { damping: 25, stiffness: 80 },
          });

          return (
            <React.Fragment key={i}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  maxWidth: 320,
                  opacity: ease(s),
                  transform: `translateY(${interpolate(ease(s), [0, 1], [30, 0])}px)`,
                }}
              >
                {/* Icon circle */}
                <div
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    backgroundColor: `${C.orange}10`,
                    border: `2px solid ${C.orange}33`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 44,
                    marginBottom: 24,
                  }}
                >
                  {step.icon}
                </div>
                {/* Step number */}
                <span
                  style={{
                    color: C.orange,
                    fontSize: 14,
                    fontWeight: 700,
                    marginBottom: 8,
                  }}
                >
                  SCHRITT {step.num}
                </span>
                {/* Title */}
                <h3
                  style={{
                    color: C.dark,
                    fontSize: 24,
                    fontWeight: 700,
                    textAlign: "center",
                    margin: "0 0 8px",
                  }}
                >
                  {step.title}
                </h3>
                {/* Description */}
                <p
                  style={{
                    color: C.muted,
                    fontSize: 16,
                    textAlign: "center",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {step.desc}
                </p>
              </div>
              {/* Connecting arrow */}
              {i < STEPS.length - 1 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: 45,
                    opacity: ease(lineProgress),
                  }}
                >
                  <div
                    style={{
                      width: interpolate(ease(lineProgress), [0, 1], [0, 60]),
                      height: 2,
                      backgroundColor: C.orange,
                    }}
                  />
                  <div
                    style={{
                      width: 0,
                      height: 0,
                      borderTop: "6px solid transparent",
                      borderBottom: "6px solid transparent",
                      borderLeft: `10px solid ${C.orange}`,
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Social proof */}
      <FadeIn delay={200} style={{ marginTop: 50 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            backgroundColor: `${C.green}10`,
            padding: "12px 24px",
            borderRadius: 40,
            border: `1px solid ${C.green}33`,
          }}
        >
          <span style={{ color: C.green, fontSize: 16, fontWeight: 600 }}>
            ✓ Bereits im Einsatz bei Logistikunternehmen in Portugal
          </span>
        </div>
      </FadeIn>
    </AbsoluteFill>
  );
}

// ═══════════════════════════════════════════════════════════
//  SCENE 7: CTA
// ═══════════════════════════════════════════════════════════
function SceneCTA() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Pulsing button
  const pulse = Math.sin(frame * 0.12) * 0.03 + 1;

  const btnSpring = spring({
    frame: frame - 80,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.dark,
        fontFamily,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.orange}08, transparent 70%)`,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Main question */}
      <FadeIn delay={10}>
        <h1
          style={{
            color: C.white,
            fontSize: 68,
            fontWeight: 800,
            textAlign: "center",
            letterSpacing: -2,
            margin: 0,
            lineHeight: 1.15,
          }}
        >
          Bereit, WhatsApp
          <br />
          <span style={{ color: C.whatsapp }}>hinter dir zu lassen</span>?
        </h1>
      </FadeIn>

      {/* Pricing */}
      <FadeIn delay={45} style={{ marginTop: 32 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <div
            style={{
              backgroundColor: C.darkCard,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: "16px 28px",
              textAlign: "center",
            }}
          >
            <div style={{ color: C.muted, fontSize: 13, marginBottom: 4 }}>Ab</div>
            <div style={{ color: C.white, fontSize: 32, fontWeight: 800 }}>
              €2<span style={{ fontSize: 16, fontWeight: 400, color: C.muted }}>/Mitarbeiter/Mo</span>
            </div>
          </div>
          <div
            style={{
              backgroundColor: C.orange,
              borderRadius: 12,
              padding: "16px 28px",
              textAlign: "center",
              border: `1px solid ${C.orangeGlow}`,
            }}
          >
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, marginBottom: 4 }}>
              Empfohlen
            </div>
            <div style={{ color: C.white, fontSize: 32, fontWeight: 800 }}>
              €4<span style={{ fontSize: 16, fontWeight: 400, color: "rgba(255,255,255,0.7)" }}>/Mitarbeiter/Mo</span>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* CTA Button */}
      <div
        style={{
          marginTop: 48,
          transform: `scale(${interpolate(ease(btnSpring), [0, 1], [0.8, 1]) * pulse})`,
          opacity: ease(btnSpring),
        }}
      >
        <div
          style={{
            backgroundColor: C.orange,
            color: C.white,
            padding: "20px 64px",
            borderRadius: 16,
            fontSize: 24,
            fontWeight: 700,
            boxShadow: `0 8px 32px ${C.orange}55`,
            cursor: "pointer",
          }}
        >
          Jetzt starten
        </div>
      </div>

      {/* Website */}
      <FadeIn delay={100} style={{ marginTop: 28 }}>
        <span style={{ color: C.muted, fontSize: 20 }}>
          traggo.io
        </span>
      </FadeIn>

      {/* Logo */}
      <FadeIn delay={110} style={{ position: "absolute", bottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, opacity: 0.4 }}>
          <Img src={staticFile("logo-white.svg")} style={{ width: 24, height: 24 }} />
          <span style={{ color: C.white, fontSize: 14, fontWeight: 600 }}>
            Tra<span style={{ color: C.teal }}>gg</span>o
          </span>
        </div>
      </FadeIn>
    </AbsoluteFill>
  );
}

// ═══════════════════════════════════════════════════════════
//  MAIN COMPOSITION
// ═══════════════════════════════════════════════════════════
export const TraggoVideoDe: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.dark, fontFamily }}>
      {/* Background ambient music */}
      <Audio src={staticFile("bg-music.mp3")} volume={0.10} />

      {/* Voiceover narration per scene */}
      <Sequence from={T.HOOK.start + 15}>
        <Audio src={staticFile("vo-scene1-de.mp3")} volume={0.9} />
      </Sequence>
      <Sequence from={T.PAIN.start + 15}>
        <Audio src={staticFile("vo-scene2-de.mp3")} volume={0.9} />
      </Sequence>
      <Sequence from={T.REVEAL.start + 10}>
        <Audio src={staticFile("vo-scene3-de.mp3")} volume={0.9} />
      </Sequence>
      <Sequence from={T.DASHBOARD.start + 15}>
        <Audio src={staticFile("vo-scene4-de.mp3")} volume={0.9} />
      </Sequence>
      <Sequence from={T.MOBILE.start + 15}>
        <Audio src={staticFile("vo-scene5-de.mp3")} volume={0.9} />
      </Sequence>
      <Sequence from={T.HOW.start + 10}>
        <Audio src={staticFile("vo-scene6-de.mp3")} volume={0.9} />
      </Sequence>
      <Sequence from={T.CTA.start + 15}>
        <Audio src={staticFile("vo-scene7-de.mp3")} volume={0.9} />
      </Sequence>

      {/* Scene 1: Hook — WhatsApp Chaos */}
      <Sequence from={T.HOOK.start} durationInFrames={T.HOOK.dur}>
        <SceneFade sceneStart={0} sceneDur={T.HOOK.dur} fadeIn={0} fadeOut={20}>
          <SceneHook />
        </SceneFade>
      </Sequence>

      {/* Scene 2: Pain Points */}
      <Sequence from={T.PAIN.start} durationInFrames={T.PAIN.dur}>
        <SceneFade sceneStart={0} sceneDur={T.PAIN.dur}>
          <ScenePain />
        </SceneFade>
      </Sequence>

      {/* Scene 3: Solution Reveal */}
      <Sequence from={T.REVEAL.start} durationInFrames={T.REVEAL.dur}>
        <SceneFade sceneStart={0} sceneDur={T.REVEAL.dur}>
          <SceneReveal />
        </SceneFade>
      </Sequence>

      {/* Scene 4: Dashboard Showcase */}
      <Sequence from={T.DASHBOARD.start} durationInFrames={T.DASHBOARD.dur}>
        <SceneFade sceneStart={0} sceneDur={T.DASHBOARD.dur}>
          <SceneDashboard />
        </SceneFade>
      </Sequence>

      {/* Scene 5: Mobile App */}
      <Sequence from={T.MOBILE.start} durationInFrames={T.MOBILE.dur}>
        <SceneFade sceneStart={0} sceneDur={T.MOBILE.dur}>
          <SceneMobile />
        </SceneFade>
      </Sequence>

      {/* Scene 6: How It Works */}
      <Sequence from={T.HOW.start} durationInFrames={T.HOW.dur}>
        <SceneFade sceneStart={0} sceneDur={T.HOW.dur}>
          <SceneHowItWorks />
        </SceneFade>
      </Sequence>

      {/* Scene 7: CTA */}
      <Sequence from={T.CTA.start} durationInFrames={T.CTA.dur}>
        <SceneFade sceneStart={0} sceneDur={T.CTA.dur} fadeIn={15} fadeOut={0}>
          <SceneCTA />
        </SceneFade>
      </Sequence>
    </AbsoluteFill>
  );
};
