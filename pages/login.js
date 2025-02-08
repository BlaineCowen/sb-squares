import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import MainLayout from "@/components/MainLayout";
import { FaGoogle } from "react-icons/fa";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function Login() {
  const router = useRouter();
  const callbackUrl = router.query.callbackUrl || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = () => {
    signIn("google", { callbackUrl });
  };

  // const handleTestLogin = async () => {
  //   try {
  //     const result = await signIn("test-account", {
  //       email: "test@example.com",
  //       redirect: false,
  //       callbackUrl,
  //     });

  //     if (result?.error) {
  //       console.error("Login error:", result.error);
  //       alert("Login failed: " + result.error);
  //     } else if (result?.url) {
  //       router.push(result.url);
  //     }
  //   } catch (error) {
  //     console.error("Login error:", error);
  //     alert("Login failed. Please try again.");
  //   }
  // };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        console.error("Login error:", result.error);
        alert("Login failed: " + result.error);
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <Card className="w-full bg-slate-50 backdrop-blur-sm shadow-xl relative rounded-t-md rounded-b-lg max-w-md mx-auto">
        <motion.div
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-t-lg"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              variant="default"
              type="submit"
              className="w-full bg-black text-white"
            >
              Sign In
            </Button>
          </form>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-50 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full bg-black text-white"
            onClick={handleSignIn}
          >
            <FaGoogle className="mr-2 " />
            Sign in with Google
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" onClick={() => router.push("/register")}>
            Don't have an account? Register
          </Button>
        </CardFooter>
      </Card>
    </MainLayout>
  );
}
