import type { ICodeSequenceRepository } from '../../../domain/repositories/ICodeSequenceRepository.js';
import { pool } from '../pool.js';

export class CodeSequenceRepository implements ICodeSequenceRepository {
  async getNextSequence(prefix: string): Promise<number> {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      
      // Ensure prefix exists
      await conn.execute('INSERT IGNORE INTO code_sequences (prefix, last_value) VALUES (?, 0)', [prefix]);

      // Legacy support: If it's a type prefix, ensure we are synced with existing records
      if (['INV', 'QUO', 'ADV'].includes(prefix)) {
        const [maxRows] = await conn.execute(
            `SELECT MAX(CAST(SUBSTRING_INDEX(code, '-', -1) AS UNSIGNED)) as maxVal 
             FROM invoices WHERE code LIKE ?`,
            [`${prefix}-%`]
        );
        const maxVal = (maxRows as any[])[0]?.maxVal || 0;
        await conn.execute(
            'UPDATE code_sequences SET last_value = GREATEST(last_value, ?) WHERE prefix = ?',
            [maxVal, prefix]
        );
      }
      
      await conn.execute('SELECT last_value FROM code_sequences WHERE prefix = ? FOR UPDATE', [prefix]);
      await conn.execute(
        'UPDATE code_sequences SET last_value = last_value + 1, updated_at = NOW(3) WHERE prefix = ?',
        [prefix]
      );
      const [rows] = await conn.execute(
        'SELECT last_value FROM code_sequences WHERE prefix = ?',
        [prefix]
      );
      const next = (rows as { last_value: number }[])[0]?.last_value ?? 1;
      await conn.commit();
      return next;
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  }
}
