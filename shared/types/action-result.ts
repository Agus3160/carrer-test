export type ActionResult<T = null> =
  | {
      success: true;
      message?: string;
      data?: T;
    }
  | {
      success: false;
      message: string;
      errors?: string[];
    };
