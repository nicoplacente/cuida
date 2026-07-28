export const genericActionErrorMessage =
  "No pudimos completar la operación. Intentá nuevamente.";

export const initialActionState = {
  id: null,
  status: "idle",
  message: "",
  data: null,
};

export function actionSuccess(message, data = null) {
  return {
    id: `${Date.now()}-${Math.random()}`,
    status: "success",
    message,
    data,
  };
}

export function actionError(message = genericActionErrorMessage) {
  return {
    id: `${Date.now()}-${Math.random()}`,
    status: "error",
    message,
    data: null,
  };
}

export function unexpectedActionError(context, error) {
  console.error(`[${context}]`, error);
  return actionError();
}
