import type { ReactElement, ReactNode } from 'react';
import {
  Card as MuiCard,
  CardHeader,
  CardContent,
  CardActions,
  type CardProps as MuiCardProps,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState } from 'react';

export interface CardAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  color?: 'inherit' | 'primary' | 'secondary' | 'error';
}

export interface CardProps extends Omit<MuiCardProps, 'title'> {
  title?: string;
  subtitle?: string;
  avatar?: ReactNode;
  actions?: CardAction[];
  footerActions?: ReactNode;
  children: ReactNode;
  noPadding?: boolean;
}

/** Enhanced card with header, menu, and footer support */
export function Card({
  title,
  subtitle,
  avatar,
  actions,
  footerActions,
  children,
  noPadding = false,
  ...props
}: CardProps): ReactElement {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (): void => {
    setAnchorEl(null);
  };

  const handleAction = (action: CardAction): void => {
    handleMenuClose();
    action.onClick();
  };

  return (
    <MuiCard {...props}>
      {(title || avatar || actions) && (
        <CardHeader
          avatar={avatar}
          title={title}
          subheader={subtitle}
          action={
            actions && actions.length > 0 ? (
              <>
                <IconButton onClick={handleMenuOpen}>
                  <MoreVertIcon />
                </IconButton>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                  {actions.map((action, index) => (
                    <MenuItem key={index} onClick={() => handleAction(action)}>
                      {action.icon && <ListItemIcon>{action.icon}</ListItemIcon>}
                      <ListItemText>{action.label}</ListItemText>
                    </MenuItem>
                  ))}
                </Menu>
              </>
            ) : undefined
          }
        />
      )}
      <CardContent sx={noPadding ? { p: 0, '&:last-child': { pb: 0 } } : undefined}>
        {children}
      </CardContent>
      {footerActions && <CardActions sx={{ px: 2, pb: 2 }}>{footerActions}</CardActions>}
    </MuiCard>
  );
}

export default Card;
