import { Timestamp } from "firebase/firestore";

/**
 * Convierte un Firestore Timestamp a una fecha formateada.
 *
 * @param visitDate - El timestamp de Firestore a formatear.
 * @returns La fecha formateada en el formato "DD de MMMM de YYYY".
 */
export const formatDate = (visitDate: Timestamp): string => {
  if (!visitDate || typeof visitDate.toDate !== "function") {
    throw new Error(
      "El parámetro visitDate no es un Timestamp válido de Firestore."
    );
  }

  const date = visitDate.toDate();

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

/**
 * Convierte una fecha JavaScript a una fecha formateada.
 *
 * @param date - La fecha a formatear.
 * @returns La fecha formateada en el formato "DD de MMMM de YYYY".
 */
export const formatDateFromJSDate = (date: Date): string => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error("El parámetro date no es una fecha válida.");
  }

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};
