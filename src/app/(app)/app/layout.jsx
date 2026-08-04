import { AppShell } from "@/components/app-shell";
import { PRIVATE_ROBOTS, SITE_NAME } from "@/utils/seo";

export const metadata = {
  title: {
    default: "Aplicación",
    template: `%s | ${SITE_NAME}`,
  },
  robots: PRIVATE_ROBOTS,
};

export default function PrivateLayout({ children }) {
  return <AppShell>{children}</AppShell>;
}
