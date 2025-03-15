import { DatabaseErrorException } from "@/modules/shared/exceptions";
import { RecordId } from "surrealdb";

export class SurrealRecordIdMapper {
  static toRecordId(tableName: string, id: string) {
    return new RecordId(tableName, id);
  }

  static fromRecordId(recordId: any): string {
    if (typeof recordId === 'string') return recordId;

    if (typeof recordId === 'object' && recordId.id) {
      return recordId.id;
    }

    if (typeof recordId === 'object' && recordId.value) {
      return recordId.value;
    }

    throw new DatabaseErrorException('Invalid record id');
  }
}
