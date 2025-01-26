export type Subscription = {
  id: string;
  name: string;
  price: string;
  cycle: string;
  startedAt: string;
  nextPaymentAt: string;
  description: string | null;
  status: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};
