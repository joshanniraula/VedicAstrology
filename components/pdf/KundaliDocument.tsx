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
        padding: 15,
        fontFamily: 'Helvetica',
        fontSize: 10,
        backgroundColor: '#ffffff'
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
        borderBottomWidth: 2,
        borderBottomColor: '#d6d6d6',
        paddingBottom: 5
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
        marginBottom: 5,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    table: {
        width: '48%',
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
        width: '48%',
        height: 200,
        borderWidth: 1,
        borderColor: '#e8bcbc',
        backgroundColor: '#fff8f0',
        position: 'relative' // Important for absolute children
    },
    chartLabel: {
        position: 'absolute',
        fontSize: 7,
        color: 'black',
        textAlign: 'center',
        width: 15, // fixed width to center
        height: 10
    },
    beneficTable: {
        marginTop: 20,
        width: '100%',
        borderWidth: 0,
    },
    beneficRow: {
        flexDirection: 'row',
        marginBottom: 4,
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
                        <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#E35E18', textAlign: 'center', textTransform: 'uppercase' }}>Monjusatya Astrologer Center</Text>
                        <Text style={{ fontSize: 9, color: '#333', marginBottom: 2, textAlign: 'center' }}>Kathmandu, Nepal</Text>
                        <Text style={styles.om}>|| श्री गणेशाय नमः ||</Text>
                        <Text style={styles.title}>|| अथ जन्मकुंडली: ||</Text>
                    </View>

                    {/* 4. Ganesha-Shiva */}
                    <Image src="/ganesha-family.png" style={styles.headerImage} />

                    {/* 5. Lotus */}
                    <Image src="/lotus.jpg" style={styles.headerImage} />
                </View>

                {/* Birth Details Table */}
                <View style={{ marginBottom: 15, borderWidth: 1, borderColor: '#000' }}>
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

                        {/* House Signs (Apexes) */}
                        <Text style={[styles.chartLabel, { top: '4%', left: '46%' }]}>{data.chart.signs[1]}</Text>
                        <Text style={[styles.chartLabel, { top: '2%', left: '15%' }]}>{data.chart.signs[2]}</Text>
                        <Text style={[styles.chartLabel, { top: '15%', left: '2%' }]}>{data.chart.signs[3]}</Text>
                        <Text style={[styles.chartLabel, { top: '48%', left: '4%' }]}>{data.chart.signs[4]}</Text>
                        <Text style={[styles.chartLabel, { bottom: '15%', left: '2%' }]}>{data.chart.signs[5]}</Text>
                        <Text style={[styles.chartLabel, { bottom: '2%', left: '15%' }]}>{data.chart.signs[6]}</Text>
                        <Text style={[styles.chartLabel, { bottom: '4%', left: '46%' }]}>{data.chart.signs[7]}</Text>
                        <Text style={[styles.chartLabel, { bottom: '2%', right: '15%' }]}>{data.chart.signs[8]}</Text>
                        <Text style={[styles.chartLabel, { bottom: '15%', right: '2%' }]}>{data.chart.signs[9]}</Text>
                        <Text style={[styles.chartLabel, { top: '48%', right: '4%' }]}>{data.chart.signs[10]}</Text>
                        <Text style={[styles.chartLabel, { top: '15%', right: '2%' }]}>{data.chart.signs[11]}</Text>
                        <Text style={[styles.chartLabel, { top: '2%', right: '15%' }]}>{data.chart.signs[12]}</Text>

                        {/* Planets for all 12 Houses (Geometric Centroids) */}
                        {[
                            { h: 1, top: '22%', left: '41%' },
                            { h: 2, top: '6%', left: '15%' },
                            { h: 3, top: '22%', left: '2%' },
                            { h: 4, top: '46%', left: '15%' },
                            { h: 5, top: '73%', left: '2%' },
                            { h: 6, top: '89%', left: '15%' },
                            { h: 7, top: '73%', left: '41%' },
                            { h: 8, top: '89%', left: '66%' },
                            { h: 9, top: '73%', left: '80%' },
                            { h: 10, top: '46%', left: '66%' },
                            { h: 11, top: '22%', left: '80%' },
                            { h: 12, top: '6%', left: '66%' },
                        ].map((pos) => {
                            const planets = data.chart.houses[pos.h];
                            if (!planets || planets.length === 0) return null;
                            return (
                                <Text key={pos.h} style={{
                                    position: 'absolute',
                                    top: pos.top,
                                    left: pos.left,
                                    fontSize: 6,
                                    width: 45,
                                    textAlign: 'center',
                                    flexWrap: 'wrap',
                                    lineHeight: 1.2
                                }}>
                                    {planets.map(p => `${p.symbol} ${p.degree}`).join(' ')}
                                </Text>
                            );
                        })}

                    </View>
                </View>

                {/* Planetary Positions Table in PDF */}
                {showPlanetaryPositions && (
                    <View style={{ marginTop: 5 }}>
                        <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', marginBottom: 5 }}>Planetary Positions</Text>
                        <View style={[styles.table, { width: '100%' }]}>
                            <View style={[styles.row, { backgroundColor: '#f5f5f5' }]}>
                                <Text style={[styles.cellLabel, { width: '25%' }]}>Planet</Text>
                                <Text style={[styles.cellLabel, { width: '25%' }]}>Sign</Text>
                                <Text style={[styles.cellLabel, { width: '20%' }]}>Degree</Text>
                                <Text style={[styles.cellLabel, { width: '30%' }]}>Nakshatra</Text>
                            </View>
                            {data.planetaryPositions.map((p, idx) => (
                                <View style={styles.row} key={idx}>
                                    <Text style={[styles.cellValue, { width: '25%', fontFamily: 'Helvetica-Bold' }]}>{p.planet}</Text>
                                    <Text style={[styles.cellValue, { width: '25%' }]}>{p.rashi}</Text>
                                    <Text style={[styles.cellValue, { width: '20%' }]}>{p.position}°</Text>
                                    <Text style={[styles.cellValue, { width: '30%' }]}>{p.nakshatra}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Benefic / Malefic Section */}
                <View style={{ marginTop: 5 }}>
                    <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', marginBottom: 5 }}>Benefic and Malefic Analysis</Text>
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
                <View style={{ position: 'absolute', top: 30, right: 30 }}>
                    <Text style={{ fontSize: 8, color: '#666' }}>Print date (MM-DD-YYYY): {new Date().toLocaleDateString()}</Text>
                </View>

                {/* Dasha Tables in PDF */}
                <View style={{ marginTop: 20 }}>
                    <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold', marginBottom: 10, textAlign: 'center', color: '#E35E18' }}>Dasha Period ({data.birthDetails.name})</Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'nowrap', alignItems: 'flex-start' }}>
                        {/* Vimshottari */}
                        <View style={{ width: '47%' }}>
                            <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>Vimshottari Dasha</Text>
                            {data.vimshottariDasha.find(d => d.isCurrent) && (
                                <View style={{ marginBottom: 4 }}>
                                    <Text style={{ fontSize: 8, color: 'red' }}>
                                        Current: {data.vimshottariDasha.find(d => d.isCurrent)?.planet} ({data.vimshottariDasha.find(d => d.isCurrent)?.start} — {data.vimshottariDasha.find(d => d.isCurrent)?.end})
                                    </Text>
                                    <Text style={{ fontSize: 8, color: 'red', marginLeft: 30 }}>
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
                                    <React.Fragment key={idx}>
                                        <View style={[styles.row, { paddingVertical: 2, backgroundColor: row.isCurrent ? '#fff0f0' : 'transparent' }]}>
                                            <Text style={[styles.cellValue, { width: '40%', fontFamily: 'Helvetica-Bold', color: row.isCurrent ? 'red' : 'black' }]}>{row.planet}</Text>
                                            <Text style={[styles.cellValue, { width: '30%', color: row.isCurrent ? 'red' : 'black' }]}>{row.start}</Text>
                                            <Text style={[styles.cellValue, { width: '30%', color: row.isCurrent ? 'red' : 'black' }]}>{row.end}</Text>
                                        </View>
                                        {row.subPeriods && row.subPeriods.map((sub, sIdx) => (
                                            <View key={`${idx}-${sIdx}`} style={[styles.row, { paddingVertical: 1, backgroundColor: sub.isCurrent ? '#fffbf0' : '#f9f9f9', paddingLeft: 6 }]}>
                                                <Text style={[styles.cellValue, { width: '40%', fontSize: 7, color: sub.isCurrent ? '#d97706' : '#666' }]}>  &gt; {sub.planet}</Text>
                                                <Text style={[styles.cellValue, { width: '30%', fontSize: 7, color: sub.isCurrent ? '#d97706' : '#666' }]}>{sub.start}</Text>
                                                <Text style={[styles.cellValue, { width: '30%', fontSize: 7, color: sub.isCurrent ? '#d97706' : '#666' }]}>{sub.end}</Text>
                                            </View>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </View>
                        </View>

                        {/* Yogini */}
                        <View style={{ width: '47%' }}>
                            <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>Yogini Dasha</Text>
                            {data.yoginiDasha.find(d => d.isCurrent) && (
                                <View style={{ marginBottom: 4 }}>
                                    <Text style={{ fontSize: 8, color: 'red' }}>
                                        Current: {data.yoginiDasha.find(d => d.isCurrent)?.dashaName} ({data.yoginiDasha.find(d => d.isCurrent)?.start} — {data.yoginiDasha.find(d => d.isCurrent)?.end})
                                    </Text>
                                    <Text style={{ fontSize: 8, color: 'red', marginLeft: 30 }}>
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
                                    <React.Fragment key={idx}>
                                        <View style={[styles.row, { paddingVertical: 2, backgroundColor: row.isCurrent ? '#fff0f0' : 'transparent' }]}>
                                            <Text style={[styles.cellValue, { width: '40%', fontFamily: 'Helvetica-Bold', color: row.isCurrent ? 'red' : 'black' }]}>{row.dashaName}</Text>
                                            <Text style={[styles.cellValue, { width: '30%', color: row.isCurrent ? 'red' : 'black' }]}>{row.start}</Text>
                                            <Text style={[styles.cellValue, { width: '30%', color: row.isCurrent ? 'red' : 'black' }]}>{row.end}</Text>
                                        </View>
                                        {/* Sub Periods */}
                                        {row.subPeriods && row.subPeriods.map((sub, sIdx) => (
                                            <View key={`${idx}-${sIdx}`} style={[styles.row, { paddingVertical: 1, backgroundColor: sub.isCurrent ? '#fffbf0' : '#f9f9f9', paddingLeft: 6 }]}>
                                                <Text style={[styles.cellValue, { width: '40%', fontSize: 7, color: sub.isCurrent ? '#d97706' : '#666' }]}>  &gt; {sub.dashaName}</Text>
                                                <Text style={[styles.cellValue, { width: '30%', fontSize: 7, color: sub.isCurrent ? '#d97706' : '#666' }]}>{sub.start}</Text>
                                                <Text style={[styles.cellValue, { width: '30%', fontSize: 7, color: sub.isCurrent ? '#d97706' : '#666' }]}>{sub.end}</Text>
                                            </View>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </View>
                        </View>
                    </View>
                </View>

                {/* Mantras Section */}
                {data.currentMantras && (
                    <View style={{ marginTop: 20, padding: 10, backgroundColor: '#ffffff', borderRadius: 4, borderWidth: 1, borderColor: '#fcd34d' }}>
                        <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', marginBottom: 8, color: '#d97706', textAlign: 'center' }}>Remedial Mantras</Text>

                        <View style={{ marginBottom: 8 }}>
                            <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#92400e' }}>For Current Vimshottari ({data.currentMantras.vimshottari.planet}):</Text>
                            <Text style={{ fontSize: 10, fontStyle: 'italic', marginTop: 2, color: '#333' }}>"{data.currentMantras.vimshottari.mantra}"</Text>
                        </View>

                        <View>
                            <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#92400e' }}>For Current Yogini ({data.currentMantras.yogini.dasha}):</Text>
                            <Text style={{ fontSize: 10, fontStyle: 'italic', marginTop: 2, color: '#333' }}>"{data.currentMantras.yogini.mantra}"</Text>
                        </View>
                    </View>
                )}

                {/* Prediction Section */}
                {prediction && (
                    <View style={{ marginTop: 20, padding: 15, backgroundColor: '#f9f9f9', borderRadius: 4, borderWidth: 1, borderColor: '#ccc' }}>
                        <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', marginBottom: 8, color: '#333', textAlign: 'center' }}>Astrologer's Prediction</Text>
                        <Text style={{ fontSize: 10, color: '#333', lineHeight: 1.5 }}>
                            {prediction}
                        </Text>
                    </View>
                )}

                {/* Footer */}
                <View style={{ position: 'absolute', bottom: 20, left: 30, right: 30, alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 10, color: '#333', marginBottom: 2 }}>Created by</Text>
                    <Text style={{ fontSize: 9, color: '#333' }}>Name: Bhim Prasad Niroula |</Text>
                    <Text style={{ fontSize: 9, color: '#333' }}>Email: bhimniroula27@gmail.com |</Text>
                    <Text style={{ fontSize: 9, color: '#333' }}>Contact via Whatsapp: +977-9861003516 |</Text>
                    <Text style={{ fontSize: 8, color: '#fc4d4dff', marginTop: 4 }}>| Licensed |</Text>
                </View>
            </Page>
        </Document>
    );
};
