export class StoreSettingsUseCases {
    settingsRepo;
    constructor(settingsRepo) {
        this.settingsRepo = settingsRepo;
    }
    async get() {
        return this.settingsRepo.get();
    }
    async update(data) {
        return this.settingsRepo.upsert(data);
    }
}
//# sourceMappingURL=StoreSettingsUseCases.js.map