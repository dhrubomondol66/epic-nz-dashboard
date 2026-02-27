type SubmissionStatus = "pending" | "approved" | "rejected";
export interface Submission {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  author: string;
  email: string;
  date: string;
  status: SubmissionStatus;
  adminNotes?: string;
}