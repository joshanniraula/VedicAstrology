"use client"

import { useState } from 'react'
import { Sparkles, Lock, Unlock, ArrowRight } from 'lucide-react'
import UltraVisionChart from '@/components/UltraVisionChart'

export default function UltraVisionPage() {
    const [accessCode, setAccessCode] = useState("")
    const [isUnlocked, setIsUnlocked] = useState(false)
    const [error, setError] = useState(false)

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault()
        if (accessCode.trim() === "UltraVision") {
            setIsUnlocked(true)
            setError(false)
        } else {
            setError(true)
            setTimeout(() => setError(false), 2000)
        }
    }

    if (!isUnlocked) {
        return (
            <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-4">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-purple-900/20 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[20%] right-[20%] w-96 h-96 bg-indigo-900/20 rounded-full blur-[120px]"></div>
                </div>

                <div className={`relative z-10 w-full max-w-md backdrop-blur-xl bg-black/40 border border-white/10 p-8 rounded-2xl shadow-2xl transition-all duration-500 ${error ? 'animate-shake border-red-500/50' : ''}`}>
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                            {error ? <Lock className="w-8 h-8 text-white/90" /> : <Unlock className="w-8 h-8 text-white/90" />}
                        </div>
                        
                        <div className="space-y-2">
                            <h1 className="text-3xl font-light tracking-tight text-white">UltraVision <span className="font-semibold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Access</span></h1>
                            <p className="text-white/60 text-sm">Enter the required passcode to access advanced planetary reverse calculations.</p>
                        </div>

                        <form onSubmit={handleUnlock} className="w-full space-y-4">
                            <div className="relative">
                                <input
                                    type="password"
                                    value={accessCode}
                                    onChange={(e) => setAccessCode(e.target.value)}
                                    placeholder="Enter access code"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium py-3 rounded-xl shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 group"
                            >
                                Authenticate
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="h-screen overflow-hidden bg-[#0a0a1a] text-slate-200 flex flex-col">
            {/* Background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[150px]"></div>
                <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[150px]"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
            </div>

            <main className="relative z-10 container mx-auto px-4 py-4 max-w-[1600px] flex-1 min-h-0 flex flex-col">
                <header className="mb-4 text-center space-y-2 shrink-0">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-purple-300 text-xs font-medium mb-1">
                        <Sparkles className="w-3 h-3" />
                        <span>UltraVision Enabled</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-light tracking-tight text-white">
                        Reverse <span className="font-semibold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Astrology</span>
                    </h1>
                    <p className="text-sm text-white/50 max-w-2xl mx-auto font-light hidden sm:block">
                        Design a specific planetary alignment by placing planets in the Kundali. 
                        UltraVision will calculate the exact historical or future date and time this configuration occurs.
                    </p>
                </header>

                <div className="flex-1 min-h-0 w-full">
                    <UltraVisionChart />
                </div>
            </main>
        </div>
    )
}
