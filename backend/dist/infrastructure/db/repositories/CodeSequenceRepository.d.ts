import type { ICodeSequenceRepository } from '../../../domain/repositories/ICodeSequenceRepository.js';
export declare class CodeSequenceRepository implements ICodeSequenceRepository {
    getNextSequence(prefix: string): Promise<number>;
}
//# sourceMappingURL=CodeSequenceRepository.d.ts.map