import React from "react";
import EditFaq from "../../_components/EditFaq";

interface EditFaqPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditFaqPage({ params }: EditFaqPageProps) {
  const { id } = await params;
  return <EditFaq faqId={id} />;
}
