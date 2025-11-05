import { Bell } from 'lucide-react';
import { Badge } from '../../assets/shadcn-ui/components/ui/badge';
import { Button } from '../../assets/shadcn-ui/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../assets/shadcn-ui/components/ui/popover';
import { AlertList } from './AlertList';
import { useQuery } from '@tanstack/react-query';
import { alertService } from '../../services/center-owner/alerts/alert.service';

export const AlertBadge = () => {
  const { data: unreadCountData, refetch } = useQuery({
    queryKey: ['alerts', 'unread-count'],
    queryFn: async () => {
      const response = await alertService.getUnreadCount();
      return response?.data?.count || 0;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const unreadCount = typeof unreadCountData === 'number' ? unreadCountData : 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <AlertList onUpdate={refetch} />
      </PopoverContent>
    </Popover>
  );
};

