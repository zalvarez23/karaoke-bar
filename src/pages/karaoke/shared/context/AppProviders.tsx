import { ReactNode } from "react";
import { UsersProvider } from "./UsersContext";

const AppProviders = ({ children }: { children: ReactNode }) => {
  return <UsersProvider>{children}</UsersProvider>;
};

export { AppProviders };
