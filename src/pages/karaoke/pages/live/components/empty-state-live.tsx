import React from "react";
import { Typography } from "../../../shared/components";
import { KaraokeColors } from "../../../colors";

type TEmptyStateLiveProps = {
  onStart: () => void;
  onViewTables: () => void;
};

export const EmptyStateLive: React.FC<TEmptyStateLiveProps> = ({
  onStart,
  onViewTables,
}) => {
  return (
    <div className="flex flex-col items-center justify-center mt-8 gap-1">
      <Typography variant="body-lg-semi" color={KaraokeColors.base.white}>
        Aún no han solicitado canciones.
      </Typography>
      <Typography
        variant="body-sm"
        color={KaraokeColors.gray.gray500}
        className="text-center mt-2"
      >
        Agrega una cancion, dale empezar y escoge tu preferida !
      </Typography>

      <div className="flex mt-5 justify-between px-4">
        <button
          onClick={onStart}
          className="py-3 px-4 hover:opacity-80 transition-opacity"
        >
          <Typography
            color={KaraokeColors.orange.orange400}
            variant="body-md-semi"
          >
            Empezar
          </Typography>
        </button>

        <button
          onClick={onViewTables}
          className="py-3 px-4 hover:opacity-80 transition-opacity"
        >
          <Typography
            color={KaraokeColors.green.green400}
            variant="body-md-semi"
          >
            Ver Mesas
          </Typography>
        </button>
      </div>
    </div>
  );
};

export default EmptyStateLive;
