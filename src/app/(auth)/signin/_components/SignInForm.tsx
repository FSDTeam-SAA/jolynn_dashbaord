"use client"; // Required for client-side interactions like form state

import React from "react";
import { Mail, KeyRound, EyeOff, Users, ChevronDown } from "lucide-react"; // Example icons
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

function SignInForm() {
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
        <form className="w-full space-y-6">
          {/* Email/Username Field */}
          <div className="space-y-2">
            <Label
              htmlFor="emailUsername"
              className="text-base font-semibold leading-[100%] text-[#4365D0]"
            >
              Email Address/Username
            </Label>
            <Input
              id="emailUsername"
              type="text"
              placeholder="Type your email or username"
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
                type="password"
                placeholder="********"
                className="pr-10 w-full rounded-[8px] h-[51px] border-[#DCE3EE] focus:ring-[#168CF8] focus:border-[#168CF8] shadow-[0px_0px_10px_0px_#00000026]"
              />
              {/* Optional: Add eye-toggle functionality here */}
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9EA7BC]"
                title="Toggle password visibility"
              >
                <EyeOff className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Remember Me and Forgot Password Container */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="rememberMe" className="border-[#A6B2C3]" />
              <Label
                htmlFor="rememberMe"
                className="text-base font-medium text-[#14151C] peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
              className="w-full h-[51px] bg-[#30386C] hover:bg-[#252C5C] text-white font-semibold py-3 text-base leading-[100%] rounded-md transition-colors cursor-pointer"
            >
              Sign in
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignInForm;
