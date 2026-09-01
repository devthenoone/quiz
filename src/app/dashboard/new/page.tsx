import { redirect } from "next/navigation";

export default function NewPostRedirect() {
  redirect("/dashboard/articles/create");
}
