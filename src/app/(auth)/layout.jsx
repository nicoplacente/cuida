import { PRIVATE_ROBOTS, SITE_NAME } from "@/utils/seo";

export const metadata = {
  title: {
    default: "Acceso",
    template: `%s | ${SITE_NAME}`,
  },
  robots: PRIVATE_ROBOTS,
};

export default function AuthLayout({ children }) {
  return children;
}
