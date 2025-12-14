import { NextResponse } from "next/server";

import { getReportStore } from "@/lib/mockStore";
import { DailyReport } from "@/types";

type CreateReportPayload = Omit<DailyReport, "id" | "createdAt">;

export async function GET() {
  const reports = getReportStore().list();
  return NextResponse.json({ data: reports });
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<CreateReportPayload>;

  if (
    typeof body.workDurationSec !== "number" ||
    typeof body.githubUrl !== "string" ||
    typeof body.content !== "string" ||
    typeof body.diffSummary !== "string" ||
    typeof body.changedFileCount !== "number" ||
    typeof body.aiScore !== "number" ||
    typeof body.aiFeedback !== "string" ||
    typeof body.aiShortComment !== "string"
  ) {
    return NextResponse.json(
      { error: "Invalid payload. Missing required fields." },
      { status: 400 },
    );
  }

  const report = getReportStore().create({
    workDurationSec: Math.max(0, body.workDurationSec),
    githubUrl: body.githubUrl,
    content: body.content,
    diffSummary: body.diffSummary,
    changedFileCount: body.changedFileCount,
    aiScore: Math.min(100, Math.max(0, Math.round(body.aiScore))),
    aiFeedback: body.aiFeedback,
    aiShortComment: body.aiShortComment,
  });

  return NextResponse.json({ data: report }, { status: 201 });
}
