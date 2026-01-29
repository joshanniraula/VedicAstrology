import { KundaliReport as ReportType, ChartPlanet } from './types';
import * as Astronomy from 'astronomy-engine';
import tzLookup from '@photostructure/tz-lookup';
import { DateTime } from 'luxon';
import { YOGAS, KARANAS, NAKSHATRA_DETAILS, RASHI_INFO, LAGNA_DATA, NUMEROLOGY_DATA } from './panchang-data';
import { VIMSHOTTARI_LORDS, VIMSHOTTARI_YEARS, YOGINI_DAHSAS, YOGINI_YEARS } from './dasha-data';
import MANTRAS from './mantras.json';

// --- Math Helpers ---
const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

function normalize(deg: number): number {
    deg = deg % 360;
    if (deg < 0) deg += 360;
    return deg;
}

async function getCoordinates(place: string): Promise<{ lat: number, lon: number }> {
    console.log(`Geocoding place: ${place}`);
    const query = encodeURIComponent(place.trim());
    // Use a more unique User-Agent and include a contact if possible
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'VedicAstrologyApp/1.0 (contact: admin@bhimniroula.netlify.app)',
                'Accept-Language': 'en'
            }
        });

        if (!response.ok) {
            console.error(`Geocoding API responded with status: ${response.status}`);
            throw new Error(`Geocoding service unavailable (Status: ${response.status})`);
        }

        const data = await response.json();
        console.log(`Geocoding response received:`, data);

        if (Array.isArray(data) && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon)
            };
        }
        throw new Error("Location not found. Please try a different city name.");
    } catch (err: any) {
        console.error("Geocoding fetch error:", err);
        if (err.message.includes("fetch failed")) {
            throw new Error("Network error while looking up location. Please check your internet connection.");
        }
        throw err;
    }
}

// --- Constants & Data ---

const RASHIS = [
    "", "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const RASHI_LORDS: Record<number, string> = {
    1: "Mars", 2: "Venus", 3: "Mercury", 4: "Moon", 5: "Sun", 6: "Mercury",
    7: "Venus", 8: "Mars", 9: "Jupiter", 10: "Saturn", 11: "Saturn", 12: "Jupiter"
};

const NAKSHATRAS = [
    { name: "Ashwini", lord: "Ketu" }, { name: "Bharani", lord: "Venus" }, { name: "Krittika", lord: "Sun" },
    { name: "Rohini", lord: "Moon" }, { name: "Mrigashira", lord: "Mars" }, { name: "Ardra", lord: "Rahu" },
    { name: "Punarvasu", lord: "Jupiter" }, { name: "Pushya", lord: "Saturn" }, { name: "Ashlesha", lord: "Mercury" },
    { name: "Magha", lord: "Ketu" }, { name: "Purva Phalguni", lord: "Venus" }, { name: "Uttara Phalguni", lord: "Sun" },
    { name: "Hasta", lord: "Moon" }, { name: "Chitra", lord: "Mars" }, { name: "Swati", lord: "Rahu" },
    { name: "Vishakha", lord: "Jupiter" }, { name: "Anuradha", lord: "Saturn" }, { name: "Jyeshtha", lord: "Mercury" },
    { name: "Mula", lord: "Ketu" }, { name: "Purva Ashadha", lord: "Venus" }, { name: "Uttara Ashadha", lord: "Sun" },
    { name: "Shravana", lord: "Moon" }, { name: "Dhanishta", lord: "Mars" }, { name: "Shatabhisha", lord: "Rahu" },
    { name: "Purva Bhadrapada", lord: "Jupiter" }, { name: "Uttara Bhadrapada", lord: "Saturn" }, { name: "Revati", lord: "Mercury" }
];

const TITHIS = [
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi",
    "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi",
    "Trayodashi", "Chaturdashi", "Purnima", "Amavasya"
];

// --- Vedic Astrology Helpers ---

