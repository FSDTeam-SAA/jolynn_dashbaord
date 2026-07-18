import React from "react";
import ChangePasswordForm from "./_components/ChangePasswordForm";

async function Page({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email = "" } = await searchParams;

  return (
    <div>
      <ChangePasswordForm email={email} />
    </div>
  );
}

export default Page;
