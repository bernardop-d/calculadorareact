import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { createCheckoutSession, createOrRetrieveCustomer } from "@/lib/stripe";
import { getBaseUrl } from "@/lib/utils";

export async function POST() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const customerId = await createOrRetrieveCustomer(
      user.id,
      user.email,
      user.name
    );

    const baseUrl = getBaseUrl();
    const session = await createCheckoutSession(
      customerId,
      user.id,
      `${baseUrl}/dashboard?payment=success`,
      `${baseUrl}/payment?cancelled=true`
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[CHECKOUT]", error);
    return NextResponse.json({ error: "Erro ao criar sessão de pagamento" }, { status: 500 });
  }
}
