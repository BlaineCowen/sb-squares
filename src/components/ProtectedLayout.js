import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function ProtectedLayout({ children }) {
  const { status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <LoadingSpinner />;
  }

  if (status === "unauthenticated") {
    router.push({
      pathname: "/login",
      query: { callbackUrl: router.asPath },
    });
    return null;
  }

  return <>{children}</>;
}
