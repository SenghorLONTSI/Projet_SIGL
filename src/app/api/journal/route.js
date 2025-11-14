// app/api/journals/route.js

import { getSession, requireRole, Actions } from "@/lib/auth-server";

export async function POST() {
  // 1) Vérifier la session
  const session = getSession();

  // 2) À partir d'ici, tu es sûr d'avoir :
  //    session.user.id, session.user.role, etc.
  //    Tu pourras ajouter requireRole / requireOwnership ensuite.

  return new Response(
    JSON.stringify({
      message: "OK, tu es authentifié",
      userId: session.user.id,
      role: session.user.role,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}



export async function POST() {
  try {
    // 1) Auth obligatoire
    const session = getSession();

    // 2) Vérifier que ce rôle a le droit de créer un journal
    requireRole(session, Actions.JOURNAL_CREATE);

    // 3) Ici tu es sûr :
    //    - user authentifié
    //    - role = APPRENTI (avec nos règles actuelles)
    //    - Prochaine étape : créer le journal avec apprenti_id = session.user.id

    // TODO: insert into DB...
    // await db.insertJournal({ apprentiId: session.user.id, ... })

    return new Response(
      JSON.stringify({ message: "Journal created (fake for now)" }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    if (err instanceof Response) return err; // nos require* renvoient déjà la bonne réponse
    console.error(err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}