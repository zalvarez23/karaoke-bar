import { FC } from "react";
import { Typography } from "./index";
import { KaraokeColors } from "../../colors";

type TRadioButtonGroupProps = {
  options: { label: string; value: string }[];
  selectedGender: string;
  onSelectedGender: (value: string) => void;
};

export const RadioButtonGroup: FC<TRadioButtonGroupProps> = ({
  options,
  selectedGender,
  onSelectedGender,
}) => {
  return (
    <div className="flex flex-row flex-wrap justify-between gap-5 items-center mt-5">
      {options.map((option) => (
        <button
          key={option.value}
          className="flex flex-row items-center gap-2 mb-4 min-w-[120px] hover:opacity-80 transition-opacity"
          onClick={() => onSelectedGender(option.value)}
        >
          <div
            className="w-5 h-5 rounded-full border-2 flex justify-center items-center"
            style={{ borderColor: KaraokeColors.primary.primary500 }}
          >
            {selectedGender === option.value && (
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: KaraokeColors.primary.primary500 }}
              />
            )}
          </div>
          <Typography
            variant="body-sm"
            color={KaraokeColors.gray.gray400}
            className="leading-4"
          >
            {option.label}
          </Typography>
        </button>
      ))}
    </div>
  );
};
