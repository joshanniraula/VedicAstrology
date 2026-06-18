"use client";

import { InputForm } from "@/components/InputForm";

/* ─── Stars ───────────────────────────────────────────────── */
const STARS = [
  { top:"4%",  left:"8%",  s:2, d:0,   o:0.8 },
  { top:"12%", left:"72%", s:1, d:1.2, o:0.6 },
  { top:"20%", left:"35%", s:2, d:0.5, o:0.9 },
  { top:"30%", left:"91%", s:1, d:2.1, o:0.5 },
  { top:"42%", left:"3%",  s:3, d:0.8, o:0.7 },
  { top:"55%", left:"57%", s:1, d:1.6, o:0.8 },
  { top:"68%", left:"22%", s:2, d:0.3, o:0.6 },
  { top:"78%", left:"88%", s:2, d:2.4, o:0.9 },
  { top:"88%", left:"45%", s:1, d:1.0, o:0.5 },
  { top:"6%",  left:"52%", s:2, d:3.0, o:0.7 },
  { top:"58%", left:"80%", s:1, d:0.7, o:0.8 },
  { top:"25%", left:"15%", s:3, d:1.9, o:0.6 },
  { top:"72%", left:"33%", s:1, d:2.7, o:0.9 },
  { top:"10%", left:"28%", s:2, d:0.6, o:0.5 },
  { top:"93%", left:"12%", s:2, d:2.2, o:0.6 },
];

/* ─── Floating Sanskrit particles ─────────────────────────── */
const PARTICLES = [
  { sym:"ॐ", bottom:"18%", left:"8%",  delay:0,   dur:9  },
  { sym:"✦", bottom:"12%", left:"28%", delay:2.5, dur:11 },
  { sym:"ॐ", bottom:"20%", left:"48%", delay:5,   dur:8  },
  { sym:"☯", bottom:"10%", left:"68%", delay:1.5, dur:12 },
  { sym:"ॐ", bottom:"15%", left:"86%", delay:3.8, dur:10 },
  { sym:"✦", bottom:"25%", left:"18%", delay:6,   dur:9  },
  { sym:"☽", bottom:"8%",  left:"55%", delay:4.2, dur:11 },
  { sym:"✦", bottom:"5%",  left:"38%", delay:7,   dur:10 },
];

/* ─── Animated Solar System ───────────────────────────────── */
const PLANETS = [
  { name:"Mercury", r:60,  size:5,  color:"#b0b0b0", dur:6,   startDeg:20  },
  { name:"Venus",   r:90,  size:8,  color:"#e8cda0", dur:11,  startDeg:75  },
  { name:"Earth",   r:125, size:9,  color:"#4fa3e0", dur:18,  startDeg:140 },
  { name:"Mars",    r:162, size:6,  color:"#c1440e", dur:28,  startDeg:210 },
  { name:"Jupiter", r:210, size:18, color:"#c88b3a", dur:45,  startDeg:280 },
  { name:"Saturn",  r:258, size:13, color:"#e4d191", dur:65,  startDeg:50  },
  { name:"Uranus",  r:300, size:10, color:"#7de8e8", dur:80,  startDeg:170 },
  { name:"Neptune", r:338, size:9,  color:"#3f54ba", dur:100, startDeg:300 },
];

