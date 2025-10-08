import { forwardRef, Ref } from "react";
import Modal, { ModalRef } from "./modal";
import Button from "./button";
import Typography from "./typography";
import { KaraokeColors } from "../../colors";
import { AlertCircle, CheckCircle } from "lucide-react";

type TStatus = "success" | "error" | "warning";
type TStatusModalProps = {
  status: TStatus;
  onConfirm: () => void;
  onClose?: () => void;
  description?: string;
  visible?: boolean;
};

const StatusModal = forwardRef<ModalRef, TStatusModalProps>(
  (
    { status, description, onConfirm, onClose, visible },
    ref: Ref<ModalRef>
  ) => {
    // Si se pasa visible, usar esa prop, sino usar ref
    if (visible !== undefined) {
      if (!visible) return null;

      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          <div
            className="relative bg-[#1e1c24] rounded-lg p-6 w-full max-w-sm mx-4"
            style={{ backgroundColor: KaraokeColors.base.darkPrimary }}
          >
            <div className="flex flex-col items-center justify-center space-y-6">
              {/* Icon */}
              <div
                className="flex items-center justify-center w-16 h-16 rounded-full bg-opacity-20"
                style={{
                  backgroundColor:
                    status === "success"
                      ? KaraokeColors.green.green500 + "20"
                      : status === "warning"
                      ? KaraokeColors.yellow.yellow500 + "20"
                      : KaraokeColors.red.red500 + "20",
                }}
              >
                {status === "success" ? (
                  <CheckCircle size={32} color={KaraokeColors.green.green500} />
                ) : status === "warning" ? (
                  <AlertCircle
                    size={32}
                    color={KaraokeColors.yellow.yellow500}
                  />
                ) : (
                  <AlertCircle size={32} color={KaraokeColors.red.red500} />
                )}
              </div>

              {/* Title */}
              <Typography
                variant="body-lg-semi"
                className="text-center tracking-wide"
                color={KaraokeColors.base.white}
              >
                {status === "success"
                  ? "¡Felicidades!"
                  : status === "warning"
                  ? "¡Atención!"
                  : "¡Ocurrió un error!"}
              </Typography>

              {/* Description */}
              <Typography
                variant="body-md"
                color={KaraokeColors.gray.gray400}
                className="text-center"
              >
                {description}
              </Typography>

              {/* Button */}
              <Button
                size="lg"
                theme={
                  status === "success"
                    ? "secondary"
                    : status === "warning"
                    ? "secondary"
                    : "destructive"
                }
                appearance="ghost"
                fullWidth
                isLoading={false}
                onClick={() => {
                  onConfirm();
                }}
              >
                {status === "success"
                  ? "Entendido"
                  : status === "warning"
                  ? "Aceptar"
                  : "Reintentar"}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Usar ref como antes
    return (
      <Modal ref={ref} className="max-w-sm">
        <div className="flex flex-col items-center justify-center space-y-6">
          {/* Icon */}
          <div
            className="flex items-center justify-center w-16 h-16 rounded-full bg-opacity-20"
            style={{
              backgroundColor:
                status === "success"
                  ? KaraokeColors.green.green500 + "20"
                  : KaraokeColors.red.red500 + "20",
            }}
          >
            {status === "success" ? (
              <CheckCircle size={32} color={KaraokeColors.green.green500} />
            ) : (
              <AlertCircle size={32} color={KaraokeColors.red.red500} />
            )}
          </div>

          {/* Title */}
          <Typography
            variant="body-lg-semi"
            className="text-center tracking-wide"
            color={KaraokeColors.base.white}
          >
            {status === "success" ? "¡Felicidades!" : "¡Ocurrió un error!"}
          </Typography>

          {/* Description */}
          <Typography
            variant="body-md"
            color={KaraokeColors.gray.gray400}
            className="text-center"
          >
            {description}
          </Typography>

          {/* Button */}
          <Button
            size="lg"
            theme={status === "success" ? "secondary" : "destructive"}
            appearance="ghost"
            fullWidth
            isLoading={false}
            onClick={() => {
              onConfirm();
            }}
          >
            {status === "success" ? "Entendido" : "Reintentar"}
          </Button>
        </div>
      </Modal>
    );
  }
);

StatusModal.displayName = "StatusModal";

export default StatusModal;
