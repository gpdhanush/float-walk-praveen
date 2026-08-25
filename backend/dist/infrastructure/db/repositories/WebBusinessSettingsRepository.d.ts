export interface StoreStatus {
    closed: boolean;
    reason: string;
    updated_at?: string;
}
export interface BusinessHour {
    id: number;
    day: string;
    is_closed: boolean;
    open_time: string | null;
    close_time: string | null;
    sort_order: number;
}
export declare class WebBusinessSettingsRepository {
    getStatus(): Promise<StoreStatus>;
    updateStatus(status: Pick<StoreStatus, 'closed' | 'reason'>): Promise<StoreStatus>;
    getHours(): Promise<BusinessHour[]>;
    updateHours(hours: Array<Pick<BusinessHour, 'day' | 'is_closed' | 'open_time' | 'close_time'>>): Promise<BusinessHour[]>;
}
//# sourceMappingURL=WebBusinessSettingsRepository.d.ts.map