import React from 'react';
import { Page, Text, View, Document, StyleSheet, Svg, Line, Font, Image } from '@react-pdf/renderer';
import { KundaliReport } from '@/lib/astrology/types';

// Register Devanagari Font
Font.register({
    family: 'Noto Sans Devanagari',
    fonts: [
        { src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-devanagari/files/noto-sans-devanagari-devanagari-400-normal.woff', fontWeight: 'normal' },
        { src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-devanagari/files/noto-sans-devanagari-devanagari-700-normal.woff', fontWeight: 'bold' }
    ]
});

const styles = StyleSheet.create({
    page: {
        paddingTop: 20,
        paddingRight: 25,
        paddingBottom: 20,
        paddingLeft: 50, // Added gutter for stapling
        fontFamily: 'Helvetica',
        fontSize: 10,
        backgroundColor: '#ffffff'
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 3,
        borderBottomWidth: 2,
        borderBottomColor: '#d6d6d6',
        paddingBottom: 3
    },
    headerImage: {
        height: 55,
        width: 'auto',
        objectFit: 'contain'
    },
    headerTextContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    om: {
        fontSize: 24,
        color: '#E35E18',
        marginBottom: 2,
        fontFamily: 'Noto Sans Devanagari',
        fontWeight: 'bold'
    },
    title: {
        fontSize: 18,
        fontFamily: 'Noto Sans Devanagari',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: '#333'
    },
    subTitle: {
        fontSize: 10,
        color: '#666',
        marginTop: 2
    },
    section: {
        marginBottom: 3,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    table: {
        width: '40%', // Reduced to give more room to chart
        borderWidth: 1,
        borderColor: '#000',
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        minHeight: 15,
        alignItems: 'center'
    },
    cellLabel: {
        width: '50%',
        padding: 3,
        fontSize: 8,
        backgroundColor: '#f5f5f5',
        fontFamily: 'Helvetica-Bold'
    },
    cellValue: {
        width: '50%',
        padding: 3,
        fontSize: 8
    },
    chartContainer: {
        width: '58%', // Enlarged
        height: 230, // Enlarged
        borderWidth: 1,
        borderColor: '#e8bcbc',
        backgroundColor: '#fff8f0',
        position: 'relative' // Important for absolute children
    },
    chartLabel: {
        position: 'absolute',
        fontSize: 8, // Smaller for better clearance
        fontFamily: 'Helvetica-Bold',
        color: '#E35E18',
        textAlign: 'center',
        width: 15,
        height: 10
    },
    beneficTable: {
        marginTop: 20,
        width: '100%',
        borderWidth: 0,
    },
    beneficRow: {
        flexDirection: 'row',
        marginBottom: 2,
    },
    beneficLabel: {
        width: '25%',
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        color: '#444'
    },
    beneficValue: {
        width: '75%',
        fontSize: 9,
        color: '#000'
    }
});

// Helper to draw North Indian Chart Lines (Pure SVG)
const ChartSVG = () => {
    return (
        <Svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }} preserveAspectRatio="none">
            {/* Outer Box */}
            <Line x1="0" y1="0" x2="200" y2="0" stroke="red" strokeWidth={0.5} />
            <Line x1="200" y1="0" x2="200" y2="200" stroke="red" strokeWidth={0.5} />
            <Line x1="200" y1="200" x2="0" y2="200" stroke="red" strokeWidth={0.5} />
            <Line x1="0" y1="200" x2="0" y2="0" stroke="red" strokeWidth={0.5} />

            {/* Diagonals (Cross) */}
            <Line x1="0" y1="0" x2="200" y2="200" stroke="red" strokeWidth={0.5} />
            <Line x1="0" y1="200" x2="200" y2="0" stroke="red" strokeWidth={0.5} />

            {/* Diamond (Midpoints) */}
            <Line x1="100" y1="0" x2="0" y2="100" stroke="red" strokeWidth={0.5} />
            <Line x1="0" y1="100" x2="100" y2="200" stroke="red" strokeWidth={0.5} />
            <Line x1="100" y1="200" x2="200" y2="100" stroke="red" strokeWidth={0.5} />
            <Line x1="200" y1="100" x2="100" y2="0" stroke="red" strokeWidth={0.5} />
        </Svg>
    );
};

// Helper to calculate duration
// Helper to calculate time left from now
const calculateTimeLeft = (end: string) => {
    try {
        const s = new Date();
        const e = new Date(end);

        let years = e.getFullYear() - s.getFullYear();
        let months = e.getMonth() - s.getMonth();
        let days = e.getDate() - s.getDate();

        if (days < 0) {
            months--;
            const prevMonth = new Date(e.getFullYear(), e.getMonth(), 0);
            days += prevMonth.getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        if (years < 0 || (years === 0 && months < 0) || (years === 0 && months === 0 && days < 0)) {
            return 'Expired';
        }

        const parts = [];
        if (years > 0) parts.push(`${years} Years`);
        if (months > 0) parts.push(`${months} Months`);
        if (days > 0) parts.push(`${days} Days`);

        return parts.length > 0 ? `${parts.join(' ')} Left` : 'Ending Today';
    } catch (e) {
        return '';
    }
};

// Helper to calculate age from DOB
const calculateAge = (dob: string) => {
    try {
        const birthDate = new Date(dob);
        const today = new Date();

        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();
        let days = today.getDate() - birthDate.getDate();

        if (days < 0) {
            months--;
            const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            days += prevMonth.getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        const parts = [];
        if (years > 0) parts.push(`${years} Years`);
        if (months > 0) parts.push(`${months} Months`);
        if (days > 0) parts.push(`${days} Days`);

        return parts.join(' ') || '0 Days';
    } catch (e) {
        return '';
    }
};

export const KundaliDocument = ({ data, showPlanetaryPositions, prediction }: { data: KundaliReport; showPlanetaryPositions?: boolean; prediction?: string }) => {
    const EXCLUDED_BENEFICS = [
        'unfavorablePlanets',
        'friendlyLagna',
        'favorableMetal',
        'favorableTime',
        'favorableItems',
        'favorableCereals',
        'favorableLiquid'
    ];

    // Helper to format planets (max 2 per line)
    const formatPlanets = (planets: any[]) => {
        const rows = [];
        for (let i = 0; i < planets.length; i += 2) {
            rows.push(planets.slice(i, i + 2).map((p: any) => `${p.symbol}${p.degree}`).join(' '));
        }
        return rows.join('\n');
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header with Images */}
                <View style={styles.headerRow}>
                    {/* 1. Swastik */}
                    <Image src="/swastik.jpg" style={styles.headerImage} />

                    {/* 2. SaiBaba */}
                    <Image src="/saibaba.jpg" style={styles.headerImage} />

                    {/* 3. Text (Center) */}
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.om}>|| श्री गणेशाय नमः ||</Text>
                        <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#E35E18', textAlign: 'center', textTransform: 'uppercase' }}>Monjusatya Astrology Center</Text>
                        <Text style={{ fontSize: 9, color: '#333', marginBottom: 2, textAlign: 'center' }}>Kathmandu, Nepal</Text>
                        <Text style={styles.title}>|| अथ जन्मकुंडली: ||</Text>
                    </View>

                    {/* 4. Ganesha-Shiva */}
                    <Image src="/ganesha-family.png" style={styles.headerImage} />

                    {/* 5. Lotus */}
                    <Image src="/lotus.jpg" style={styles.headerImage} />
                </View>

                {/* Birth Details Table */}
                <View style={{ marginBottom: 10, borderWidth: 1, borderColor: '#000' }}>
                    <View style={{ flexDirection: 'row', backgroundColor: '#FF9933', padding: 4, borderBottomWidth: 1, borderBottomColor: '#000' }}>
                        <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#fff', width: '100%', textAlign: 'center' }}>JATAK DETAILS (BIRTH DETAILS)</Text>
                    </View>

                    <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                        <View style={{ width: '20%', padding: 4, backgroundColor: '#fff3e0', borderRightWidth: 1, borderRightColor: '#ccc' }}>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>Name</Text>
                        </View>
                        <View style={{ width: '30%', padding: 4, borderRightWidth: 1, borderRightColor: '#ccc' }}>
                            <Text style={{ fontSize: 9 }}>{data.birthDetails.name}</Text>
                        </View>
                        <View style={{ width: '20%', padding: 4, backgroundColor: '#fff3e0', borderRightWidth: 1, borderRightColor: '#ccc' }}>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>Date (YYYY-MM-DD)</Text>
                        </View>
                        <View style={{ width: '30%', padding: 4 }}>
                            <Text style={{ fontSize: 9 }}>{data.birthDetails.date}</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ width: '20%', padding: 4, backgroundColor: '#fff3e0', borderRightWidth: 1, borderRightColor: '#ccc' }}>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>Time</Text>
                        </View>
                        <View style={{ width: '30%', padding: 4, borderRightWidth: 1, borderRightColor: '#ccc' }}>
                            <Text style={{ fontSize: 9 }}>{data.birthDetails.time}</Text>
                        </View>
                        <View style={{ width: '20%', padding: 4, backgroundColor: '#fff3e0', borderRightWidth: 1, borderRightColor: '#ccc' }}>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>Place</Text>
                        </View>
                        <View style={{ width: '30%', padding: 4 }}>
                            <Text style={{ fontSize: 9 }}>{data.birthDetails.place}, {data.birthDetails.country}</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#ccc' }}>
                        <View style={{ width: '20%', padding: 4, backgroundColor: '#fff3e0', borderRightWidth: 1, borderRightColor: '#ccc' }}>
                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>Current Age</Text>
                        </View>
                        <View style={{ width: '80%', padding: 4 }}>
                            <Text style={{ fontSize: 9 }}>{calculateAge(data.birthDetails.date)}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    {/* Avakahada Chakra Table */}
                    <View style={styles.table}>
                        <View style={[styles.row, { backgroundColor: '#ffe0b2' }]}>
                            <Text style={[styles.cellLabel, { width: '100%', textAlign: 'center' }]}>Avakahada Chakra</Text>
                        </View>
                        {Object.entries(data.avakahada).map(([key, value]) => {
                            const formatKey = (k: string) => {
                                if (k === 'ascendantLord') return 'Ascendant / Lord';
                                if (k === 'rashiLord') return 'Rashi / Lord';
                                return k.replace(/([A-Z])/g, ' $1').trim().replace(/^./, str => str.toUpperCase());
                            };
                            return (
                                <View style={styles.row} key={key}>
                                    <Text style={styles.cellLabel}>
                                        {formatKey(key)}
                                    </Text>
                                    <Text style={styles.cellValue}>{value}</Text>
                                </View>
                            );
                        })}
                    </View>

                    {/* Chart Container - overlaying text on SVG */}
                    <View style={styles.chartContainer}>
                        <ChartSVG />

                        {/* House Signs (Apexes) - Moved deeper into corners to avoid planets */}
                        <Text style={[styles.chartLabel, { top: '1%', left: '46.5%' }]}>{data.chart.signs[1]}</Text>
                        <Text style={[styles.chartLabel, { top: '2%', left: '15%' }]}>{data.chart.signs[2]}</Text>
                        <Text style={[styles.chartLabel, { top: '6%', left: '2%' }]}>{data.chart.signs[3]}</Text>
                        <Text style={[styles.chartLabel, { top: '48%', left: '1%' }]}>{data.chart.signs[4]}</Text>
                        <Text style={[styles.chartLabel, { bottom: '6%', left: '2%' }]}>{data.chart.signs[5]}</Text>
                        <Text style={[styles.chartLabel, { bottom: '2%', left: '15%' }]}>{data.chart.signs[6]}</Text>
                        <Text style={[styles.chartLabel, { bottom: '1%', left: '46.5%' }]}>{data.chart.signs[7]}</Text>
                        <Text style={[styles.chartLabel, { bottom: '2%', right: '15%' }]}>{data.chart.signs[8]}</Text>
                        <Text style={[styles.chartLabel, { bottom: '6%', right: '2%' }]}>{data.chart.signs[9]}</Text>
                        <Text style={[styles.chartLabel, { top: '48%', right: '1%' }]}>{data.chart.signs[10]}</Text>
                        <Text style={[styles.chartLabel, { top: '6%', right: '2%' }]}>{data.chart.signs[11]}</Text>
                        <Text style={[styles.chartLabel, { top: '2%', right: '15%' }]}>{data.chart.signs[12]}</Text>

                        {/* Planets for all 12 Houses (Geometric Centroids) */}
                        {[
                            { h: 1, top: '18%', left: '25%', width: '50%' },
                            { h: 2, top: '10%', left: '10%', width: '30%' },
                            { h: 3, top: '26%', left: '1%', width: '20%' },
                            { h: 4, top: '40%', left: '8%', width: '35%' },
                            { h: 5, top: '75%', left: '1%', width: '20%' },
                            { h: 6, top: '85%', left: '10%', width: '30%' },
                            { h: 7, top: '65%', left: '25%', width: '50%' },
                            { h: 8, top: '85%', left: '60%', width: '30%' },
                            { h: 9, top: '75%', right: '1%', width: '20%' },
                            { h: 10, top: '40%', right: '8%', width: '35%' },
                            { h: 11, top: '26%', right: '1%', width: '20%' },
                            { h: 12, top: '10%', left: '60%', width: '30%' },
                        ].map((pos) => {
                            const planets = data.chart.houses[pos.h];
                            if (!planets || planets.length === 0) return null;
                            return (
                                <Text key={pos.h} style={{
                                    position: 'absolute',
                                    top: pos.top,
                                    left: pos.left,
                                    ...((pos as any).right ? { right: (pos as any).right } : {}),
                                    fontSize: 7,
                                    fontFamily: 'Helvetica',
                                    width: pos.width,
                                    textAlign: 'center',
                                    color: '#000000',
                                    lineHeight: 1.1
                                }}>
                                    {formatPlanets(planets)}
                                </Text>
                            );
                        })}

                    </View>
                </View>

                {/* Planetary Positions Table in PDF */}
                {showPlanetaryPositions && (
                    <View style={{ marginTop: 3 }}>
                        <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', marginBottom: 3 }}>Planetary Positions</Text>
                        <View style={[styles.table, { width: '100%' }]}>
                            <View style={[styles.row, { backgroundColor: '#f5f5f5' }]}>
                                <Text style={[styles.cellLabel, { width: '20%' }]}>Planet</Text>
                                <Text style={[styles.cellLabel, { width: '20%' }]}>Sign</Text>
                                <Text style={[styles.cellLabel, { width: '15%' }]}>Degree</Text>
                                <Text style={[styles.cellLabel, { width: '30%' }]}>Nakshatra</Text>
                                <Text style={[styles.cellLabel, { width: '15%' }]}>State</Text>
                            </View>
                            {data.planetaryPositions.map((p, idx) => (
                                <View style={styles.row} key={idx}>
                                    <Text style={[styles.cellValue, { width: '20%', fontFamily: 'Helvetica-Bold' }]}>{p.planet}</Text>
                                    <Text style={[styles.cellValue, { width: '20%' }]}>{p.rashi}</Text>
                                    <Text style={[styles.cellValue, { width: '15%' }]}>{p.position}°</Text>
                                    <Text style={[styles.cellValue, { width: '30%' }]}>{p.nakshatra}</Text>
                                    <Text style={[styles.cellValue, { width: '15%', color: '#000', fontSize: 7, flexWrap: 'wrap' }]}>
                                        {p.isRetrograde ? 'Retrograde(Bakra)' : ''}
                                        {p.isCombust ? (p.isRetrograde ? '\n' : '') + 'Combust(Asta)' : ''}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Benefic / Malefic Section */}
                <View style={{ marginTop: 3 }}>
                    <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', marginBottom: 3 }}>Benefic and Malefic Analysis</Text>
                    {Object.entries(data.beneficMalefic)
                        .filter(([key]) => !EXCLUDED_BENEFICS.includes(key) && !['rootNumber', 'destinyNumber'].includes(key))
                        .map(([key, value]) => (
                            <View style={styles.beneficRow} key={key}>
                                <Text style={styles.beneficLabel}>
                                    {key.replace(/([A-Z])/g, ' $1').trim().replace(/^./, str => str.toUpperCase())}:
                                </Text>
                                <Text style={styles.beneficValue}>{value}</Text>
                            </View>
                        ))}
                </View>

                {/* Footer for First Page */}
                {/* <Text style={{ position: 'absolute', bottom: 30, left: 30, right: 30, textAlign: 'center', fontSize: 8, color: '#999' }}>
                    Created by Vedic Astrology App | Licensed
                </Text> */}
            </Page>

            <Page size="A4" style={styles.page}>
                <View style={{ position: 'absolute', top: 20, right: 25 }}>
                    <Text style={{ fontSize: 8, color: '#666' }}>Print date (MM-DD-YYYY): {new Date().toLocaleDateString()}</Text>
                </View>

                {/* Dasha Tables in PDF */}
                <View style={{ marginTop: 60 }}>
                    <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 8, textAlign: 'left', color: '#E35E18' }}>({data.birthDetails.name})</Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'nowrap', alignItems: 'flex-start' }}>
                        {/* Vimshottari */}
                        <View style={{ width: '47%' }}>
                            <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>Vimshottari MahaDasha</Text>
                            {data.vimshottariDasha.find(d => d.isCurrent) && (
                                <View style={{ marginBottom: 4 }}>
                                    <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: 'red' }}>
                                        {data.vimshottariDasha.find(d => d.isCurrent)?.planet} ({data.vimshottariDasha.find(d => d.isCurrent)?.start} — {data.vimshottariDasha.find(d => d.isCurrent)?.end})
                                    </Text>
                                    <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: 'red', marginLeft: 30 }}>
                                        {calculateTimeLeft(data.vimshottariDasha.find(d => d.isCurrent)?.end || '')}
                                    </Text>
                                </View>
                            )}
                            <View style={[styles.table, { width: '100%' }]}>
                                <View style={[styles.row, { backgroundColor: '#f5f5f5' }]}>
                                    <Text style={[styles.cellLabel, { width: '40%' }]}>Planet</Text>
                                    <Text style={[styles.cellLabel, { width: '30%' }]}>Start</Text>
                                    <Text style={[styles.cellLabel, { width: '30%' }]}>End</Text>
                                </View>
                                {data.vimshottariDasha.map((row, idx) => (
                                    <View key={idx}>
                                        <View style={[styles.row, { paddingVertical: 2, backgroundColor: row.isCurrent ? '#fff0f0' : 'transparent' }]}>
                                            <Text style={[styles.cellValue, { width: '40%', fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: row.isCurrent ? 'red' : 'black' }]}>{row.planet}</Text>
                                            <Text style={[styles.cellValue, { width: '30%', fontSize: 9, fontFamily: 'Helvetica-Bold', color: row.isCurrent ? 'red' : 'black' }]}>{row.start}</Text>
                                            <Text style={[styles.cellValue, { width: '30%', fontSize: 9, fontFamily: 'Helvetica-Bold', color: row.isCurrent ? 'red' : 'black' }]}>{row.end}</Text>
                                        </View>
                                        {row.subPeriods && row.subPeriods.map((sub, sIdx) => (
                                            <View key={`${idx}-${sIdx}`} style={[styles.row, { paddingVertical: 1, backgroundColor: sub.isCurrent ? '#fffbf0' : '#f9f9f9', paddingLeft: 6 }]}>
                                                <Text style={[styles.cellValue, { width: '40%', fontSize: 8, fontFamily: 'Helvetica-Bold', color: sub.isCurrent ? '#d97706' : '#444' }]}>  &gt; {sub.planet}</Text>
                                                <Text style={[styles.cellValue, { width: '30%', fontSize: 8, fontFamily: 'Helvetica-Bold', color: sub.isCurrent ? '#d97706' : '#444' }]}>{sub.start}</Text>
                                                <Text style={[styles.cellValue, { width: '30%', fontSize: 8, fontFamily: 'Helvetica-Bold', color: sub.isCurrent ? '#d97706' : '#444' }]}>{sub.end}</Text>
                                            </View>
                                        ))}
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Yogini */}
                        <View style={{ width: '47%' }}>
                            <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>Yogini MahaDasha</Text>
                            {data.yoginiDasha.find(d => d.isCurrent) && (
                                <View style={{ marginBottom: 4 }}>
                                    <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: 'red' }}>
                                        {data.yoginiDasha.find(d => d.isCurrent)?.dashaName} ({data.yoginiDasha.find(d => d.isCurrent)?.start} — {data.yoginiDasha.find(d => d.isCurrent)?.end})
                                    </Text>
                                    <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: 'red', marginLeft: 30 }}>
                                        {calculateTimeLeft(data.yoginiDasha.find(d => d.isCurrent)?.end || '')}
                                    </Text>
                                </View>
                            )}
                            <View style={[styles.table, { width: '100%' }]}>
                                <View style={[styles.row, { backgroundColor: '#f5f5f5' }]}>
                                    <Text style={[styles.cellLabel, { width: '40%' }]}>Dasha</Text>
                                    <Text style={[styles.cellLabel, { width: '30%' }]}>Start</Text>
                                    <Text style={[styles.cellLabel, { width: '30%' }]}>End</Text>
                                </View>
                                {data.yoginiDasha.map((row, idx) => (
                                    <View key={idx}>
                                        <View style={[styles.row, { paddingVertical: 2, backgroundColor: row.isCurrent ? '#fff0f0' : 'transparent' }]}>
                                            <Text style={[styles.cellValue, { width: '40%', fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: row.isCurrent ? 'red' : 'black' }]}>{row.dashaName}</Text>
                                            <Text style={[styles.cellValue, { width: '30%', fontSize: 9, fontFamily: 'Helvetica-Bold', color: row.isCurrent ? 'red' : 'black' }]}>{row.start}</Text>
                                            <Text style={[styles.cellValue, { width: '30%', fontSize: 9, fontFamily: 'Helvetica-Bold', color: row.isCurrent ? 'red' : 'black' }]}>{row.end}</Text>
                                        </View>
                                        {/* Sub Periods */}
                                        {row.subPeriods && row.subPeriods.map((sub, sIdx) => (
                                            <View key={`${idx}-${sIdx}`} style={[styles.row, { paddingVertical: 1, backgroundColor: sub.isCurrent ? '#fffbf0' : '#f9f9f9', paddingLeft: 6 }]}>
                                                <Text style={[styles.cellValue, { width: '40%', fontSize: 8, fontFamily: 'Helvetica-Bold', color: sub.isCurrent ? '#d97706' : '#444' }]}>  &gt; {sub.dashaName}</Text>
                                                <Text style={[styles.cellValue, { width: '30%', fontSize: 8, fontFamily: 'Helvetica-Bold', color: sub.isCurrent ? '#d97706' : '#444' }]}>{sub.start}</Text>
                                                <Text style={[styles.cellValue, { width: '30%', fontSize: 8, fontFamily: 'Helvetica-Bold', color: sub.isCurrent ? '#d97706' : '#444' }]}>{sub.end}</Text>
                                            </View>
                                        ))}
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                </View>

                {/* Mantras Section */}
                {data.currentMantras && (
                    <View style={{ marginTop: 10, padding: 8, backgroundColor: '#ffffff', borderRadius: 4, borderWidth: 1, borderColor: '#fcd34d' }}>
                        <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', marginBottom: 6, color: '#d97706', textAlign: 'center' }}> Mantras</Text>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{ width: '48%' }}>
                                <Text style={{ fontSize: 8, marginTop: 1, color: '#333', marginBottom: 4 }}>"{data.currentMantras.vimshottari.mantra}"</Text>

                                {data.currentMantras.vimshottari.subPlanet && (
                                    <View>
                                        <Text style={{ fontSize: 8, marginTop: 1, color: '#333' }}>"{data.currentMantras.vimshottari.subMantra}"</Text>
                                    </View>
                                )}
                            </View>

                            <View style={{ width: '48%' }}>
                                <Text style={{ fontSize: 8, marginTop: 1, color: '#333', marginBottom: 4 }}>"{data.currentMantras.yogini.mantra}"</Text>

                                {data.currentMantras.yogini.subDasha && (
                                    <View>
                                        <Text style={{ fontSize: 8, marginTop: 1, color: '#333' }}>"{data.currentMantras.yogini.subMantra}"</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                )}

                {/* Prediction Section */}
                {prediction && (
                    <View style={{ marginTop: 10, padding: 12, backgroundColor: '#f9f9f9', borderRadius: 4, borderWidth: 1, borderColor: '#ccc' }}>
                        <Text style={{ fontSize: 15, fontFamily: 'Helvetica-Bold', marginBottom: 8, color: '#333', textAlign: 'center' }}>Prediction</Text>
                        <Text style={{ fontSize: 10, color: '#333', lineHeight: 1.5 }}>
                            {prediction}
                        </Text>
                    </View>
                )}

                {/* Footer */}
                <View style={{ position: 'absolute', bottom: 20, left: 50, right: 25, alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 10, color: '#333', marginBottom: 2 }}>Created by</Text>
                    <Text style={{ fontSize: 9, color: '#333' }}>Name: Bhim Prasad Niroula |</Text>
                    <Text style={{ fontSize: 9, color: '#333' }}>Email: bhimniroula27@gmail.com |</Text>
                    <Text style={{ fontSize: 9, color: '#333' }}>Contact via Whatsapp: +977-9861003516 |</Text>
                    <Text style={{ fontSize: 8, color: '#fc4d4dff', marginTop: 4 }}>| Licensed |</Text>
                </View>
            </Page>
        </Document >
    );
};
