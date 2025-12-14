import { NextResponse } from "next/server";

import { getReportStore } from "@/lib/mockStore";

type Params = { params: { id: string } };

export async function GET(_: Request, { params }: Params) {
  const report = getReportStore().get(params.id);

  if (!report) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data: report });
}
