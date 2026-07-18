import React from "react";
import VerifyEmailForm from "./_components/VerifyEmailForm";

async function Page({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email = "" } = await searchParams;

  return (
    <div>
      <VerifyEmailForm email={email} />
    </div>
  );
}

export default Page;
