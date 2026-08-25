import type { BusinessHour } from '../db/repositories/WebBusinessSettingsRepository.js';
export declare class GoogleBusinessService {
    syncHours(hours: BusinessHour[]): Promise<{
        configured: boolean;
        synced: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=GoogleBusinessService.d.ts.map