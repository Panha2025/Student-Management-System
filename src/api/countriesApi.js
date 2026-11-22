import { FALLBACK_COUNTRIES } from '../data/studentOptions.js';
import { requestJson } from './http.js';

export async function fetchCountries({ onUnavailable = () => {} } = {}) {
  try {
    const response = await requestJson('https://countriesnow.space/api/v0.1/countries/positions', { timeout: 8000 });
    if (response?.error || !Array.isArray(response?.data)) throw new Error('Invalid country collection');
    const countries = response.data.map((country) => country?.name)
      .filter((name) => typeof name === 'string' && name.trim());
    if (!countries.length) throw new Error('No country names returned');
    return [...new Set(countries)].sort((first, second) => first.localeCompare(second));
  } catch (error) {
    onUnavailable(error);
    return [...FALLBACK_COUNTRIES];
  }
}
