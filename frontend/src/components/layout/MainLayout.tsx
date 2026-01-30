import { useState, type ReactNode, type ReactElement } from 'react';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export interface MainLayoutProps {
  children: ReactNode;
}

const SIDEBAR_WIDTH = 240;

/** Main application layout with header and sidebar */
export function MainLayout({ children }: MainLayoutProps): ReactElement {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleMenuClick = (): void => {
    // Only toggle on mobile
    if (isMobile) {
      setMobileSidebarOpen((prev) => !prev);
    }
  };

  const handleSidebarClose = (): void => {
    if (isMobile) {
      setMobileSidebarOpen(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header onMenuClick={handleMenuClick} />

      <Sidebar
        open={isMobile ? mobileSidebarOpen : true}
        onClose={handleSidebarClose}
        variant={isMobile ? 'temporary' : 'permanent'}
        width={SIDEBAR_WIDTH}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          minHeight: '100vh',
          marginLeft: 0, // Sidebar is always visible on desktop via permanent variant
        }}
      >
        <Toolbar />
        <Box sx={{ p: 3 }}>{children}</Box>
      </Box>
    </Box>
  );
}

export default MainLayout;
