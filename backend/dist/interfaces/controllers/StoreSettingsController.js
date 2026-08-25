import { storeSettingsUseCases } from '../../container.js';
export async function getSettings(_req, res, next) {
    try {
        const settings = await storeSettingsUseCases.get();
        res.json({ success: true, data: settings ?? {} });
    }
    catch (e) {
        next(e);
    }
}
export async function updateSettings(req, res, next) {
    try {
        const settings = await storeSettingsUseCases.update(req.body);
        res.json({ success: true, data: settings });
    }
    catch (e) {
        next(e);
    }
}
//# sourceMappingURL=StoreSettingsController.js.map