function getLahiriAyanamsa(date: Date): number {
    const astroTime = Astronomy.MakeTime(date);
    const jd = astroTime.ut;
    // FIXED: astroTime.ut is ALREADY days since J2000. Do NOT subtract 2.45M.
    const daysSinceJ2000 = jd;
    const yearsSinceJ2000 = daysSinceJ2000 / 365.25;
    const initialOffset = 23.861111;
    const precession = 0.0139694;
    return initialOffset + (yearsSinceJ2000 * precession);
}

function toSidereal(tropicalLon: number, ayanamsa: number): number {
    return normalize(tropicalLon - ayanamsa);
}

function getRashi(longitude: number): { signId: number; name: string; position: number } {
    const signId = Math.floor(longitude / 30) + 1;
    return {
        signId,
        name: RASHIS[signId] || "Aries",
        position: longitude % 30
    };
}

function getNakshatra(longitude: number) {
    const exactIndex = longitude / (360 / 27);
    const index = Math.floor(exactIndex) % 27;
    const charm = Math.floor((exactIndex - Math.floor(exactIndex)) * 4) + 1;

    const nakdata = NAKSHATRAS[index] || NAKSHATRAS[0];
    return {
        name: nakdata.name,
        lord: nakdata.lord,
        pada: charm
    };
}

function mapPlanetSymbol(name: string): string {
    const map: Record<string, string> = {
        "Sun": "Su", "Moon": "Mo", "Mars": "Ma", "Mercury": "Me",
        "Jupiter": "Ju", "Venus": "Ve", "Saturn": "Sa",
        "Rahu": "Ra", "Ketu": "Ke",
        "Uranus": "Ur", "Neptune": "Ne", "Pluto": "Pl"
    };
    return map[name] || name.substring(0, 2);
}

function getYoga(sunLon: number, moonLon: number): string {
    const sum = normalize(sunLon + moonLon);
    const index = Math.floor(sum / (360 / 27));
    return YOGAS[index % 27];
}

function getKarana(sunLon: number, moonLon: number): string {
    const diff = normalize(moonLon - sunLon);
    const index = Math.floor(diff / 6); // 60 half-tithis

    // Logic for Karana
    if (index === 0) return "Kimstughna";
    if (index >= 57) {
        if (index === 57) return "Shakuni";
        if (index === 58) return "Chatushpada";
        if (index === 59) return "Naga";
    }
    // Movable Karanas: Bava, Balava, Kaulava, Taitila, Gara, Vanija, Vishti (7)
    // Starting from index 1 (2nd half-tithi). 
    // (index - 1) % 7
    return KARANAS[(index - 1) % 7];
}

function getTithi(sunLon: number, moonLon: number): string {
    const diff = normalize(moonLon - sunLon);
    const tithiIndex = Math.floor(diff / 12) + 1; // 1 to 30

    const paksha = tithiIndex <= 15 ? "Shukla" : "Krishna";
    const displayNameIndex = tithiIndex <= 15 ? tithiIndex : tithiIndex - 15;

    // Special Cases
    if (tithiIndex === 15) return "Purnima (Full Moon)";
    if (tithiIndex === 30) return "Amavasya (New Moon)";

    const name = TITHIS[displayNameIndex - 1];
    return `${paksha} ${name}`;
}

function getPaya(moonSign: number, ascSign: number): string {
    // 1-based House number
    const house = (moonSign - ascSign + 12) % 12 + 1;
    if ([1, 6, 11].includes(house)) return "Gold";
    if ([2, 5, 9].includes(house)) return "Silver";
    if ([3, 7, 10].includes(house)) return "Copper";
    if ([4, 8, 12].includes(house)) return "Iron";
    return "Silver"; // Default
}

function getNumerology(dateStr: string): { root: number, destiny: number } {
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();

    const sumDigits = (n: number) => {
        let sum = 0;
        while (n > 0 || sum > 9) {
            if (n === 0) { n = sum; sum = 0; }
            sum += n % 10;
            n = Math.floor(n / 10);
        }
        return sum;
    };

    return {
        root: sumDigits(day),
        destiny: sumDigits(day + month + year)
    };
}

// --- Specific Calculations ---

function getMeanNode(date: Date): number {
    const astroTime = Astronomy.MakeTime(date);
    const jd = astroTime.ut;
    // FIXED: Correct Time scale for Julian Centuries relative to J2000
    const T = jd / 36525.0;

    const omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + T * T * T / 450000;
    return normalize(omega);
}

