export const LOG_TYPES = [
  ["MEAL", "Comida"],
  ["MOOD", "Ánimo"],
  ["SLEEP", "Sueño"],
  ["SYMPTOM", "Síntoma"],
  ["BEHAVIOR", "Comportamiento"],
  ["INCIDENT", "Incidente"],
  ["NOTE", "Nota"],
];

export function getLogTypeLabel(type) {
  return LOG_TYPES.find(([value]) => value === type)?.[1] || "Nota";
}
