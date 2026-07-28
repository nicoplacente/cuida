const MERCADO_PAGO_SHORT_LINK_HOSTNAME = "mpago.la";
const MERCADO_PAGO_ARGENTINA_HOSTNAME = "mercadopago.com.ar";

export function getDonationUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_MERCADO_PAGO_DONATION_URL?.trim();

  if (!configuredUrl) {
    return null;
  }

  try {
    const donationUrl = new URL(configuredUrl);
    const isOfficialHostname =
      donationUrl.hostname === MERCADO_PAGO_SHORT_LINK_HOSTNAME ||
      donationUrl.hostname === MERCADO_PAGO_ARGENTINA_HOSTNAME ||
      donationUrl.hostname.endsWith(`.${MERCADO_PAGO_ARGENTINA_HOSTNAME}`);

    if (
      donationUrl.protocol !== "https:" ||
      donationUrl.username ||
      donationUrl.password ||
      !isOfficialHostname
    ) {
      return null;
    }

    return donationUrl.toString();
  } catch {
    return null;
  }
}
