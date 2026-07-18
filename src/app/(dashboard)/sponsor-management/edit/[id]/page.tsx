import React from "react";
import EditSponsor from "../../_components/EditSponsor";

interface EditSponsorPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSponsorPage({
  params,
}: EditSponsorPageProps) {
  const { id } = await params;
  return <EditSponsor sponsorId={id} />;
}
