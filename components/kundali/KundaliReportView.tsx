import React, { useRef, useState } from 'react';
import { KundaliReport } from '@/lib/astrology/types';
import { NorthIndianChart } from './NorthIndianChart';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Printer, Download, Eye, EyeOff } from 'lucide-react';
import { BlobProvider } from '@react-pdf/renderer';
import { KundaliDocument } from '../pdf/KundaliDocument';

interface KundaliReportViewProps {
    data: KundaliReport;
}


// Memoized Download Button Component
const DownloadReportButton = React.memo(({ data, prediction, showPlanetaryPositions }: { data: KundaliReport, prediction: string, showPlanetaryPositions: boolean }) => {
    return (
        <BlobProvider
            key={`${data.birthDetails.name}-${prediction.length}`}
            document={<KundaliDocument data={data} showPlanetaryPositions={showPlanetaryPositions} prediction={prediction} />}
        >
            {({ url, loading, error }) => {
                if (error) {
                    console.error("PDF Generation Error:", error);
                }
                return (
                    <a
                        href={url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                            if (!url) {
                                e.preventDefault();
                                alert("PDF is still generating or failed. Please check console for details.");
                            }
                        }}
                        className={`
                        inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all
                        ${loading
                                ? 'bg-zinc-700 text-zinc-400 cursor-wait'
                                : error
                                    ? 'bg-red-600 text-white cursor-not-allowed'
                                    : 'bg-amber-600 hover:bg-amber-700 text-white hover:scale-105 shadow-lg shadow-amber-900/20'}
                    `}
                    >
                        {loading ? (
                            <span>Generating PDF...</span>
                        ) : error ? (
                            <span>Generation Failed</span>
                        ) : (
                            <>
                                <Download className="w-5 h-5" />
                                Download Full Report
                            </>
                        )}
                    </a>
                )
            }}
        </BlobProvider>
    );
});

DownloadReportButton.displayName = 'DownloadReportButton';

// Memoized Prediction Panel to isolate typing state
const PredictionPanel = React.memo(({ onDebouncedChange }: { onDebouncedChange: (val: string) => void }) => {
    const [prediction, setPrediction] = useState('');

    // Debounce internal state to parent
    React.useEffect(() => {
        const timer = setTimeout(() => {
            onDebouncedChange(prediction);
        }, 500); // 500ms is enough for a smooth feel

        return () => clearTimeout(timer);
    }, [prediction, onDebouncedChange]);

    return (
        <div className="space-y-4">
            <h3 className="text-amber-400 font-serif text-lg border-b border-amber-500/20 pb-2">Prediction</h3>
            <textarea
                className="w-full h-[400px] bg-indigo-950/30 border border-indigo-500/20 rounded-lg p-4 text-indigo-100 placeholder-indigo-400/30 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all font-sans leading-relaxed resize-none scrollbar-thin scrollbar-thumb-indigo-500/20"
                placeholder="Enter your detailed prediction and analysis here..."
                value={prediction}
                onChange={(e) => setPrediction(e.target.value)}
            />
        </div>
    );
});

PredictionPanel.displayName = 'PredictionPanel';

