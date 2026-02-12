import type { StoreSettings } from '../../domain/entities/StoreSettings.js';
import type { IStoreSettingsRepository } from '../../domain/repositories/IStoreSettingsRepository.js';

export class StoreSettingsUseCases {
  constructor(private readonly settingsRepo: IStoreSettingsRepository) {}

  async get(): Promise<StoreSettings | null> {
    return this.settingsRepo.get();
  }

  async update(data: Partial<Omit<StoreSettings, 'id' | 'updatedAt'>>): Promise<StoreSettings> {
    return this.settingsRepo.upsert(data);
  }
}
