import type { StoreSettings } from '../../domain/entities/StoreSettings.js';
import type { IStoreSettingsRepository } from '../../domain/repositories/IStoreSettingsRepository.js';
export declare class StoreSettingsUseCases {
    private readonly settingsRepo;
    constructor(settingsRepo: IStoreSettingsRepository);
    get(): Promise<StoreSettings | null>;
    update(data: Partial<Omit<StoreSettings, 'id' | 'updatedAt'>>): Promise<StoreSettings>;
}
//# sourceMappingURL=StoreSettingsUseCases.d.ts.map