import { redirect } from "next/navigation";

/** The profile editor lives in the dashboard now. */
export default function ClientProfileRedirect() {
  redirect("/client/dashboard?tab=profile");
}
