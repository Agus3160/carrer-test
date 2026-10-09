import { ActionResult } from "../types/action-result";

const ok = <T>(data?: T, message?: string): ActionResult<T> => ({
  success: true,
  message,
  data,
});

const success = (message?: string):ActionResult<undefined> => ({ success: true, message });

const fail = <T>(message: string, errors?: string[]): ActionResult<T> => ({
  success: false,
  message,
  errors,
});

export const result = { ok, success, fail };
