import { notFound } from "next/navigation";

import { getReportStore } from "@/lib/mockStore";

import { ReportDetailClient } from "./ReportDetailClient";

type Params = { params: Promise<{ id: string }> };

export default async function ReportDetailPage({ params }: Params) {
  const resolvedParams = await params;
  const report = getReportStore().get(resolvedParams.id);

  if (!report) {
    return notFound();
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
      <ReportDetailClient report={report} />
    </main>
  );
}
