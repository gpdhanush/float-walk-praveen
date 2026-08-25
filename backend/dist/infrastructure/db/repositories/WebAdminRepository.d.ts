export type WebResource = 'enquiries' | 'appointments' | 'testimonials' | 'gallery' | 'services';
type ResourceDefinition = {
    table: string;
    primaryKey: string;
    columns: string[];
    orderBy: string;
};
export declare const webResourceDefinitions: Record<WebResource, ResourceDefinition>;
export type WebAdminRecord = Record<string, unknown>;
export declare class WebAdminRepository {
    private definition;
    list(resource: WebResource, limit: number, offset: number): Promise<{
        rows: WebAdminRecord[];
        total: number;
    }>;
    getById(resource: WebResource, id: number): Promise<WebAdminRecord | null>;
    create(resource: WebResource, data: Record<string, unknown>): Promise<WebAdminRecord>;
    update(resource: WebResource, id: number, data: Record<string, unknown>): Promise<WebAdminRecord | null>;
    delete(resource: WebResource, id: number): Promise<boolean>;
}
export {};
//# sourceMappingURL=WebAdminRepository.d.ts.map