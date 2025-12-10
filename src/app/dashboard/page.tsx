import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function DashboardRedirect() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const user = session.user as {
    role?: "ADMIN" | "TEACHER" | "PARENT";
  };

  // segurança extra: caso não tenha role volta pro login
  if (!user.role) {
    redirect("/login");
  }

  // redireciona baseado no papel do usuário
  switch (user.role) {
    case "ADMIN":
      redirect("/admin");

    case "TEACHER":
      redirect("/teacher");

    case "PARENT":
      redirect("/parent");

    default:
      redirect("/login");
  }
}
