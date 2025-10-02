import { FC } from "react";
import { Typography } from "../../../shared/components";
import { KaraokeColors } from "../../../colors";

const VisitPendingState: FC = () => {
  return (
    <div className="flex flex-col items-center justify-center mt-8 px-6">
      <Typography variant="body-md" color={KaraokeColors.base.white}>
        Solicitud Enviada
      </Typography>
      <Typography
        variant="body-sm"
        color={KaraokeColors.gray.gray500}
        className="text-center mt-2.5"
      >
        Nuestro equipo aceptara la solicitud lo antes posible.
      </Typography>
      <div className="mt-6 p-4 rounded-lg bg-gray-800 bg-opacity-50 border border-gray-700">
        <Typography
          variant="body-sm"
          color={KaraokeColors.base.secondaryLight}
          className="text-center"
        >
          Estado: Pendiente de confirmación
        </Typography>
      </div>
    </div>
  );
};

export default VisitPendingState;
