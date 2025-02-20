import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import React from "react";
import { DialogHeader } from "./dialog";

interface ControlledDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subTitle?: string;
  children?: React.ReactNode;
}

export const Modal: React.FC<ControlledDialogProps> = ({
  isOpen,
  onClose,
  title,
  subTitle,
  children,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="tracking-wide mb-2">
            {title || "Edit Data"}
          </DialogTitle>
          <DialogDescription>
            {subTitle || "Make changes here. Click Save when you're done."}
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};
