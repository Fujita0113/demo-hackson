"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { fetchReports } from "@/lib/clientApi";
import { formatDisplayDate, formatDuration } from "@/lib/format";
import { DailyReport } from "@/types";

type SortKey = "newest" | "score";

function Tag({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
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
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
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
      <div className="mt-3 flex items-center justify-between text-sm text-indigo-700">
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
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchReports()
      .then(setReports)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const hasTodayReport = reports.some((r) => r.createdAt.startsWith(today));

  const filtered = useMemo(() => {
    const lower = query.toLowerCase();
    const base = reports.filter(
      (r) =>
        r.content.toLowerCase().includes(lower) ||
        r.githubUrl.toLowerCase().includes(lower) ||
        r.diffSummary.toLowerCase().includes(lower),
    );

    if (sortKey === "score") {
      return [...base].sort((a, b) => b.aiScore - a.aiScore);
    }

    return [...base].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [reports, query, sortKey]);

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col justify-between gap-6 rounded-3xl bg-gradient-to-r from-indigo-600 to-sky-500 p-8 text-white shadow-lg lg:flex-row lg:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
              Developer Studyplus
            </div>
            <Tag label="MVP" />
          </div>
          <h1 className="mt-3 text-3xl font-semibold">日報の動くたたき台</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/90">
            手元で触りながら不足項目を洗い出すためのUIプロトです。AI評価はダミー生成ですが、画面遷移と入力体験は本番同等にしています。
          </p>
          {!hasTodayReport && (
            <div className="mt-3 rounded-xl bg-white/15 px-4 py-3 text-sm font-medium text-white">
              今日はまだレポートがありません。作業が終わったらサクッと記録しましょう！
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3 text-right">
          <Link
            href="/entry"
            className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            ＋ 作成 / 計測を始める
          </Link>
          <div className="text-sm text-white/90">
            合計 {reports.length} 件 / 平均スコア{" "}
            {reports.length
              ? Math.round(reports.reduce((sum, r) => sum + r.aiScore, 0) / reports.length)
              : 0}
            点
          </div>
        </div>
      </header>

      <section className="flex flex-col gap-3 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-900">レポート一覧</h2>
          <Tag label="AI一言" />
          <Tag label="作業時間" />
        </div>
        <div className="flex flex-col gap-3 rounded-xl bg-slate-50 p-3 md:flex-row md:items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="PR URL / メモ / diff のキーワードで絞り込み"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
          />
          <div className="flex items-center gap-2 text-sm text-slate-600">
            並び替え
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
            >
              <option value="newest">新着</option>
              <option value="score">AIスコア順</option>
            </select>
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filtered.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      </section>
    </main>
  );
}
