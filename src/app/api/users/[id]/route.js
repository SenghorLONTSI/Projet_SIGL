import { getSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { use } from "react";
import { NextResponse } from "next/server";

export async function GET(_request, { params }) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await (params);
        if (!id) {
            return NextResponse.json({ error: "Id de l'utilisateur requis" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: (id) },
        });
        if (!user) {
            return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (err) {
        if (err instanceof NextResponse) return err;
        console.error(err);
        return NextResponse.json({ error: "Erreur interne du serveur" }, {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

export async function PATCH(request, { params }) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = params || {};
        if (!id) {
            return NextResponse.json({ error: "Id de l'utilisateur requis" }, { status: 400 });
        }

        const body = await request.json().catch(() => ({}));
        const role = body?.role;
        const allowedRoles = ["MA", "TP", "APPRENTI"];
        if (!allowedRoles.includes(role)) {
            return NextResponse.json({ error: "Role invalide" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { id },
        });
        if (!existingUser) {
            return NextResponse.json({ error: "Utilisateur non trouvÇ¸" }, { status: 404 });
        }

        const updatedUser = await prisma.$transaction(async (tx) => {
            const user = await tx.user.update({
                where: { id },
                data: { role },
            });

            if (role === "MA") {
                const existing = await tx.ma.findUnique({ where: { userId: id } });
                if (!existing) {
                    await tx.ma.create({
                        data: {
                            id,
                            userId: id,
                            name: user.name,
                            subName: user.subName,
                        },
                    });
                }
            } else if (role === "TP") {
                const existing = await tx.tp.findUnique({ where: { userId: id } });
                if (!existing) {
                    await tx.tp.create({
                        data: {
                            id,
                            userId: id,
                            name: user.name,
                            subName: user.subName,
                        },
                    });
                }
            } else if (role === "APPRENTI") {
                const existing = await tx.apprenti.findUnique({ where: { userId: id } });
                if (!existing) {
                    await tx.apprenti.create({
                        data: {
                            id,
                            userId: id,
                            name: user.name,
                            subName: user.subName,
                        },
                    });
                }
            }

            return user;
        });

        return NextResponse.json({ user: updatedUser }, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Erreur interne du serveur" }, {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
export const runtime = "nodejs"
