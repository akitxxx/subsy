import type { SubscriptionCreateModel, SubscriptionViewModel } from '@/shared/domain/subscription/subscription.viewModel';
import { useCallback, useState } from 'react';

export const useSubscriptionListCard = (props: {
  subscriptions: SubscriptionViewModel[];
  onCreate: (subscription: SubscriptionCreateModel) => void;
  onUpdate: (subscription: SubscriptionViewModel) => void;
  onDelete: (subscription: SubscriptionViewModel) => void;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModal, setIsEditModal] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionViewModel | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailSubscription, setDetailSubscription] = useState<SubscriptionViewModel | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleOpenModal = useCallback((subscription?: SubscriptionViewModel) => {
    if (!subscription) {
      setCurrentSubscription(null);
      setIsEditModal(false);
      setIsModalOpen(true);
      return;
    }
    setCurrentSubscription(subscription);
    setIsEditModal(true);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setCurrentSubscription(null);
  }, []);

  const handleOpenDetailModal = useCallback((subscription: SubscriptionViewModel) => {
    setDetailSubscription(subscription);
    setIsDetailModalOpen(true);
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setIsDetailModalOpen(false);
    if (!isTransitioning) {
      setDetailSubscription(null);
    }
  }, [isTransitioning]);

  const handleSwitchToEditModal = useCallback((subscription: SubscriptionViewModel) => {
    setIsTransitioning(true);
    setCurrentSubscription(subscription);
    setIsEditModal(true);
    setIsDetailModalOpen(false);
    setTimeout(() => {
      setIsModalOpen(true);
      setIsTransitioning(false);
    }, 100);
  }, []);

  const handleCreateSubscription = useCallback(
    (subscription: SubscriptionCreateModel) => {
      props.onCreate(subscription);
      handleCloseModal();
    },
    [props, handleCloseModal],
  );

  const handleUpdateSubscription = useCallback(
    (subscription: SubscriptionViewModel) => {
      props.onUpdate(subscription);
      handleCloseModal();
    },
    [props, handleCloseModal],
  );

  const handleDeleteSubscription = useCallback(
    (subscription: SubscriptionViewModel) => {
      props.onDelete(subscription);
      setIsDeleteDialogOpen(false);
    },
    [props],
  );

  return {
    isModalOpen,
    isEditModal,
    currentSubscription,
    isDeleteDialogOpen,
    isDetailModalOpen,
    detailSubscription,
    isTransitioning,
    handleOpenModal,
    handleCloseModal,
    handleOpenDetailModal,
    handleCloseDetailModal,
    handleSwitchToEditModal,
    setIsDeleteDialogOpen,
    setCurrentSubscription,
    handleCreateSubscription,
    handleUpdateSubscription,
    handleDeleteSubscription,
  };
};
