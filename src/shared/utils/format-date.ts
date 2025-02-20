export const formatDateLarge = (timestamp: {
  seconds: number;
  nanoseconds: number;
}): string => {
  // Convertir el timestamp a milisegundos
  const date = new Date(
    timestamp.seconds * 1000 + Math.floor(timestamp.nanoseconds / 1e6),
  );

  const formattedDate = date.toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "short", // mes abreviado, ej. "feb"
    year: "numeric",
    timeZone: "America/Lima",
  });
  return formattedDate;
};

export const formatDateTimeLarge = (timestamp: {
  seconds: number;
  nanoseconds: number;
}): string => {
  const date = new Date(
    timestamp.seconds * 1000 + Math.floor(timestamp.nanoseconds / 1e6),
  );

  const formattedDate = date.toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "short", // mes abreviado, ej. "feb"
    year: "numeric",
    timeZone: "America/Lima",
  });

  const formattedTime = date.toLocaleTimeString("es-PE", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZone: "America/Lima",
  });

  return `${formattedDate} - ${formattedTime}`;
};

export const formatDateToTime = (timestamp: {
  seconds: number;
  nanoseconds: number;
}): string => {
  const date = new Date(
    timestamp.seconds * 1000 + Math.floor(timestamp.nanoseconds / 1e6),
  );

  const formattedTime = date.toLocaleTimeString("es-PE", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZone: "America/Lima",
  });

  return `${formattedTime}`;
};
