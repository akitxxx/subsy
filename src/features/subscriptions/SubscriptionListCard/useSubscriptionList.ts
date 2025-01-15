import type { Subscription } from '@/types/domains/subscription';
import { useState } from 'react';

export const useSubscriptionList = (props: {
  subscriptions: Subscription[];
  onSave: (subscription: Subscription) => void;
  onDelete: (id: number) => void;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSubscription, setCurrentSubscription] =
    useState<Subscription | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleOpenModal = (subscription?: Subscription) => {
    setCurrentSubscription(
      subscription || {
        id: Date.now(),
        name: '',
        amount: 0,
        cycle: '',
        nextBillingDate: '',
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

  const handleDelete = (id: number) => {
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
