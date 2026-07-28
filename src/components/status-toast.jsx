"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function StatusToast({ message, status = "error" }) {
  useEffect(() => {
    if (status === "success") {
      toast.success(message);
    } else if (status === "warning") {
      toast.warning(message);
    } else {
      toast.error(message);
    }
  }, [message, status]);

  return null;
}
