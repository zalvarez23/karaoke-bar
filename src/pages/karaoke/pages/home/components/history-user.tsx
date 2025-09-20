import { PartyPopper } from "lucide-react";
import Spinner from "../../../shared/components/spinner";
import Typography from "../../../shared/components/typography";
import { KaraokeColors } from "../../../colors";
import { IVisits } from "../../../shared/types/visits.types";
import { formatCurrency, formatDate } from "../../../shared/utils";
import EmptyStateHistory from "./empty-state-history";
import ErrorStateHistory from "./error-state-history";

type THistoryUserProps = {
  visits: IVisits[];
  onStart: () => void;
  isLoading?: boolean;
  isError: boolean;
  onRetry: () => void;
};

export const HistoryUser = ({
  visits,
  onStart,
  isLoading,
  isError,
  onRetry,
}: THistoryUserProps) => {
  if (isLoading) {
    return (
      <div className="mt-8">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return <ErrorStateHistory onRetry={onRetry} />;
  }

  if (visits.length === 0) {
    return <EmptyStateHistory onStart={onStart} />;
  }

  return (
    <div className="mt-5">
      <Typography variant="body-lg-semi" color={KaraokeColors.base.white}>
        Visitas
      </Typography>

      <div className="mt-2.5 pb-30">
        {visits?.map((visit) => (
          <div
            className="flex flex-row justify-start items-center gap-8 h-20 w-auto relative"
            key={visit.id}
          >
            <div
              className="rounded-full w-15 h-15 flex justify-center items-center"
              style={{ backgroundColor: "#13141e" }}
            >
              <PartyPopper size={32} color={KaraokeColors.primary.primary500} />
            </div>
            <div>
              <Typography
                variant="body-sm-semi"
                color={KaraokeColors.base.white}
              >
                {visit.points} {visit.points === 1 ? "Punto" : "Puntos"}
              </Typography>
              <Typography variant="body-xs" color={KaraokeColors.gray.gray500}>
                {formatDate(visit.date as any)}
              </Typography>
            </div>
            {visit.totalPayment && visit.totalPayment > 0 && (
              <Typography
                className="absolute right-0 top-6"
                variant="body-sm-semi"
                color={KaraokeColors.base.white}
              >
                {formatCurrency(visit.totalPayment)}
              </Typography>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
