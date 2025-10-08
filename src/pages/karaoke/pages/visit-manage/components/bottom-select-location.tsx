import { FC } from "react";
import { Check } from "lucide-react";
import { KaraokeColors } from "../../../colors";
import { Button, Typography } from "../../../shared/components";
import { ILocations } from "../../../shared/types/location.types";

type TBottomSelectLocationProps = {
  onConfirm: () => void;
  item?: ILocations;
  isLoading?: boolean;
};

const BottomSelectLocation: FC<TBottomSelectLocationProps> = ({
  item,
  onConfirm,
  isLoading,
}) => {
  return (
    <div
      className="rounded-2xl p-6 mx-2.5 relative shadow-lg"
      style={{ backgroundColor: KaraokeColors.base.darkPrimary }}
    >
      <div className="flex flex-row justify-between items-center">
        <div className="flex items-center gap-2.5">
          {item ? (
            <>
              <Check size={20} color={KaraokeColors.green.green500} />
              <Typography
                variant="body-sm-semi"
                color={KaraokeColors.base.white}
              >
                Ingresar a {item?.name}
              </Typography>
            </>
          ) : (
            <Typography
              variant="body-sm-semi"
              color={KaraokeColors.gray.gray400}
            >
              Selecciona una mesa
            </Typography>
          )}
        </div>
        <Button
          appearance="outline"
          size="md"
          theme="secondary"
          isLoading={isLoading}
          onClick={onConfirm}
          disabled={!item}
          className="min-w-[100px]"
        >
          Ingresar
        </Button>
      </div>
    </div>
  );
};

export default BottomSelectLocation;
