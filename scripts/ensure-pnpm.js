const execPath = process.env.npm_execpath || "";
const userAgent = process.env.npm_config_user_agent || "";
const isPnpm =
  execPath.toLowerCase().includes("pnpm") ||
  userAgent.toLowerCase().startsWith("pnpm/");

if (!isPnpm) {
  console.error(
    "\nEste proyecto solo permite pnpm. Usá comandos como: pnpm install, pnpm dev, pnpm build o pnpm add <paquete>.\n",
  );
  process.exit(1);
}
