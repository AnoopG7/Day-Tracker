import type { ReactElement } from 'react';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Typography,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import { useLocation, useNavigate } from 'react-router-dom';

export interface SidebarProps {
  open: boolean;
  onClose?: () => void;
  variant?: 'permanent' | 'persistent' | 'temporary';
  width?: number;
}

interface NavItem {
  label: string;
  path: string;
  icon: ReactElement;
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <HomeIcon /> },
  { label: 'Activities', path: '/activities', icon: <FitnessCenterIcon /> },
  { label: 'Calendar', path: '/calendar', icon: <CalendarMonthIcon /> },
  { label: 'Analytics', path: '/analytics', icon: <BarChartIcon /> },
];

const bottomNavItems: NavItem[] = [
  { label: 'Settings', path: '/settings', icon: <SettingsIcon /> },
];

/** Sidebar navigation drawer */
export function Sidebar({
  open,
  onClose,
  variant = 'permanent',
  width = 240,
}: SidebarProps): ReactElement {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path: string): void => {
    navigate(path);
    if (variant === 'temporary' && onClose) {
      onClose();
    }
  };

  const renderNavItems = (items: NavItem[]): ReactElement => (
    <List>
      {items.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <ListItem key={item.path} disablePadding sx={{ px: 1 }}>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={isActive}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': {
                    color: 'inherit',
                  },
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: isActive ? 'inherit' : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar />
      <Box sx={{ p: 2 }}>
        <Typography variant="overline" color="text.secondary">
          Navigation
        </Typography>
      </Box>
      {renderNavItems(mainNavItems)}
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      {renderNavItems(bottomNavItems)}
      <Box sx={{ p: 2 }} />
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: open ? width : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}

export default Sidebar;
