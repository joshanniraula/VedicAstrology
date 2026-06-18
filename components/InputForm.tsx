"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CalendarIcon, Clock, MapPin, User, Globe, RefreshCw } from "lucide-react"
import { KundaliReportView } from "@/components/kundali/KundaliReportView"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useState, useCallback, useEffect } from "react"
import { generateKundaliAction } from "@/app/actions/generate-kundali"
import { KundaliReport } from "@/lib/astrology/types"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { bsToAdString, getBsMonthDays, BS_MONTH_NAMES, BS_MIN_YEAR, BS_MAX_YEAR } from "@/lib/astrology/bs-converter"

/* ─── Types ──────────────────────────────────────────────── */

type DateMode = "AD" | "BS"

const formSchema = z.object({
    fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
    dob: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Please enter a valid date of birth.",
    }),
    tob: z.string().min(1, { message: "Time of birth is required." }),
    place: z.string().min(2, { message: "City/Place is required." }),
    country: z.string().min(2, { message: "Country is required." }),
})

type FormData = z.infer<typeof formSchema>

/* ─── AD/BS Toggle ───────────────────────────────────────── */

function DateModeToggle({ mode, onToggle }: { mode: DateMode; onToggle: () => void }) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className="relative inline-flex items-center h-8 w-[88px] rounded-full p-0.5 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50"
            style={{
                background: mode === "AD"
                    ? "linear-gradient(135deg, rgba(99,102,241,0.4), rgba(79,70,229,0.3))"
                    : "linear-gradient(135deg, rgba(251,146,60,0.4), rgba(245,158,11,0.3))",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)",
            }}
            aria-label={`Switch to ${mode === "AD" ? "BS" : "AD"} date`}
        >
            {/* Sliding knob */}
            <span
                className={`absolute top-0.5 h-7 w-10 rounded-full transition-all duration-300 flex items-center justify-center text-xs font-bold tracking-wide text-white shadow-md ${
                    mode === "AD" ? "left-0.5 bg-indigo-500" : "left-[46px] bg-amber-500"
                }`}
            >
                {mode}
            </span>
            {/* Labels */}
            <span className={`w-10 text-center text-xs font-semibold transition-colors ${mode === "AD" ? "text-transparent" : "text-indigo-300/60"}`}>AD</span>
            <span className={`w-10 text-center text-xs font-semibold transition-colors ${mode === "BS" ? "text-transparent" : "text-amber-300/60"}`}>BS</span>
        </button>
    )
}

/* ─── BS Date Picker ─────────────────────────────────────── */

interface BsDatePickerProps {
    onAdDateChange: (adDate: string) => void
}

function BsDatePicker({ onAdDateChange }: BsDatePickerProps) {
    const currentYear = new Date().getFullYear() + 56 // rough BS year
    const [bsYear, setBsYear] = useState(currentYear > BS_MAX_YEAR ? BS_MAX_YEAR : currentYear)
    const [bsMonth, setBsMonth] = useState(1)
    const [bsDay, setBsDay] = useState(1)
    const [daysInMonth, setDaysInMonth] = useState(31)
    const [convertedAD, setConvertedAD] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Recompute days whenever year/month changes
    useEffect(() => {
        try {
            const days = getBsMonthDays(bsYear, bsMonth)
            setDaysInMonth(days)
            if (bsDay > days) setBsDay(days)
        } catch {
            setDaysInMonth(30)
        }
    }, [bsYear, bsMonth, bsDay])

    // Convert and propagate
    useEffect(() => {
        try {
            const adStr = bsToAdString(bsYear, bsMonth, bsDay)
            setConvertedAD(adStr)
            setError(null)
            onAdDateChange(adStr)
        } catch (e: any) {
            setError("Invalid BS date")
            setConvertedAD(null)
        }
    }, [bsYear, bsMonth, bsDay, onAdDateChange])

    const inputClass =
        "bg-black/20 border border-indigo-500/25 text-indigo-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all [color-scheme:dark]"

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
                {/* Year */}
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-indigo-400/60 uppercase tracking-wider font-medium">Year</span>
                    <input
                        type="number"
                        min={BS_MIN_YEAR}
                        max={BS_MAX_YEAR}
                        value={bsYear}
                        onChange={(e) => setBsYear(Number(e.target.value))}
                        className={inputClass + " w-full"}
                    />
                </div>
                {/* Month */}
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-indigo-400/60 uppercase tracking-wider font-medium">Month</span>
                    <select
                        value={bsMonth}
                        onChange={(e) => setBsMonth(Number(e.target.value))}
                        className={inputClass + " w-full appearance-none cursor-pointer"}
                    >
                        {BS_MONTH_NAMES.map((name, i) => (
                            <option key={i} value={i + 1} className="bg-slate-900 text-indigo-50">
                                {i + 1}. {name}
                            </option>
                        ))}
                    </select>
                </div>
                {/* Day — select dropdown avoids typing friction */}
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-indigo-400/60 uppercase tracking-wider font-medium">Day</span>
                    <select
                        value={bsDay}
                        onChange={(e) => setBsDay(Number(e.target.value))}
                        className={inputClass + " w-full appearance-none cursor-pointer"}
                    >
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                            <option key={d} value={d} className="bg-slate-900 text-indigo-50">
                                {d}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Converted AD date indicator */}
            {convertedAD && !error && (
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/8 border border-amber-500/20 rounded-lg">
                    <RefreshCw className="w-3 h-3 text-amber-400/70 flex-shrink-0" />
                    <span className="text-xs text-amber-300/70">
                        Equals <span className="font-semibold text-amber-300">{convertedAD}</span> (AD)
                    </span>
                </div>
            )}
            {error && (
                <p className="text-xs text-red-400 px-1">{error}</p>
            )}
        </div>
    )
}

