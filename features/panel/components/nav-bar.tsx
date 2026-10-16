import { ReactNode } from "react";
import Link from "next/link";
import { CompassIcon } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/shared/components/ui/navigation-menu";
import { SignoutButton } from "./signout-button";

type Props = {
  children: ReactNode;
};

const navigationItems = [
  { label: "Inicio", href: "/panel" },
  { label: "Conocimiento", href: "/panel/knowledge" },
  { label: "Preguntas", href: "/panel/questions" },
  { label: "Carreras", href: "/panel/carrer" },
  { label: "Orientaciones", href: "/panel/assessments" },
  { label: "Candidatos", href: "/panel/candidates" },
  { label: "Dimensiones", href: "/panel/dimension" },
];

const NavBarLayout = ({ children }: Props) => {
  return (
    <div className="min-h-dvh w-full">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link href="/panel" className="group flex shrink-0 items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary">
                <CompassIcon className="size-4" aria-hidden="true" />
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-semibold tracking-tight">Brújula</span>
                <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Administración</span>
              </span>
            </Link>
            <div className="sm:hidden">
              <SignoutButton />
            </div>
            <div className="hidden sm:block">
              <SignoutButton />
            </div>
          </div>
          <NavigationMenu className="max-w-full">
            <NavigationMenuList className="flex max-w-full flex-wrap gap-1">
              {navigationItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink
                    render={<Link href={item.href} />}
                    className={navigationMenuTriggerStyle() + " rounded-full border border-transparent px-3 text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground"}
                  >
                    {item.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-7 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
};

export default NavBarLayout;
