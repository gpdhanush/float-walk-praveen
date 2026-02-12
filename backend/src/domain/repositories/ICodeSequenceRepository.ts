export interface ICodeSequenceRepository {
  getNextSequence(prefix: string): Promise<number>;
}
