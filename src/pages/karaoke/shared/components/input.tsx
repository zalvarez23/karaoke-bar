import React, { forwardRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { KaraokeColors } from "../../colors";
import { User, Phone, Mail } from "lucide-react";

type InputType = "onlyNumbers" | "alphanumeric" | "onlyString";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  icon?: string;
  customIcon?: React.ReactNode;
  inputType?: InputType;
  error?: string;
  className?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      value: initValue,
      onChangeText,
      placeholder,
      icon,
      customIcon,
      inputType,
      error,
      className,
      onChange,
      ...rest
    },
    ref
  ) => {
    const [onFocus, setOnFocus] = useState(false);
    const [value, setValue] = useState("");

    // Función para obtener el icono por nombre
    const getIconByName = (iconName?: string) => {
      if (!iconName) return null;

      const iconProps = {
        size: 20,
        color: error
          ? KaraokeColors.red.red300
          : KaraokeColors.primary.primary500,
      };

      switch (iconName) {
        case "user":
          return <User {...iconProps} />;
        case "phone":
          return <Phone {...iconProps} />;
        case "googleplus":
        case "mail":
          return <Mail {...iconProps} />;
        default:
          return null;
      }
    };

    // Validar texto basado en el tipo
    const validateText = (text: string): string => {
      switch (inputType) {
        case "onlyNumbers":
          return text.replace(/[^0-9]/g, ""); // Solo permite números
        case "alphanumeric":
          return text.replace(/[^a-zA-Z0-9]/g, ""); // Letras y números
        case "onlyString":
          return text.replace(/[^a-zA-Z ]/g, ""); // Letras y espacios
        default:
          return text; // Sin restricciones
      }
    };

    // Manejo del cambio de texto
    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const text = e.target.value;
      const validatedText = validateText(text);

      if (onChangeText) {
        onChangeText(validatedText);
      }

      setValue(validatedText);
      onChange?.(e);
    };

    const getInputStyles = () => {
      if (error) {
        return "border-red-500 focus:border-red-500";
      }
      return onFocus
        ? "border-[#7F64FC] focus:border-[#7F64FC]"
        : "border-gray-600 focus:border-[#7F64FC]";
    };

    useEffect(() => {
      setValue(initValue || "");
    }, [initValue]);

    const baseClasses =
      "w-full px-4 py-3 rounded-lg bg-[#1e1c24] text-white placeholder-gray-400 border transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F64FC]/20";

    const inputClasses = cn(baseClasses, getInputStyles(), className);

    return (
      <div className="relative">
        <input
          ref={ref}
          value={value}
          onChange={handleOnChange}
          onFocus={() => setOnFocus(true)}
          onBlur={() => setOnFocus(false)}
          placeholder={placeholder}
          className={inputClasses}
          {...rest}
        />

        {(icon || customIcon) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {customIcon || getIconByName(icon)}
          </div>
        )}

        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
