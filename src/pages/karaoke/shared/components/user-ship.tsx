import { Avatar, Typography } from "./index";
import { KaraokeColors } from "../../colors";

type UserShipProps = {
  image: string;
  name: string;
  points: number;
  icon?: string;
};

const UserShip = ({ name, image, points, icon }: UserShipProps) => {
  return (
    <div className="flex flex-row justify-start items-center gap-2 h-20 w-auto">
      <Avatar image={image as any} size="md" />
      <div
        className="w-32 py-2 px-4 rounded-lg"
        style={{ backgroundColor: KaraokeColors.base.primary }}
      >
        <div className="flex flex-col">
          <Typography
            variant="body-xs-semi"
            className="tracking-wider text-center"
            color={KaraokeColors.base.white}
          >
            {name}
          </Typography>
          <Typography
            variant="body-xs-semi"
            color={KaraokeColors.gray.gray500}
            className="text-center"
          >
            Mesa {points}
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default UserShip;
