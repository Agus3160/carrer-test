"use client";

import { useState, useTransition } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { signout } from "@/features/auth/actions/signout.action";

export const SignoutButton = () => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSignout = () => {
    startTransition(async () => {
      await signout();
    });
  };

  return (
    <>
      <Button
        size="icon"
        variant="destructive"
        className="hover:cursor-pointer"
        aria-label="Cerrar sesión"
        onClick={() => setOpen(true)}
      >
        <LogOut className="size-4" />
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
            <AlertDialogDescription>
              Se cerrará tu sesión actual y volverás a la pantalla de acceso.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isPending}
              onClick={handleSignout}
            >
              {isPending ? "Cerrando..." : "Cerrar sesión"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
