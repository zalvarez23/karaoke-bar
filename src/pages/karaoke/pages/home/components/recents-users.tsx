import Typography from "../../../shared/components/typography";
import UserShip from "../../../shared/components/user-ship";
import { KaraokeColors } from "../../../colors";

export const RecentUsers = () => {
  return (
    <div className="mt-5">
      <Typography variant="body-lg-semi" color={KaraokeColors.base.white}>
        Recientes
      </Typography>
      <div className="mt-2.5 overflow-x-auto scrollbar-hide">
        <div className="flex flex-row gap-5 pb-4 min-w-max">
          <div className="flex-shrink-0">
            <UserShip name="Robert" image="image2" points={2} icon="heart" />
          </div>
          <div className="flex-shrink-0">
            <UserShip name="Alex" image="image3" points={3} />
          </div>
          <div className="flex-shrink-0">
            <UserShip name="Tommy" image="default" points={4} />
          </div>
        </div>
      </div>
    </div>
  );
};
