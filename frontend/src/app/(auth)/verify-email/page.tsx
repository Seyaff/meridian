"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { useVerify } from "@/hooks/auth/useVerify";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const { mutate, isPending, isError, isSuccess } = useVerify();
  const { user } = useAuth();

  useEffect(() => {
    if (!token) return;

    mutate(
      {token},
      {
        onSuccess: () => {
          router.push("/login");
        },
        onError : (error) => {
            console.log(error)
        }
      }
    );
  }, [token, user, router]);

  if (!token) {
    return <div>No token provided</div>;
  }

  return (
    <main className="flex items-center justify-center min-h-screen">
      {isPending && <p>Verifying your email...</p>}

      {isError && <p className="text-red-500">Verification failed</p>}

      {isSuccess && <p className="text-green-500">Email verified!</p>}
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}