import type { Subscription } from '@/domain/subscription/subscription.viewModel';
import { SubscriptionCycleEnum } from '@/enums/subscription/subscriptionCycle.enum';
import { SubscriptionStatusEnum } from '@/enums/subscription/subscriptionStatus.enum';
import { useState } from 'react';

export const useSubscriptionList = (props: {
  subscriptions: Subscription[];
  onCreate: (subscription: Subscription) => void;
  onUpdate: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModal, setIsEditModal] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleOpenModal = ({ isEdit, subscription }: { isEdit: boolean; subscription?: Subscription }) => {
    setCurrentSubscription(
      subscription || {
        id: crypto.randomUUID(),
        userId: '',
        name: '',
        status: SubscriptionStatusEnum.Active,
        price: '0',
        cycle: SubscriptionCycleEnum.OneMonth,
        startedAt: new Date(),
        cancelledAt: null,
        expiredAt: new Date(),
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    );
    setIsEditModal(isEdit);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentSubscription(null);
  };

  const handleCreateSubscription = (subscription: Subscription) => {
    props.onCreate(subscription);
    handleCloseModal();
  };

  const handleUpdateSubscription = (subscription: Subscription) => {
    props.onUpdate(subscription);
    handleCloseModal();
  };

  const handleDeleteSubscription = (id: string) => {
    props.onDelete(id);
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
