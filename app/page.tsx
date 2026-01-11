import { InputForm } from "@/components/InputForm";



export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#050510] text-white">
      {/* --- Cosmic Background Effects --- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-900/20 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent opacity-50" />
      </div>

      {/* --- Stars (Simple CSS dots) --- */}
      <div className="absolute inset-0 z-0 opacity-40">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              width: Math.random() * 3 + 'px',
              height: Math.random() * 3 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animationDelay: Math.random() * 5 + 's',
              opacity: Math.random() * 0.7
            }}
          />
        ))}
      </div>

      {/* --- Content --- */}
      <div className="z-10 w-full max-w-xl px-4 flex flex-col items-center gap-8">
        <div className="text-center space-y-4">
          <div className="inline-block px-3 py-1 text-xs font-medium tracking-widest text-indigo-300 uppercase bg-indigo-950/50 border border-indigo-800/50 rounded-full backdrop-blur-sm">
            Discover Your Cosmic Blueprint
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-medium tracking-tight bg-gradient-to-b from-amber-100 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(251,191,36,0.2)]">
            Vedic Mystery
          </h1>
          <p className="text-lg text-indigo-200/80 max-w-sm mx-auto leading-relaxed">
            Generate precise Janma Kundali charts with ancient wisdom and modern accuracy.
          </p>
        </div>

        <div className="w-full">
          <InputForm />
        </div>

        <footer className="text-xs text-indigo-400/30 font-medium tracking-wider">
          ENGINEERED WITH ASTRONOMY ENGINE
        </footer>
      </div>
    </main>
  );
}
