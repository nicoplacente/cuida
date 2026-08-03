import "server-only";

import { actionError } from "@/utils/action-result";
import { logServerError } from "@/utils/safe-logger";

export function unexpectedActionError(context, error) {
  logServerError(context, error);
  return actionError();
}
