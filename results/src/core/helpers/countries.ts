import countries from 'data/geo/world_countries'

export const getCountryName = (code: string) => {
  const country = countries?.features?.find((c: any) => c.id === code)
  return country?.properties?.name
}