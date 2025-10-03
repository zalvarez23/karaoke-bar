import { useCallback } from "react";
import Typography from "./typography";
import { KaraokeColors } from "../../colors";
import { IAdditionalInfo } from "../types/user.types";
import { ECardDiscount, ECardVisitRequired, ECards } from "../types/card.types";

type UserCardProps = {
  additionalInfo: IAdditionalInfo;
};

export const UserCard = ({ additionalInfo }: UserCardProps) => {
  const { visits, cardType, points } = additionalInfo;

  const getMissingPercentage = useCallback(() => {
    return Math.round((visits / ECardVisitRequired[cardType]) * 100);
  }, [visits, cardType]);

  return (
    <div className="relative mx-1 my-5">
      {/* Background Card */}
      <div
        className="absolute top-7 left-0 right-0 mx-4 h-32 rounded-2xl"
        style={{ backgroundColor: "#3a3a3a" }}
      />

      {/* Main Card */}
      <div
        className="relative px-7 py-6 rounded-2xl flex flex-row justify-between items-center"
        style={{
          background:
            "linear-gradient(135deg, #d18ee8 0%, #f5a9c8 50%, #f9d3b4 100%)",
        }}
      >
        {/* Card Content */}
        <div className="flex flex-col items-start gap-5">
          <Typography variant="headline-sm" color={KaraokeColors.base.white}>
            {`Tarjeta ${ECards[additionalInfo.cardType]}`}
          </Typography>
          <div>
            <Typography
              variant="body-md-semi"
              className="tracking-wider"
              color={KaraokeColors.base.white}
            >
              {points} {points === 1 ? "Punto" : "Puntos"}
            </Typography>
            <Typography
              variant="body-sm"
              color={KaraokeColors.base.white}
              className="tracking-wider"
            >
              Descuento de {ECardDiscount[additionalInfo.cardType]}%
            </Typography>
          </div>
        </div>

        {/* Percentage Circle */}
        <div className="flex justify-center items-center">
          <div
            className="w-15 h-15 rounded-full flex justify-center items-center"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
          >
            <span
              className="text-white text-base font-bold"
              style={{ color: KaraokeColors.base.white }}
            >
              {getMissingPercentage()}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};





