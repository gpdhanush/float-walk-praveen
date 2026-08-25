export class AnalyticsUseCases {
    analyticsService;
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    async recordPageView(req, visitorIdentifier) {
        return this.analyticsService.processPageView(req, visitorIdentifier);
    }
    async getPublicCount() {
        return this.analyticsService.getPublicAnalytics();
    }
    async getAdminReport(fromDate, toDate) {
        return this.analyticsService.getAdminAnalytics(fromDate, toDate);
    }
}
//# sourceMappingURL=AnalyticsUseCases.js.map