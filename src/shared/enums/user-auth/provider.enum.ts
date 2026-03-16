export const ProviderEnum = {
  Clerk: 'Clerk',
  Line: 'Line',
} as const;
export type ProviderEnum = (typeof ProviderEnum)[keyof typeof ProviderEnum];
