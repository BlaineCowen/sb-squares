import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";

export default function SignOut() {
  const router = useRouter();

  useEffect(() => {
    const performSignOut = async () => {
      await signOut({
        redirect: false,
        callbackUrl: "/",
      });
      router.push("/");
    };

    performSignOut();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Signing you out...</h1>
        <p className="text-gray-600">
          Please wait while we secure your session
        </p>
      </div>
    </div>
  );
}
