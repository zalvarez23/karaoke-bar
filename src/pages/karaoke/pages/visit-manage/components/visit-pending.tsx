import { FC } from "react";
import { KaraokeColors } from "../../../colors";
import { Header } from "../../../shared/components";
import VisitPendingState from "./visit-pending-state";

export const VisitPending: FC = () => {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: KaraokeColors.base.darkPrimary,
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      {/* Header */}
      <div className="pt-2.5 px-9">
        <Header
          title="Excelente,"
          description="Solo un paso más para vivir nuestra experiencia !"
        />
        <VisitPendingState />
      </div>
    </div>
  );
};
