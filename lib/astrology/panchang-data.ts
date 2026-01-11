
export const YOGAS = [
    "Vishkumbha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda",
    "Sukarma", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva",
    "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan",
    "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla",
    "Brahma", "Indra", "Vaidhriti"
];

export const KARANAS = [
    "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti",
    "Shakuni", "Chatushpada", "Naga", "Kimstughna"
];

export const RASHI_INFO: Record<number, { varna: string; vashya: string }> = {
    1: { varna: "Kshatriya", vashya: "Chatushpada" },
    2: { varna: "Vaishya", vashya: "Chatushpada" },
    3: { varna: "Shudra", vashya: "Manav" },
    4: { varna: "Brahmin", vashya: "Jalchar" },
    5: { varna: "Kshatriya", vashya: "Vanachara" },
    6: { varna: "Vaishya", vashya: "Manav" },
    7: { varna: "Shudra", vashya: "Manav" },
    8: { varna: "Brahmin", vashya: "Keeta" },
    9: { varna: "Kshatriya", vashya: "Manav" },
    10: { varna: "Vaishya", vashya: "Jalchar" },
    11: { varna: "Shudra", vashya: "Manav" },
    12: { varna: "Brahmin", vashya: "Jalchar" }
};

export const NAKSHATRA_DETAILS = [
    { id: 1, name: "Ashwini", gana: "Deva", yoni: "Ashwa", nadi: "Adi", syllables: ["Chu", "Che", "Cho", "La"] },
    { id: 2, name: "Bharani", gana: "Manushya", yoni: "Gaja", nadi: "Madhya", syllables: ["Li", "Lu", "Le", "Lo"] },
    { id: 3, name: "Krittika", gana: "Rakshasa", yoni: "Mesh", nadi: "Antya", syllables: ["A", "I", "U", "E"] },
    { id: 4, name: "Rohini", gana: "Manushya", yoni: "Sarpa", nadi: "Antya", syllables: ["O", "Va", "Vi", "Vu"] },
    { id: 5, name: "Mrigashira", gana: "Deva", yoni: "Sarpa", nadi: "Madhya", syllables: ["Ve", "Vo", "Ka", "Ki"] },
    { id: 6, name: "Ardra", gana: "Manushya", yoni: "Shwan", nadi: "Adi", syllables: ["Ku", "Gha", "Ng", "Jha"] },
    { id: 7, name: "Punarvasu", gana: "Deva", yoni: "Marjar", nadi: "Adi", syllables: ["Ke", "Ko", "Ha", "Hi"] },
    { id: 8, name: "Pushya", gana: "Deva", yoni: "Mesh", nadi: "Madhya", syllables: ["Hu", "He", "Ho", "Da"] },
    { id: 9, name: "Ashlesha", gana: "Rakshasa", yoni: "Marjar", nadi: "Antya", syllables: ["Di", "Du", "De", "Do"] },
    { id: 10, name: "Magha", gana: "Rakshasa", yoni: "Mushaka", nadi: "Antya", syllables: ["Ma", "Mi", "Mu", "Me"] },
    { id: 11, name: "Purva Phalguni", gana: "Manushya", yoni: "Mushaka", nadi: "Madhya", syllables: ["Mo", "Ta", "Ti", "Tu"] },
    { id: 12, name: "Uttara Phalguni", gana: "Manushya", yoni: "Gau", nadi: "Adi", syllables: ["Te", "To", "Pa", "Pi"] },
    { id: 13, name: "Hasta", gana: "Deva", yoni: "Mahish", nadi: "Adi", syllables: ["Pu", "Sha", "Na", "Tha"] },
    { id: 14, name: "Chitra", gana: "Rakshasa", yoni: "Vyaghra", nadi: "Madhya", syllables: ["Pe", "Po", "Ra", "Ri"] },
    { id: 15, name: "Swati", gana: "Deva", yoni: "Mahish", nadi: "Antya", syllables: ["Ru", "Re", "Ro", "Ta"] },
    { id: 16, name: "Vishakha", gana: "Rakshasa", yoni: "Vyaghra", nadi: "Antya", syllables: ["Ti", "Tu", "Te", "To"] },
    { id: 17, name: "Anuradha", gana: "Deva", yoni: "Mrig", nadi: "Madhya", syllables: ["Na", "Ni", "Nu", "Ne"] },
    { id: 18, name: "Jyeshtha", gana: "Rakshasa", yoni: "Mrig", nadi: "Adi", syllables: ["No", "Ya", "Yi", "Yu"] },
    { id: 19, name: "Mula", gana: "Rakshasa", yoni: "Shwan", nadi: "Adi", syllables: ["Ye", "Yo", "Bha", "Bhi"] },
    { id: 20, name: "Purva Ashadha", gana: "Manushya", yoni: "Vanar", nadi: "Madhya", syllables: ["Bhu", "Dha", "Bha", "Dha"] },
    { id: 21, name: "Uttara Ashadha", gana: "Manushya", yoni: "Nakul", nadi: "Antya", syllables: ["Bhe", "Bho", "Ja", "Ji"] },
    { id: 22, name: "Shravana", gana: "Deva", yoni: "Vanar", nadi: "Antya", syllables: ["Ju", "Je", "Jo", "Gha"] },
    { id: 23, name: "Dhanishta", gana: "Rakshasa", yoni: "Simha", nadi: "Madhya", syllables: ["Ga", "Gi", "Gu", "Ge"] },
    { id: 24, name: "Shatabhisha", gana: "Rakshasa", yoni: "Ashwa", nadi: "Adi", syllables: ["Go", "Sa", "Si", "Su"] },
    { id: 25, name: "Purva Bhadrapada", gana: "Manushya", yoni: "Simha", nadi: "Adi", syllables: ["Se", "So", "Da", "Di"] },
    { id: 26, name: "Uttara Bhadrapada", gana: "Manushya", yoni: "Gau", nadi: "Madhya", syllables: ["Du", "Tha", "Jha", "Nya"] },
    { id: 27, name: "Revati", gana: "Deva", yoni: "Gaja", nadi: "Antya", syllables: ["De", "Do", "Cha", "Chi"] }
];

