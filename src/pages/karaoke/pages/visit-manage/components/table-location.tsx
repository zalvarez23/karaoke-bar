import { FC } from "react";
import { Circle } from "lucide-react";
import {
  ICON_TABLE_COLOR_AVAILABLE,
  ICON_TABLE_COLOR_NOT_AVAILABLE,
  ICON_TABLE_COLOR_SELECTION,
} from "../constants/visit-manage.constants";
import { Typography } from "../../../shared/components";
import { ILocations } from "../../../shared/types/location.types";
import { KaraokeColors } from "@/pages/karaoke/colors";

type TTableLocationProps = {
  item?: ILocations;
  tableSelected?: string;
  onSelectTable?: (item: ILocations) => void;
  showDescription?: boolean;
};

const TableLocation: FC<TTableLocationProps> = ({
  item,
  tableSelected,
  onSelectTable,
  showDescription = true,
}) => {
  const getIconColor = () => {
    if (item?.id === tableSelected) {
      return ICON_TABLE_COLOR_SELECTION;
    }
    if (item?.status === "available") {
      return ICON_TABLE_COLOR_AVAILABLE;
    }
    return ICON_TABLE_COLOR_NOT_AVAILABLE;
  };

  const handleClick = () => {
    if (onSelectTable && item && item.status === "available") {
      onSelectTable(item);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex-1 py-2 px-1 rounded-lg flex flex-col items-center justify-center gap-2 transition-all duration-200 ${
        item?.id === tableSelected
          ? "bg-purple_light-700/20"
          : item?.status === "available"
          ? "bg-green-600/20"
          : ""
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      disabled={item?.status !== "available"}
    >
      <Circle size={34} color={getIconColor()} fill={getIconColor()} />
      <Typography
        variant="label-xs-semi"
        color={KaraokeColors.base.white}
        className="text-center"
      >
        {showDescription && item?.abbreviation}
      </Typography>
    </button>
  );
};

export default TableLocation;
