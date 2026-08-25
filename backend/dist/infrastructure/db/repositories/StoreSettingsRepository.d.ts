import type { StoreSettings } from '../../../domain/entities/StoreSettings.js';
import type { IStoreSettingsRepository } from '../../../domain/repositories/IStoreSettingsRepository.js';
export declare class StoreSettingsRepository implements IStoreSettingsRepository {
    get(): Promise<StoreSettings | null>;
    upsert(data: Partial<StoreSettings>): Promise<StoreSettings>;
}
//# sourceMappingURL=StoreSettingsRepository.d.ts.map