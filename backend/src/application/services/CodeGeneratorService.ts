import type { ICodeSequenceRepository } from '../../domain/repositories/ICodeSequenceRepository.js';

const PREFIX_MAP: Record<string, string> = {
  INV: 'INV',
  EXP: 'EXP',
  MEA: 'MEA',
  STK: 'STK',
  PUR: 'PUR',
  QUO: 'QUO',
  ADV: 'ADV',
};

export class CodeGeneratorService {
  constructor(private readonly codeSequenceRepo: ICodeSequenceRepository) {}

  async generate(prefix: keyof typeof PREFIX_MAP): Promise<string> {
    const p = PREFIX_MAP[prefix] ?? prefix;
    const next = await this.codeSequenceRepo.getNextSequence(p);
    return `${p}-${String(next).padStart(3, '0')}`;
  }
}