// Accurate Ascendant
function getAscendant(date: Date, lat: number, lng: number): number {
    const astroTime = Astronomy.MakeTime(date);
    const gmst = Astronomy.SiderealTime(date);
    const lstDeg = normalize(gmst * 15 + lng);

    // Obliquity of ecliptic (more precise calculation)
    const T = astroTime.ut / 36525.0; // Julian Centuries since J2000
    const eps = (23.4392911 - (46.8150 * T + 0.00059 * T * T - 0.001813 * T * T * T) / 3600.0) * DEG2RAD;

    const ramc = lstDeg * DEG2RAD;
    const latRad = lat * DEG2RAD;

    // Standard Ascendant Formula:
    // tan Asc = cos RAMC / (-sin RAMC * cos e - tan lat * sin e)
    const y = Math.cos(ramc);
    const x = -Math.sin(ramc) * Math.cos(eps) - Math.tan(latRad) * Math.sin(eps);

    let ascRad = Math.atan2(y, x);
    let ascDeg = normalize(ascRad * RAD2DEG);

    return ascDeg;
}

// --- Dasha Calculations ---

function calculateDashaDates(
    startDate: Date,
    nakshatraLon: number, // 0-360 mapped to nakshatra progress
    totalCycleYears: number,
    lords: string[],
    years: number[],
    startNakshatraIndex: number, // 0-26 or 0-7 depends on system. 
    // Actually for Vimshottari: Nakshatra index determines the LORD.
    // For Yogini: Nakshatra index determines the YOGINI.
    type: 'Vimshottari' | 'Yogini' | 'Tribhagi'
) {
    // 1. Calculate Balance
    // Range of one nakshatra: 13.333 deg
    const NAK_DURATION = 360 / 27;
    const progressInNak = nakshatraLon % NAK_DURATION; // Degrees passed
    const fractionPassed = progressInNak / NAK_DURATION;
    const fractionRemaining = 1 - fractionPassed;

    let dashaList = [];
    let currentDate = new Date(startDate);

    // Determine Starting Lord Index
    let lordIndex = 0;

    if (type === 'Vimshottari' || type === 'Tribhagi') {
        // Lords list is 9. Nakshatras 27.
        // Nakshatra 0 (Ashwini) -> Ketu (Index 0)
        // Lord Index = NakshatraIndex % 9
        const nakIndex = Math.floor(nakshatraLon / NAK_DURATION);
        lordIndex = nakIndex % 9;
    } else if (type === 'Yogini') {
        // Formula: (NakshatraIndex + 3) % 8. 
        // Index 1-27 usually used in texts. Here 0-26.
        // If 0 (Ashwini): (1 + 3) = 4 -> Bhramari?
        // Let's verify standard: Ashwini(1) -> Mangala(1)? No.
        // Standard: Add 3 to Nakshatra number. Divide by 8. Remainder:
        // 1=Mangala, 2=Pingala... 0=Sankata.
        const nakIndex = Math.floor(nakshatraLon / NAK_DURATION) + 1; // 1-based
        const remainder = (nakIndex + 3) % 8;
        // Remainder 1 -> Index 0 (Mangala)
        // Remainder 0 -> Index 7 (Sankata)
        lordIndex = (remainder === 0) ? 7 : (remainder - 1);
    }

    // First Dasha (Balance)
    // First Dasha (Balance)
    let firstLordParams = { lord: lords[lordIndex], fullYears: years[lordIndex] };
    if (type === 'Tribhagi') firstLordParams.fullYears = firstLordParams.fullYears * (2 / 3);

    const balanceYears = firstLordParams.fullYears * fractionRemaining;
    const firstEndDate = new Date(currentDate);
    firstEndDate.setDate(firstEndDate.getDate() + Math.round(balanceYears * 365.25));

    const checkCurrent = (start: Date, end: Date) => {
        const now = new Date();
        return now >= start && now <= end;
    };

    dashaList.push({
        name: firstLordParams.lord,
        start: currentDate.toISOString().split('T')[0],
        end: firstEndDate.toISOString().split('T')[0],
        duration: balanceYears, // approximate
        isCurrent: checkCurrent(currentDate, firstEndDate)
    });

    currentDate = firstEndDate;

    // Generate Next cycles (e.g. 1-2 full cycles or until 100 years?)
    // Let's generate about 9 steps (1 full cycle)
    // Generate cycles until we cover 100+ years from birth
    let steps = 0;
    while (steps < 50) { // Safety limit
        const yearsPassed = (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        if (yearsPassed > 100) break;

        let idx = (lordIndex + 1) % lords.length;
        lordIndex++;

        let dYears = years[idx];
        if (type === 'Tribhagi') dYears = dYears * (2 / 3);

        let endDate = new Date(currentDate);
        endDate.setDate(endDate.getDate() + Math.round(dYears * 365.25));

        dashaList.push({
            name: lords[idx],
            start: currentDate.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0],
            duration: dYears,
            isCurrent: checkCurrent(currentDate, endDate)
        });
        currentDate = endDate;
        steps++;
    }

    return dashaList;
}

