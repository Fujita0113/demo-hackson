/** Client component for Detail page interactions */
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { formatDisplayDate, formatDuration } from "@/lib/format";
import { DailyReport } from "@/types";

export function ReportDetailClient({ report }: { report: DailyReport }) {
  const router = useRouter();
  const [showFullFeedback, setShowFullFeedback] = useState(false);
  const [showDiff, setShowDiff] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-indigo-600">Detail</p>
          <h1 className="text-2xl font-semibold text-slate-900">AIスコア {report.aiScore} 点</h1>
          <p className="text-sm text-slate-600">
            {formatDisplayDate(report.createdAt)} ・ {formatDuration(report.workDurationSec)} ・{" "}
            {report.changedFileCount} files
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => alert("共有リンク生成はダミーです")}
            className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-indigo-300"
          >
            共有（ダミー）
          </button>
          <button
            onClick={() => alert("削除はダミーです")}
            className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:border-rose-300"
          >
            削除（ダミー）
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-500 p-4 text-white shadow">
          <p className="text-xs uppercase">AI Score</p>
          <p className="text-4xl font-bold leading-tight">{report.aiScore}</p>
          <p className="text-sm text-white/80">{report.aiShortComment}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">作業時間</p>
          <p className="text-2xl font-bold text-slate-900">{formatDuration(report.workDurationSec)}</p>
          <p className="text-sm text-slate-600">PR: {report.githubUrl || "未入力"}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">変更ファイル数</p>
          <p className="text-2xl font-bold text-slate-900">{report.changedFileCount}</p>
          <p className="text-sm text-slate-600">diff概要を下部で確認</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-900">一言日報</h2>
          <Link href="/" className="text-sm font-semibold text-indigo-700 hover:underline">
            ← 一覧へ
          </Link>
        </div>
        <p className="mt-2 rounded-xl bg-slate-50 p-3 text-slate-800">{report.content}</p>
        {report.githubUrl && (
          <a
            href={report.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-indigo-700 hover:underline"
          >
            PRをブラウザで開く →
          </a>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">AIフィードバック</h3>
          <button
            onClick={() => setShowFullFeedback((v) => !v)}
            className="text-sm font-semibold text-indigo-700 hover:underline"
          >
            {showFullFeedback ? "折りたたむ" : "全文を表示"}
          </button>
        </div>
        <p className="mt-3 whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm text-slate-800">
          {showFullFeedback || report.aiFeedback.length <= 140
            ? report.aiFeedback
            : `${report.aiFeedback.slice(0, 140)}...`}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">diff summary</h3>
          <button
            onClick={() => setShowDiff((v) => !v)}
            className="text-sm font-semibold text-indigo-700 hover:underline"
          >
            {showDiff ? "折りたたむ" : "展開"}
          </button>
        </div>
        {showDiff && <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-800">{report.diffSummary}</p>}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-sm text-slate-600">
          他のレポートへ戻って、足りない項目を洗い出してください。
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.refresh()}
            className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-indigo-300"
          >
            最新に更新
          </button>
          <Link
            href="/"
            className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
          >
            Homeへ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
