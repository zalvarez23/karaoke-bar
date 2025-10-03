import React from "react";
import { useNavigate } from "react-router-dom";
import { KaraokeColors } from "../../colors";
import { HeaderScreen, Typography } from "../../shared/components";
import { RecentUsers, SectionCardHome } from "./components";
import { useUsersContext } from "../../shared/context";
import { KARAOKE_ROUTES } from "../../shared/types";
import { FlameIcon, MicVocal, Radio } from "lucide-react";

export const KaraokeHomePage: React.FC = () => {
  const {
    state: { user },
  } = useUsersContext();

  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen pb-20"
      style={{
        backgroundColor: KaraokeColors.base.darkPrimary,
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      <div className="px-9 py-5">
        <HeaderScreen user={user} />
        {/* <CardUserHome additionalInfo={user.additionalInfo} /> */}
        <Typography variant="body-lg-semi" color={KaraokeColors.base.white}>
          ¿Qué hacemos hoy?
        </Typography>
        <div className="mt-5 flex flex-col gap-5">
          <SectionCardHome
            icon={MicVocal}
            title="Empezar a cantar."
            description="Comienza a sumar puntos y disfruta de los beneficios."
            onClick={() => navigate(KARAOKE_ROUTES.MESAS)}
            highlight={true}
          />
          <SectionCardHome
            icon={Radio}
            title="Ver Live"
            description="Revisa todas las canciones en curso."
            onClick={() => navigate(KARAOKE_ROUTES.LIVE)}
          />
          <SectionCardHome
            icon={FlameIcon}
            title="Nuestra Carta"
            description="Revisa nuestras bebidas y platillos"
            comingSoon={true}
          />
        </div>
        <RecentUsers />
        {/* 
        <HistoryUser
          isLoading={isLoading}
          isError={isError}
          visits={visits}
          onStart={handleOnStart}
          onRetry={handleOnRetry}
        /> */}
      </div>

      {/* Bottom Navigation */}
      {/* <BottomNavigation /> */}
    </div>
  );
};
