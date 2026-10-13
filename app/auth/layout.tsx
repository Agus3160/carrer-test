import { Suspense, type ReactNode } from "react";
import { AuthRedirectIfSignedIn } from "@/features/auth/components/auth-redirect-if-signed-in";

type Props = {
  children: ReactNode;
};

const AuthLayout = ({ children }: Props) => {
  return (
    <>
      <Suspense fallback={null}>
        <AuthRedirectIfSignedIn />
      </Suspense>
      {children}
    </>
  );
};

export default AuthLayout;
