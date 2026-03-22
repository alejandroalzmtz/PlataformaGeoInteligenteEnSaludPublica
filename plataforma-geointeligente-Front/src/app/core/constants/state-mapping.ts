// Mapeo entre nombres en mx.json y IDs de la base de datos
// IMPORTANTE: Los nombres DEBEN coincidir EXACTAMENTE con los del mx.json
export const STATE_NAME_TO_ID: Record<string, number> = {
  'Aguascalientes': 1,
  'Baja California': 2,
  'Baja California Sur': 3,
  'Campeche': 4,
  'Coahuila': 5,
  'Colima': 6,
  'Chiapas': 7,
  'Chihuahua': 8,
  'Ciudad de México': 9,  // mx.json usa "Ciudad de México"
  'Durango': 10,
  'Guanajuato': 11,
  'Guerrero': 12,
  'Hidalgo': 13,
  'Jalisco': 14,
  'México': 15,  // Estado de México
  'Michoacán': 16,
  'Morelos': 17,
  'Nayarit': 18,
  'Nuevo León': 19,
  'Oaxaca': 20,
  'Puebla': 21,
  'Querétaro': 22,
  'Quintana Roo': 23,
  'San Luis Potosí': 24,
  'Sinaloa': 25,
  'Sonora': 26,
  'Tabasco': 27,
  'Tamaulipas': 28,
  'Tlaxcala': 29,
  'Veracruz': 30,
  'Yucatán': 31,
  'Zacatecas': 32
};

// Mapeo inverso para facilitar lookups
export const STATE_ID_TO_NAME: Record<number, string> = Object.fromEntries(
  Object.entries(STATE_NAME_TO_ID).map(([name, id]) => [id, name])
);

// Para debugging - verificar que tenemos 32 estados
export const TOTAL_STATES = Object.keys(STATE_NAME_TO_ID).length;
