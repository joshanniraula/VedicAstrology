"use client";

import { useEffect, useState } from "react";
import { BlobProvider, PDFViewer } from "@react-pdf/renderer";
import { KundaliDocument } from "./KundaliDocument";
import { KundaliReport } from "@/lib/astrology/types";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface PDFPreviewProps {
    data: KundaliReport;
}

export function PDFPreview({ data }: PDFPreviewProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null;

    return (
        <div className="flex flex-col items-center gap-6 mt-6 w-full max-w-4xl mx-auto">
            {/* Debug Metadata for User Verification */}
            <div className="w-full bg-blue-50 p-2 rounded border border-blue-200 text-xs text-blue-800 flex flex-wrap gap-4 justify-center">
                <span><strong>Used Location:</strong> {data.birthDetails.place}, {data.birthDetails.country}</span>
                <span><strong>Coordinates:</strong> {data.birthDetails.lat?.toFixed(4)}, {data.birthDetails.lon?.toFixed(4)}</span>
                <span><strong>Timezone:</strong> {data.birthDetails.timezone}</span>
            </div>

            {/* Embedded Preview (Whole PDF) */}
            <div className="w-full bg-white p-1 rounded-lg shadow-sm border overflow-hidden">
                <h3 className="text-lg font-semibold text-center py-2 bg-gray-50 border-b">Report Preview</h3>
                <PDFViewer width="100%" height="600px" className="w-full h-[600px]">
                    <KundaliDocument data={data} />
                </PDFViewer>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
                <BlobProvider document={<KundaliDocument data={data} />}>
                    {({ url, loading, error }) => {
                        if (loading) return <Button disabled>Generating...</Button>;
                        if (error) return <Button variant="destructive">Error</Button>;

                        return (
                            <a href={url || '#'} target="_blank" rel="noopener noreferrer">
                                <Button className="bg-blue-600 hover:bg-blue-700 min-w-[200px]">
                                    <Printer className="mr-2 h-4 w-4" />
                                    Open & Print
                                </Button>
                            </a>
                        );
                    }}
                </BlobProvider>
            </div>
        </div>
    );
}
