import * as Astronomy from 'astronomy-engine';

export type RequiredPlanetConfig = {
    planet: string;
    targetSignId: number; // 1 to 12
};

export type SearchResult = {
    startDate: Date;
    endDate: Date;
    exact: boolean;
};

// Math Helpers
const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

const normalize = (deg: number) => {
    let d = deg % 360;
    if (d < 0) d += 360;
    return d;
};

const getLahiriAyanamsa = (date: Date): number => {
    const astroTime = Astronomy.MakeTime(date);
    const yearsSinceJ2000 = astroTime.ut / 365.25;
    const initialOffset = 23.861111;
    const precession = 0.0139694;
    return initialOffset + (yearsSinceJ2000 * precession);
};

const getSignId = (tropicalLon: number, ayanamsa: number): number => {
    const siderealLon = normalize(tropicalLon - ayanamsa);
    return Math.floor(siderealLon / 30) + 1;
};

function getAscendantSignId(date: Date, lat: number, lng: number): number {
    const astroTime = Astronomy.MakeTime(date);
    const gmst = Astronomy.SiderealTime(date);
    const lstDeg = normalize(gmst * 15 + lng);

    const T = astroTime.ut / 36525.0; 
    const eps = (23.4392911 - (46.8150 * T + 0.00059 * T * T - 0.001813 * T * T * T) / 3600.0) * DEG2RAD;

    const ramc = lstDeg * DEG2RAD;
    const latRad = lat * DEG2RAD;

    const y = Math.cos(ramc);
    const x = -Math.sin(ramc) * Math.cos(eps) - Math.tan(latRad) * Math.sin(eps);

    const ascRad = Math.atan2(y, x);
    const ascDeg = normalize(ascRad * RAD2DEG);
    
    const ayanamsa = getLahiriAyanamsa(date);
    return getSignId(ascDeg, ayanamsa);
}

const PLANET_BODIES: Record<string, any> = {
    "Sun": Astronomy.Body.Sun,
    "Moon": Astronomy.Body.Moon,
    "Mars": Astronomy.Body.Mars,
    "Mercury": Astronomy.Body.Mercury,
    "Jupiter": Astronomy.Body.Jupiter,
    "Venus": Astronomy.Body.Venus,
    "Saturn": Astronomy.Body.Saturn,
};

function getNodeLongitude(date: Date, isRahu: boolean): number {
    const astroTime = Astronomy.MakeTime(date);
    const d = astroTime.ut;
    let omega = 125.04452 - 0.0529537648 * d;
    omega = normalize(omega);
    if (!isRahu) omega = normalize(omega + 180);
    return omega;
}

export function getPlanetSign(planet: string, date: Date): number {
    const ayanamsa = getLahiriAyanamsa(date);
    if (planet === 'Rahu') return getSignId(getNodeLongitude(date, true), ayanamsa);
    if (planet === 'Ketu') return getSignId(getNodeLongitude(date, false), ayanamsa);
    
    const body = PLANET_BODIES[planet];
    if (!body) return 1;
    
    const time = Astronomy.MakeTime(date);
    const result = Astronomy.GeoVector(body, time, true);
    const pos = Astronomy.Ecliptic(result);
    return getSignId(pos.elon, ayanamsa);
}

