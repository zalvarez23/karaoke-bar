import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { KaraokeColors } from "../../colors";
import {
  Typography,
  Button,
  Input,
  StatusModal,
  Header,
  type ModalRef,
} from "../../shared/components";
import { UserServices } from "../../shared/services";
import { useUsersContext } from "../../shared/context";
import { KARAOKE_ROUTES } from "../../shared/types";
import { useUserStorage } from "../../shared/hooks/user/use-user-storage";

type TFormData = {
  name: string;
};

export const GuestModePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const userService = new UserServices();
  const { setUser: setUserState } = useUsersContext();
  const { setUser: setUserStorage } = useUserStorage();
  const statusModalRef = useRef<ModalRef>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<TFormData>({
    defaultValues: {
      name: "",
    },
  });

  const watchedValues = watch();
  const isError = Object.keys(errors).length > 0;

  const handleOnGuestRegister = async (userData: TFormData) => {
    try {
      setIsLoading(true);

      // Crear usuario invitado con datos mínimos
      const guestUser = await userService.registerGuest(userData.name);

      setIsSuccess(true);
      setUserState(guestUser);
      setUserStorage(guestUser);

      statusModalRef.current?.open();
    } catch (error: unknown) {
      setIsSuccess(false);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Error desconocido");
      }
      statusModalRef.current?.open();
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnConfirmStatus = () => {
    if (isSuccess) {
      // Navegar al home después del registro exitoso
      navigate(KARAOKE_ROUTES.MESAS, { replace: true });
    } else {
      statusModalRef.current?.close();
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: KaraokeColors.base.darkPrimary,
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      {/* Header with back button */}
      <div className="px-5 pt-3">
        <Header showBackIcon />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center px-8">
        <div className="w-full max-w-md">
          {/* Title */}
          <div className="text-center mb-8">
            <Typography
              variant="headline-xl-semi"
              color={KaraokeColors.base.white}
            >
              Modo Invitado
            </Typography>
            <Typography
              variant="body-md-semi"
              className="mt-2 text-center"
              color={KaraokeColors.gray.gray300}
            >
              Ingresa tu nombre para continuar como invitado
            </Typography>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(handleOnGuestRegister)}
            className="space-y-6"
          >
            {/* Name Input */}
            <div>
              <Input
                {...register("name", {
                  required: "El nombre es requerido",
                  minLength: {
                    value: 2,
                    message: "El nombre debe tener al menos 2 caracteres",
                  },
                  maxLength: {
                    value: 50,
                    message: "El nombre no puede exceder 50 caracteres",
                  },
                })}
                value={watchedValues.name}
                placeholder="Nombre o nick"
                customIcon={
                  <User
                    size={20}
                    color={
                      errors?.name?.message
                        ? KaraokeColors.red.red300
                        : KaraokeColors.primary.primary500
                    }
                  />
                }
                error={errors?.name?.message}
                className="w-full"
              />
            </div>

            {/* Submit Button */}
            <Button
              size="lg"
              theme="primary"
              fullWidth
              disabled={isError}
              isLoading={isLoading}
              type="submit"
            >
              Continuar como invitado
            </Button>
          </form>

          {/* Status Modal */}
          <StatusModal
            ref={statusModalRef}
            status={isSuccess ? "success" : "error"}
            onConfirm={handleOnConfirmStatus}
            description={
              isSuccess
                ? "¡Bienvenido! Has ingresado como invitado."
                : errorMessage
            }
          />
        </div>
      </div>
    </div>
  );
};
