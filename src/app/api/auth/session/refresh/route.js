import { NextResponse } from "next/server";
import { refreshSession } from "@/services/auth";

const noStoreHeaders = {
  "Cache-Control": "no-store",
};

export async function POST(request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json(
      { message: "La solicitud de renovación no es válida." },
      { status: 403, headers: noStoreHeaders },
    );
  }

  try {
    const wasRefreshed = await refreshSession();

    if (!wasRefreshed) {
      return NextResponse.json(
        { message: "La sesión venció." },
        { status: 401, headers: noStoreHeaders },
      );
    }

    return NextResponse.json(
      { refreshed: true },
      { headers: noStoreHeaders },
    );
  } catch (error) {
    console.error("[refreshSessionRoute]", error);
    return NextResponse.json(
      { message: "No pudimos renovar la sesión." },
      { status: 500, headers: noStoreHeaders },
    );
  }
}
