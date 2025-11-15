import { auth } from "@/lib/auth"


export async function POST(request) {
    try {

        const body = await request.json();
        //console.log("📥 Received body:", body); // Debug

        const { email, password } = body;

        // Validation
        if (password === undefined || password === '') {
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

        // Connexion à Better Auth
        const user = await auth.api.signInEmail({
            body: {
                email,
                password,
            },
            asResponse: true,
        });
        return user
    } catch (error) {
        console.error("❌ Sign in error:", error);
        return Response.json(
            { error: error.message || "Erreur lors de la connexion au compte" },
            { status: 422 }
        );
    }
}