/* ─── Main Form ──────────────────────────────────────────── */

export function InputForm() {
    const [reportData, setReportData] = useState<KundaliReport | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [dateMode, setDateMode] = useState<DateMode>("AD")
    // Local state for the visible AD date input (separate from RHF)
    const [adDateValue, setAdDateValue] = useState<string>("")

    const {
        register,
        handleSubmit,
        setFocus,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({ resolver: zodResolver(formSchema) })

    // dobRegistration is attached to ONE hidden input always — this is the
    // single source of truth for RHF's internal ref tracking.
    const dobRegistration = register("dob")

    // When BS date changes, push converted AD date into RHF
    const handleBsAdChange = useCallback((adDate: string) => {
        setValue("dob", adDate, { shouldValidate: false })
    }, [setValue])

    const onSubmit = async (data: FormData) => {
        try {
            const report = await generateKundaliAction({
                fullName: data.fullName,
                dob: data.dob,
                tob: data.tob,
                place: data.place,
                country: data.country,
            })
            setReportData(report)
            setIsDialogOpen(true)
            reset()
        } catch (error: any) {
            console.error("Failed to generate Kundali:", error)
            const msg = error instanceof Error ? error.message : "An unexpected error occurred."
            alert(`Failed to generate Kundali: ${msg}`)
        }
    }

    const inputClass = (hasError: boolean) =>
        `text-white placeholder:text-indigo-400/30 transition-all duration-200
         focus-visible:ring-1 focus-visible:ring-amber-500/50 focus-visible:border-amber-500/60
         rounded-lg ${
            hasError
                ? "border-red-500/60 bg-red-500/5"
                : "border-indigo-500/20 bg-white/[0.04] hover:bg-white/[0.06] hover:border-indigo-400/35"
        }`

    return (
        <>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-5xl w-full p-0 bg-transparent border-0 shadow-none sm:max-w-5xl overflow-hidden text-left">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Kundali Report</DialogTitle>
                        <DialogDescription>Detailed Vedic Astrology Report</DialogDescription>
                    </DialogHeader>
                    {reportData && <KundaliReportView data={reportData} />}
                </DialogContent>
            </Dialog>

            <Card className="w-full border-0 rounded-2xl relative overflow-hidden" style={{
                background: "rgba(8, 6, 30, 0.7)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                boxShadow: "0 0 0 1px rgba(251,191,36,0.2), 0 0 40px rgba(99,102,241,0.12), 0 30px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}>
                {/* Gradient corner accents */}
                <div className="absolute top-0 left-0 w-32 h-32 rounded-full pointer-events-none" style={{
                    background: "radial-gradient(circle, rgba(251,191,36,0.08), transparent 70%)"
                }} />
                <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full pointer-events-none" style={{
                    background: "radial-gradient(circle, rgba(99,102,241,0.1), transparent 70%)"
                }} />

                <CardHeader className="pb-3 pt-5 px-6">
                    <CardDescription className="text-center uppercase tracking-[0.22em] text-[10px] font-bold" style={{
                        background: "linear-gradient(90deg, #fbbf24, #a78bfa, #fbbf24)",
                        backgroundSize: "200% auto",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                    }}>
                        ✦ Enter Birth Details ✦
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="relative z-10">
                    <CardContent className="grid gap-5 px-6">

                        {/* Full Name */}
                        <div className="grid gap-1.5">
                            <Label htmlFor="fullName" className="flex items-center gap-2 text-indigo-200/80 text-sm font-medium">
                                <User className="w-3.5 h-3.5 text-amber-400" /> Full Name
                            </Label>
                            <Input
                                id="fullName"
                                placeholder="e.g. Bhim Prasad Niroula"
                                {...register("fullName")}
                                onChange={(e) => {
                                    const formatted = e.target.value.replace(/\b\w/g, c => c.toUpperCase())
                                    e.target.value = formatted
                                    register("fullName").onChange(e)
                                }}
                                className={inputClass(!!errors.fullName)}
                            />
                            {errors.fullName && <p className="text-xs text-red-400 pl-1">{errors.fullName.message}</p>}
                        </div>

                        {/* Date of birth with AD/BS toggle */}
                        <div className="grid gap-1.5">
                            <div className="flex items-center justify-between">
                                <Label className="flex items-center gap-2 text-indigo-200/80 text-sm font-medium">
                                    <CalendarIcon className="w-3.5 h-3.5 text-amber-400" /> Date of Birth
                                </Label>
                                {/* AD/BS toggle */}
                                <DateModeToggle mode={dateMode} onToggle={() => setDateMode(m => m === "AD" ? "BS" : "AD")} />
                            </div>

                            {/* Single hidden input — always mounted — is the sole RHF ref for "dob" */}
                            <input
                                type="hidden"
                                name={dobRegistration.name}
                                ref={dobRegistration.ref}
                            />

                            {dateMode === "AD" ? (
                                <>
                                    <Input
                                        id="dob"
                                        type="date"
                                        value={adDateValue}
                                        autoComplete="off"
                                        onChange={(e) => {
                                            const val = e.target.value
                                            setAdDateValue(val)
                                            setValue("dob", val, { shouldValidate: false })
                                            if (val && val.length === 10) {
                                                const year = parseInt(val.split("-")[0])
                                                if (!isNaN(Date.parse(val)) && year > 1900) setFocus("tob")
                                            }
                                        }}
                                        className={inputClass(!!errors.dob) + " appearance-none [color-scheme:dark]"}
                                    />
                                    {errors.dob && <p className="text-xs text-red-400 pl-1">{errors.dob.message}</p>}
                                </>
                            ) : (
                                <>
                                    <BsDatePicker onAdDateChange={handleBsAdChange} />
                                    {errors.dob && <p className="text-xs text-red-400 pl-1">{errors.dob.message}</p>}
                                </>
                            )}
                        </div>

                        {/* Time of Birth */}
                        <div className="grid gap-1.5">
                            <Label htmlFor="tob" className="flex items-center gap-2 text-indigo-200/80 text-sm font-medium">
                                <Clock className="w-3.5 h-3.5 text-amber-400" /> Time of Birth
                            </Label>
                            <Input
                                id="tob"
                                type="time"
                                {...register("tob")}
                                className={inputClass(!!errors.tob) + " appearance-none [color-scheme:dark]"}
                            />
                            {errors.tob && <p className="text-xs text-red-400 pl-1">{errors.tob.message}</p>}
                        </div>

                        {/* Place & Country */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5">
                                <Label htmlFor="place" className="flex items-center gap-2 text-indigo-200/80 text-sm font-medium">
                                    <MapPin className="w-3.5 h-3.5 text-amber-400" /> Place
                                </Label>
                                <Input
                                    id="place"
                                    placeholder="City"
                                    {...register("place")}
                                    onChange={(e) => {
                                        const formatted = e.target.value.replace(/\b\w/g, c => c.toUpperCase())
                                        e.target.value = formatted
                                        register("place").onChange(e)
                                    }}
                                    className={inputClass(!!errors.place)}
                                />
                                {errors.place && <p className="text-xs text-red-400 pl-1">{errors.place.message}</p>}
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="country" className="flex items-center gap-2 text-indigo-200/80 text-sm font-medium">
                                    <Globe className="w-3.5 h-3.5 text-amber-400" /> Country
                                </Label>
                                <Input
                                    id="country"
                                    placeholder="Country"
                                    {...register("country")}
                                    onChange={(e) => {
                                        const formatted = e.target.value.replace(/\b\w/g, c => c.toUpperCase())
                                        e.target.value = formatted
                                        register("country").onChange(e)
                                    }}
                                    className={inputClass(!!errors.country)}
                                />
                                {errors.country && <p className="text-xs text-red-400 pl-1">{errors.country.message}</p>}
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="pt-3 pb-6 px-6 flex flex-col gap-3">
                        <Button
                            type="submit"
                            id="submit-kundali"
                            className="w-full h-12 text-sm font-bold tracking-widest text-white border-0 rounded-xl transition-all duration-300 hover:scale-[1.015] active:scale-[0.985] uppercase"
                            style={{
                                background: isSubmitting
                                    ? "rgba(30,27,75,0.5)"
                                    : "linear-gradient(135deg, #f59e0b 0%, #d97706 35%, #92400e 100%)",
                                boxShadow: isSubmitting
                                    ? "none"
                                    : "0 0 0 1px rgba(251,191,36,0.3), 0 8px 32px rgba(245,158,11,0.3), 0 2px 8px rgba(0,0,0,0.5)",
                            }}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Consulting the Stars…
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    ✦ &nbsp;Reveal My Kundali
                                </span>
                            )}
                        </Button>
                        <p className="text-center text-[10px] text-indigo-400/30 tracking-wide">
                            Your data is used only to calculate your chart
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </>
    )
}
