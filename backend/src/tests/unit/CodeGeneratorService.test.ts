import { jest } from '@jest/globals';
import { CodeGeneratorService } from '../../application/services/CodeGeneratorService.js';
import type { ICodeSequenceRepository } from '../../domain/repositories/ICodeSequenceRepository.js';

describe('CodeGeneratorService', () => {
  const mockRepo: ICodeSequenceRepository = {
    getNextSequence: jest.fn().mockResolvedValue(1) as ICodeSequenceRepository['getNextSequence'],
  };

  let service: CodeGeneratorService;

  beforeEach(() => {
    jest.clearAllMocks();
    (mockRepo.getNextSequence as jest.Mock).mockResolvedValue(1);
    service = new CodeGeneratorService(mockRepo);
  });

  it('generates INV code with padded number', async () => {
    const code = await service.generate('INV');
    expect(code).toBe('INV0001');
    expect(mockRepo.getNextSequence).toHaveBeenCalledWith('INV');
  });

  it('generates EXP code', async () => {
    (mockRepo.getNextSequence as jest.Mock).mockResolvedValue(42);
    const code = await service.generate('EXP');
    expect(code).toBe('EXP0042');
  });

  it('generates MEA code', async () => {
    (mockRepo.getNextSequence as jest.Mock).mockResolvedValue(100);
    const code = await service.generate('MEA');
    expect(code).toBe('MEA0100');
  });

  it('generates STK code', async () => {
    const code = await service.generate('STK');
    expect(code).toBe('STK0001');
  });

  it('generates PUR code', async () => {
    const code = await service.generate('PUR');
    expect(code).toBe('PUR0001');
  });
});
