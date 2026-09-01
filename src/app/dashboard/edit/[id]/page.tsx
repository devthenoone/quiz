import { redirect } from "next/navigation";

export default async function EditPostRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/dashboard/articles/edit/${id}`);
}