export const NUMEROLOGY_DATA: Record<number, { friends: string; enemies: string }> = {
    1: { friends: "1, 2, 3, 9", enemies: "6, 8" }, // Sun
    2: { friends: "1, 5", enemies: "4, 8" },       // Moon
    3: { friends: "1, 2, 9", enemies: "5, 6" },    // Jupiter
    4: { friends: "5, 6, 8", enemies: "1, 2" },    // Rahu
    5: { friends: "1, 4, 6", enemies: "2" },       // Mercury
    6: { friends: "4, 5, 8", enemies: "1, 2" },    // Venus
    7: { friends: "6, 9", enemies: "1, 2" },       // Ketu
    8: { friends: "4, 5, 6", enemies: "1, 2, 9" }, // Saturn
    9: { friends: "1, 2, 3", enemies: "5" }        // Mars
};

export const LAGNA_DATA: Record<number, {
    beneficYears: string;
    favorableDays: string;
    favorablePlanets: string;
    friendlySigns: string;
    ratna: string;
    upRatna: string;
    luckyRatna: string;
    deity: string;
    color: string;
    direction: string;
}> = {
    1: { // Aries
        beneficYears: "16, 22, 28, 32, 36",
        favorableDays: "Tuesday, Sunday, Thursday",
        favorablePlanets: "Mars, Sun, Jupiter",
        friendlySigns: "Leo, Sagittarius, Scorpio",
        ratna: "Red Coral (Moonga)",
        upRatna: "Red Carnelian",
        luckyRatna: "Ruby (Manikya)",
        deity: "Lord Hanuman",
        color: "Red, Yellow",
        direction: "East"
    },
    2: { // Taurus
        beneficYears: "25, 28, 36, 42",
        favorableDays: "Friday, Saturday, Wednesday",
        favorablePlanets: "Venus, Saturn, Mercury",
        friendlySigns: "Virgo, Capricorn, Libra",
        ratna: "Diamond (Heera)",
        upRatna: "White Opal",
        luckyRatna: "Blue Sapphire (Neelam)",
        deity: "Goddess Lakshmi",
        color: "White, Green",
        direction: "South-East"
    },
    3: { // Gemini
        beneficYears: "32, 33, 35, 40, 42",
        favorableDays: "Wednesday, Friday",
        favorablePlanets: "Mercury, Venus, Saturn",
        friendlySigns: "Libra, Aquarius, Taurus",
        ratna: "Emerald (Panna)",
        upRatna: "Peridot",
        luckyRatna: "Diamond (Heera)",
        deity: "Lord Ganesha",
        color: "Green, White",
        direction: "West"
    },
    4: { // Cancer
        beneficYears: "21, 22, 24, 32",
        favorableDays: "Monday, Tuesday, Thursday",
        favorablePlanets: "Moon, Mars, Jupiter",
        friendlySigns: "Scorpio, Pisces, Leo",
        ratna: "Pearl (Moti)",
        upRatna: "Moonstone",
        luckyRatna: "Red Coral (Moonga)",
        deity: "Lord Shiva",
        color: "White, Cream, Red",
        direction: "North"
    },
    5: { // Leo
        beneficYears: "22, 24, 26, 28, 32",
        favorableDays: "Sunday, Tuesday, Thursday",
        favorablePlanets: "Sun, Mars, Jupiter",
        friendlySigns: "Aries, Sagittarius, Cancer",
        ratna: "Ruby (Manikya)",
        upRatna: "Red Garnet",
        luckyRatna: "Red Coral (Moonga)",
        deity: "Lord Vishnu / Sun God",
        color: "Red, Orange, Gold",
        direction: "East"
    },
    6: { // Virgo
        beneficYears: "23, 25, 32, 33, 35",
        favorableDays: "Wednesday, Friday",
        favorablePlanets: "Mercury, Venus, Saturn",
        friendlySigns: "Taurus, Capricorn, Gemini",
        ratna: "Emerald (Panna)",
        upRatna: "Green Tourmaline",
        luckyRatna: "Diamond (Heera)",
        deity: "Lord Ganesha",
        color: "Green, White",
        direction: "South"
    },
    7: { // Libra
        beneficYears: "24, 25, 32, 33, 35",
        favorableDays: "Friday, Saturday, Wednesday",
        favorablePlanets: "Venus, Saturn, Mercury",
        friendlySigns: "Gemini, Aquarius, Taurus",
        ratna: "Diamond (Heera)",
        upRatna: "White Zircon",
        luckyRatna: "Blue Sapphire (Neelam)",
        deity: "Goddess Lakshmi",
        color: "White, Blue",
        direction: "West"
    },
    8: { // Scorpio
        beneficYears: "22, 24, 28, 32",
        favorableDays: "Tuesday, Sunday, Thursday",
        favorablePlanets: "Mars, Sun, Jupiter",
        friendlySigns: "Cancer, Pisces, Aries",
        ratna: "Red Coral (Moonga)",
        upRatna: "Red Carnelian",
        luckyRatna: "Yellow Sapphire (Pushparaj)",
        deity: "Lord Hanuman",
        color: "Red, Yellow",
        direction: "North"
    },
    9: { // Sagittarius
        beneficYears: "16, 22, 32, 36",
        favorableDays: "Thursday, Sunday, Tuesday",
        favorablePlanets: "Jupiter, Sun, Mars",
        friendlySigns: "Aries, Leo, Pisces",
        ratna: "Yellow Sapphire (Pushparaj)",
        upRatna: "Citrine",
        luckyRatna: "Ruby (Manikya)",
        deity: "Lord Vishnu",
        color: "Yellow, Red",
        direction: "East"
    },
    10: { // Capricorn
        beneficYears: "25, 33, 35, 36",
        favorableDays: "Saturday, Friday, Wednesday",
        favorablePlanets: "Saturn, Venus, Mercury",
        friendlySigns: "Taurus, Virgo, Aquarius",
        ratna: "Blue Sapphire (Neelam)",
        upRatna: "Amethyst",
        luckyRatna: "Diamond (Heera)",
        deity: "Lord Shiva / Hanuman",
        color: "Black, Blue",
        direction: "South"
    },
    11: { // Aquarius
        beneficYears: "28, 33, 36, 42",
        favorableDays: "Saturday, Friday",
        favorablePlanets: "Saturn, Venus, Mercury",
        friendlySigns: "Gemini, Libra, Capricorn",
        ratna: "Blue Sapphire (Neelam)",
        upRatna: "Blue Topaz",
        luckyRatna: "Emerald (Panna)",
        deity: "Lord Shiva",
        color: "Black, Blue",
        direction: "West"
    },
    12: { // Pisces
        beneficYears: "16, 22, 28, 33",
        favorableDays: "Thursday, Tuesday, Sunday",
        favorablePlanets: "Jupiter, Mars, Moon",
        friendlySigns: "Cancer, Scorpio, Sagittarius",
        ratna: "Yellow Sapphire (Pushparaj)",
        upRatna: "Yellow Topaz",
        luckyRatna: "Red Coral (Moonga)",
        deity: "Lord Vishnu",
        color: "Yellow, Red",
        direction: "North"
    }
};
