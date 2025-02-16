import type { SubscriptionCreateModel, SubscriptionViewModel } from '@/domain/subscription/subscription.viewModel';
import { useState } from 'react';

export const useSubscriptionList = (props: {
  subscriptions: SubscriptionViewModel[];
  onCreate: (subscription: SubscriptionCreateModel) => void;
  onUpdate: (subscription: SubscriptionViewModel) => void;
  onDelete: (subscription: SubscriptionViewModel) => void;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModal, setIsEditModal] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionViewModel | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleOpenModal = (subscription?: SubscriptionViewModel) => {
    if (!subscription) {
      setCurrentSubscription(null);
      setIsEditModal(false);
      setIsModalOpen(true);
      return;
    }
    setCurrentSubscription(subscription);
    setIsEditModal(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentSubscription(null);
  };

  const handleCreateSubscription = (subscription: SubscriptionCreateModel) => {
    props.onCreate(subscription);
    handleCloseModal();
  };

  const handleUpdateSubscription = (subscription: SubscriptionViewModel) => {
    props.onUpdate(subscription);
    handleCloseModal();
  };

  const handleDeleteSubscription = (subscription: SubscriptionViewModel) => {
    props.onDelete(subscription);
    setIsDeleteDialogOpen(false);
  };

  return {
    isModalOpen,
    isEditModal,
    currentSubscription,
    isDeleteDialogOpen,
    handleOpenModal,
    handleCloseModal,
    setIsDeleteDialogOpen,
    setCurrentSubscription,
    handleCreateSubscription,
    handleUpdateSubscription,
    handleDeleteSubscription,
  };
};
