export interface TableInfo {
  events: Record<string, unknown>;
  fields: Record<string, string>;
  indexes: Record<string, unknown>;
  lives: Record<string, unknown>;
  tables: Record<string, unknown>;
}
