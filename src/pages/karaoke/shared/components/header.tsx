import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { KaraokeColors } from "../../colors";
import Typography from "./typography";

type THeaderProps = {
  title?: string;
  showBackIcon?: boolean;
  description?: string;
  redirectTo?: string;
};

const Header = ({
  title,
  showBackIcon,
  description,
  redirectTo,
}: THeaderProps) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (redirectTo) {
      navigate(redirectTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="pt-4 relative">
      <div className="flex flex-row gap-7 items-center">
        {showBackIcon && (
          <button
            onClick={handleGoBack}
            className="hover:opacity-80 transition-opacity"
          >
            <ChevronLeft size={30} color={KaraokeColors.base.white} />
          </button>
        )}
        {title && (
          <Typography
            variant="headline-sm-semi"
            color={KaraokeColors.base.white}
          >
            {title}
          </Typography>
        )}
      </div>
      {description && (
        <Typography
          variant="body-md-semi"
          color={KaraokeColors.base.white}
          className="mt-6"
        >
          {description}
        </Typography>
      )}
    </div>
  );
};

export default Header;
