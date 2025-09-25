/**
 * Convierte un número a formato de moneda en Soles (PEN).
 *
 * @param amount - El monto numérico a formatear.
 * @returns El monto formateado como "S/ X,XXX.XX".
 */
export const formatCurrency = (amount: number): string => {
  if (isNaN(amount)) {
    throw new Error("El parámetro amount debe ser un número válido.");
  }

  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};




