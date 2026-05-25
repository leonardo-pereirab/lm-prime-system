"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logout() {
  (await cookies()).set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  redirect("/login");
}
