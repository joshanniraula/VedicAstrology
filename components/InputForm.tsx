"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CalendarIcon, Clock, MapPin, User, Globe } from "lucide-react"
import { KundaliReportView } from "@/components/kundali/KundaliReportView"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useState } from "react"
import { generateKundaliAction } from "@/app/actions/generate-kundali"
import { KundaliReport } from "@/lib/astrology/types"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle, // Although currently unused in the simplified header, keeping it is fine
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const formSchema = z.object({
    fullName: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    dob: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Please enter a valid date of birth.",
    }),
    tob: z.string().min(1, {
        message: "Time of birth is required.",
    }),
    place: z.string().min(2, {
        message: "City/Place is required.",
    }),
    country: z.string().min(2, {
        message: "Country is required.",
    }),
})

type FormData = z.infer<typeof formSchema>

export function InputForm() {
    const [reportData, setReportData] = useState<KundaliReport | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const {
        register,
        handleSubmit,
        setFocus,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
    })

    // Separate registration to wrap onChange
    const dobRegistration = register("dob");

    const onSubmit = async (data: FormData) => {
        try {
            const report = await generateKundaliAction({
                fullName: data.fullName,
                dob: data.dob,
                tob: data.tob,
                place: data.place,
                country: data.country
            });

            setReportData(report);
            setIsDialogOpen(true);
            reset();
        } catch (error: any) {
            console.error("Failed to generate Kundali:", error);
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred. Please try again.";
            alert(`Failed to generate Kundali: ${errorMessage}`);
        }
    }

    return (
        <>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-5xl w-full p-0 bg-transparent border-0 shadow-none sm:max-w-5xl overflow-hidden text-left">
                    {/* Header accessible for screen readers but hidden visually/integrated in view */}
                    <DialogHeader className="sr-only">
                        <DialogTitle>Kundali Report</DialogTitle>
                        <DialogDescription>Detailed Vedic Astrology Report</DialogDescription>
                    </DialogHeader>

                    {reportData && <KundaliReportView data={reportData} />}
                </DialogContent>
            </Dialog>

            <Card className="w-full border-0 bg-indigo-950/20 backdrop-blur-md shadow-2xl ring-1 ring-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />
                <CardHeader>
                    {/* Header removed or simplified as the page title covers it, keeping minimal if needed or just removing the title/desc inside the card to keep it clean, but let's keep a subtle prompt */}
                    <CardDescription className="text-center text-indigo-200/60 uppercase tracking-widest text-xs">
                        Enter Birth Details
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="relative z-10">
                    <CardContent className="grid gap-5">
                        <div className="grid gap-2">
                            <Label htmlFor="fullName" className="flex items-center gap-2 text-indigo-100 font-medium">
                                <User className="w-4 h-4 text-amber-400" /> Full Name
                            </Label>
                            <Input
                                id="fullName"
                                placeholder="e.g. Bhim Prasad Niroula"
                                {...register("fullName")}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    // Capitalize first letter of each word
                                    const formatted = val.replace(/\b\w/g, c => c.toUpperCase());
                                    e.target.value = formatted;
                                    register("fullName").onChange(e);
                                }}
                                className={`bg-black/20 border-indigo-500/30 text-indigo-50 placeholder:text-indigo-400/30 focus-visible:ring-amber-500/50 focus-visible:border-amber-500/50 ${errors.fullName ? "border-red-500/50" : ""}`}
                            />
                            {errors.fullName && (
                                <p className="text-xs text-red-400">{errors.fullName.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="dob" className="flex items-center gap-2 text-indigo-100 font-medium">
                                    <CalendarIcon className="w-4 h-4 text-amber-400" /> Date of Birth
                                </Label>
                                <Input
                                    id="dob"
                                    type="date"
                                    {...dobRegistration}
                                    onChange={(e) => {
                                        dobRegistration.onChange(e);
                                        const val = e.target.value;
                                        // ULTRA-STRICT CHECK:
                                        // 1. Length must be 10 (YYYY-MM-DD)
                                        // 2. Must form a valid date
                                        // 3. Year must be plausible (>1900) to ensure they didn't just type '0001'
                                        if (val && val.length === 10) {
                                            const year = parseInt(val.split('-')[0]);
                                            if (!isNaN(Date.parse(val)) && year > 1900) {
                                                setFocus("tob");
                                            }
                                        }
                                    }}
                                    autoComplete="off"
                                    className={`bg-black/20 border-indigo-500/30 text-indigo-50 placeholder:text-indigo-400/30 focus-visible:ring-amber-500/50 focus-visible:border-amber-500/50 ${errors.dob ? "border-red-500/50" : ""} appearance-none [color-scheme:dark]`}
                                />
                                {errors.dob && (
                                    <p className="text-xs text-red-400">{errors.dob.message}</p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="tob" className="flex items-center gap-2 text-indigo-100 font-medium">
                                    <Clock className="w-4 h-4 text-amber-400" /> Time of Birth
                                </Label>
                                <Input
                                    id="tob"
                                    type="time"
                                    {...register("tob")}
                                    className={`bg-black/20 border-indigo-500/30 text-indigo-50 placeholder:text-indigo-400/30 focus-visible:ring-amber-500/50 focus-visible:border-amber-500/50 ${errors.tob ? "border-red-500/50" : ""} appearance-none [color-scheme:dark]`}
                                />
                                {errors.tob && (
                                    <p className="text-xs text-red-400">{errors.tob.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="place" className="flex items-center gap-2 text-indigo-100 font-medium">
                                    <MapPin className="w-4 h-4 text-amber-400" /> Place
                                </Label>
                                <Input
                                    id="place"
                                    placeholder="City"
                                    {...register("place")}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        const formatted = val.replace(/\b\w/g, c => c.toUpperCase());
                                        e.target.value = formatted;
                                        register("place").onChange(e);
                                    }}
                                    className={`bg-black/20 border-indigo-500/30 text-indigo-50 placeholder:text-indigo-400/30 focus-visible:ring-amber-500/50 focus-visible:border-amber-500/50 ${errors.place ? "border-red-500/50" : ""}`}
                                />
                                {errors.place && (
                                    <p className="text-xs text-red-400">{errors.place.message}</p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="country" className="flex items-center gap-2 text-indigo-100 font-medium">
                                    <Globe className="w-4 h-4 text-amber-400" /> Country
                                </Label>
                                <Input
                                    id="country"
                                    placeholder="Country"
                                    {...register("country")}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        const formatted = val.replace(/\b\w/g, c => c.toUpperCase());
                                        e.target.value = formatted;
                                        register("country").onChange(e);
                                    }}
                                    className={`bg-black/20 border-indigo-500/30 text-indigo-50 placeholder:text-indigo-400/30 focus-visible:ring-amber-500/50 focus-visible:border-amber-500/50 ${errors.country ? "border-red-500/50" : ""}`}
                                />
                                {errors.country && (
                                    <p className="text-xs text-red-400">{errors.country.message}</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium tracking-wide shadow-lg shadow-amber-900/20 border border-amber-400/20"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Divining..." : "Reveal Horoscope"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </>
    )
}
