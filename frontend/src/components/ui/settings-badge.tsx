import {cn} from '../../lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';
import {Settings} from 'lucide-react';

interface SettingsBadgeProps {
  hasApolloKey: boolean;
  onClick: () => void;
}

export function SettingsBadge({hasApolloKey, onClick}: SettingsBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative group cursor-pointer" onClick={onClick}>
            <Settings className="h-5 w-5 text-gray-500 transition-colors group-hover:text-gray-900" />
            {!hasApolloKey && (
              <span
                className={cn(
                  'absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full',
                  'bg-red-500/90 transition-all duration-300',
                  'group-hover:scale-125 group-hover:bg-red-600',
                  'animate-[pulse_3s_ease-in-out_infinite]'
                )}
                style={{
                  animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  background: 'linear-gradient(45deg, #ef4444, #dc2626)',
                }}
              />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[300px]">
          <p className="text-sm font-medium">
            Connect to Apollo Studio
            <span className="block text-xs font-normal text-muted-foreground mt-1">
              Enter your user-scoped Apollo API key to instantly build custom
              mock seeds against existing supergraph variants and schema
              proposals
            </span>
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
