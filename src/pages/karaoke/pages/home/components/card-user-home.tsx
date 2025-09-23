import { UserCard } from "../../../shared/components/user-card";
import { IAdditionalInfo } from "../../../shared/types/user.types";

type TCardUserHomeProps = {
  additionalInfo: IAdditionalInfo;
};

export const CardUserHome = ({ additionalInfo }: TCardUserHomeProps) => {
  return (
    <div className="mt-1.5 px-4">
      <UserCard additionalInfo={additionalInfo} />
    </div>
  );
};



