export const ProviderEnum = {
  Google: 'Google',
  Line: 'Line',
} as const;
export type ProviderEnum = (typeof ProviderEnum)[keyof typeof ProviderEnum];
