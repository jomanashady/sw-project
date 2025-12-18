export declare class UpdateLeaveRequestDto {
    leaveTypeId?: string;
    dates?: {
        from: Date;
        to: Date;
    };
    durationDays?: number;
    justification?: string;
    attachmentId?: string;
    approvalFlow?: {
        role: string;
        status: string;
        decidedBy?: string;
        decidedAt?: Date;
    }[];
}
