import React from "react";
import { Typography } from "../../../shared/components";
import { KaraokeColors } from "../../../colors";
import { SectionCardHome } from "../../home/components";
import { Eye } from "lucide-react";

type TEmptyStateLiveProps = {
  onStart: () => void;
  onViewTables: () => void;
};

export const EmptyStateLive: React.FC<TEmptyStateLiveProps> = ({
  onViewTables,
}) => {
  return (
    <div className="flex flex-col items-center justify-center mt-8 gap-1">
      <Typography variant="body-lg-semi" color={KaraokeColors.base.white}>
        Aún no hay canciones en curso.
      </Typography>

      <SectionCardHome
        className="mt-5 w-full"
        icon={Eye}
        title="Personas en vivo"
        description="Ver mesas y personas en vivo."
        onClick={onViewTables}
      />
    </div>
  );
};

export default EmptyStateLive;
