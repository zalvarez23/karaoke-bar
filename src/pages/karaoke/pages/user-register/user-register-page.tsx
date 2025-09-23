import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { KaraokeColors } from "../../colors";
import {
  Header,
  Input,
  Button,
  Typography,
  RadioButtonGroup,
  StatusModal,
} from "../../shared/components";
import { EGenders, IUser } from "../../shared/types/user.types";
import { UserServices } from "../../shared/services";
import { useUsersContext } from "../../shared/context";
import { KARAOKE_ROUTES } from "../../shared/types";
import { useUserStorage } from "../../shared/hooks/user/use-user-storage";

export const KaraokeUserRegisterPage: React.FC = () => {
  const [selectedGender, setSelectedGender] = useState<string>("O"); // Default a 'No especificar'
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const { setUser } = useUsersContext();
  const { setUser: setUserStorage } = useUserStorage();
  const navigate = useNavigate();

  const genderOptions = [
    { label: "Masculino", value: "M" },
    { label: "Femenino", value: "F" },
    { label: "No especificar", value: "O" },
  ];

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<IUser>();

  const isValid = Object.keys(errors).length > 0;
  const userServices = new UserServices();

  const handleOpenStatusModal = () => {
    setShowStatusModal(true);
  };

  const handleOnRegister = async (data: IUser) => {
    try {
      setIsLoading(true);

      // Usar el teléfono como usuario y contraseña
      const phoneAsUsername = data.phone?.toString() || "";

      await userServices.register({
        ...data,
        gender: selectedGender as EGenders, // Convertir string a EGenders
        documentNumber: 0, // Valor por defecto ya que no se usa
        generatedUsername: phoneAsUsername, // Usar teléfono como usuario
      });
      setIsSuccess(true);
      handleOpenStatusModal();
    } catch (error: any) {
      setIsSuccess(false);
      setErrorMessage(
        error?.message || "Ocurrió un error inesperado. Vuelve a intentarlo."
      );
      handleOpenStatusModal();
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnConfirmStatus = async () => {
    if (!isSuccess) {
      // Si hay error, cerrar modal para permitir reintentar
      setShowStatusModal(false);
      return;
    }

    // Si es éxito, hacer login automático
    try {
      const data = getValues();
      const phoneAsUsername = data.phone?.toString() || "";

      const userLogged = await userServices.login({
        username: phoneAsUsername, // Usar teléfono como usuario
        password: phoneAsUsername, // Usar teléfono como contraseña
      });
      setUser(userLogged);
      setUserStorage(userLogged);
      setShowStatusModal(false);
      navigate(KARAOKE_ROUTES.HOME);
    } catch (error: any) {
      console.error("Error en login automático:", error);
      // Si falla el login, mostrar error
      setIsSuccess(false);
      setErrorMessage(
        error?.message || "Error al iniciar sesión. Intenta nuevamente."
      );
      // El modal ya está abierto, solo cambiar el estado
    }
  };

  const handleCloseStatusModal = () => {
    setShowStatusModal(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: KaraokeColors.base.darkPrimary,
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      {/* Header */}
      <div className="px-8 pt-5">
        <Header showBackIcon />
      </div>

      {/* Content */}
      <div className="px-8 pt-5 flex-1">
        <Typography variant="headline-xl-semi" color={KaraokeColors.base.white}>
          Registro
        </Typography>
        <Typography
          variant="body-lg-semi"
          color={KaraokeColors.gray.gray300}
          className="mt-2.5 leading-10"
        >
          Vamos a registrarte, con unos simples pasos.
        </Typography>

        <div className="mt-8 space-y-6">
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                value={value || ""}
                placeholder="Nombres"
                icon="user"
                onBlur={onBlur}
                onChange={onChange}
                error={errors?.name?.message}
              />
            )}
            name="name"
            rules={{ required: "Nombre querido" }}
          />

          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                value={value || ""}
                placeholder="Apellidos"
                onBlur={onBlur}
                onChange={onChange}
                error={errors?.lastName?.message}
              />
            )}
            name="lastName"
            rules={{ required: "Apellido requerido" }}
          />

          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                value={value?.toString() || ""}
                placeholder="Teléfono *"
                type="tel"
                maxLength={15}
                icon="phone"
                onChange={onChange}
                onBlur={onBlur}
                error={errors?.phone?.message}
              />
            )}
            name="phone"
            rules={{
              required: "Teléfono es obligatorio",
              pattern: {
                value: /^[0-9]{9,15}$/,
                message: "Teléfono inválido (9-15 dígitos)",
              },
            }}
          />

          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                value={value || ""}
                placeholder="Correo (opcional)"
                type="email"
                onChange={onChange}
                onBlur={onBlur}
                error={errors?.email?.message}
              />
            )}
            name="email"
            rules={{
              pattern: {
                value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                message: "Correo inválido",
              },
            }}
          />

          <RadioButtonGroup
            options={genderOptions}
            onSelectedGender={(value) => setSelectedGender(value)}
            selectedGender={selectedGender}
          />
        </div>
      </div>

      {/* Bottom Button */}
      <div
        className="px-8 pb-8 mb-6 mt-auto"
        style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}
      >
        <Button
          size="lg"
          theme="primary"
          fullWidth
          onClick={handleSubmit(handleOnRegister)}
          isLoading={isLoading}
          disabled={isValid}
        >
          Guardar
        </Button>
      </div>

      {/* Status Modal */}
      <StatusModal
        visible={showStatusModal}
        status={isSuccess ? "success" : "error"}
        onConfirm={handleOnConfirmStatus}
        onClose={handleCloseStatusModal}
        description={
          isSuccess
            ? "Conseguiste un regalo, estas a punto de iniciar una nueva experiencia."
            : errorMessage || "Ocurrió un error, vuelve a intentarlo."
        }
      />
    </div>
  );
};
