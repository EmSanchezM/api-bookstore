import { RecordId } from 'surrealdb';

import { DatabaseErrorException } from '@/modules/shared/exceptions';

export function toRecordId(tableName: string, id: string) {
  return new RecordId(tableName, id);
}

export function fromRecordId(
  recordId: string | RecordId | { id: string },
): string {
  if (typeof recordId === 'string') return recordId;

  if (recordId instanceof RecordId) {
    return recordId.id.toString();
  }

  if (typeof recordId === 'object' && recordId?.id) {
    return recordId.id;
  }

  throw new DatabaseErrorException('Invalid record id');
}
