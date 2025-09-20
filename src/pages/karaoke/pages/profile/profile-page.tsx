import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Lock, ChevronRight, Delete, Mail, Phone } from "lucide-react";
import { KaraokeColors } from "../../colors";
import {
  Header,
  Button,
  Input,
  Typography,
  ConfirmModal,
} from "../../shared/components";
import { useUsersContext } from "../../shared/context";
import { UserServices } from "../../shared/services";

type TChangePasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export const KaraokeProfilePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showInvalidPasswordModal, setShowInvalidPasswordModal] =
    useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPasswordMismatchModal, setShowPasswordMismatchModal] =
    useState(false);
  const [showRequestSentModal, setShowRequestSentModal] = useState(false);
  const [showPasswordErrorModal, setShowPasswordErrorModal] = useState(false);
  const [showRequestErrorModal, setShowRequestErrorModal] = useState(false);

  const {
    state: { user },
    logout,
  } = useUsersContext();

  const userServices = new UserServices();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<TChangePasswordForm>();

  const watchedValues = watch();

  const handleChangePassword = async (data: TChangePasswordForm) => {
    try {
      setIsLoading(true);

      // Validar contraseña actual
      if (
        !user.password ||
        data.currentPassword.toLowerCase() !== user.password.toLowerCase()
      ) {
        setShowInvalidPasswordModal(true);
        return;
      }

      // Validar que las nuevas contraseñas coincidan
      if (
        data.newPassword.toLowerCase() !== data.confirmPassword.toLowerCase()
      ) {
        setShowPasswordMismatchModal(true);
        return;
      }

      // Actualizar contraseña
      await userServices.updatePassword(user.id, data.newPassword);

      setShowSuccessModal(true);
    } catch (error) {
      setShowPasswordErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccountRequest = async () => {
    try {
      setIsLoading(true);

      await userServices.requestAccountDeletion(user.id, {
        requested: true,
        requestDate: new Date(),
        reason: "Solicitud del usuario",
      });

      setShowRequestSentModal(true);
    } catch (error) {
      setShowRequestErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: KaraokeColors.base.darkPrimary }}
    >
      {/* Header */}
      <div className="px-9 pt-2.5">
        <Header
          title="Configuración"
          description="Gestiona tu cuenta y preferencias"
          showBackIcon
        />
      </div>

      <div className="px-8 pb-8">
        {/* Información del Usuario */}
        <div className="mb-8">
          <Typography
            variant="headline-md-semi"
            color={KaraokeColors.base.white}
          >
            Información Personal
          </Typography>
          <div className="mt-4 space-y-2">
            <Typography
              variant="body-md-semi"
              color={KaraokeColors.gray.gray300}
            >
              Usuario: {user.generatedUsername}
            </Typography>
            <Typography
              variant="body-md-semi"
              color={KaraokeColors.gray.gray300}
            >
              Nombre: {user.name} {user.lastName}
            </Typography>
            {user.email && (
              <Typography
                variant="body-md-semi"
                color={KaraokeColors.gray.gray300}
              >
                Email: {user.email}
              </Typography>
            )}
          </div>
        </div>

        {/* Cambiar Contraseña */}
        <div className="mb-8">
          <Typography
            variant="headline-md-semi"
            color={KaraokeColors.base.white}
          >
            Seguridad
          </Typography>

          {!showChangePassword ? (
            <button
              className="flex flex-row items-center justify-between w-full p-4 rounded-lg mt-4 hover:opacity-80 transition-opacity"
              style={{ backgroundColor: KaraokeColors.gray.gray800 }}
              onClick={() => setShowChangePassword(true)}
            >
              <div className="flex items-center gap-3">
                <Lock size={24} color={KaraokeColors.primary.primary500} />
                <Typography
                  variant="body-md-semi"
                  color={KaraokeColors.base.white}
                >
                  Cambiar Contraseña
                </Typography>
              </div>
              <ChevronRight size={24} color={KaraokeColors.gray.gray400} />
            </button>
          ) : (
            <form
              onSubmit={handleSubmit(handleChangePassword)}
              className="mt-4 space-y-4"
            >
              <Input
                {...register("currentPassword", {
                  required: "Contraseña actual requerida",
                })}
                value={watchedValues.currentPassword || ""}
                placeholder="Contraseña Actual"
                type="password"
                error={errors?.currentPassword?.message}
              />

              <Input
                {...register("newPassword", {
                  required: "Nueva contraseña requerida",
                })}
                value={watchedValues.newPassword || ""}
                placeholder="Nueva Contraseña"
                type="password"
                error={errors?.newPassword?.message}
              />

              <Input
                {...register("confirmPassword", {
                  required: "Confirmar contraseña requerida",
                })}
                value={watchedValues.confirmPassword || ""}
                placeholder="Confirmar Nueva Contraseña"
                type="password"
                error={errors?.confirmPassword?.message}
              />

              <div className="flex gap-4">
                <Button
                  size="md"
                  theme="secondary"
                  appearance="outline"
                  onClick={() => {
                    setShowChangePassword(false);
                    reset();
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  size="md"
                  theme="primary"
                  onClick={() => setShowChangePasswordModal(true)}
                  isLoading={isLoading}
                  className="flex-1"
                >
                  Actualizar
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Eliminar Cuenta */}
        <div className="mb-8">
          <Typography
            variant="headline-md-semi"
            color={KaraokeColors.base.white}
          >
            Cuenta
          </Typography>

          <button
            className="flex flex-row items-center justify-between w-full p-4 rounded-lg mt-4 hover:opacity-80 transition-opacity"
            style={{ backgroundColor: KaraokeColors.red.red900 }}
            onClick={() => setShowDeleteAccountModal(true)}
          >
            <div className="flex items-center gap-3">
              <Delete size={24} color={KaraokeColors.red.red500} />
              <Typography
                variant="body-md-semi"
                color={KaraokeColors.red.red500}
              >
                Solicitar Eliminación de Cuenta
              </Typography>
            </div>
            <ChevronRight size={24} color={KaraokeColors.red.red500} />
          </button>
        </div>

        {/* Información de Contacto */}
        <div className="mb-8">
          <Typography
            variant="headline-md-semi"
            color={KaraokeColors.base.white}
          >
            Soporte y Contacto
          </Typography>

          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3 py-2">
              <Mail size={20} color={KaraokeColors.purple.purple400} />
              <Typography variant="body-md" color={KaraokeColors.gray.gray300}>
                kevinsalazar30@gmail.com
              </Typography>
            </div>

            <div className="flex items-center gap-3 py-2">
              <Phone size={20} color={KaraokeColors.purple.purple400} />
              <Typography variant="body-md" color={KaraokeColors.gray.gray300}>
                +51 993 477 536
              </Typography>
            </div>

            <Typography
              variant="body-sm"
              color={KaraokeColors.gray.gray400}
              className="mt-2.5 text-center italic"
            >
              Para soporte técnico, consultas o reportar problemas, puedes
              contactarnos por cualquiera de estos medios.
            </Typography>
          </div>
        </div>
      </div>

      {/* Modales de Confirmación */}
      <ConfirmModal
        visible={showInvalidPasswordModal}
        title="Contraseña Incorrecta"
        message="La contraseña actual que ingresaste no es correcta. Por favor, verifica e intenta nuevamente."
        onConfirm={() => setShowInvalidPasswordModal(false)}
        onClose={() => setShowInvalidPasswordModal(false)}
        type="error"
      />

      <ConfirmModal
        visible={showPasswordMismatchModal}
        title="Contraseñas No Coinciden"
        message="Las nuevas contraseñas que ingresaste no coinciden. Por favor, verifica que ambas contraseñas sean idénticas."
        onConfirm={() => setShowPasswordMismatchModal(false)}
        onClose={() => setShowPasswordMismatchModal(false)}
        type="error"
      />

      <ConfirmModal
        visible={showChangePasswordModal}
        title="Cambiar Contraseña"
        message="¿Estás seguro de que quieres cambiar tu contraseña?"
        showCancelButton={true}
        onConfirm={() => {
          setShowChangePasswordModal(false);
          handleSubmit(handleChangePassword)();
        }}
        onClose={() => setShowChangePasswordModal(false)}
        type="info"
      />

      <ConfirmModal
        visible={showDeleteAccountModal}
        title="Solicitar Eliminación de Cuenta"
        message="¿Estás seguro de que quieres solicitar la eliminación de tu cuenta? Esta acción enviará una solicitud a nuestro equipo de administración que será procesada en un plazo de 24-48 horas. Recibirás un mensaje de texto o correo electrónico de confirmación."
        showCancelButton={true}
        onConfirm={() => {
          setShowDeleteAccountModal(false);
          handleDeleteAccountRequest();
        }}
        onClose={() => setShowDeleteAccountModal(false)}
        type="warning"
      />

      <ConfirmModal
        visible={showSuccessModal}
        title="¡Contraseña Actualizada!"
        message="Tu contraseña ha sido actualizada correctamente. Serás redirigido al login para iniciar sesión con tu nueva contraseña."
        onConfirm={() => {
          setShowSuccessModal(false);
          setShowChangePassword(false);
          reset();
          logout();
        }}
        onClose={() => {
          setShowSuccessModal(false);
          setShowChangePassword(false);
          reset();
          logout();
        }}
        type="success"
      />

      <ConfirmModal
        visible={showRequestSentModal}
        title="Solicitud de Eliminación Enviada"
        message="Tu solicitud de eliminación de cuenta ha sido enviada exitosamente. Nuestro equipo de administración revisará tu solicitud y te contactará por mensaje de texto o correo electrónico en un plazo de 24-48 horas para confirmar la eliminación de tu cuenta. Por favor, revisa tu bandeja de entrada y spam."
        onConfirm={() => {
          setShowRequestSentModal(false);
          setShowDeleteAccountModal(false);
        }}
        onClose={() => {
          setShowRequestSentModal(false);
          setShowDeleteAccountModal(false);
        }}
        type="success"
      />

      <ConfirmModal
        visible={showPasswordErrorModal}
        title="Error al Cambiar Contraseña"
        message="No se pudo actualizar tu contraseña. Por favor, verifica tu conexión a internet e intenta nuevamente."
        onConfirm={() => setShowPasswordErrorModal(false)}
        onClose={() => setShowPasswordErrorModal(false)}
        type="error"
      />

      <ConfirmModal
        visible={showRequestErrorModal}
        title="Error al Enviar Solicitud"
        message="No se pudo enviar tu solicitud de eliminación de cuenta. Por favor, verifica tu conexión a internet e intenta nuevamente."
        onConfirm={() => setShowRequestErrorModal(false)}
        onClose={() => setShowRequestErrorModal(false)}
        type="error"
      />
    </div>
  );
};
