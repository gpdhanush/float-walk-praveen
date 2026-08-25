const PREFIX_MAP = {
    INV: 'INV',
    EXP: 'EXP',
    MEA: 'MEA',
    STK: 'STK',
    PUR: 'PUR',
    QUO: 'QUO',
    ADV: 'ADV',
};
export class CodeGeneratorService {
    codeSequenceRepo;
    constructor(codeSequenceRepo) {
        this.codeSequenceRepo = codeSequenceRepo;
    }
    async generate(prefix) {
        const p = PREFIX_MAP[prefix] ?? prefix;
        const next = await this.codeSequenceRepo.getNextSequence(p);
        return `${p}-${String(next).padStart(3, '0')}`;
    }
}
//# sourceMappingURL=CodeGeneratorService.js.map