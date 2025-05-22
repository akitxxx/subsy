import type { SubscriptionViewModel } from '@/shared/domain/subscription/subscription.viewModel';
import { AlertCircleIcon, CheckIcon, XIcon } from 'lucide-react';
import { useMemo } from 'react';

type StatusBadgeProps = {
  subscription: SubscriptionViewModel;
};

export const StatusBadge = ({ subscription }: StatusBadgeProps) => {
  // サブスクリプションのステータス情報を生成
  const statusInfo = useMemo(() => {
    if (subscription.isExpired) {
      return {
        label: '期限切れ',
        color: 'text-gray-500',
        bgColor: 'bg-gray-100',
        icon: <AlertCircleIcon className="h-4 w-4" />,
      };
    }
    if (subscription.isCancelled) {
      return {
        label: 'キャンセル済み',
        color: 'text-orange-500',
        bgColor: 'bg-orange-100',
        icon: <XIcon className="h-4 w-4" />,
      };
    }
    return {
      label: '利用中',
      color: 'text-green-500',
      bgColor: 'bg-green-100',
      icon: <CheckIcon className="h-4 w-4" />,
    };
  }, [subscription]);

  return (
    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusInfo.bgColor} ${statusInfo.color}`}>
      {statusInfo.icon}
      <span className="ml-1">{statusInfo.label}</span>
    </div>
  );
};