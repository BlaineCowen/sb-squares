import { SessionProvider } from "next-auth/react";
import "../styles/globals.css";
import { useRouter } from "next/router";
import { useEffect } from "react";
import ProtectedLayout from "../components/ProtectedLayout";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  const router = useRouter();

  return (
    <SessionProvider session={session} refetchInterval={5 * 60}>
      {Component.requiresAuth ? (
        <ProtectedLayout>
          <Component {...pageProps} />
        </ProtectedLayout>
      ) : (
        <Component {...pageProps} />
      )}
    </SessionProvider>
  );
}
