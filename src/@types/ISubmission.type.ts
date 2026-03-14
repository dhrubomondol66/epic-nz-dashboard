export type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Submission {
    _id: string;
    userId?: {
        _id?: string;
        fullName?: string;
        full_name?: string;
        email?: string;
    };
    name: string;
    description: string;
    imageUrl: string | string[];
    author?: string;
    email?: string;
    location?: string;
    address?: string;
    coordinates?: string;
    status: SubmissionStatus;
    adminNotes?: string;
    category?: string;
    createdAt: string;
    updatedAt: string;
}
