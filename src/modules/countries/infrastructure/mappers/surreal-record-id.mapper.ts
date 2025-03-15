export class SurrealRecordIdMapper {
  static toRecordId(tableName: string, id: string) {
    return `${tableName}:${id}`;
  }

  static fromRecordId(recordId: string) {
    const [_, id] = recordId.split(':');

    return id;
  }
}
