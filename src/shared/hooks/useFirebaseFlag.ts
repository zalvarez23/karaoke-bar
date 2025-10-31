import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase";

/**
 * Hook para leer flags de configuración desde Firebase
 * Lee del primer documento en la colección Config que tenga el flag
 * @param flagName - Nombre del flag a leer
 * @param defaultValue - Valor por defecto si el flag no existe (por defecto false)
 * @returns El valor del flag
 */
export const useFirebaseFlag = (
  flagName: string,
  defaultValue: boolean = false
): boolean => {
  const [flagValue, setFlagValue] = useState<boolean>(defaultValue);

  useEffect(() => {
    const configCollection = collection(db, "Config");

    // Suscribirse a cambios en tiempo real de todos los documentos en Config
    const unsubscribe = onSnapshot(
      configCollection,
      (snapshot) => {
        let found = false;

        // Buscar en todos los documentos de Config
        snapshot.forEach((docSnapshot) => {
          if (!found && docSnapshot.exists()) {
            const data = docSnapshot.data();
            // Si el flag existe en este documento, usar su valor
            if (data[flagName] !== undefined) {
              setFlagValue(data[flagName] as boolean);
              found = true;
            }
          }
        });

        // Si no se encontró el flag en ningún documento, usar el valor por defecto
        if (!found) {
          setFlagValue(defaultValue);
        }
      },
      (error) => {
        console.error(`❌ Error leyendo flag ${flagName}:`, error);
        // En caso de error, usar el valor por defecto
        setFlagValue(defaultValue);
      }
    );

    return () => unsubscribe();
  }, [flagName, defaultValue]);

  return flagValue;
};
