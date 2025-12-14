"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import { fetchReports } from "@/lib/clientApi";
import { formatDisplayDate, formatDuration } from "@/lib/format";
import { DailyReport } from "@/types";

type SortKey = "newest" | "score";

function Tag({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
      {label}
    </span>
  );
}

function LoadingCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex animate-pulse flex-col gap-3">
        <div className="h-4 w-24 rounded bg-slate-200" />
        <div className="h-5 w-64 rounded bg-slate-200" />
        <div className="flex gap-2">
          <div className="h-6 w-20 rounded-full bg-slate-200" />
          <div className="h-6 w-16 rounded-full bg-slate-200" />
          <div className="h-6 w-28 rounded-full bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

function WeeklyEvaluation() {
  const valueToGrade: Record<number, string> = {
    0: "D",
    1: "D+",
    2: "C-",
    3: "C",
    4: "C+",
    5: "B-",
    6: "B",
    7: "B+",
    8: "A-",
    9: "A+",
  };

  // 画像のデータに基づく週間評価データ
  const weeklyData = [
    { date: "12/7", grade: "C+", value: 4 },
    { date: "12/8", grade: "B+", value: 7 },
    { date: "12/9", grade: "B-", value: 5 },
    { date: "12/10", grade: "C", value: 3 },
    { date: "12/11", grade: "B+", value: 7 },
    { date: "12/12", grade: "A-", value: 8 },
    { date: "12/13", grade: "A+", value: 9 },
  ];

  const totalStudyHours = 32;
  const averageGrade = "B+";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">この1週間の総合評価</h2>
      </div>

      <div className="mb-6 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={weeklyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              style={{ fontSize: "12px" }}
              tick={{ fill: "#64748b" }}
            />
            <YAxis
              domain={[0, 9]}
              stroke="#64748b"
              style={{ fontSize: "12px" }}
              tick={{ fill: "#64748b" }}
              tickFormatter={(value) => valueToGrade[value] || ""}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#14b8a6"
              strokeWidth={2}
              dot={{ fill: "#14b8a6", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg bg-slate-50 p-4">
          <h3 className="text-sm font-medium text-slate-600">総勉強時間</h3>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{totalStudyHours}時間</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-4">
          <h3 className="text-sm font-medium text-slate-600">平均評価</h3>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{averageGrade}</p>
        </div>
      </div>
    </section>
  );
}

function ReportCard({ report }: { report: DailyReport }) {
  return (
    <Link
      href={`/reports/${report.id}`}
      className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs font-medium text-slate-500">
          {formatDisplayDate(report.createdAt)}
        </div>
        <span className="rounded-3xl bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          AI {report.aiScore} 点
        </span>
      </div>
      <div className="mt-2 text-lg font-semibold text-slate-900">{report.content}</div>
      <div className="mt-1 text-sm text-slate-600">{report.aiShortComment}</div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
        <span className="rounded-full bg-slate-100 px-2 py-1">
          時間 {formatDuration(report.workDurationSec)}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-1">
          変更 {report.changedFileCount} files
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-1">
          <span className="max-w-[200px] truncate inline-block align-middle">
            AI一言: {report.aiShortComment}
          </span>
        </span>
      </div>
      <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
        {report.diffSummary}
      </p>
      <div className="mt-3 flex items-center justify-between text-sm text-slate-700">
        <span className="font-semibold">詳細を見る</span>
        <span className="transition group-hover:translate-x-1">→</span>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("newest");

  useEffect(() => {
    fetchReports()
      .then(setReports)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (sortKey === "score") {
      return [...reports].sort((a, b) => b.aiScore - a.aiScore);
    }

    return [...reports].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [reports, sortKey]);

  const totalReports = reports.length;
  const averageScore = reports.length
    ? Math.round(reports.reduce((sum, r) => sum + r.aiScore, 0) / reports.length)
    : 0;
  const recentReports = reports.slice(0, 5);

  return (
    <div className="flex min-h-screen">
      {/* サイドバー */}
      <aside className="w-64 border-r border-slate-200 bg-white p-6">
        <nav className="space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            ホーム
          </Link>
          <Link
            href="/entry"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            日報を作成
          </Link>
        </nav>

        <div className="mt-8 rounded-lg bg-slate-50 p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            統計
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-600">総日報数</p>
              <p className="text-lg font-semibold text-slate-900">{totalReports}件</p>
            </div>
            <div>
              <p className="text-xs text-slate-600">平均スコア</p>
              <p className="text-lg font-semibold text-slate-900">{averageScore}点</p>
            </div>
          </div>
        </div>

        {recentReports.length > 0 && (
          <div className="mt-8">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              最近の日報
            </h3>
            <div className="space-y-2">
              {recentReports.map((report) => (
                <Link
                  key={report.id}
                  href={`/reports/${report.id}`}
                  className="block rounded-lg px-3 py-2 text-xs text-slate-600 hover:bg-slate-50"
                >
                  <div className="truncate font-medium text-slate-900">{report.content}</div>
                  <div className="mt-1 text-slate-500">{formatDisplayDate(report.createdAt)}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </aside>

      <main className="flex-1">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
          <header className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-slate-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Loggit</h1>
                <p className="mt-1 text-sm text-slate-500">開発日報を記録・管理</p>
              </div>
            </div>
          </header>

          <WeeklyEvaluation />

      <section className="flex flex-col gap-3 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-900">レポート一覧</h2>
            <Tag label="AI一言" />
            <Tag label="作業時間" />
          </div>
          <Link
            href="/entry"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow transition"
            style={{
              backgroundColor: "#3DB8A8",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#2FA896";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#3DB8A8";
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            新規日報
          </Link>
        </div>
        <div className="flex items-center justify-end gap-3 rounded-xl bg-slate-50 p-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
              />
            </svg>
            <span>並び替え</span>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <option value="newest">最新</option>
              <option value="score">AIスコア順</option>
            </select>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <LoadingCard key={i} />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-6 md:flex-row md:items-center">
            <div>
              <p className="text-base font-semibold text-slate-900">まだレポートがありません</p>
              <p className="text-sm text-slate-600">
                今日の成果を短くまとめて、AIのダミー評価を試してみましょう。
              </p>
            </div>
            <Link
              href="/entry"
              className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
            >
              はじめる
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {filtered.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      </section>
        </div>
      </main>
    </div>
  );
}
