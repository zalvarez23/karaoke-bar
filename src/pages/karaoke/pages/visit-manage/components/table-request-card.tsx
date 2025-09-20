import { FC } from "react";
import { Typography, Button } from "../../../shared/components";
import { KaraokeColors } from "../../../colors";
import { UserPlus } from "lucide-react";
import { TGuestUsers } from "../../../shared/types/visits.types";

interface TableRequestCardProps {
  guestUser: TGuestUsers;
  onAccept: () => void;
  onReject: () => void;
}

export const TableRequestCard: FC<TableRequestCardProps> = ({
  guestUser,
  onAccept,
  onReject,
}) => {
  return (
    <div className="bg-[#2a2830] rounded-xl px-5 py-4 mb-4 mt-4 shadow-lg border border-purple-500">
      <div className="flex items-center justify-center gap-5 mb-4">
        <UserPlus size={20} color={KaraokeColors.purple.purple500} />
        <Typography
          variant="body-sm"
          color={KaraokeColors.gray.gray100}
          className="text-center leading-5 max-w-[90%]"
        >
          <span className="font-bold text-white">{guestUser.userName}</span>{" "}
          desea ingresar a tu mesa. ¿Aceptas?
        </Typography>
      </div>

      <div className="flex gap-3 justify-between">
        <Button
          theme="destructive"
          size="sm"
          appearance="ghost"
          onClick={onReject}
          className="flex-1"
        >
          <Typography variant="body-sm-semi" color={KaraokeColors.red.red400}>
            Rechazar
          </Typography>
        </Button>
        <Button
          title="Aceptar"
          theme="secondary"
          size="sm"
          appearance="ghost"
          onClick={onAccept}
          className="flex-1"
        />
      </div>
    </div>
  );
};
