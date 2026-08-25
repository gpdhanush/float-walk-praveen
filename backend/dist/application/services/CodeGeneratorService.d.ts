import type { ICodeSequenceRepository } from '../../domain/repositories/ICodeSequenceRepository.js';
declare const PREFIX_MAP: Record<string, string>;
export declare class CodeGeneratorService {
    private readonly codeSequenceRepo;
    constructor(codeSequenceRepo: ICodeSequenceRepository);
    generate(prefix: keyof typeof PREFIX_MAP): Promise<string>;
}
export {};
//# sourceMappingURL=CodeGeneratorService.d.ts.map