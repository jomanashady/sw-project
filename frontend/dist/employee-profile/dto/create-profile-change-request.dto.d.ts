export declare class CreateProfileChangeRequestDto {
    requestDescription: string;
    reason?: string;
}
export declare class ProcessProfileChangeRequestDto {
    status: 'APPROVED' | 'REJECTED' | 'CANCELED';
    reason?: string;
}
