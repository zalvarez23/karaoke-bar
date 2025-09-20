import React from "react";
import { BottomNavigation } from "../../shared/components";

export const KaraokeVisitManageOnlinePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background dark:bg-primary pb-20">
      <div className="container mx-auto px-6 py-8">
        <div className="text-foreground text-center">
          <h1 className="text-2xl font-semibold mb-4">
            Mesa Online - KantoBar Karaoke
          </h1>
          <p className="text-gray-400">Página de mesa online en construcción</p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
