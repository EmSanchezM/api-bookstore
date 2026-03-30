import { type InferInput, object, picklist } from 'valibot';

export const AssignRoleSchema = object({
  role: picklist(
    ['admin', 'editor', 'user'],
    'El rol debe ser admin, editor o user',
  ),
});

export type AssignRoleDto = InferInput<typeof AssignRoleSchema>;
