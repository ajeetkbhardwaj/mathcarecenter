import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="grid-bg min-h-[calc(100vh-57px)]">
      <div className="mx-auto grid max-w-[1400px] place-items-center px-4 py-16 sm:px-6">
        <AuthForm mode="login" next={next} />
      </div>
    </div>
  );
}
