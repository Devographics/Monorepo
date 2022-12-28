import countries from 'data/geo/countries.yml'

export const getCountryName = (code: string) => {
  const country = countries.find((c: any) => c['alpha-3'] === code)
  return country?.name
}