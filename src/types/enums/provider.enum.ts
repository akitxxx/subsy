export const ProviderEnum = {
  Google: 'Google',
} as const;
export type ProviderEnum = (typeof ProviderEnum)[keyof typeof ProviderEnum];
