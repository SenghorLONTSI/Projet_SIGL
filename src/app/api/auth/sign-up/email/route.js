import { auth } from "@/lib/auth"

export async function POST(request) {
    try {
        const body = await request.json();
        console.log("📥 Received body:", body); // Debug

        const { email, password, name } = body;

        // Validation
        if (!password) {
            return Response.json(
                { error: "Le mot de passe est requis" },
                { status: 400 }
            );
        }

        if (!email) {
            return Response.json(
                { error: "L'email est requis" },
                { status: 400 }
            );
        }

        console.log("✅ Password présent, length:", password.length); // Debug

        // Création de l'utilisateur via Better Auth
        const user = await auth.api.signUpEmail({
            body: {
                email,
                password,
                name: name || "User",
            },
        });

        console.log("✅ User créé:", user); // Debug

        return Response.json(user, { status: 201 });

    } catch (error) {
        console.error("❌ Sign up error:", error);
        return Response.json(
            { error: error.message || "Erreur lors de la création du compte" },
            { status: 422 }
        );
    }
}