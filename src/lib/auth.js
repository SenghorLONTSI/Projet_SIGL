import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
//import { PrismaClient } from '@prisma/client';
import { prisma } from "../lib/prisma";


export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "USER",
                input: false, // don't allow user to set role
            },
        },
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
    },
})  