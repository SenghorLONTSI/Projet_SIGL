import { getSession, getUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function MesApprentisTPPage() {
  // 1️⃣ Vérifier la session
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  // 2️⃣ Vérifier que l'utilisateur est TP + récupérer son TP
  const tp = await prisma.tp.findUnique({
    where: {
      userId: user.id,
    },
  });

  if (!tp) {
    return (
      <div className="max-w-2xl mx-auto mt-10 space-y-6">
        <h1 className="text-2xl font-bold">Mes apprentis</h1>
        <p className="text-gray-500 text-sm">
          Vous n'êtes pas enregistré en tant que Tuteur pédagogique (TP).
        </p>
      </div>
    );
  }

  // 3️⃣ Récupérer les apprentis rattachés à ce TP
  const apprentis = await prisma.apprenti.findMany({
    where: {
      idTP: tp.id,
    },
    include: {
      user: true, // Infos du User relié
    },
  });

  return (
    <div className="max-w-2xl mx-auto mt-10 space-y-6">
      <h1 className="text-2xl font-bold">Mes apprentis</h1>

      {apprentis.length === 0 ? (
        <p className="text-gray-500 text-sm">
          Aucun apprenti ne vous est assigné en tant que TP.
        </p>
      ) : (
        <div className="space-y-3">
          {apprentis.map((a) => (
            <Card key={a.id} className="">
              <CardHeader className="text-green-500 hover:text-blue-900 transition-colors">
                <CardTitle className="text-black-200">
                  {a.name} {a.subName ?? ""}
                </CardTitle>
              </CardHeader>

              {/*<CardContent className="space-y-1 text-sm text-gray-700">
                <p>
                  <span className="font-medium">ID apprenti :</span> {a.id}
                </p>
                <p>
                  <span className="font-medium">idMA :</span> {a.idMA}
                </p>
                <p>
                  <span className="font-medium">idTP :</span> {a.idTP}
                </p>
                {a.user && (
                  <p>
                    <span className="font-medium">Email :</span>{" "}
                    {a.user.email}
                  </p>
                )}
              </CardContent>*/}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