function SolarSystem() {
  const W = 730, H = 730;
  const cx = W / 2, cy = H / 2;

  return (
    <div
      className="pointer-events-none absolute z-[1] overflow-hidden"
      style={{
        top: "50%", left: "2%",
        transform: "translateY(-50%)",
        width: W, height: H,
        opacity: 0.52,
      }}
    >
      {/* Sun */}
      <div
        className="absolute rounded-full animate-breathe"
        style={{
          width: 46, height: 46,
          top: cy - 23, left: cx - 23,
          background: "radial-gradient(circle, #fff9d6 0%, #fef08a 30%, #fbbf24 65%, #f59e0b 85%)",
          boxShadow:
            "0 0 28px 14px rgba(251,191,36,0.45), 0 0 70px 35px rgba(251,191,36,0.18), 0 0 130px 65px rgba(251,191,36,0.07)",
        }}
      />

      {/* Asteroid belt */}
      <div
        className="absolute rounded-full"
        style={{
          width: 370, height: 370,
          top: cy - 185, left: cx - 185,
          border: "1px dashed rgba(255,255,255,0.07)",
        }}
      />

      {/* Orbit rings + planets */}
      {PLANETS.map((p) => {
        const delay = `${-(p.startDeg / 360) * p.dur}s`;
        const isEarth   = p.name === "Earth";
        const isJupiter = p.name === "Jupiter";
        const isSaturn  = p.name === "Saturn";

        const planetBg = isEarth
          ? "radial-gradient(circle at 35% 30%, #a7f3d0, #4fa3e0 55%, #1e3a5f)"
          : isJupiter
          ? "radial-gradient(circle at 40% 40%, #f5c264, #c88b3a 50%, #8b5f1f)"
          : `radial-gradient(circle at 35% 30%, ${p.color}cc, ${p.color} 60%, ${p.color}88)`;

        return (
          <div key={p.name}>
            {/* Orbit ring */}
            <div
              className="absolute rounded-full"
              style={{
                width: p.r * 2, height: p.r * 2,
                top: cy - p.r, left: cx - p.r,
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            />

            {/* Rotating container */}
            <div
              className="absolute"
              style={{
                width: p.r * 2, height: p.r * 2,
                top: cy - p.r, left: cx - p.r,
                animation: `spin-slow ${p.dur}s linear ${delay} infinite`,
                transformOrigin: "50% 50%",
              }}
            >
              {/* Planet */}
              <div
                className="absolute rounded-full"
                style={{
                  width: p.size, height: p.size,
                  top: 0, left: "50%",
                  transform: "translate(-50%, -50%)",
                  background: planetBg,
                  boxShadow: `0 0 ${p.size + 5}px ${p.color}90`,
                }}
              >
                {/* Saturn rings */}
                {isSaturn && (
                  <div
                    style={{
                      position: "absolute",
                      width: p.size * 2.6, height: p.size * 0.45,
                      border: "2.5px solid rgba(228,209,145,0.5)",
                      borderRadius: "50%",
                      top: "50%", left: "50%",
                      transform: "translate(-50%, -50%) rotateX(68deg)",
                      boxShadow: "0 0 6px rgba(228,209,145,0.2)",
                    }}
                  />
                )}
                {/* Earth moon */}
                {isEarth && (
                  <div
                    className="absolute rounded-full"
                    style={{
                      width: 4, height: 4,
                      background: "#e0e0e0",
                      top: -12, left: "50%",
                      transform: "translateX(-50%)",
                      boxShadow: "0 0 4px rgba(224,224,224,0.6)",
                      animation: `spin-slow 2s linear infinite`,
                      transformOrigin: "50% 12px",
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Feature chips ───────────────────────────────────────── */
const FEATURES = [
  { icon:"🗺️", label:"North Indian Chart" },
  { icon:"🪐", label:"Planetary Positions" },
  { icon:"⏳", label:"Dasha Periods" },
  { icon:"🔮", label:"Remedial Mantras" },
  { icon:"🔢", label:"Numerology" },
  { icon:"🌟", label:"Avakahada Chakra" },
];

/* ═══════════════════════════════════════════════════════════ */
export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#030212] text-white overflow-hidden">

      {/* ── Nebula blobs ────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0" style={{ background:"radial-gradient(ellipse 80% 60% at 20% 40%, rgba(99,102,241,0.16) 0%, transparent 60%)" }} />
        <div className="absolute inset-0" style={{ background:"radial-gradient(ellipse 60% 70% at 80% 60%, rgba(192,132,252,0.10) 0%, transparent 55%)" }} />
        <div className="animate-nebula absolute top-[-10%] left-[-5%] w-[55%] h-[55%] rounded-full"
          style={{ opacity:0.35, background:"radial-gradient(circle, rgba(99,102,241,0.35), transparent 70%)" }} />
        <div className="animate-nebula absolute bottom-[-15%] right-[-5%] w-[50%] h-[55%] rounded-full"
          style={{ animationDelay:"3s", opacity:0.25, background:"radial-gradient(circle, rgba(192,132,252,0.3), transparent 70%)" }} />
      </div>

      {/* ── Animated Solar System (background) ─────────────── */}
      <SolarSystem />

      {/* ── Stars ───────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 z-[2]">
        {STARS.map((s, i) => (
          <div key={i} className="absolute rounded-full bg-white animate-twinkle"
            style={{ top:s.top, left:s.left, width:s.s, height:s.s,
              animationDelay:s.d+"s", opacity:s.o }} />
        ))}
      </div>

      {/* ── Floating Sanskrit particles ─────────────────────── */}
      <div className="pointer-events-none absolute inset-0 z-[2] select-none overflow-hidden">
        {PARTICLES.map((p, i) => (
          <span key={i} className="absolute animate-float-up"
            style={{
              bottom:p.bottom, left:p.left,
              fontSize:22, color:"rgba(251,191,36,0.75)",
              animationDelay:p.delay+"s", animationDuration:p.dur+"s",
              opacity:0, filter:"blur(0.4px)",
            }}>
            {p.sym}
          </span>
        ))}
      </div>

      {/* ── Top accent line ─────────────────────────────────── */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent z-10" />

      {/* ── Header ──────────────────────────────────────────── */}
      <header className="relative z-20 px-8 md:px-14 py-5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="text-2xl animate-breathe inline-block" style={{ color:"rgba(251,191,36,0.9)" }}>ॐ</span>
          <span className="font-serif text-lg font-bold tracking-wide text-amber-100/80">Vedic Mystery</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Live · Astronomy Engine
        </div>
      </header>

      {/* ── Two-panel grid ──────────────────────────────────── */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[calc(100vh-65px)]">

        {/* ════ LEFT – Hero ════ */}
        <div className="flex flex-col justify-center px-8 md:px-12 lg:px-14 py-10"
          style={{ minHeight:"calc(100vh - 65px)" }}>

          {/* Breathing OM */}
          <div className="mb-3 animate-slide-up" style={{ animationDelay:"0.1s" }}>
            <span className="text-6xl font-serif animate-breathe inline-block" style={{ color:"rgba(251,191,36,0.75)" }}>ॐ</span>
          </div>

          {/* Title */}
          <div className="mb-6 animate-slide-up" style={{ animationDelay:"0.18s" }}>
            <h1 className="font-serif font-black leading-none tracking-tight">
              <span className="block text-4xl md:text-5xl xl:text-6xl text-indigo-200/60 font-medium mb-2">Discover Your</span>
              <span className="block text-5xl md:text-6xl xl:text-7xl shimmer-text">Cosmic Self</span>
            </h1>
          </div>

          {/* Subtitle */}
          <div className="mb-10 animate-slide-up" style={{ animationDelay:"0.26s" }}>
            <p className="text-base text-indigo-200/50 max-w-md leading-relaxed">
              Generate a complete <span className="text-indigo-100/80 font-semibold">Vedic birth chart</span> using your exact birth time and place.
              Supports both <span className="text-amber-300/80 font-semibold">AD and Bikram Sambat (BS)</span> dates.
            </p>
          </div>

          {/* Feature chips */}
          <div className="flex flex-wrap gap-2">
            {FEATURES.map((f, i) => (
              <div key={f.label}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
                  text-indigo-200/65 border border-indigo-500/20 bg-black/25 backdrop-blur-sm
                  hover:border-amber-500/40 hover:text-amber-200/80 hover:bg-amber-500/5
                  transition-all duration-300 cursor-default animate-slide-up"
                style={{ animationDelay:(0.34 + i * 0.06)+"s" }}>
                <span className="text-base">{f.icon}</span>
                <span>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ════ RIGHT – Form ════ */}
        <div className="relative flex flex-col justify-center px-6 md:px-10 lg:px-12 py-10">
          {/* Divider */}
          <div className="hidden lg:block absolute left-0 top-[8%] bottom-[8%] w-px"
            style={{ background:"linear-gradient(to bottom, transparent, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.08) 80%, transparent)" }} />

          {/* Right panel glow */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background:"radial-gradient(ellipse 70% 70% at 70% 50%, rgba(99,102,241,0.06), transparent)" }} />

          {/* Heading */}
          <div className="mb-6 animate-slide-up" style={{ animationDelay:"0.35s" }}>
            <h2 className="font-serif text-2xl font-bold text-white/90 mb-1">Reveal Your Kundali</h2>
            <p className="text-sm text-indigo-300/45">Enter birth details below — takes under 30 seconds</p>
          </div>

          {/* Form */}
          <div className="animate-slide-up" style={{ animationDelay:"0.45s" }}>
            <InputForm />
          </div>

          {/* Trust row */}
          <div className="mt-5 flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay:"0.55s" }}>
            {[
              { dot:"bg-green-400",  text:"Astronomy Engine" },
              { dot:"bg-amber-400",  text:"AD & BS dates" },
              { dot:"bg-blue-400",   text:"PDF export" },
              { dot:"bg-purple-400", text:"100% private" },
            ].map((t) => (
              <span key={t.text} className="flex items-center gap-1.5 text-[11px] text-indigo-400/45 font-medium">
                <span className={`w-1.5 h-1.5 rounded-full ${t.dot} opacity-70`} />
                {t.text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom line ─────────────────────────────────────── */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
    </main>
  );
}
