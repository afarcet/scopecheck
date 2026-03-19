export const STAGES = ["Pre-seed", "Seed", "Early-A", "Series A", "Series B+"];
export const SECTORS = ["Applied AI", "ClimateTech", "FinTech", "HealthTech", "DeepTech", "SaaS", "Consumer", "Web3", "Other"];
export const INVESTOR_GEOS = ["Europe", "UK", "US", "Israel", "Africa", "LATAM", "Asia", "Global"];

export const COUNTRIES = [
  "United Kingdom", "Germany", "France", "Netherlands", "Belgium", "Austria", "Switzerland",
  "Spain", "Portugal", "Italy", "Ireland", "Denmark", "Sweden", "Finland", "Norway",
  "Poland", "Czech Republic", "Romania", "Greece", "Hungary", "Luxembourg", "Estonia",
  "Latvia", "Lithuania", "Croatia", "Bulgaria", "Slovakia", "Slovenia",
  "United States", "Canada",
  "Israel",
  "Brazil", "Mexico", "Argentina", "Colombia", "Chile",
  "India", "China", "Japan", "South Korea", "Singapore", "Indonesia", "Vietnam",
  "South Africa", "Nigeria", "Kenya", "Egypt", "Ghana", "Morocco",
  "Australia", "New Zealand",
];

export const COUNTRY_TO_REGION: Record<string, string> = {
  "United Kingdom": "UK", "Germany": "Europe", "France": "Europe", "Netherlands": "Europe",
  "Belgium": "Europe", "Austria": "Europe", "Switzerland": "Europe", "Spain": "Europe",
  "Portugal": "Europe", "Italy": "Europe", "Ireland": "Europe", "Denmark": "Europe",
  "Sweden": "Europe", "Finland": "Europe", "Norway": "Europe", "Poland": "Europe",
  "Czech Republic": "Europe", "Romania": "Europe", "Greece": "Europe", "Hungary": "Europe",
  "Luxembourg": "Europe", "Estonia": "Europe", "Latvia": "Europe", "Lithuania": "Europe",
  "Croatia": "Europe", "Bulgaria": "Europe", "Slovakia": "Europe", "Slovenia": "Europe",
  "United States": "US", "Canada": "US",
  "Israel": "Israel",
  "Brazil": "LATAM", "Mexico": "LATAM", "Argentina": "LATAM", "Colombia": "LATAM", "Chile": "LATAM",
  "India": "Asia", "China": "Asia", "Japan": "Asia", "South Korea": "Asia", "Singapore": "Asia",
  "Indonesia": "Asia", "Vietnam": "Asia",
  "South Africa": "Africa", "Nigeria": "Africa", "Kenya": "Africa", "Egypt": "Africa",
  "Ghana": "Africa", "Morocco": "Africa",
  "Australia": "Asia", "New Zealand": "Asia",
};
