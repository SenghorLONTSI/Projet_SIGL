import Image from "next/image";
import { getUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function Home() {
  const user = await getUser();
  if (!user) {
    redirect("/login"); // This will stop rendering and redirect the user.
  }

  const roleMap = {
    APPRENTI: "Apprenti",
    MA: "Maître d'apprentissage",
  };
  const roleDisplay = roleMap[user.role] || user.role;

  return (
    <div className="max-w-sm mx-auto mt-10">
      <Card>
        <CardHeader className="flex flex-col items-center">
          <Image
            src={user.image || "/default-image.png"}
            alt="image utilisateur"
            width={80}
            height={80}
            className="rounded-full mb-4"
          />
          <CardTitle>{user.name}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div>
            <span className="text-gray-800 font-medium">Adresse email</span>
            <p className="text-gray-600">{user.email}</p>
          </div>
          <div>
            <span className="text-gray-800 font-medium">Rôle</span>
            <p className="text-gray-500">{roleDisplay}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
