import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import ReviewClient from "@/components/review/ReviewClient";

export default async function ReviewPage({ params }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const assignmentId = Number(params.id);
  if (!Number.isInteger(assignmentId)) {
    redirect("/"); // ou renvoie une 404 si tu préfères
  }

  return <ReviewClient assignmentId={assignmentId} />;
}
