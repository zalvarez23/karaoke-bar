import { FC } from "react";
import { Circle, MicVocal } from "lucide-react";
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
    if (item?.status === "inactive") {
      return ICON_TABLE_COLOR_NOT_AVAILABLE;
    }
    return ICON_TABLE_COLOR_AVAILABLE;
  };

  const getIcon = () => {
    if (item?.status === "occupied") {
      return <MicVocal size={35} color={KaraokeColors.base.white} />;
    }
    return <Circle size={37} color={getIconColor()} fill={getIconColor()} />;
  };

  const handleClick = () => {
    if (
      onSelectTable &&
      item &&
      (item.status === "available" || item.status === "occupied")
    ) {
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
          : item?.status === "occupied"
          ? "bg-blue-500/20"
          : ""
      } hover:opacity-80`}
    >
      {getIcon()}
      <Typography
        variant="label-md-semi"
        color={KaraokeColors.base.white}
        className="text-center"
      >
        {showDescription && item?.abbreviation}
      </Typography>
    </button>
  );
};

export default TableLocation;
