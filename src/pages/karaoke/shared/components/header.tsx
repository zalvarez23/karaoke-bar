import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { KaraokeColors } from "../../colors";
import Typography from "./typography";

type THeaderProps = {
  title?: string;
  showBackIcon?: boolean;
  description?: string;
};

const Header = ({ title, showBackIcon, description }: THeaderProps) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="pt-4 relative">
      {showBackIcon && (
        <button
          onClick={handleGoBack}
          className="mb-5 hover:opacity-80 transition-opacity"
        >
          <ArrowLeft size={26} color={KaraokeColors.base.white} />
        </button>
      )}
      {title && (
        <Typography
          variant="headline-md-semi"
          color={KaraokeColors.base.white}
          className="text-left mt-5"
        >
          {title}
        </Typography>
      )}
      {description && (
        <Typography
          variant="body-md-semi"
          color={KaraokeColors.gray.gray400}
          className="mt-2.5"
        >
          {description}
        </Typography>
      )}
    </div>
  );
};

export default Header;



