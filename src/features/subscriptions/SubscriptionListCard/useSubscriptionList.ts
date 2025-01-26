import type { Subscription } from '@/types/domains/subscription';
import { useState } from 'react';

export const useSubscriptionList = (props: {
  subscriptions: Subscription[];
  onSave: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSubscription, setCurrentSubscription] =
    useState<Subscription | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleOpenModal = (subscription?: Subscription) => {
    setCurrentSubscription(
      subscription || {
        id: crypto.randomUUID(),
        name: '',
        price: '0',
        cycle: '',
        startedAt: new Date().toISOString(),
        nextPaymentAt: new Date().toISOString(),
        description: null,
        status: 'active',
        userId: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
    );
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentSubscription(null);
  };

  const handleSaveSubscription = (subscription: Subscription) => {
    props.onSave(subscription);
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    props.onDelete(id);
    setIsDeleteDialogOpen(false);
  };

  return {
    isModalOpen,
    currentSubscription,
    isDeleteDialogOpen,
    handleOpenModal,
    handleCloseModal,
    handleSaveSubscription,
    handleDelete,
    setIsDeleteDialogOpen,
    setCurrentSubscription,
  };
};
