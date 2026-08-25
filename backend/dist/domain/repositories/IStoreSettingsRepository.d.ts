import type { StoreSettings } from '../entities/StoreSettings.js';
export interface IStoreSettingsRepository {
    get(): Promise<StoreSettings | null>;
    upsert(data: Partial<StoreSettings>): Promise<StoreSettings>;
}
//# sourceMappingURL=IStoreSettingsRepository.d.ts.map