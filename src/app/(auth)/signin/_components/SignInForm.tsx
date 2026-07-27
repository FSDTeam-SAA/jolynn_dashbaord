"use client"; // Required for client-side interactions like form state

import React, { FormEvent, useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react"; // Example icons
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function SignInForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedSignInEmail");

    if (rememberedEmail) {
      setFormData((previous) => ({
        ...previous,
        email: rememberedEmail,
      }));
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      const res = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (!res || res.error) {
        throw new Error(res?.error || "Login failed");
      }

      if (rememberMe) {
        localStorage.setItem("rememberedSignInEmail", formData.email.trim());
      } else {
        localStorage.removeItem("rememberedSignInEmail");
      }

      toast.success("Login Successfully!");
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // The main page container with the overall gradient background
    <div className="min-h-screen w-full flex items-center justify-center bg-[linear-gradient(0deg,rgba(0,0,0,0.2),rgba(0,0,0,0.2)),linear-gradient(180deg,#292D73_0%,#91C7D9_50%,#CBE4E3_100%)]">
      {/* The white, centered card */}
      <div className="bg-white p-10 rounded-[16px] shadow-2xl w-full max-w-xl flex flex-col items-center">
        {/* The Quote Icon */}
        <div className="mb-6 w-[90px] h-[90px] rounded-full flex items-center justify-center">
          <Image
            src="/images/logo_images.png"
            alt="Quote Icon"
            width={300}
            height={300}
          />
        </div>

        {/* Heading text */}
        <h1 className="text-3xl font-bold text-[#292D73] mb-10">
          Log in to your account
        </h1>

        {/* The main form */}
        <form className="w-full space-y-6" onSubmit={handleSubmit}>
          {/* Email/Username Field */}
          <div className="space-y-2">
            <Label
              htmlFor="emailUsername"
              className="text-base font-semibold leading-[100%] text-[#4365D0]"
            >
              Email
            </Label>
            <Input
              id="emailUsername"
              type="text"
              placeholder="Type your email or username"
              value={formData.email}
              onChange={(e) =>
                setFormData((previous) => ({
                  ...previous,
                  email: e.target.value,
                }))
              }
              required
              autoComplete="email"
              className="w-full rounded-[8px] h-[51px] border-[#DCE3EE] focus:ring-[#168CF8] focus:border-[#168CF8] shadow-[0px_0px_10px_0px_#00000026]"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-base font-semibold leading-[100%] text-[#4365D0]"
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData((previous) => ({
                    ...previous,
                    password: e.target.value,
                  }))
                }
                required
                autoComplete="current-password"
                className="pr-10 w-full rounded-[8px] h-[51px] border-[#DCE3EE] focus:ring-[#168CF8] focus:border-[#168CF8] shadow-[0px_0px_10px_0px_#00000026]"
              />
              {!formData.password && (
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 pt-[5px] leading-none text-muted-foreground">
                  ********
                </span>
              )}
              {/* Optional: Add eye-toggle functionality here */}
              <button
                type="button"
                onClick={() => setShowPassword((previous) => !previous)}
                className="absolute inset-y-0 cursor-pointer right-0 pr-3 flex items-center text-[#9EA7BC]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <Eye className="h-5 w-5" />
                ) : (
                  <EyeOff className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me and Forgot Password Container */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => {
                  const shouldRemember = checked === true;
                  setRememberMe(shouldRemember);

                  if (!shouldRemember) {
                    localStorage.removeItem("rememberedSignInEmail");
                  }
                }}
                className="border-[#A6B2C3] cursor-pointer"
              />
              <Label
                htmlFor="rememberMe"
                className="text-base cursor-pointer font-medium text-[#14151C] peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me
              </Label>
            </div>
            <Link
              href="/forgot-password"
              className="text-base text-[#14151C] hover:text-[#168CF8] transition-colors"
            >
              Forgot password?
            </Link> 
          </div>

          {/* Sign In Button */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-[51px] bg-[#30386C] hover:bg-[#252C5C] text-white font-semibold py-3 text-base leading-[100%] rounded-md transition-colors cursor-pointer"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignInForm;
