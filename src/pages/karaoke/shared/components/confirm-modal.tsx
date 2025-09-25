import { X, AlertCircle, CheckCircle } from "lucide-react";
import { KaraokeColors } from "../../colors";
import Typography from "./typography";
import Button from "./button";

type TConfirmModalProps = {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
  showCancelButton?: boolean;
  type?: "info" | "success" | "error" | "warning";
};

const ConfirmModal = ({
  visible,
  title,
  message,
  onConfirm,
  onClose,
  showCancelButton = false,
  type = "info",
}: TConfirmModalProps) => {
  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle size={32} color={KaraokeColors.green.green500} />;
      case "error":
        return <AlertCircle size={32} color={KaraokeColors.red.red500} />;
      case "warning":
        return <AlertCircle size={32} color={KaraokeColors.yellow.yellow500} />;
      default:
        return (
          <AlertCircle size={32} color={KaraokeColors.primary.primary500} />
        );
    }
  };

  const getIconBgColor = () => {
    switch (type) {
      case "success":
        return KaraokeColors.green.green500 + "20";
      case "error":
        return KaraokeColors.red.red500 + "20";
      case "warning":
        return KaraokeColors.yellow.yellow500 + "20";
      default:
        return KaraokeColors.primary.primary500 + "20";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className="relative bg-[#1e1c24] rounded-lg p-6 w-full max-w-md mx-4 transform transition-all duration-300"
        style={{ backgroundColor: KaraokeColors.base.darkPrimary }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div
            className="flex items-center justify-center w-16 h-16 rounded-full"
            style={{ backgroundColor: getIconBgColor() }}
          >
            {getIcon()}
          </div>
        </div>

        {/* Title */}
        <Typography
          variant="headline-md-semi"
          color={KaraokeColors.base.white}
          className="text-center mb-4"
        >
          {title}
        </Typography>

        {/* Message */}
        <Typography
          variant="body-md"
          color={KaraokeColors.gray.gray300}
          className="text-center mb-6"
        >
          {message}
        </Typography>

        {/* Buttons */}
        <div className="flex gap-3">
          {showCancelButton && (
            <Button
              theme="secondary"
              size="md"
              appearance="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
          )}
          <Button
            theme={type === "error" ? "destructive" : "primary"}
            size="md"
            onClick={onConfirm}
            className="flex-1"
          >
            {type === "success" ? "Entendido" : "Confirmar"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;




