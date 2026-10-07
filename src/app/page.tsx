import { HomePage } from "@global/pages/home-page";
import { appModules } from "@modules/registry";

export default function Page() {
  return <HomePage modules={appModules} />;
}
