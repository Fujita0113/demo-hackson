import { DailyReport } from "@/types";

const headers = { "Content-Type": "application/json" };

export async function fetchReports(): Promise<DailyReport[]> {
  const res = await fetch("/api/reports", { cache: "no-store" });
  if (!res.ok) throw new Error("一覧の取得に失敗しました");
  const { data } = (await res.json()) as { data: DailyReport[] };
  return data;
}

export async function fetchReport(id: string): Promise<DailyReport> {
  const res = await fetch(`/api/reports/${id}`, { cache: "no-store" });
  if (res.status === 404) throw new Error("レポートが見つかりませんでした");
  if (!res.ok) throw new Error("詳細の取得に失敗しました");
  const { data } = (await res.json()) as { data: DailyReport };
  return data;
}

export type CreateReportInput = Omit<DailyReport, "id" | "createdAt">;

export async function createReport(payload: CreateReportInput): Promise<DailyReport> {
  const res = await fetch("/api/reports", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error ?? "作成に失敗しました");
  }

  const { data } = (await res.json()) as { data: DailyReport };
  return data;
}
