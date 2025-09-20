import { FC } from "react";
import { BottomNavigation, Typography } from "../../../shared/components";
import { KaraokeColors } from "../../../colors";

const VisitPendingState: FC = () => {
  return (
    <div className="flex flex-col items-center justify-center mt-8 px-6">
      <Typography variant="body-lg-semi" color={KaraokeColors.green.green500}>
        Solicitud Enviada
      </Typography>
      <Typography
        variant="body-md"
        color={KaraokeColors.base.white}
        className="text-center mt-3"
      >
        Tu solicitud de mesa ha sido enviada exitosamente.
      </Typography>
      <Typography
        variant="body-sm"
        color={KaraokeColors.gray.gray500}
        className="text-center mt-2.5"
      >
        Espera a que nuestro equipo te confirme la asignación de tu mesa.
      </Typography>
      <div className="mt-6 p-4 rounded-lg bg-gray-800 bg-opacity-50 border border-gray-700">
        <Typography
          variant="body-sm"
          color={KaraokeColors.gray.gray400}
          className="text-center"
        >
          Estado: Pendiente de confirmación
        </Typography>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default VisitPendingState;
