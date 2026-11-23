import { getMenu } from "@/lib/navigation";
import { HeaderBar } from "./HeaderBar";

/** The public header. Its menu comes from Navigation Management in the admin panel. */
export async function Header() {
  return <HeaderBar items={await getMenu("header")} />;
}
