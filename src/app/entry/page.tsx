/** Entry page: timer + AIダミー評価で新規レポート作成 */
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createReport } from "@/lib/clientApi";
import { formatDuration, parseDurationInput } from "@/lib/format";

type TimerState = "idle" | "running" | "paused";

const fakeDiffSummaries = [
  "レビューコメントを反映し、バリデーションを抽象化。",
  "UIのマイクロコピーを整備し、空状態のCTAを追加。",
  "キャッシュの無効化パスを追加し、ログ粒度を細かくした。",
  "パフォーマンステストを1本追加し、タイムアウトを短縮。",
];

const fakeFeedbacks = [
  "着実に品質を上げています。テレメトリが整備されているので、次は成功指標を数字で追えると良いです。",
  "UIコピーが分かりやすくなりました。アクセシビリティのラベルも丁寧で好印象です。",
  "リファクタリングが小さく分割されており、レビューしやすい形です。ドキュメントの追記も検討しましょう。",
  "テストの強化が進んでいます。負荷試験と合わせてリリース条件を明文化するとさらに安心です。",
];

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function buildMockEvaluation(content: string, githubUrl: string, workDurationSec: number) {
  const aiScore = Math.min(100, Math.max(60, Math.round(65 + Math.random() * 30)));
  const changedFileCount = Math.max(2, Math.round(3 + Math.random() * 6));
  const diffSummary = pickRandom(fakeDiffSummaries);
  const aiFeedback = pickRandom(fakeFeedbacks);
  const aiShortComment =
    aiScore > 85 ? "完成度高め。軽い振り返りで締めましょう。" : "良い流れ。あと一歩の改善余地あり。";

  return {
    aiScore,
    changedFileCount,
    diffSummary,
    aiFeedback: `${aiFeedback}\n\nPR: ${githubUrl || "（URL未入力）"}\n所要時間: ${formatDuration(workDurationSec)}`,
    aiShortComment,
  };
}

export default function EntryPage() {
  const router = useRouter();
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [manualDuration, setManualDuration] = useState<number | null>(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState("");
  const [changedFileCount, setChangedFileCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // timer
  useEffect(() => {
    if (timerState !== "running") return;
    const id = window.setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerState]);

  const durationToSave = manualDuration ?? elapsed;
  const canSubmit = content.trim().length > 4 && durationToSave > 0 && !isEvaluating;

  const helperText = useMemo(() => {
    if (timerState === "running") return "測定中... 作業が終わったらStopを押してください";
    if (durationToSave === 0) return "最短でも数秒の記録を残しましょう";
    return "時間はあとから秒/HH:MMで上書きできます";
  }, [timerState, durationToSave]);

  const handleDurationInput = (value: string) => {
    const parsed = parseDurationInput(value);
    setManualDuration(parsed);
    if (parsed === null && value.trim()) {
      setError("時間は秒もしくは hh:mm(:ss) で入力してください");
    } else {
      setError(null);
    }
  };

  const handleRunEvaluation = async () => {
    if (!canSubmit) return;
    setIsEvaluating(true);
    setError(null);
    try {
      await new Promise((res) => setTimeout(res, 700));
      const evaluation = buildMockEvaluation(content, githubUrl, durationToSave);
      const report = await createReport({
        workDurationSec: durationToSave,
        githubUrl,
        content,
        diffSummary: evaluation.diffSummary,
        changedFileCount: changedFileCount ?? evaluation.changedFileCount,
        aiScore: evaluation.aiScore,
        aiFeedback: evaluation.aiFeedback + (notes ? `\nメモ: ${notes}` : ""),
        aiShortComment: evaluation.aiShortComment,
      });
      router.push(`/reports/${report.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "作成に失敗しました");
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-indigo-600">Entry</p>
          <h1 className="text-2xl font-semibold text-slate-900">日報を作成</h1>
          <p className="text-sm text-slate-600">
            タイマーで計測しつつ、PRリンクと一言日報を入力します。AI評価はダミー生成ですが保存と遷移は本番同等です。
          </p>
        </div>
        <Link href="/" className="text-sm font-semibold text-indigo-700 hover:underline">
          ← 一覧へ戻る
        </Link>
      </div>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-slate-500">作業時間</p>
                <p className="text-4xl font-bold text-slate-900">{formatDuration(durationToSave)}</p>
              </div>
              <div className="flex gap-2">
                <button
                  className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                  onClick={() => setTimerState((prev) => (prev === "running" ? "paused" : "running"))}
                >
                  {timerState === "running" ? "Stop" : timerState === "paused" ? "Resume" : "Start"}
                </button>
                <button
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-indigo-300"
                  onClick={() => {
                    setTimerState("idle");
                    setElapsed(0);
                    setManualDuration(null);
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500">{helperText}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm text-slate-700">
                秒もしくは hh:mm で上書き
                <input
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                  placeholder="例) 95 または 1:15:00"
                  onChange={(e) => handleDurationInput(e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-slate-700">
                変更ファイル数（任意）
                <input
                  type="number"
                  min={0}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                  placeholder="自動推定に任せる場合は空欄"
                  value={changedFileCount ?? ""}
                  onChange={(e) => setChangedFileCount(e.target.value ? Number(e.target.value) : null)}
                />
              </label>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
              GitHub PR URL
              <input
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/org/repo/pull/123"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
              一言日報
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="今日やったこと・決めたことを短く書く"
                rows={3}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
              メモ（AIフィードバックに含める）
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="レビュアーへの補足、実験結果など。空でもOK。"
                rows={2}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
              />
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-xs font-semibold text-indigo-600">AI評価（ダミー）</p>
            <h2 className="text-lg font-semibold text-slate-900">押した瞬間に生成して保存</h2>
            <p className="text-sm text-slate-600">
              PR URLと時間をもとに、AIスコアやdiffサマリをダミー生成してDetail画面へ遷移します。
            </p>
          </div>

          <button
            disabled={!canSubmit}
            onClick={handleRunEvaluation}
            className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {isEvaluating ? "AI評価中..." : "AI評価を実行して保存"}
          </button>
          <p className="text-xs text-slate-500">
            PR URLが空でも作成できます。保存後はDetailで確認できます。
          </p>

          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
            <div className="font-semibold text-slate-900">Tips</div>
            <ul className="mt-2 list-disc pl-4">
              <li>入力途中で戻るときは左上の戻るリンクで一覧へ。</li>
              <li>時間は秒単位で上書きできます（例: 5400）。</li>
              <li>変更ファイル数が分からない場合は空欄でOK。自動推定します。</li>
            </ul>
          </div>

          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