// Search algorithm: Robust two-stage search
export async function searchPlanetaryConfiguration(
    requiredPlanets: RequiredPlanetConfig[],
    targetAscendantSign: number,
    lat: number,
    lon: number,
    startYear: number,
    endYear: number,
    onProgress?: (progress: number) => void
): Promise<SearchResult[]> {

    const totalYears = Math.abs(endYear - startYear) || 1;
    const step = startYear <= endYear ? 1 : -1;

    let currentYear = startYear;
    const results: SearchResult[] = [];
    let lastFoundEndMs = 0;

    // Stage 1 check: do all slow/medium planets match? (Moon and Ascendant NOT checked here)
    const checkPlanetsExceptMoon = (date: Date): boolean => {
        for (const req of requiredPlanets) {
            if (req.planet === 'Moon') continue;
            if (getPlanetSign(req.planet, date) !== req.targetSignId) {
                return false;
            }
        }
        return true;
    };

    // Stage 2 full check: planets + moon + ascendant
    const checkAll = (date: Date): boolean => {
        if (getAscendantSignId(date, lat, lon) !== targetAscendantSign) return false;
        
        // Check Moon specifically
        const moonReq = requiredPlanets.find(p => p.planet === 'Moon');
        if (moonReq && getPlanetSign('Moon', date) !== moonReq.targetSignId) return false;

        return checkPlanetsExceptMoon(date);
    };

    // Keep track of if we found anything so we can stop after finding the first valid cluster
    let foundAny = false;

    while ((step > 0 && currentYear <= endYear) || (step < 0 && currentYear >= endYear)) {
        await new Promise(r => setTimeout(r, 0)); // yield to keep UI responsive

        if (onProgress) {
            const progress = Math.abs(currentYear - startYear) / totalYears;
            onProgress(Math.min(progress, 1));
        }

        // Scan each day of the year using a noon reference for slow/medium planet sign checks
        let dayFound = false;

        // Determine loop direction for days so we find the most recent dates first when searching past
        const startDay = step > 0 ? 0 : 364;
        const endDay = step > 0 ? 365 : -1;
        const dayStep = step > 0 ? 1 : -1;

        for (let dayOfYear = startDay; dayOfYear !== endDay; dayOfYear += dayStep) {
            const noonDate = new Date(currentYear, 0, 1 + dayOfYear, 12, 0, 0);

            // Stage 1: Check slow planets at noon - fast reject
            if (!checkPlanetsExceptMoon(noonDate)) continue;

            // Stage 2: Slow planets match this day! 
            // Now scan hour-by-hour for the correct Moon and Ascendant
            const startHour = step > 0 ? 0 : 23;
            const endHour = step > 0 ? 24 : -1;
            const hourStep = step > 0 ? 1 : -1;

            for (let hour = startHour; hour !== endHour; hour += hourStep) {
                const hourDate = new Date(currentYear, 0, 1 + dayOfYear, hour, 0, 0);

                if (getAscendantSignId(hourDate, lat, lon) !== targetAscendantSign) continue;

                // Ascendant matches in this hour window — scan minute by minute
                for (let minute = 0; minute < 60; minute += 2) {
                    const exactDate = new Date(hourDate.getTime() + minute * 60000);

                    // Skip if already covered by a previously found result
                    if (step > 0 && exactDate.getTime() <= lastFoundEndMs) continue;
                    if (step < 0 && lastFoundEndMs !== 0 && exactDate.getTime() >= lastFoundEndMs) continue;

                    if (checkAll(exactDate)) {
                        // Found a match — expand backwards and forwards to find the full window
                        let startDate = new Date(exactDate);
                        while (checkAll(new Date(startDate.getTime() - 60000))) {
                            startDate = new Date(startDate.getTime() - 60000);
                        }

                        let endDate = new Date(exactDate);
                        while (checkAll(new Date(endDate.getTime() + 60000))) {
                            endDate = new Date(endDate.getTime() + 60000);
                        }

                        results.push({ startDate, endDate, exact: true });
                        lastFoundEndMs = step > 0 ? endDate.getTime() : startDate.getTime();
                        
                        dayFound = true;
                        foundAny = true;

                        // Skip to end of this hour since we have the full range
                        break;
                    }
                }
            }
            
            // If we found matches in the past days, and now we hit a day with no matches, we've exhausted this cluster
            if (foundAny && !dayFound && results.length > 0) {
                // We break out of the day loop to stop searching further back/forward
                break;
            }
        }
        
        if (foundAny && results.length > 0) {
            break; // Stop searching subsequent years once we found the first occurrence
        }

        currentYear += step;
    }

    // Sort results chronologically
    return results.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}

