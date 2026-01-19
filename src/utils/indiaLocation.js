import { City, State } from 'country-state-city'

const COUNTRY_CODE_IN = 'IN'

export function getIndiaStates() {
  return State.getStatesOfCountry(COUNTRY_CODE_IN) || []
}

export function findIndiaStateByName(stateName) {
  const name = String(stateName || '').trim().toLowerCase()
  if (!name) return null
  const states = getIndiaStates()
  return (
    states.find((s) => String(s.name || '').trim().toLowerCase() === name) ||
    null
  )
}

export function getIndiaDivisionsForStateIso(stateIso) {
  const iso = String(stateIso || '').trim()
  if (!iso) return []
  // Using cities as "division" options (works well for operational CRM usage)
  return City.getCitiesOfState(COUNTRY_CODE_IN, iso) || []
}


