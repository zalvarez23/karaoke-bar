import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
} from "react";
import { cn } from "@/lib/utils";

type ModalProps = {
  children?: React.ReactNode;
  className?: string;
};

export type ModalRef = {
  open: () => void;
  close: () => void;
};

const Modal = forwardRef<ModalRef, ModalProps>(
  ({ children, className }, ref) => {
    const [visible, setVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useImperativeHandle(ref, () => ({
      open: () => {
        setVisible(true);
        setIsAnimating(true);
      },
      close: () => {
        setIsAnimating(false);
        setTimeout(() => setVisible(false), 300); // Esperar a que termine la animación
      },
    }));

    useEffect(() => {
      if (visible) {
        // Prevenir scroll del body cuando el modal está abierto
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "unset";
      }

      return () => {
        document.body.style.overflow = "unset";
      };
    }, [visible]);

    if (!visible) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div
          className={cn(
            "absolute inset-0 bg-black transition-opacity duration-300",
            isAnimating ? "bg-opacity-50" : "bg-opacity-0"
          )}
          onClick={() => ref && "current" in ref && ref.current?.close()}
        />

        {/* Modal Content */}
        <div
          className={cn(
            "relative bg-[#1e1c24] rounded-t-3xl p-6 w-full max-w-md mx-4 transform transition-all duration-300",
            isAnimating
              ? "translate-y-0 opacity-100"
              : "translate-y-full opacity-0",
            className
          )}
        >
          {children}
        </div>
      </div>
    );
  }
);

Modal.displayName = "Modal";

export default Modal;
