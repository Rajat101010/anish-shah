
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { compare } from "bcryptjs";
import { makeSession, sessionCookieName } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email =
      typeof body.email === "string"
        ? body.email.toLowerCase().trim()
        : "";
    const password =
      typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const admin = await db.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      console.log("LOGIN DEBUG: Admin record not found.");
      return NextResponse.json(
        { error: "Admin record not found in the connected database." },
        { status: 401 }
      );
    }

    const passwordMatches = await compare(
      password,
      admin.passwordHash
    );

    if (!passwordMatches) {
      console.log("LOGIN DEBUG: Password comparison failed.");
      return NextResponse.json(
        { error: "Password does not match the stored hash." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ ok: true });

    response.cookies.set(
      sessionCookieName,
      makeSession(admin.email),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      }
    );

    console.log("LOGIN DEBUG: Credentials verified and session created.");

    return response;
  } catch (error) {
    console.error("LOGIN DEBUG: Server error:", error);

    return NextResponse.json(
      { error: "Server error. Check the terminal." },
      { status: 500 }
    );
  }
}