function getSubPeriods(
    majorStart: string,
    majorPlanet: string,
    majorDuration: number,
    lords: string[],
    years: number[], // full cycle years per planet
    type: 'Vimshottari' | 'Yogini' | 'Tribhagi',
    totalCycle: number
) {
    const start = new Date(majorStart);
    let current = new Date(start);
    const subList = [];

    // Identify start index (The major lord itself starts the sub-cycle)
    let startIndex = lords.findIndex(l => l === majorPlanet);
    if (startIndex === -1) startIndex = 0;

    const checkCurrent = (s: Date, e: Date) => {
        const now = new Date();
        return now >= s && now <= e;
    };

    for (let i = 0; i < lords.length; i++) {
        const idx = (startIndex + i) % lords.length;
        const subLord = lords[idx];
        const subLordYears = years[idx]; // Base years for this planet in cycle

        // Formula: SubDuration = MajorDuration * (SubLordYears / TotalCycle)
        let subDuration = majorDuration * (subLordYears / totalCycle);

        const end = new Date(current);
        end.setDate(end.getDate() + Math.round(subDuration * 365.25));

        subList.push({
            planet: subLord, // or dashaName
            dashaName: subLord, // normalization
            start: current.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0],
            isCurrent: checkCurrent(current, end)
        });

        current = end;
    }
    return subList;
}

// --- Main Fetch Function ---

