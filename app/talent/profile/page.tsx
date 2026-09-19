import { redirect } from "next/navigation";

/** The profile editor lives in the dashboard now. */
export default function TalentProfileRedirect() {
  redirect("/talent/dashboard?tab=profile");
}
