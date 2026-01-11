export interface BirthDetails {
    name: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    place: string;
    country: string;
    lat?: number;
    lon?: number;
    timezone?: string;
}

export interface AvakahadaChakra {
    ascendantLord: string;
    rashiLord: string;
    nakshatraCharan: string;
    nakshatraLord: string;
    yoga: string;
    karna: string;
    gana: string;
    yoni: string;
    nadi: string;
    varan: string;
    vashya: string;
    nameAlphabet: string;
    paya: string;
}

export interface PlanetPosition {
    planet: string;
    rashi: string; // Sign
    position: string;
    nakshatra: string;
    isRetrograde?: boolean;
}

export interface ChartPlanet {
    symbol: string;
    degree: string;
}

export interface ChartData {
    houses: { [key: number]: ChartPlanet[] }; // House number (1-12) -> List of Planet objects
    signs: { [key: number]: number }; // House number (1-12) -> Sign number (1-12)
}


export interface BeneficMalefic {
    rootNumber: number;
    destinyNumber: number;
    friendlyNumbers: string;
    enemyNumbers: string;
    benficYears: string;
    favorableDays: string;
    favorablePlanets: string;
    unfavorablePlanets: string;
    friendlySigns: string;
    friendlyLagna: string;
    favorableRatna: string;
    favorableUpRatna: string;
    luckyRatna: string;
    favorableDeity: string;
    favorableMetal: string;
    favorableColor: string;
    direction: string;
    favorableTime: string;
    favorableItems: string;
    favorableCereals: string;
    favorableLiquid: string;
}

export interface KundaliReport {
    birthDetails: BirthDetails;
    avakahada: AvakahadaChakra;
    chart: ChartData;
    planetaryPositions: PlanetPosition[];
    beneficMalefic: BeneficMalefic;
    vimshottariDasha: {
        planet: string;
        start: string;
        end: string;
        duration: number;
        isCurrent?: boolean;
        subPeriods?: {
            planet: string;
            start: string;
            end: string;
            isCurrent?: boolean;
        }[];
    }[];
    yoginiDasha: {
        dashaName: string;
        start: string;
        end: string;
        duration: number;
        isCurrent?: boolean;
        subPeriods?: {
            dashaName: string;
            start: string;
            end: string;
            isCurrent?: boolean;
        }[];
    }[];
    tribhagiDasha: {
        planet: string;
        start: string;
        end: string;
        duration: number;
        isCurrent?: boolean;
        subPeriods?: {
            planet: string;
            start: string;
            end: string;
            isCurrent?: boolean;
        }[];
    }[];
    currentMantras?: {
        vimshottari: {
            planet: string;
            mantra: string;
        };
        yogini: {
            dasha: string;
            mantra: string;
        };
    };
}
