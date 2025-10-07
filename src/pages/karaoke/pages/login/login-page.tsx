import React, { useEffect, useRef, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Phone, Lock } from "lucide-react";
import { KaraokeColors } from "../../colors";
import {
  Typography,
  Button,
  Input,
  Spinner,
  StatusModal,
  type ModalRef,
} from "../../shared/components";
import { UserServices, VisitsServices } from "../../shared/services";
import { useUsersContext } from "../../shared/context";
import { KARAOKE_ROUTES } from "../../shared/types";
import { useUserStorage } from "../../shared/hooks/user/use-user-storage";
import { KARAOKE_CONSTANTS } from "../../shared/constants/global.constants";
import { GuestModePage } from "../guest-mode";

type TFormData = {
  username: string;
  password: string;
};

export const KaraokeLoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCheckingStorage, setIsCheckingStorage] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const userService = useMemo(() => new UserServices(), []);
  const visitsService = useMemo(() => new VisitsServices(), []);
  const { setUser: setUserState } = useUsersContext();
  const { setUser: setUserStorage, getUser: getUserStorage } = useUserStorage();
  const statusModalRef = useRef<ModalRef>(null);
  const navigate = useNavigate();
  const showLogin = false;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<TFormData>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const watchedValues = watch();
  const isError = Object.keys(errors).length > 0;

  useEffect(() => {
    const checkStoredUser = async () => {
      try {
        const storedUser = getUserStorage();

        if (storedUser) {
          // Si hay usuario guardado, verificar si tiene visita online
          setUserState(storedUser);
          setIsCheckingStorage(true);

          // Verificar si el usuario tiene una visita online con retry
          let visitCheck;
          let retryCount = 0;
          const maxRetries = 3;

          while (retryCount < maxRetries) {
            try {
              visitCheck = await visitsService.checkUserOnlineVisit(
                storedUser.id
              );
              break; // Si es exitoso, salir del loop
            } catch (error) {
              retryCount++;
              console.log("retryCount", retryCount);
              console.log(
                `Intento ${retryCount} falló, reintentando...`,
                error
              );

              if (retryCount >= maxRetries) {
                console.log(
                  "Máximo de reintentos alcanzado, asumiendo sin visita online"
                );
                visitCheck = { hasOnlineVisit: false };
                break;
              }

              // Esperar 1 segundo antes del siguiente intento
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          }

          if (visitCheck?.hasOnlineVisit) {
            // Si tiene visita online, redirigir a mesas
            navigate(KARAOKE_ROUTES.MESAS, { replace: true });
          } else {
            // Si no tiene visita online, redirigir a home
            navigate(KARAOKE_ROUTES.HOME, { replace: true });
          }
        } else {
          // No hay usuario guardado, mostrar formulario
          setIsCheckingStorage(false);
        }
      } catch (error) {
        console.error("Error checking stored user:", error);
        setIsCheckingStorage(false);
      }
    };

    checkStoredUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependencias necesarias

  const handleOnLogIn = async (userData: TFormData) => {
    try {
      setIsLoading(true);
      const res = await userService.login(userData);
      setUserState(res);
      setUserStorage(res);

      // Verificar si el usuario tiene una visita online con retry
      let visitCheck;
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          visitCheck = await visitsService.checkUserOnlineVisit(res.id);
          break; // Si es exitoso, salir del loop
        } catch (error) {
          retryCount++;
          console.log(`Intento ${retryCount} falló, reintentando...`, error);

          if (retryCount >= maxRetries) {
            console.log(
              "Máximo de reintentos alcanzado, asumiendo sin visita online"
            );
            visitCheck = { hasOnlineVisit: false };
            break;
          }

          // Esperar 1 segundo antes del siguiente intento
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      if (visitCheck?.hasOnlineVisit) {
        // Si tiene visita online, redirigir a mesas
        navigate(KARAOKE_ROUTES.MESAS, { replace: true });
      } else {
        // Si no tiene visita online, redirigir a home
        navigate(KARAOKE_ROUTES.HOME, { replace: true });
      }
    } catch (error: unknown) {
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
    statusModalRef.current?.close();
  };

  const handleGoToRegister = () => {
    navigate(KARAOKE_ROUTES.REGISTER);
  };

  const handleGoToGuestMode = () => {
    navigate(KARAOKE_ROUTES.GUEST_MODE);
  };

  // Mostrar loading mientras se verifica el storage
  if (isCheckingStorage) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: KaraokeColors.base.darkPrimary }}
      >
        <div className="text-center">
          <Spinner size={35} color={KaraokeColors.base.white} />
          <Typography
            variant="body-md-semi"
            className="mt-5 text-center"
            color={KaraokeColors.base.white}
          >
            Verificando sesión...
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <>
      {showLogin && (
        <>
          <div
            className="min-h-screen flex flex-col justify-center relative"
            style={{
              backgroundColor: KaraokeColors.base.darkPrimary,
              paddingTop: "env(safe-area-inset-top, 0px)",
            }}
          >
            <div className="w-full max-w-md px-8">
              {/* Header */}
              <div className="text-center mb-8">
                <Typography
                  variant="headline-xl-semi"
                  color={KaraokeColors.base.white}
                >
                  Iniciar
                </Typography>
                <Typography
                  variant="body-md-semi"
                  className="mt-2 text-right"
                  color={KaraokeColors.gray.gray300}
                >
                  Vive una experiencia única
                </Typography>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit(handleOnLogIn)}
                className="space-y-6"
              >
                {/* Username Input */}
                <div>
                  <Input
                    {...register("username", {
                      required: "Número de teléfono es requerido",
                      pattern: {
                        value: /^[0-9]{9,15}$/,
                        message: "Número de teléfono inválido (9-15 dígitos)",
                      },
                    })}
                    value={watchedValues.username}
                    placeholder="Número de teléfono"
                    inputType="onlyNumbers"
                    maxLength={15}
                    customIcon={
                      <Phone
                        size={20}
                        color={
                          errors?.username?.message
                            ? KaraokeColors.red.red300
                            : KaraokeColors.primary.primary500
                        }
                      />
                    }
                    error={errors?.username?.message}
                    className="w-full"
                  />
                </div>

                {/* Password Input */}
                <div>
                  <Input
                    {...register("password", {
                      required: "Contraseña es requerida",
                    })}
                    value={watchedValues.password}
                    placeholder="Contraseña"
                    type="password"
                    customIcon={
                      <Lock
                        size={20}
                        color={
                          errors?.password?.message
                            ? KaraokeColors.red.red300
                            : KaraokeColors.primary.primary500
                        }
                      />
                    }
                    error={errors?.password?.message}
                    className="w-full"
                  />
                </div>

                {/* Forgot Password Link */}
                <div className="text-right">
                  <Typography
                    variant="link-sm-semi"
                    color={KaraokeColors.gray.gray300}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    ¿Olvidaste tu contraseña?
                  </Typography>
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
                  Ingresar
                </Button>
              </form>

              {/* Guest Mode Section */}
              <div className="mt-4">
                <Button
                  size="lg"
                  appearance="outline"
                  theme="secondary"
                  fullWidth
                  onClick={handleGoToGuestMode}
                >
                  Ingresar como invitado
                </Button>
              </div>

              {/* Footer */}
              <div
                className="absolute bottom-8 left-0 right-0 flex flex-col items-center justify-center space-y-3 mb-6"
                style={{
                  paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
                }}
              >
                <div className="flex items-center space-x-2">
                  <Typography
                    variant="body-md-semi"
                    color={KaraokeColors.base.white}
                    className="text-center"
                  >
                    ¿No tienes cuenta?
                  </Typography>
                  <Typography
                    variant="link-md-semi"
                    color={KaraokeColors.primary.primary400}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={handleGoToRegister}
                  >
                    Regístrate
                  </Typography>
                </div>

                {/* Version */}
                <Typography
                  variant="body-sm-semi"
                  color={KaraokeColors.gray.gray400}
                  className="text-center opacity-70"
                >
                  v{KARAOKE_CONSTANTS.APP.VERSION}
                </Typography>
              </div>

              {/* Status Modal */}
              <StatusModal
                ref={statusModalRef}
                status="error"
                onConfirm={handleOnConfirmStatus}
                description={errorMessage}
              />
            </div>
          </div>
        </>
      )}
      {!showLogin && <GuestModePage />}
    </>
  );
};
