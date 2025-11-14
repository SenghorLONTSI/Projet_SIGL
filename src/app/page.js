import Image from "next/image";
import { getUser } from "@/lib/auth-server";
import { unauthorized } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function Home() {
  const user = await getUser();
  if (!user) {
    return unauthorized();
  }
  let roleDisplay = "";
  switch (user.role) {
    case "APPRENTI":
      roleDisplay = "Apprenti";
      break;
    case "MA":
      roleDisplay = "Maître d'apprentissage";
      break;
  }
  console.log(user)
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
        <CardContent className="text-center">
          <span className="text-gray-800 font-medium mb-2">Adresse email</span>
          <p className="text-gray-600 mb-1">{user.email}</p>
          <span className="text-gray-800 font-medium mb-2">Rôle</span>
          <p className="text-gray-500">{roleDisplay}</p>
        </CardContent>
      </Card>
    </div>
  );
}