export async function fetchKundaliData(input: {
    name: string;
    date: string;
    time: string;
    place: string;
    country: string;
}): Promise<ReportType> {

    try {
        console.log("Processing Kundali for:", input);

        const queryPlace = `${input.place}, ${input.country}`;
        const { lat, lon } = await getCoordinates(queryPlace);
        const timezoneId = tzLookup(lat, lon);

        const dt = DateTime.fromISO(`${input.date}T${input.time}`, { zone: timezoneId });
        if (!dt.isValid) throw new Error("Invalid Date/Time");
        const dateObj = dt.toJSDate();

        const ayanamsa = getLahiriAyanamsa(dateObj);

        const bodies = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];

        const sunAstroTime = Astronomy.MakeTime(dateObj);
        const sunVector = Astronomy.GeoVector("Sun" as Astronomy.Body, sunAstroTime, true);
        const sunPos = Astronomy.Ecliptic(sunVector);
        const sunSiderealLon = toSidereal(sunPos.elon, ayanamsa);

        let allPlanets = bodies.map(body => {
            const astroTime = Astronomy.MakeTime(dateObj);

            // Current Position
            const result = Astronomy.GeoVector(body as Astronomy.Body, astroTime, true);
            const pos = Astronomy.Ecliptic(result);
            const siderealLon = toSidereal(pos.elon, ayanamsa);

            // Check Retrograde: Compare with position 1 hour later
            const laterTime = new Date(dateObj.getTime() + 60 * 60 * 1000);
            const laterAstroTime = Astronomy.MakeTime(laterTime);
            const laterResult = Astronomy.GeoVector(body as Astronomy.Body, laterAstroTime, true);
            const laterPos = Astronomy.Ecliptic(laterResult);
            const laterSiderealLon = toSidereal(laterPos.elon, ayanamsa);

            // Handle degree wrapping (e.g. 359 -> 1)
            let diff = laterSiderealLon - siderealLon;
            if (diff > 180) diff -= 360;
            if (diff < -180) diff += 360;
            const isRetrograde = diff < 0;

            // Check Combustion (Asta)
            let isCombust = false;
            if (body !== "Sun") {
                const angleToSun = Math.abs(normalize(siderealLon - sunSiderealLon));
                const distance = Math.min(angleToSun, 360 - angleToSun);

                const combustionLimits: Record<string, number> = {
                    "Moon": 12, "Mars": 17, "Jupiter": 11, "Saturn": 15,
                    "Mercury": isRetrograde ? 12 : 14,
                    "Venus": isRetrograde ? 8 : 10
                };
                if (combustionLimits[body] && distance <= combustionLimits[body]) {
                    isCombust = true;
                }
            }

            const rashiData = getRashi(siderealLon);
            const nakData = getNakshatra(siderealLon);

            return {
                planet: body,
                sign_id: rashiData.signId,
                rashi: rashiData.name,
                position: rashiData.position.toFixed(2),
                nakshatra: nakData.name,
                nakshatraLord: nakData.lord,
                isRetrograde,
                isCombust
            };
        });

        // Nodes
        const rahuTropical = getMeanNode(dateObj);
        const rahuSidereal = toSidereal(rahuTropical, ayanamsa);
        const ketuSidereal = normalize(rahuSidereal + 180);

        const rahuRashi = getRashi(rahuSidereal);
        const rahuNak = getNakshatra(rahuSidereal);
        allPlanets.push({
            planet: "Rahu", sign_id: rahuRashi.signId, rashi: rahuRashi.name,
            position: rahuRashi.position.toFixed(2), nakshatra: rahuNak.name,
            nakshatraLord: rahuNak.lord,
            isRetrograde: true, // Nodes are always retrograde
            isCombust: false
        });

        const ketuRashi = getRashi(ketuSidereal);
        const ketuNak = getNakshatra(ketuSidereal);
        allPlanets.push({
            planet: "Ketu", sign_id: ketuRashi.signId, rashi: ketuRashi.name,
            position: ketuRashi.position.toFixed(2), nakshatra: ketuNak.name,
            nakshatraLord: ketuNak.lord,
            isRetrograde: true, // Nodes are always retrograde
            isCombust: false
        });

        // Ascendant
        const ascTropical = getAscendant(dateObj, lat, lon);
        const ascSidereal = toSidereal(ascTropical, ayanamsa);
        const ascData = getRashi(ascSidereal);
        const ascNak = getNakshatra(ascSidereal);
        const ascendantSignId = ascData.signId;

        // Construction
        const signs: Record<number, number> = {};
        for (let i = 1; i <= 12; i++) {
            let signId = (ascendantSignId + i - 2) % 12 + 1;
            signs[i] = signId;
        }

        const houses: Record<number, ChartPlanet[]> = {
            1: [], 2: [], 3: [], 4: [], 5: [], 6: [],
            7: [], 8: [], 9: [], 10: [], 11: [], 12: []
        };

        allPlanets.forEach((p) => {
            const houseNum = (p.sign_id - ascendantSignId + 12) % 12 + 1;
            const symbol = mapPlanetSymbol(p.planet);
            if (houses[houseNum]) {
                houses[houseNum].push({
                    symbol: symbol,
                    degree: Math.floor(parseFloat(p.position)).toString().padStart(2, '0') + "°"
                });
            }
        });

        const finalPositions = [...allPlanets, {
            planet: "Ascendant",
            sign_id: ascendantSignId,
            rashi: ascData.name,
            position: ascData.position.toFixed(2),
            nakshatra: ascNak.name,
            isRetrograde: false,
            isCombust: false
            // nakshatraLord not strictly needed in list for now
        }];

        // --- Derived Data for Reports ---
        const moonData = allPlanets.find(p => p.planet === "Moon");
        const nakshatraName = moonData?.nakshatra || "Unknown";

        // Find Moon longitude
        const astroTimeMoon = Astronomy.MakeTime(dateObj);
        const moonResult = Astronomy.GeoVector("Moon" as Astronomy.Body, astroTimeMoon, true);
        const moonPos = Astronomy.Ecliptic(moonResult);
        const moonSidereal = toSidereal(moonPos.elon, ayanamsa);
        const moonNakFull = getNakshatra(moonSidereal);

        const numerology = getNumerology(input.date);

        // Calculate Yoga & Karana
        const astroTimeSun = Astronomy.MakeTime(dateObj);
        const sunResult = Astronomy.GeoVector("Sun" as Astronomy.Body, astroTimeSun, true);
        const sunPosEco = Astronomy.Ecliptic(sunResult);
        const sunSidereal = toSidereal(sunPosEco.elon, ayanamsa);

        const yogaName = getYoga(sunSidereal, moonSidereal);
        const karanaName = getKarana(sunSidereal, moonSidereal);
        const tithiName = getTithi(sunSidereal, moonSidereal);

        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayOfWeek = daysOfWeek[dateObj.getDay()];

        // Nakshatra Details
        // Find index of standard 27 nakshatras in our new list.
        // NAKSHATRAS array in this file has 27 items in order, so likely 
        // moonNakFull.name matches NAKSHATRA_DETAILS items.
        // We need the index 0-26.
        // moonNakFull is calculated from NAKSHATRAS array at line 93.
        const nakIndex = NAKSHATRAS.findIndex(n => n.name === moonNakFull.name);
        const nakDetail = NAKSHATRA_DETAILS[nakIndex] || NAKSHATRA_DETAILS[0];

        const rashiDetail = RASHI_INFO[moonData?.sign_id || 1] || RASHI_INFO[1];
        const payaName = getPaya(moonData?.sign_id || 1, ascendantSignId);

        const lagnaInfo = LAGNA_DATA[ascendantSignId] || LAGNA_DATA[1];
        const numInfo = NUMEROLOGY_DATA[numerology.root] || NUMEROLOGY_DATA[1];

        const syllable = nakDetail.syllables[(moonNakFull.pada || 1) - 1];

        // --- Calculate Dashas ---
        const vimList = calculateDashaDates(
            dateObj,
            moonSidereal,
            120,
            VIMSHOTTARI_LORDS,
            VIMSHOTTARI_YEARS,
            0,
            'Vimshottari'
        ).map(d => ({ planet: d.name, start: d.start, end: d.end, duration: d.duration, isCurrent: d.isCurrent }));

        const yoginiList = calculateDashaDates(
            dateObj,
            moonSidereal,
            36,
            YOGINI_DAHSAS,
            YOGINI_YEARS,
            0,
            'Yogini'
        ).map(d => ({ dashaName: d.name, start: d.start, end: d.end, duration: d.duration, isCurrent: d.isCurrent }));

        const tribhagiList: { planet: string; start: string; end: string; duration: number; isCurrent?: boolean }[] = [];
        /* Tribhagi Disabled
        const tribhagiList = calculateDashaDates(
            dateObj,
            moonSidereal,
            80,
            VIMSHOTTARI_LORDS,
            VIMSHOTTARI_YEARS,
            0,
            'Tribhagi'
        ).map(d => ({ planet: d.name, start: d.start, end: d.end, duration: d.duration, isCurrent: d.isCurrent }));
        */

        // Filter Logic:
        // User Request: "make only current dasha will appear but list all the pratyantar dash in that time too"
        // Interpret: Show ONLY the current Mahadasha row. But populate its sub-periods.

        const filterCurrentOnly = (list: any[], type: 'Vimshottari' | 'Yogini') => {
            const currentItem = list.find(d => d.isCurrent);
            if (!currentItem) return []; // Fallback empty if nothing current (rare)

            // Calculate Sub Periods
            let lords = VIMSHOTTARI_LORDS;
            let years = VIMSHOTTARI_YEARS;
            let totalCycle = 120;
            let mainDuration = currentItem.duration;

            if (type === 'Yogini') {
                lords = YOGINI_DAHSAS; // These are Names
                years = YOGINI_YEARS;
                totalCycle = 36;
            }

            // Note: For incomplete balance dasha, the duration might be fractional 'balanceYears'.
            // However, the standard calculation rule uses the FULL MD duration to derive AD durations.
            // Balance logic is complex: The first AD might be gone.
            // Simplified Approach: Recalculate full sub-periods for the Lord, then filter? 
            // Or just calculate sub-periods based on the ACTUAL start time?
            // Actually, if it's a "balance" dasha, the start date is the birth date. 
            // But standard Antardashas start from the true beginning of the Mahadasha.
            // Complex case: If we are in the middle of a "Balance" Mahadasha, we need to know the true start of that Mahadasha to plot Antardashas correctly.
            // Approximation: 
            // If it's a regular dasha (not start), duration is full years.
            // If it's start dasha, duration is partial.
            // We'll trust the user wants to see the breakdown of the "Current" period. 
            // If current period is the FIRST (Balance) one, we might need to adjust.
            // For now, let's just break down the *Current Duration*? NO, that's wrong. 
            // Antardasha length is fixed based on Lord.
            // We should use the *Standard Years* of the current Lord for calculation, but mapped to the time range 
            // spanning the full Mahadasha.
            // BUT, `currentItem.start` might be the Birth Date (middle of Dasha).
            // This is a nuance. 
            // Let's assume standard full cycle for now for simpler implementation, unless `currentItem` is the very first one, 
            // in which case we might miss earlier ADs.

            // Wait, finding the full years for the current planet is easy:
            const pIndex = lords.findIndex(l => l === (currentItem.name || currentItem.planet || currentItem.dashaName));
            const fullYears = (pIndex >= 0) ? years[pIndex] : 0;

            const subs = getSubPeriods(
                currentItem.start, // If this is birth date (balance), this is effectively shifting the ADs... 
                // Ideally we need True Start of MD. 
                // True Start = End Date - Full Duration.
                // Let's estimate True Start since we have End Date and Full Duration (standard).
                // End Date is correct. `start` might be clamped to birth.
                // So TrueStart = currentItem.end - (FullYears)
                currentItem.name || currentItem.planet || currentItem.dashaName,
                fullYears,
                lords,
                years,
                type,
                totalCycle
            );

            // Correction: If this is the 'Balance' dasha, the 'start' we have is Birth Date. 
            // The calculated 'subs' will start from Birth Date if we pass it.
            // Does the user want standard ADs? 
            // If we use `end` date to back-calculate, we get the theoretical start.
            // Then we generate ADs from there.
            // Then we can filter ADs that are before birth? Or just show them.
            // Let's refine `getSubPeriods` call to use back-calculated start.

            // Calculate approximate True Start based on end date
            const endDateObj = new Date(currentItem.end);
            const trueDurationMs = fullYears * 365.25 * 24 * 3600 * 1000;
            const trueStartObj = new Date(endDateObj.getTime() - trueDurationMs);
            const trueStartStr = trueStartObj.toISOString().split('T')[0];

            // Re-run with true start
            const correctSubs = getSubPeriods(
                trueStartStr,
                currentItem.name || currentItem.planet || currentItem.dashaName,
                fullYears,
                lords,
                years,
                type,
                totalCycle
            );

            // Post-filter subs to only those ending after birth (currentItem.start)
            // Actually, keep them all to show the full structure, or filter if requested. 
            // "list all pratyantar in that time" -> if time is filtered to Now +/- 10, maybe we show relevant ones.
            // But usually seeing the full breakdown of the MD is good.

            const mappedItem = {
                ...currentItem,
                subPeriods: correctSubs.map(s => ({
                    planet: s.planet, // or dashaName
                    dashaName: s.dashaName,
                    start: s.start,
                    end: s.end,
                    isCurrent: s.isCurrent
                }))
            };
            return [mappedItem];
        };

        const filteredVimList = filterCurrentOnly(vimList, 'Vimshottari');
        const filteredYoginiList = filterCurrentOnly(yoginiList, 'Yogini');

        // Identify Current Mantras
        // Vimshottari
        const currentVim = filteredVimList.length > 0 ? filteredVimList[0] : null;
        const currentVimPlanet = currentVim ? currentVim.planet : "Sun";
        // Assuming MANTRAS is imported or defined elsewhere
        const vimMantra = (MANTRAS.planets as any)[currentVimPlanet]?.beej || "Om Suryaya Namah";

        // Yogini
        const currentYogini = filteredYoginiList.length > 0 ? filteredYoginiList[0] : null;
        const currentYoginiName = currentYogini ? currentYogini.dashaName : "Mangala";
        // Assuming MANTRAS is imported or defined elsewhere
        const yoginiMantra = (MANTRAS.yoginis as any)[currentYoginiName] || "Om Devi Namah";

        return {
            birthDetails: {
                name: input.name,
                date: input.date,
                time: input.time,
                place: input.place,
                country: input.country,
                lat: lat,
                lon: lon,
                timezone: timezoneId,
                tithi: tithiName,
                dayOfWeek: dayOfWeek
            },
            avakahada: {
                ascendantLord: `${ascData.name} / ${RASHI_LORDS[ascendantSignId]}`,
                rashiLord: `${moonData?.rashi || "Aries"} / ${RASHI_LORDS[moonData?.sign_id || 1]}`,
                nakshatraCharan: `${moonNakFull.name} - ${moonNakFull.pada}`,
                nakshatraLord: moonNakFull.lord,
                yoga: yogaName,
                karana: karanaName,
                gana: nakDetail.gana,
                yoni: nakDetail.yoni,
                nadi: nakDetail.nadi,
                varan: rashiDetail.varna,
                vashya: rashiDetail.vashya,
                nameAlphabet: syllable,
                paya: payaName
            },
            chart: { signs, houses },
            planetaryPositions: finalPositions,
            beneficMalefic: {
                rootNumber: numerology.root,
                destinyNumber: numerology.destiny,
                friendlyNumbers: numInfo.friends,
                enemyNumbers: numInfo.enemies,
                benficYears: lagnaInfo.beneficYears,
                favorableDays: lagnaInfo.favorableDays,
                favorablePlanets: lagnaInfo.favorablePlanets,
                unfavorablePlanets: "Saturn, Venus", // Unused/Hidden
                friendlySigns: lagnaInfo.friendlySigns,
                friendlyLagna: "Cancer, Scorpio", // Unused/Hidden
                favorableRatna: lagnaInfo.ratna,
                favorableUpRatna: lagnaInfo.upRatna,
                luckyRatna: lagnaInfo.luckyRatna,
                favorableDeity: lagnaInfo.deity,
                favorableMetal: "Gold", // Unused/Hidden
                favorableColor: lagnaInfo.color,
                direction: lagnaInfo.direction,
                favorableTime: "Morning", // Unused/Hidden
                favorableItems: "Wheat, Jaggery", // Unused/Hidden
                favorableCereals: "Wheat", // Unused/Hidden
                favorableLiquid: "Water" // Unused/Hidden
            },
            vimshottariDasha: filteredVimList,
            yoginiDasha: filteredYoginiList,
            tribhagiDasha: tribhagiList,
            currentMantras: {
                vimshottari: {
                    planet: currentVimPlanet,
                    mantra: vimMantra,
                    subPlanet: currentVim?.subPeriods?.find((s: any) => s.isCurrent)?.planet,
                    subMantra: (MANTRAS.planets as any)[currentVim?.subPeriods?.find((s: any) => s.isCurrent)?.planet || ""]?.beej
                },
                yogini: {
                    dasha: currentYoginiName,
                    mantra: yoginiMantra,
                    subDasha: currentYogini?.subPeriods?.find((s: any) => s.isCurrent)?.dashaName,
                    subMantra: (MANTRAS.yoginis as any)[currentYogini?.subPeriods?.find((s: any) => s.isCurrent)?.dashaName || ""]
                }
            }
        };

    } catch (e) {
        console.error("Calculation Error", e);
        throw e;
    }
}
