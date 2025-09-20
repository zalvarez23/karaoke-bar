import React, { FC, useState, useEffect } from "react";
import { Mic, Headphones } from "lucide-react";
import { Typography, ConfirmModal } from "../../../shared/components";
import { KaraokeColors } from "../../../colors";
import { TVisitResponseDto } from "../../../shared/types/visits.types";
import { useUsersContext } from "../../../shared/context/UsersContext";
import { useNavigate } from "react-router-dom";

type ModalPersonsLiveProps = {
  visible?: boolean;
  onClose: () => void;
  visitDto: TVisitResponseDto | null;
  onSelectedLocation: (visitId: string) => void;
};

type RandomPosition = {
  top: string;
  left: string;
  iconColor: string;
  iconName: string;
};

type ItemVisitSelected = {
  id: string;
  userId: string;
  userName: string;
  location: string;
};

const darkModeIconColors = [
  KaraokeColors.orange.orange400,
  KaraokeColors.yellow.yellow400,
  KaraokeColors.red.red400,
  KaraokeColors.green.green400,
  KaraokeColors.purple.purple400,
  KaraokeColors.lime.lime400,
];

export const ModalPersonsLive: FC<ModalPersonsLiveProps> = ({
  visible,
  onClose,
  visitDto,
  onSelectedLocation,
}) => {
  const { state } = useUsersContext();
  const user = state.user;
  const navigate = useNavigate();
  const effectiveVisitDto = visitDto;
  const [positions, setPositions] = useState<RandomPosition[]>([]);
  const [visitSelected, setVisitSelected] = useState<ItemVisitSelected>();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);

  useEffect(() => {
    if (effectiveVisitDto?.visits && effectiveVisitDto.visits.length > 0) {
      // Generar colores aleatorios para cada usuario (todos con icono headphones)
      const colorsAndIcons = effectiveVisitDto.visits.map(() => ({
        color:
          darkModeIconColors[
            Math.floor(Math.random() * darkModeIconColors.length)
          ],
        icon: "headphones", // Todos usan el mismo icono de auriculares
      }));

      setPositions(
        colorsAndIcons.map(({ color, icon }) => ({
          top: "0%",
          left: "0%",
          iconColor: color,
          iconName: icon,
        }))
      );
    }
  }, [effectiveVisitDto, user.id]);

  const handleSelectLocation = () => {
    onSelectedLocation(visitSelected?.id || "");
    setShowConfirmModal(false); // 1. Cerrar modal de confirmación

    // 2. Esperar a que se cierre el modal de confirmación, luego cerrar bottom sheet
    setTimeout(() => {
      onClose(); // Cerrar el bottom sheet "Personas en línea"

      // 3. Esperar a que se cierre el bottom sheet, luego navegar
      setTimeout(() => {
        navigate("/karaoke/mesas");
      }, 300); // Tiempo para que se complete la animación del bottom sheet
    }, 200); // Tiempo para que se complete la animación del modal de confirmación
  };

  const handleShowConfirmModal = (item: ItemVisitSelected) => {
    // Verificar si el usuario ya está online (en una mesa)
    if (user.additionalInfo.isOnline) {
      setShowBlockedModal(true);
      return;
    }

    setVisitSelected(item);
    setShowConfirmModal(true);
  };

  console.log(user);

  if (!visible) return null;

  return (
    <>
      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
        {/* Fondo oscuro que cierra el modal al presionarlo */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Contenedor del modal */}
        <div className="bg-[#2a2830] rounded-t-2xl py-6 px-8 w-full h-[85%] relative">
          <div className="flex justify-between items-center">
            <Typography variant="headline-sm" color={KaraokeColors.base.white}>
              Personas en línea
            </Typography>
            <Mic size={30} color={KaraokeColors.orange.orange400} />
          </div>

          <div className="mt-5 flex-1 flex flex-wrap gap-4 justify-center items-center">
            {effectiveVisitDto?.visits?.map((item, index) => (
              <button
                key={`liveperson-${item.id}-${index}`}
                className="bg-[#1e1c24] rounded-lg p-3 min-w-[100px] min-h-[80px] flex flex-col justify-center items-center gap-2 hover:bg-opacity-80 transition-colors"
                onClick={() => {
                  handleShowConfirmModal(item as ItemVisitSelected);
                }}
              >
                <Typography
                  color={KaraokeColors.base.white}
                  className="text-center"
                >
                  {item.userName?.split(" ")[0]}
                </Typography>
                <Headphones size={24} color={positions[index]?.iconColor} />
                <Typography
                  color={KaraokeColors.gray.gray400}
                  className="text-center text-[10px]"
                >
                  {item.location}
                </Typography>
              </button>
            ))}
          </div>
        </div>
      </div>

      <ConfirmModal
        visible={showConfirmModal}
        title="Confirmar"
        message={`¿Desea ingresar a la mesa ${visitSelected?.location} de ${visitSelected?.userName}?`}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleSelectLocation}
        showCancelButton
      />

      <ConfirmModal
        visible={showBlockedModal}
        title="Ya estás en una mesa"
        message="No puedes ingresar a otra mesa hasta que te salgas de la actual."
        onClose={() => setShowBlockedModal(false)}
        onConfirm={() => setShowBlockedModal(false)}
        showCancelButton={false}
      />
    </>
  );
};
