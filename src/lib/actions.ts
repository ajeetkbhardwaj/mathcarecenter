"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { courses, enrollments, users } from "@/db/schema";
import { createSession, destroySession, hashPassword, requireUser, verifyPassword } from "@/lib/auth";

export type AuthState = { error?: string } | null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");

  if (name.length < 2) return { error: "Please enter your name." };
  if (!EMAIL_RE.test(email)) return { error: "Please enter a valid email address." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) return { error: "An account with that email already exists." };

  const inserted = await db
    .insert(users)
    .values({ name, email, passwordHash: await hashPassword(password) })
    .returning({ id: users.id });

  await createSession(inserted[0].id);
  redirect(next);
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");

  if (!email || !password) return { error: "Enter your email and password." };

  const found = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = found[0];
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Incorrect email or password." };
  }

  await createSession(user.id);
  redirect(next);
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export type EnrollState = { error?: string; ok?: boolean } | null;

/** 1-Click course enrolment for logged-in students. */
export async function enrollCourseAction(formData: FormData): Promise<void> {
  const courseSlug = String(formData.get("courseSlug") ?? "");

  let user;
  try {
    user = await requireUser();
  } catch {
    redirect(`/login?next=${encodeURIComponent(`/courses/${courseSlug}`)}`);
  }

  const found = await db.select().from(courses).where(eq(courses.slug, courseSlug)).limit(1);
  const course = found[0];
  if (!course) return;

  const existing = await db
    .select({ id: enrollments.id })
    .from(enrollments)
    .where(and(eq(enrollments.userId, user.id), eq(enrollments.courseId, course.id)))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(enrollments).values({
      userId: user.id,
      courseId: course.id,
    });
  }

  revalidatePath("/dashboard");
  revalidatePath(`/courses/${course.slug}`);
  redirect(`/courses/${course.slug}?enrolled=1`);
}
