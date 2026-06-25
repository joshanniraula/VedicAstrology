"use client"

import React, { useState, useEffect } from 'react'
import { Search, Loader2, Sparkles, Calendar, MapPin } from 'lucide-react'
import { searchPlanetaryConfiguration, RequiredPlanetConfig, SearchResult } from '@/lib/astrology/reverse-calc'
import { getPlanetStrength } from '@/lib/astrology/strength'
import { DateTime } from 'luxon'
import tzlookup from '@photostructure/tz-lookup'
import dynamic from 'next/dynamic'

// Leaflet map component must be dynamically imported with SSR disabled
const MapSelector = dynamic(() => import('./MapSelector'), { 
    ssr: false,
    loading: () => <div className="w-full h-48 bg-black/40 border border-white/10 rounded-xl flex items-center justify-center animate-pulse"><MapPin className="w-8 h-8 text-white/20" /></div>
})

const PLANETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]
const RASHIS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
const PLANET_SYMBOLS: Record<string, string> = { "Sun": "Su", "Moon": "Mo", "Mars": "Ma", "Mercury": "Me", "Jupiter": "Ju", "Venus": "Ve", "Saturn": "Sa", "Rahu": "Ra", "Ketu": "Ke" }

export default function UltraVisionChart() {
    const [ascendantSign, setAscendantSign] = useState<number>(4) // Cancer Default
    const [placedPlanets, setPlacedPlanets] = useState<Record<number, string[]>>({})
    const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null)
    
    // Search states
    const [locationCoords, setLocationCoords] = useState<{lat: number, lon: number}>({ lat: 27.7172, lon: 85.3240 }) // Default Kathmandu
    const [isSearching, setIsSearching] = useState(false)
    const [progress, setProgress] = useState(0)
    const [resultRanges, setResultRanges] = useState<{ start: Date, end: Date }[] | null>(null)
    const [searchDirection, setSearchDirection] = useState<'past' | 'future'>('future')
    const [toast, setToast] = useState<{ message: string, type: 'error' | 'warning' | 'info' } | null>(null)

    const showToast = (message: string, type: 'error' | 'warning' | 'info' = 'warning') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 4000)
    }

    const getAvailablePlanets = () => {
        const placed = Object.values(placedPlanets).flat()
        return PLANETS.filter(p => !placed.includes(p))
    }

    const handleHouseClick = (houseIndex: number) => {
        if (selectedPlanet) {
            setPlacedPlanets(prev => {
                const next = { ...prev }
                
                if (selectedPlanet === "Rahu" || selectedPlanet === "Ketu") {
                    Object.keys(next).forEach(key => {
                        next[Number(key)] = next[Number(key)].filter(p => p !== "Rahu" && p !== "Ketu")
                    })
                }

                if (!next[houseIndex]) next[houseIndex] = []
                if (!next[houseIndex].includes(selectedPlanet)) {
                    next[houseIndex].push(selectedPlanet)
                }

                if (selectedPlanet === "Rahu" || selectedPlanet === "Ketu") {
                    const oppositePlanet = selectedPlanet === "Rahu" ? "Ketu" : "Rahu"
                    const oppositeHouse = ((houseIndex - 1 + 6) % 12) + 1
                    if (!next[oppositeHouse]) next[oppositeHouse] = []
                    next[oppositeHouse].push(oppositePlanet)
                }

                return next
            })
            setSelectedPlanet(null)
        }
    }

    const handlePlanetRemove = (houseIndex: number, planet: string) => {
        setPlacedPlanets(prev => {
            const next = { ...prev }
            
            if (planet === "Rahu" || planet === "Ketu") {
                Object.keys(next).forEach(key => {
                    next[Number(key)] = next[Number(key)].filter(p => p !== "Rahu" && p !== "Ketu")
                })
            } else {
                next[houseIndex] = next[houseIndex].filter(p => p !== planet)
            }
            
            return next
        })
    }

    const startSearch = async () => {
        const required: RequiredPlanetConfig[] = []
        Object.entries(placedPlanets).forEach(([houseStr, planetsInHouse]) => {
            const houseNum = parseInt(houseStr)
            let signForHouse = ascendantSign + houseNum - 1
            if (signForHouse > 12) signForHouse -= 12

            planetsInHouse.forEach(p => {
                required.push({ planet: p, targetSignId: signForHouse })
            })
        })

        if (required.length === 0) {
            showToast("Please place at least one planet on the chart.", "warning")
            return
        }

        setIsSearching(true)
        setProgress(0)
        setResultRanges(null)

        const currentYear = new Date().getFullYear()
        const targetYear = searchDirection === 'past' ? currentYear - 10000 : currentYear + 10000

        try {
            const res = await searchPlanetaryConfiguration(
                required,
                ascendantSign,
                locationCoords.lat,
                locationCoords.lon,
                currentYear, 
                targetYear, 
                (p) => setProgress(p)
            )
            if (res && res.length > 0) {
                setResultRanges(res.map(r => ({ start: r.startDate, end: r.endDate })))
            } else {
                showToast("No matching configuration found in the selected 10,000-year range.", "info")
            }
        } catch (e: any) {
            console.error(e)
            showToast("Search failed: " + e.message, "error")
        } finally {
            setIsSearching(false)
        }
    }

    // Chart Renderer Helper
    const HouseZone = ({ house, className }: { house: number, className: string }) => {
        const planets = placedPlanets[house] || []
        
        let signNum = ascendantSign + house - 1
        if (signNum > 12) signNum -= 12

        return (
            <div 
                onClick={() => handleHouseClick(house)}
                className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center gap-1 z-20 transition-all ${selectedPlanet ? 'cursor-pointer hover:bg-purple-500/20 rounded-full w-16 h-16' : ''} ${className}`}
            >
                <div className="flex flex-wrap justify-center content-center gap-x-2 gap-y-1 w-full">
                    {planets.map((p) => {
                        const strength = getPlanetStrength(p, signNum)
                        let strengthColor = 'bg-white/20'
                        if (strength === 'Exalted') strengthColor = 'bg-green-400 border border-green-200'
                        if (strength === 'Debilitated') strengthColor = 'bg-red-500 border border-red-300'
                        if (strength === 'Own House') strengthColor = 'bg-blue-400 border border-blue-200'

                        return (
                            <div 
                                key={p} 
                                onClick={(e) => { e.stopPropagation(); handlePlanetRemove(house, p) }}
                                className="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform group relative"
                            >
                                <div className="flex flex-row items-baseline bg-purple-900/40 px-1.5 py-0.5 rounded shadow-lg shadow-purple-900/50 border border-purple-500/30">
                                    <span className="text-[12px] font-bold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] leading-tight">
                                        {PLANET_SYMBOLS[p]}
                                    </span>
                                </div>
                                
                                {/* Strength Indicator Dot */}
                                {strength && (
                                    <div 
                                        className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full shadow-sm ${strengthColor}`} 
                                        title={strength}
                                    />
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    const getHouseSign = (house: number) => {
        let signNum = ascendantSign + house - 1
        if (signNum > 12) signNum -= 12
        return signNum
    }

    return (
        <div className="flex flex-col xl:flex-row gap-8 w-full h-full relative">
            
            {/* Custom Toast Notification */}
            {toast && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-8 duration-300">
                    <div className={`px-6 py-3 rounded-full border shadow-2xl backdrop-blur-md flex items-center gap-3 ${
                        toast.type === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-100' :
                        toast.type === 'info' ? 'bg-blue-500/20 border-blue-500/50 text-blue-100' :
                        'bg-amber-500/20 border-amber-500/50 text-amber-100'
                    }`}>
                        <div className={`w-2 h-2 rounded-full ${
                            toast.type === 'error' ? 'bg-red-400' :
                            toast.type === 'info' ? 'bg-blue-400' : 'bg-amber-400'
                        } animate-pulse`}></div>
                        <span className="font-medium">{toast.message}</span>
                    </div>
                </div>
            )}

            {/* LEFT COLUMN: Controls */}
            <div className="w-full xl:w-1/4 space-y-8 bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-xl flex-shrink-0 h-full overflow-y-auto custom-scrollbar">
                <div>
                    <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-purple-400" />
                        Ascendant & Location
                    </h3>
                    <div className="space-y-4">
                        <select 
                            value={ascendantSign}
                            onChange={(e) => setAscendantSign(Number(e.target.value))}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        >
                            {RASHIS.map((r, i) => (
                                <option key={r} value={i + 1}>{i + 1} - {r}</option>
                            ))}
                        </select>
                        
                        <div>
                            <p className="text-sm text-white/50 mb-2">Pinpoint Target Location</p>
                            
                            {/* City Search for Map Jump */}
                            <div className="flex gap-2 mb-3">
                                <input 
                                    type="text"
                                    id="citySearch"
                                    placeholder="Search city to jump map..."
                                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                    onKeyDown={async (e) => {
                                        if (e.key === 'Enter') {
                                            const val = e.currentTarget.value;
                                            if (!val.trim()) return;
                                            try {
                                                const query = encodeURIComponent(val.trim());
                                                const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;
                                                const res = await fetch(url);
                                                const data = await res.json();
                                                if (data && data.length > 0) {
                                                    setLocationCoords({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
                                                    showToast(`Map jumped to ${val}`, 'info');
                                                } else {
                                                    showToast("City not found.", "error");
                                                }
                                            } catch (err) {
                                                showToast("Search failed.", "error");
                                            }
                                        }
                                    }}
                                />
                            </div>

                            <MapSelector coords={locationCoords} onChange={setLocationCoords} />
                            <p className="text-xs text-white/40 mt-1 text-right">
                                Lat: {locationCoords.lat.toFixed(4)}, Lon: {locationCoords.lon.toFixed(4)}
                            </p>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                        Planets Dock
                    </h3>
                    <p className="text-sm text-white/50 mb-3">Select a planet, then click a house to place it.</p>
                    <div className="flex flex-wrap gap-2">
                        {getAvailablePlanets().map(p => (
                            <button
                                key={p}
                                onClick={() => setSelectedPlanet(selectedPlanet === p ? null : p)}
                                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all border ${selectedPlanet === p ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'bg-black/30 border-white/10 text-white/70 hover:bg-white/10'}`}
                            >
                                {p} ({PLANET_SYMBOLS[p]})
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                    <div className="flex gap-2 mb-4">
                        <button 
                            onClick={() => setSearchDirection('past')}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${searchDirection === 'past' ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-transparent border-white/10 text-white/60'}`}
                        >
                            Search Past
                        </button>
                        <button 
                            onClick={() => setSearchDirection('future')}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${searchDirection === 'future' ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-transparent border-white/10 text-white/60'}`}
                        >
                            Search Future
                        </button>
                    </div>

                    <button
                        onClick={startSearch}
                        disabled={isSearching}
                        className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/25 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isSearching ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Calculating ({(progress * 100).toFixed(0)}%)
                            </>
                        ) : (
                            <>
                                <Search className="w-5 h-5" />
                                Find Alignment Range
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* MIDDLE COLUMN: Chart */}
            <div className="w-full xl:w-2/4 bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/10 shadow-xl flex items-center justify-center relative overflow-hidden flex-grow h-full">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[conic-gradient(from_90deg_at_50%_50%,#00000000_50%,#a855f71a_100%)] animate-spin-slow pointer-events-none rounded-full"></div>
                <div className={`absolute -top-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] transition-all duration-1000 ${selectedPlanet ? 'scale-150 opacity-50' : 'opacity-20'}`} />
                <div className={`absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] transition-all duration-1000 ${isSearching ? 'scale-150 opacity-80 animate-pulse' : 'opacity-20'}`} />

                <div className="relative select-none bg-slate-950/90 rounded-2xl border border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.15)] flex items-center justify-center max-w-full max-h-full">
                    {/* Invisible SVG that forces a perfect square */}
                    <svg viewBox="0 0 100 100" className="opacity-0 pointer-events-none max-w-full max-h-full" style={{ height: '1000px' }} />
                    
                    <div className="absolute inset-0 overflow-hidden rounded-2xl">
                        {/* Chart Lines */}
                        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-2xl z-0">
                            <rect x="2" y="2" width="96" height="96" fill="transparent" stroke="rgba(168,85,247,0.4)" strokeWidth="0.5" />
                            <line x1="2" y1="2" x2="98" y2="98" stroke="rgba(168,85,247,0.4)" strokeWidth="0.5" />
                            <line x1="2" y1="98" x2="98" y2="2" stroke="rgba(168,85,247,0.4)" strokeWidth="0.5" />
                            <polygon points="50,2 98,50 50,98 2,50" fill="transparent" stroke="rgba(168,85,247,0.4)" strokeWidth="0.5" />
                        </svg>

                        {/* House Numbers & Zones Overlay */}
                        <div className="absolute inset-0 pointer-events-none z-10">
                            {/* House 1 (top-center triangle tip) */}
                            <div className="absolute top-[8%] left-[50%] -translate-x-1/2 text-[11px] lg:text-[13px] font-sans text-purple-400 font-bold opacity-80">{getHouseSign(1)}</div>
                            {/* House 2 (top-left triangle) */}
                            <div className="absolute top-[8%] left-[25%] -translate-x-1/2 text-[11px] lg:text-[13px] font-sans text-purple-400 font-bold opacity-80">{getHouseSign(2)}</div>
                            {/* House 3 (left-top triangle) */}
                            <div className="absolute top-[25%] left-[8%] -translate-y-1/2 text-[11px] lg:text-[13px] font-sans text-purple-400 font-bold opacity-80">{getHouseSign(3)}</div>
                            {/* House 4 (left-center triangle tip) */}
                            <div className="absolute top-[50%] left-[8%] -translate-y-1/2 text-[11px] lg:text-[13px] font-sans text-purple-400 font-bold opacity-80">{getHouseSign(4)}</div>
                            {/* House 5 (left-bottom triangle) */}
                            <div className="absolute top-[75%] left-[8%] -translate-y-1/2 text-[11px] lg:text-[13px] font-sans text-purple-400 font-bold opacity-80">{getHouseSign(5)}</div>
                            {/* House 6 (bottom-left triangle) */}
                            <div className="absolute bottom-[8%] left-[25%] -translate-x-1/2 text-[11px] lg:text-[13px] font-sans text-purple-400 font-bold opacity-80">{getHouseSign(6)}</div>
                            {/* House 7 (bottom-center triangle tip) */}
                            <div className="absolute bottom-[8%] left-[50%] -translate-x-1/2 text-[11px] lg:text-[13px] font-sans text-purple-400 font-bold opacity-80">{getHouseSign(7)}</div>
                            {/* House 8 (bottom-right triangle) */}
                            <div className="absolute bottom-[8%] left-[75%] -translate-x-1/2 text-[11px] lg:text-[13px] font-sans text-purple-400 font-bold opacity-80">{getHouseSign(8)}</div>
                            {/* House 9 (right-bottom triangle) */}
                            <div className="absolute top-[75%] right-[8%] -translate-y-1/2 text-[11px] lg:text-[13px] font-sans text-purple-400 font-bold opacity-80">{getHouseSign(9)}</div>
                            {/* House 10 (right-center triangle tip) */}
                            <div className="absolute top-[50%] right-[8%] -translate-y-1/2 text-[11px] lg:text-[13px] font-sans text-purple-400 font-bold opacity-80">{getHouseSign(10)}</div>
                            {/* House 11 (right-top triangle) */}
                            <div className="absolute top-[25%] right-[8%] -translate-y-1/2 text-[11px] lg:text-[13px] font-sans text-purple-400 font-bold opacity-80">{getHouseSign(11)}</div>
                            {/* House 12 (top-right triangle) */}
                            <div className="absolute top-[8%] left-[75%] -translate-x-1/2 text-[11px] lg:text-[13px] font-sans text-purple-400 font-bold opacity-80">{getHouseSign(12)}</div>

                            {/* Clickable House Zones */}
                            <HouseZone house={1} className="top-[25%] left-[50%] w-[25%] h-[25%] pointer-events-auto" />
                            <HouseZone house={2} className="top-[12%] left-[25%] w-[20%] h-[20%] pointer-events-auto" />
                            <HouseZone house={3} className="top-[25%] left-[12%] w-[20%] h-[20%] pointer-events-auto" />
                            <HouseZone house={4} className="top-[50%] left-[25%] w-[25%] h-[25%] pointer-events-auto" />
                            <HouseZone house={5} className="top-[75%] left-[12%] w-[20%] h-[20%] pointer-events-auto" />
                            <HouseZone house={6} className="top-[88%] left-[25%] w-[20%] h-[20%] pointer-events-auto" />
                            <HouseZone house={7} className="top-[75%] left-[50%] w-[25%] h-[25%] pointer-events-auto" />
                            <HouseZone house={8} className="top-[88%] left-[75%] w-[20%] h-[20%] pointer-events-auto" />
                            <HouseZone house={9} className="top-[75%] left-[88%] w-[20%] h-[20%] pointer-events-auto" />
                            <HouseZone house={10} className="top-[50%] left-[75%] w-[25%] h-[25%] pointer-events-auto" />
                            <HouseZone house={11} className="top-[25%] left-[88%] w-[20%] h-[20%] pointer-events-auto" />
                            <HouseZone house={12} className="top-[12%] left-[75%] w-[20%] h-[20%] pointer-events-auto" />
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Results */}
            <div className="w-full xl:w-1/4 flex-shrink-0 h-full overflow-hidden">
                {resultRanges && resultRanges.length > 0 ? (
                    <div className="p-5 rounded-3xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/30 animate-in slide-in-from-right-4 fade-in duration-500 shadow-xl backdrop-blur-md h-full flex flex-col">
                        <h4 className="text-green-400 text-lg font-bold mb-4 sticky top-0 bg-transparent z-10 flex items-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            {resultRanges.length} Configuration(s) Found
                        </h4>
                        <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
                            {resultRanges.map((range, idx) => {
                                // Convert Date to local time zone of target
                                const tz = tzlookup(locationCoords.lat, locationCoords.lon) || 'UTC';
                                const startLocal = DateTime.fromJSDate(range.start).setZone(tz).toFormat('fff');
                                const endLocal = DateTime.fromJSDate(range.end).setZone(tz).toFormat('fff');

                                // Format data for the Verify URL
                                const dateIso = DateTime.fromJSDate(range.start).setZone(tz).toFormat('yyyy-MM-dd');
                                const timeIso = DateTime.fromJSDate(range.start).setZone(tz).toFormat('HH:mm');
                                const verifyUrl = `/?verify=true&dob=${dateIso}&tob=${timeIso}&lat=${locationCoords.lat}&lon=${locationCoords.lon}&tz=${tz}`;

                                return (
                                    <div key={idx} className="bg-black/40 rounded-xl p-4 text-white text-sm space-y-2 border border-green-500/20 hover:border-green-500/40 transition-colors shadow-lg">
                                        <p className="flex justify-between items-start"><span className="text-white/50 w-12 shrink-0">Start:</span> <span className="font-medium text-right">{startLocal} ({tz})</span></p>
                                        <p className="flex justify-between items-start"><span className="text-white/50 w-12 shrink-0">End:</span> <span className="font-medium text-right">{endLocal} ({tz})</span></p>
                                        
                                        <div className="pt-3 mt-3 border-t border-white/10">
                                            <a 
                                                href={verifyUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-300 transition-colors border border-green-500/30 text-xs font-semibold"
                                            >
                                                Verify Kundali in Home Page
                                            </a>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <p className="text-xs text-white/40 mt-4 text-center">The planetary alignment and ascendant match perfectly within these time windows.</p>
                    </div>
                ) : (
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 shadow-xl backdrop-blur-md h-full flex flex-col items-center justify-center text-center text-white/30 border-dashed">
                        <Search className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-sm">Results will appear here<br/>after you run a search.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
