export type PlanetStrength = "Exalted" | "Own House" | "Friendly" | "Neutral" | "Enemy" | "Debilitated" | null;

// Vedic Exaltation Signs (1-12)
const EXALTATION_SIGNS: Record<string, number> = {
    "Sun": 1,      // Aries
    "Moon": 2,     // Taurus
    "Mars": 10,    // Capricorn
    "Mercury": 6,  // Virgo
    "Jupiter": 4,  // Cancer
    "Venus": 12,   // Pisces
    "Saturn": 7,   // Libra
    "Rahu": 3,     // Gemini
    "Ketu": 9      // Sagittarius
};

// Vedic Debilitation Signs (Opposite to Exaltation)
const DEBILITATION_SIGNS: Record<string, number> = {
    "Sun": 7,      // Libra
    "Moon": 8,     // Scorpio
    "Mars": 4,     // Cancer
    "Mercury": 12, // Pisces
    "Jupiter": 10, // Capricorn
    "Venus": 6,    // Virgo
    "Saturn": 1,   // Aries
    "Rahu": 9,     // Sagittarius
    "Ketu": 3      // Gemini
};

// Own Houses
const OWN_SIGNS: Record<string, number[]> = {
    "Sun": [5],         // Leo
    "Moon": [4],        // Cancer
    "Mars": [1, 8],     // Aries, Scorpio
    "Mercury": [3, 6],  // Gemini, Virgo
    "Jupiter": [9, 12], // Sagittarius, Pisces
    "Venus": [2, 7],    // Taurus, Libra
    "Saturn": [10, 11], // Capricorn, Aquarius
    "Rahu": [],         // Rahu/Ketu usually don't have own signs, some say Aquarius/Scorpio
    "Ketu": []
};

export function getPlanetStrength(planet: string, signId: number): PlanetStrength {
    if (EXALTATION_SIGNS[planet] === signId) {
        return "Exalted";
    }
    
    if (DEBILITATION_SIGNS[planet] === signId) {
        return "Debilitated";
    }

    if (OWN_SIGNS[planet] && OWN_SIGNS[planet].includes(signId)) {
        return "Own House";
    }

    // For simplicity in UI, we default to null for Neutral/Friendly/Enemy if not one of the top 3 extremes.
    // Full dignity calculation requires more complex relationships.
    return null;
}
