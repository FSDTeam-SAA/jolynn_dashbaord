"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import Image from "next/image";

function VerifyEmailForm() {
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
          Verify Email
        </h1>

        {/* Form */}
        <form className="w-full space-y-6">
          {/* OTP Inputs Grid */}
          <div className="grid grid-cols-6 gap-3 justify-center">
            {[...Array(6)].map((_, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                defaultValue="1"
                className="w-full h-[51px] text-center text-lg font-semibold border border-[#DCE3EE] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#168CF8] shadow-[0px_0px_10px_0px_#00000026]"
              />
            ))}
          </div>

          {/* Timer & Resend Info */}
          <div className="flex items-center justify-between text-sm font-medium mt-2">
            <div className="flex items-center space-x-1.5 text-[#4365D0]">
              <Clock className="h-4 w-4" />
              <span>00:59</span>
            </div>
            <p className="text-[#14151C]">
              Didn&apos;t get a code?{" "}
              <a href="#" className="text-[#4365D0] font-semibold underline hover:text-[#168CF8]">
                Resend
              </a>
            </p>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full h-[51px] bg-[#30386C] hover:bg-[#252C5C] text-white font-semibold text-base leading-[100%] rounded-md transition-colors cursor-pointer"
            >
              Verify Now
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VerifyEmailForm;