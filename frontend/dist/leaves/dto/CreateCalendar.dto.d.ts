declare class BlockedPeriodDto {
    from: string;
    to: string;
    reason?: string;
}
declare class HolidayDto {
    name: string;
    date: string;
    description?: string;
}
export declare class CreateCalendarDto {
    year: number;
    holidays?: HolidayDto[];
    blockedPeriods?: BlockedPeriodDto[];
}
export {};
