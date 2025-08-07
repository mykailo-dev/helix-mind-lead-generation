interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'sourced':
        return {
          color: 'bg-blue-100 text-blue-800',
          label: 'Sourced'
        };
      case 'message_generated':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          label: 'Message Generated'
        };
      case 'contacted':
        return {
          color: 'bg-purple-100 text-purple-800',
          label: 'Contacted'
        };
      case 'replied':
        return {
          color: 'bg-green-100 text-green-800',
          label: 'Replied'
        };
      case 'converted':
        return {
          color: 'bg-emerald-100 text-emerald-800',
          label: 'Converted'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          label: status.replace('_', ' ')
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color} ${className}`}>
      {config.label}
    </span>
  );
} 