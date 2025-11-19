import Image from "next/image";
import { getUser, getSession } from "@/lib/auth-server";
import { unauthorized } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import UploadDashboard from "@/components/dashboard/UploadDashboard";

export default async function Home() {
  const session = await getSession();
  if (!session) {
    return unauthorized();
  }

  const user = await getUser();
  if (!user) {
    return unauthorized();
  }

  const roleMap = {
    APPRENTI: "Apprenti",
    MA: "Maître d'apprentissage",
    USER: "Utilisateur",
    TP: "Tuteur pédagogique",
  };

  const roleDisplay = roleMap[user.role] || user.role;

  return (
    <div className="max-w-lg mx-auto mt-10 space-y-6">
      <span className="text-2xl font-bold mb-4 block text-center">
        Bienvenue sur SIGL !
      </span>

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
            <p className="text-gray-600">{user.id}</p>
          </div>

          <div>
            <span className="text-gray-800 font-medium">Rôle</span>
            <p className="text-gray-500">{roleDisplay}</p>
          </div>
        </CardContent>
      </Card>

      {/* 🌟 D A S H B O A R D   A P P R E N T I   🌟 */}
      {user.role === "APPRENTI" && (
        <UploadDashboard user={user} />
      )}
    </div>
  );
}
