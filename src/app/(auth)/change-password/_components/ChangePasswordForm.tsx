"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EyeOff } from "lucide-react";
import Image from "next/image";

function ChangePasswordForm() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[linear-gradient(0deg,rgba(0,0,0,0.2),rgba(0,0,0,0.2)),linear-gradient(180deg,#292D73_0%,#91C7D9_50%,#CBE4E3_100%)]">
      <div className="bg-white p-10 rounded-[16px] shadow-2xl w-full max-w-xl flex flex-col items-center">
        {/* Logo */}
        <div className="mb-6 w-[90px] h-[90px] relative">
          <Image
            src="/images/logo_images.png"
            alt="Logo"
            width={90}
            height={90}
            className="object-contain"
          />
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-[#232B5C] mb-10 text-center">
          Change Password
        </h1>

        {/* Form */}
        <form className="w-full space-y-6">
          {/* Create New Password */}
          <div className="space-y-2">
            <Label
              htmlFor="newPassword"
              className="text-base font-semibold leading-[100%] text-[#4365D0]"
            >
              Create New Password
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type="password"
                placeholder="********"
                className="pr-10 w-full rounded-[8px] h-[51px] border-[#DCE3EE] focus:ring-[#168CF8] focus:border-[#168CF8] shadow-[0px_0px_10px_0px_#00000026]"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9EA7BC]"
              >
                <EyeOff className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-base font-semibold leading-[100%] text-[#4365D0]"
            >
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type="password"
                placeholder="********"
                className="pr-10 w-full rounded-[8px] h-[51px] border-[#DCE3EE] focus:ring-[#168CF8] focus:border-[#168CF8] shadow-[0px_0px_10px_0px_#00000026]"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9EA7BC]"
              >
                <EyeOff className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full h-[51px] bg-[#30386C] hover:bg-[#252C5C] text-white font-semibold text-base leading-[100%] rounded-md transition-colors cursor-pointer"
            >
              Change Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordForm;