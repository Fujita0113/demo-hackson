import { DailyReport } from "@/types";

type CreateReportInput = Omit<DailyReport, "id" | "createdAt">;

const globalForStore = globalThis as typeof globalThis & {
  reportStore?: ReportStore;
};

class ReportStore {
  private reports: DailyReport[];

  constructor(seed: DailyReport[]) {
    this.reports = seed;
  }

  list(): DailyReport[] {
    return [...this.reports].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  get(id: string): DailyReport | undefined {
    return this.reports.find((report) => report.id === id);
  }

  create(input: CreateReportInput): DailyReport {
    const report: DailyReport = {
      ...input,
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
      createdAt: new Date().toISOString(),
    };

    this.reports.unshift(report);
    return report;
  }
}

function buildSeedReports(): DailyReport[] {
  const now = new Date();
  const day = 24 * 60 * 60 * 1000;

  return [
    {
      id: "seed-1",
      createdAt: new Date(now.getTime() - day * 2).toISOString(),
      workDurationSec: 2 * 60 * 60 + 15 * 60,
      githubUrl: "https://github.com/example/repo/pull/120",
      content: "デバッグ中心の日。AI補助でクラッシュ原因を特定。",
      diffSummary: "セッション管理の例外処理を追加し、再接続時のリトライ間隔を調整。",
      changedFileCount: 7,
      aiScore: 82,
      aiFeedback:
        "再現性の低いバグを丁寧に潰せています。例外時のテレメトリがまだ薄いので、ロギング強化を検討するとさらに良いです。",
      aiShortComment: "安定性改善が着実。ログ周りをあと一歩。",
    },
    {
      id: "seed-2",
      createdAt: new Date(now.getTime() - day).toISOString(),
      workDurationSec: 60 * 60 + 40 * 60,
      githubUrl: "https://github.com/example/repo/pull/121",
      content: "検索UIを改善し、空状態メッセージを追加。",
      diffSummary: "検索バーのDebounce導入、空結果時のCTAを表示、軽微なスタイル調整。",
      changedFileCount: 5,
      aiScore: 76,
      aiFeedback:
        "UXの負荷を下げる良い変更です。アクセシビリティのラベル付けも行われており評価できます。パフォーマンス計測を追加するとさらに定量的に示せます。",
      aiShortComment: "UX改善が明確。計測の仕込みが次の一手。",
    },
    {
      id: "seed-3",
      createdAt: now.toISOString(),
      workDurationSec: 45 * 60,
      githubUrl: "https://github.com/example/repo/pull/122",
      content: "APIのレスポンス整形とキャッシュ設定を調整。",
      diffSummary: "ステータスコードの統一、SWRキャッシュ時間を30秒に延長、テストを2件追加。",
      changedFileCount: 9,
      aiScore: 88,
      aiFeedback:
        "APIの一貫性が高まりました。キャッシュ延長の影響範囲は限定的に見えますが、無効化パスも念のため用意すると安心です。",
      aiShortComment: "整合性アップ。キャッシュの逃げ道があると万全。",
    },
  ];
}

export function getReportStore(): ReportStore {
  if (!globalForStore.reportStore) {
    globalForStore.reportStore = new ReportStore(buildSeedReports());
  }

  return globalForStore.reportStore;
}
