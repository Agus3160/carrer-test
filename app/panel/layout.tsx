import { Suspense, type ReactNode } from "react";
import NavBarLayout from "@/features/panel/components/nav-bar";
import { PanelSessionGate } from "@/features/panel/components/panel-session-gate";

type Props = {
  children: ReactNode;
};

const PanelLayout = ({ children }: Props) => {
  return (
    <NavBarLayout>
      <Suspense fallback={null}>
        <PanelSessionGate />
      </Suspense>
      {children}
    </NavBarLayout>
  );
};

export default PanelLayout;
