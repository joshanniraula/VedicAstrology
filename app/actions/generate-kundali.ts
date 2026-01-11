"use server"

import { fetchKundaliData } from "@/lib/astrology/api-client";
import { KundaliReport } from "@/lib/astrology/types";

export async function generateKundaliAction(formData: {
    fullName: string;
    dob: string;
    tob: string;
    place: string;
    country: string;
}): Promise<KundaliReport> {

    // Server-side logic to call our API Client
    const report = await fetchKundaliData({
        name: formData.fullName,
        date: formData.dob,
        time: formData.tob,
        place: formData.place,
        country: formData.country,
    });

    return report;
}
