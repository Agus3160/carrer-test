import NavBarLayout from "@/features/panel/components/nav-bar";
import { getSessionOrRedirect } from "@/shared/lib/session";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const PanelLayout = async ({ children }: Props) => {
  await getSessionOrRedirect();
  return <NavBarLayout>{children} </NavBarLayout>;
};

export default PanelLayout;
