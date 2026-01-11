import React from 'react';
import { KundaliReport } from '@/lib/astrology/types';

export const NorthIndianChart = ({ data }: { data: KundaliReport }) => {
    // Helper to get planets in a house as an array
    const getPlanets = (house: number) => data.chart.houses[house] || [];

    const HouseContent = ({ house, className }: { house: number, className: string }) => {
        const planets = getPlanets(house);
        return (
            <div className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center gap-0 z-20 pointer-events-none ${className}`}>
                <div className="flex flex-wrap justify-center content-center gap-x-2 gap-y-1 w-full">
                    {planets.map((p, i) => (
                        <div key={i} className="flex flex-row items-baseline gap-0.5">
                            <span className="text-[10px] sm:text-[11px] font-bold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] leading-tight whitespace-nowrap">
                                {p.symbol}
                            </span>
                            <span className="text-[7px] sm:text-[8px] text-amber-300 font-bold">
                                {p.degree}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="relative w-full max-w-[500px] aspect-square mx-auto select-none p-2 bg-slate-950/80 rounded-xl border border-slate-800 shadow-2xl">
            {/* Chart Container */}
            <div className="relative w-full h-full">

                {/* SVG Lines - Subtle for Structure */}
                <svg viewBox="0 0 200 200" className="w-full h-full absolute top-0 left-0 z-0 pointer-events-none">
                    {/* Outer Box */}
                    <rect x="0" y="0" width="200" height="200" fill="#0f172a" stroke="#d97706" strokeWidth="1.5" strokeOpacity="0.3" />

                    {/* Diagonals (Cross) */}
                    <line x1="0" y1="0" x2="200" y2="200" stroke="#d97706" strokeWidth="1" strokeOpacity="0.3" />
                    <line x1="0" y1="200" x2="200" y2="0" stroke="#d97706" strokeWidth="1" strokeOpacity="0.3" />

                    {/* Inner Diamond (Midpoints) */}
                    <path d="M100 0 L200 100 L100 200 L0 100 Z" fill="none" stroke="#d97706" strokeWidth="1.5" strokeOpacity="0.3" />
                </svg>

                {/* --- House Sign Numbers (Rashi) --- */}
                {/* High Contrast for Clarity */}
                <div className="absolute top-[4%] left-[50%] -translate-x-1/2 text-[12px] font-sans text-amber-500 font-bold z-10">{data.chart.signs[1]}</div> {/* H1 */}
                <div className="absolute top-[2%] left-[15%] text-[12px] font-sans text-amber-500 font-bold z-10">{data.chart.signs[2]}</div> {/* H2 */}
                <div className="absolute top-[15%] left-[2%] text-[12px] font-sans text-amber-500 font-bold z-10">{data.chart.signs[3]}</div> {/* H3 */}
                <div className="absolute top-[50%] left-[4%] -translate-y-1/2 text-[12px] font-sans text-amber-500 font-bold z-10">{data.chart.signs[4]}</div> {/* H4 */}
                <div className="absolute bottom-[15%] left-[2%] text-[12px] font-sans text-amber-500 font-bold z-10">{data.chart.signs[5]}</div> {/* H5 */}
                <div className="absolute bottom-[2%] left-[15%] text-[12px] font-sans text-amber-500 font-bold z-10">{data.chart.signs[6]}</div> {/* H6 */}
                <div className="absolute bottom-[4%] left-[50%] -translate-x-1/2 text-[12px] font-sans text-amber-500 font-bold z-10">{data.chart.signs[7]}</div> {/* H7 */}
                <div className="absolute bottom-[2%] right-[15%] text-[12px] font-sans text-amber-500 font-bold z-10">{data.chart.signs[8]}</div> {/* H8 */}
                <div className="absolute bottom-[15%] right-[2%] text-[12px] font-sans text-amber-500 font-bold z-10">{data.chart.signs[9]}</div> {/* H9 */}
                <div className="absolute top-[50%] right-[4%] translate-y-[-50%] text-[12px] font-sans text-amber-500 font-bold z-10">{data.chart.signs[10]}</div> {/* H10 */}
                <div className="absolute top-[15%] right-[2%] text-[12px] font-sans text-amber-500 font-bold z-10">{data.chart.signs[11]}</div> {/* H11 */}
                <div className="absolute top-[2%] right-[15%] text-[12px] font-sans text-amber-500 font-bold z-10">{data.chart.signs[12]}</div> {/* H12 */}

                {/* --- Planet Lists --- */}
                {/* H1 */} <HouseContent house={1} className="top-[25%] left-[50%] w-[18%]" />
                {/* H2 */} <HouseContent house={2} className="top-[10%] left-[25%] w-[15%]" />
                {/* H3 */} <HouseContent house={3} className="top-[25%] left-[10%] w-[15%]" />
                {/* H4 */} <HouseContent house={4} className="top-[50%] left-[25%] w-[18%]" />
                {/* H5 */} <HouseContent house={5} className="top-[75%] left-[10%] w-[15%]" />
                {/* H6 */} <HouseContent house={6} className="top-[90%] left-[25%] w-[15%]" />
                {/* H7 */} <HouseContent house={7} className="top-[75%] left-[50%] w-[18%]" />
                {/* H8 */} <HouseContent house={8} className="top-[90%] left-[75%] w-[15%]" />
                {/* H9 */} <HouseContent house={9} className="top-[75%] left-[90%] w-[15%]" />
                {/* H10 */} <HouseContent house={10} className="top-[50%] left-[75%] w-[18%]" />
                {/* H11 */} <HouseContent house={11} className="top-[25%] left-[90%] w-[15%]" />
                {/* H12 */} <HouseContent house={12} className="top-[10%] left-[75%] w-[15%]" />

            </div>
        </div>
    );
};
