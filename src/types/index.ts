export interface DailyReport {
  id: string;
  createdAt: string; // ISO
  workDurationSec: number;
  githubUrl: string;
  content: string;

  diffSummary: string;
  changedFileCount: number;

  aiScore: number;
  aiFeedback: string;
  aiShortComment: string;
}
