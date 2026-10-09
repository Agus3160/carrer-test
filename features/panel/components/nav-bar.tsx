import { ReactNode } from "react";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/shared/components/ui/navigation-menu";
import { Button } from "@/shared/components/ui/button";
import { LogOut } from "lucide-react";
import { signout } from "@/features/auth/actions/signout.action";

type Props = {
  children: ReactNode;
};

const navigationItems = [
  { label: "Dimensiones", href: "/panel/dimension" },
  { label: "Carreras", href: "/panel/carrer" },
  { label: "Candidatos", href: "/panel/candidates" },
];

const NavBarLayout = ({ children }: Props) => {
  return (
    <div className="w-full mx-auto min-h-dvh">
      <header className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <NavigationMenu>
          <NavigationMenuList className="flex flex-wrap gap-2">
            {navigationItems.map((item) => (
              <NavigationMenuItem key={item.href}>
                <NavigationMenuLink
                  render={<Link href={item.href} />}
                  className={navigationMenuTriggerStyle()}
                >
                  {item.label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <form action={signout}>
          <Button
            type="submit"
            size="icon"
            variant="destructive"
            className="hover:cursor-pointer"
          >
            <LogOut className="size-4" />
          </Button>
        </form>
      </header>
      <main className="py-6 px-4">{children}</main>
    </div>
  );
};

export default NavBarLayout;