export function KundaliReportView({ data }: KundaliReportViewProps) {
    const [showPlanetaryPositions, setShowPlanetaryPositions] = useState(true);
    const [debouncedPrediction, setDebouncedPrediction] = useState('');

    const handlePredictionChange = React.useCallback((val: string) => {
        setDebouncedPrediction(val);
    }, []);


    const EXCLUDED_BENEFICS = [
        'unfavorablePlanets',
        'friendlyLagna',
        'favorableMetal',
        'favorableTime',
        'favorableItems',
        'favorableCereals',
        'favorableLiquid'
    ];

    return (
        <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto p-4 md:p-8 bg-slate-900/50 backdrop-blur-xl rounded-xl border border-indigo-500/20 shadow-2xl overflow-y-auto max-h-[85vh] scrollbar-thin scrollbar-thumb-indigo-500/30">

            {/* Header */}
            <div className="flex flex-col items-center justify-center text-center space-y-2">
                <div className="text-amber-500 font-serif text-xl font-bold mb-2">
                    || श्री गणेशाय नमः ||
                </div>
                <h2 className="text-3xl font-serif font-bold bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">
                    Janma Kundali
                </h2>
                <div className="text-indigo-200 text-sm font-medium tracking-wide">
                    {data.birthDetails.name} • {data.birthDetails.date} • {data.birthDetails.place}
                </div>
            </div>

            {/* Main Grid: Chart + Prediction */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                {/* Visual Chart */}
                <div className="w-full flex justify-center">
                    <NorthIndianChart data={data} />
                </div>

                {/* Prediction Section */}
                <PredictionPanel key={`${data.birthDetails.name}-${data.birthDetails.date}`} onDebouncedChange={handlePredictionChange} />
            </div>

            {/* Avakahada Chakra - Moved Down */}
            <div className="space-y-4">
                <h3 className="text-amber-400 font-serif text-lg border-b border-amber-500/20 pb-2">Avakahada Chakra</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3 text-sm text-indigo-100/80 bg-indigo-950/20 p-4 rounded-lg border border-indigo-500/10">
                    {Object.entries(data.avakahada).map(([key, value]) => {
                        const formatKey = (k: string) => {
                            if (k === 'ascendantLord') return 'Ascendant / Lord';
                            if (k === 'rashiLord') return 'Rashi / Lord';
                            return k.replace(/([A-Z])/g, ' $1').trim();
                        };
                        return (
                            <div key={key} className="flex flex-col border-b border-indigo-500/10 last:border-0 pb-1">
                                <span className="text-indigo-400 text-xs font-medium uppercase tracking-wider mb-0.5">
                                    {formatKey(key)}
                                </span>
                                <span className="font-semibold text-indigo-100">{value}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Benefic / Malefic Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                <div className="bg-indigo-950/40 p-5 rounded-lg border border-indigo-500/20">
                    <h3 className="text-amber-400 font-serif text-lg mb-4 flex items-center gap-2">
                        <span>✨</span> Favorable
                    </h3>
                    <div className="space-y-2 text-sm">
                        {Object.entries(data.beneficMalefic)
                            // Filter out non-display fields and the explicit exclusions
                            .filter(([key]) => !EXCLUDED_BENEFICS.includes(key) && !['rootNumber', 'destinyNumber'].includes(key))
                            .map(([key, value]) => (
                                <div key={key} className="flex justify-between text-indigo-100">
                                    <span className="text-indigo-400 capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                    <span>{value}</span>
                                </div>
                            ))}
                    </div>
                </div>

                <div className="bg-indigo-950/40 p-5 rounded-lg border border-indigo-500/20">
                    <h3 className="text-amber-400 font-serif text-lg mb-4 flex items-center gap-2">
                        <span>🔢</span> Numerology
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-indigo-500/10 p-3 rounded">
                            <div className="text-xs text-indigo-400 uppercase tracking-wider">Root Number</div>
                            <div className="text-2xl font-bold text-white mt-1">{data.beneficMalefic.rootNumber}</div>
                        </div>
                        <div className="bg-indigo-500/10 p-3 rounded">
                            <div className="text-xs text-indigo-400 uppercase tracking-wider">Destiny Number</div>
                            <div className="text-2xl font-bold text-white mt-1">{data.beneficMalefic.destinyNumber}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Planetary Positions Table */}
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                    <h3 className="text-amber-400 font-serif text-lg">Planetary Positions</h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPlanetaryPositions(!showPlanetaryPositions)}
                        className="text-indigo-300 hover:text-amber-300 hover:bg-indigo-900/40"
                    >
                        {showPlanetaryPositions ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                        {showPlanetaryPositions ? 'Hide' : 'Show'}
                    </Button>
                </div>

                {showPlanetaryPositions && (
                    <div className="overflow-x-auto rounded-lg border border-indigo-500/20 shadow-inner bg-indigo-950/20">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[10px] text-amber-500/70 uppercase tracking-wider bg-indigo-950/60">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Planet</th>
                                    <th className="px-4 py-3 font-semibold">Sign</th>
                                    <th className="px-4 py-3 font-semibold">Degree</th>
                                    <th className="px-4 py-3 font-semibold">Nakshatra</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-indigo-500/10">
                                {data.planetaryPositions.map((p, idx) => (
                                    <tr key={idx} className="hover:bg-indigo-500/5 transition-colors group">
                                        <td className="px-4 py-2.5 font-bold text-indigo-50 hover:text-amber-300 transition-colors">{p.planet}</td>
                                        <td className="px-4 py-2.5 text-indigo-300/90">{p.rashi}</td>
                                        <td className="px-4 py-2.5 font-mono text-amber-200/80">{p.position}°</td>
                                        <td className="px-4 py-2.5 text-indigo-200/70 italic text-xs">{p.nakshatra}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Dasha Tables */}
            <div className="space-y-4">
                <h3 className="text-amber-400 font-serif text-lg border-b border-amber-500/20 pb-2">Dasha Periods</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-indigo-300 font-semibold mb-3 text-sm uppercase tracking-wide border-l-4 border-amber-600 pl-2">Vimshottari Dasha</h4>
                        <DashaTable data={data.vimshottariDasha} type="Planet" />
                    </div>
                    <div>
                        <h4 className="text-indigo-300 font-semibold mb-3 text-sm uppercase tracking-wide border-l-4 border-amber-600 pl-2">Yogini Dasha</h4>
                        <DashaTable data={data.yoginiDasha.map(d => ({ ...d, planet: d.dashaName }))} type="Yogini" />
                    </div>
                </div>
            </div>

            {/* Mantras Section */}
            {
                data.currentMantras && (
                    <div className="space-y-4 mt-8">
                        <h3 className="text-amber-400 font-serif text-lg border-b border-amber-500/20 pb-2">Remedial Mantras</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Vimshottari Mantra */}
                            <div className="bg-slate-900/50 border border-amber-500/30 rounded-lg p-5 relative overflow-hidden group hover:border-amber-500/50 transition-colors">
                                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <span className="text-6xl text-amber-500">🕉️</span>
                                </div>
                                <h4 className="text-amber-300 font-medium text-sm uppercase tracking-wider mb-2">
                                    Mahadasha: {data.currentMantras.vimshottari.planet}
                                </h4>
                                <p className="text-lg font-serif text-indigo-100 leading-relaxed italic mb-4">
                                    "{data.currentMantras.vimshottari.mantra}"
                                </p>

                                {data.currentMantras.vimshottari.subPlanet && data.currentMantras.vimshottari.subMantra && (
                                    <div className="mt-4 pt-4 border-t border-amber-500/20">
                                        <h4 className="text-amber-300/80 font-medium text-xs uppercase tracking-wider mb-1">
                                            Antardasha: {data.currentMantras.vimshottari.subPlanet}
                                        </h4>
                                        <p className="text-base font-serif text-indigo-200 leading-relaxed italic">
                                            "{data.currentMantras.vimshottari.subMantra}"
                                        </p>
                                    </div>
                                )}

                                <div className="mt-4 text-[10px] text-indigo-400">
                                    Recite these mantras to balance the effects of the current dasha periods.
                                </div>
                            </div>

                            {/* Yogini Mantra */}
                            <div className="bg-slate-900/50 border border-amber-500/30 rounded-lg p-5 relative overflow-hidden group hover:border-amber-500/50 transition-colors">
                                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <span className="text-6xl text-amber-500">🧘</span>
                                </div>
                                <h4 className="text-amber-300 font-medium text-sm uppercase tracking-wider mb-2">
                                    Mahadasha: {data.currentMantras.yogini.dasha}
                                </h4>
                                <p className="text-lg font-serif text-indigo-100 leading-relaxed italic mb-4">
                                    "{data.currentMantras.yogini.mantra}"
                                </p>

                                {data.currentMantras.yogini.subDasha && data.currentMantras.yogini.subMantra && (
                                    <div className="mt-4 pt-4 border-t border-amber-500/20">
                                        <h4 className="text-amber-300/80 font-medium text-xs uppercase tracking-wider mb-1">
                                            Antardasha: {data.currentMantras.yogini.subDasha}
                                        </h4>
                                        <p className="text-base font-serif text-indigo-200 leading-relaxed italic">
                                            "{data.currentMantras.yogini.subMantra}"
                                        </p>
                                    </div>
                                )}

                                <div className="mt-4 text-[10px] text-indigo-400">
                                    Mantras to strengthen the current Yogini dasha influence.
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }



            {/* Footer Action */}
            <div className="flex justify-end pt-4 border-t border-white/10 mt-4">
                <DownloadReportButton
                    data={data}
                    prediction={debouncedPrediction}
                    showPlanetaryPositions={showPlanetaryPositions}
                />
            </div>
        </div >
    );
}

const DashaTable = React.memo(({ data, type }: { data: any[], type: string }) => {
    if (!data || data.length === 0) return <div className="text-zinc-500 italic p-4">No data available</div>;

    const currentDasha = data.find(d => d.isCurrent);

    return (
        <div className="rounded-lg overflow-hidden border border-indigo-500/20 bg-slate-900/50">
            {currentDasha && (
                <div className="bg-gradient-to-r from-red-900/40 to-indigo-900/20 p-3 border-b border-red-500/20 text-center">
                    <span className="text-red-200 text-sm font-bold tracking-wide block">
                        Current Mahadasha: {currentDasha.planet}
                    </span>
                    <span className="text-red-300/80 text-xs">
                        ({currentDasha.start} — {currentDasha.end})
                    </span>
                </div>
            )}
            <div className="divide-y divide-indigo-500/10">
                {data.map((row, idx) => (
                    <div key={idx} className="bg-indigo-500/5">
                        {/* Main Row */}
                        {!currentDasha && (
                            <div className={`grid grid-cols-3 gap-4 px-4 py-2 bg-indigo-950/40 text-sm font-bold text-indigo-200`}>
                                <div>{row.planet}</div>
                                <div>{row.start}</div>
                                <div>{row.end}</div>
                            </div>
                        )}

                        {/* Sub Periods */}
                        {row.subPeriods && row.subPeriods.length > 0 && (
                            <div className="bg-slate-950/30 p-3">
                                <h4 className="text-[10px] uppercase tracking-wider text-indigo-400 font-semibold mb-2 ml-1">Antar Dasha (Sub-Periods)</h4>
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-indigo-950/20 text-indigo-500/60">
                                        <tr>
                                            <th className="px-3 py-1.5 font-medium">Pratyantar</th>
                                            <th className="px-3 py-1.5 font-medium">Start</th>
                                            <th className="px-3 py-1.5 font-medium">End</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-indigo-500/10">
                                        {row.subPeriods.map((sub: any, sIdx: number) => (
                                            <tr key={sIdx} className={`${sub.isCurrent ? 'bg-amber-500/10' : ''}`}>
                                                <td className={`px-3 py-1.5 ${sub.isCurrent ? 'text-amber-300 font-bold' : 'text-indigo-300'}`}>
                                                    {sub.planet || sub.dashaName}
                                                    {sub.isCurrent && <span className="ml-1 text-amber-500 text-[9px] animate-pulse">●</span>}
                                                </td>
                                                <td className={`px-3 py-1.5 ${sub.isCurrent ? 'text-amber-300' : 'text-indigo-400'}`}>{sub.start}</td>
                                                <td className={`px-3 py-1.5 ${sub.isCurrent ? 'text-amber-300' : 'text-indigo-400'}`}>{sub.end}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
});
DashaTable.displayName = 'DashaTable';
