import Button from "../../../shared/components/button";
import Typography from "../../../shared/components/typography";
import { KaraokeColors } from "../../../colors";

type TEmptyStateHistoryProps = {
  onStart: () => void;
};

const EmptyStateHistory = ({ onStart }: TEmptyStateHistoryProps) => {
  return (
    <div className="flex justify-center items-center mt-8 pb-30">
      <div className="text-center">
        <Typography variant="body-lg-semi" color={KaraokeColors.base.white}>
          Aún no tienes visitas
        </Typography>
        <Typography
          variant="body-sm"
          color={KaraokeColors.gray.gray500}
          className="mt-2.5 text-center"
        >
          Comienza a sumar puntos y disfruta de los beneficios
        </Typography>
        <Button
          className="mt-5"
          title="Empezar"
          onClick={onStart}
          appearance="outline"
          theme="secondary"
        />
      </div>
    </div>
  );
};

export default EmptyStateHistory;




