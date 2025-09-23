import Button from "../../../shared/components/button";
import Typography from "../../../shared/components/typography";
import { KaraokeColors } from "../../../colors";

type TErrorStateHistoryProps = {
  onRetry: () => void;
};

const ErrorStateHistory = ({ onRetry }: TErrorStateHistoryProps) => {
  return (
    <div className="flex justify-center items-center mt-8">
      <div className="text-center">
        <Typography variant="body-lg-semi" color={KaraokeColors.base.white}>
          ¡Ups!, algo salió mal.
        </Typography>
        <Typography
          variant="body-sm"
          color={KaraokeColors.gray.gray500}
          className="mt-2.5 text-center"
        >
          No pudimos cargar tu información, por favor intenta de nuevo.
        </Typography>
        <Button
          className="mt-5"
          title="Volver a cargar"
          onClick={onRetry}
          appearance="outline"
          theme="destructive"
        />
      </div>
    </div>
  );
};

export default ErrorStateHistory;



