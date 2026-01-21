import type { ReactElement, ReactNode } from 'react';
import { Box, Container, Typography, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageContainerProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
}

/** Page container with title, breadcrumbs, and actions */
export function PageContainer({
  children,
  title,
  subtitle,
  breadcrumbs,
  action,
  maxWidth = 'lg',
}: PageContainerProps): ReactElement {
  return (
    <Container maxWidth={maxWidth} disableGutters>
      {(breadcrumbs || title || action) && (
        <Box sx={{ mb: 3 }}>
          {breadcrumbs && breadcrumbs.length > 0 && (
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 1 }}>
              {breadcrumbs.map((item, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return isLast || !item.href ? (
                  <Typography key={index} color="text.primary" variant="body2">
                    {item.label}
                  </Typography>
                ) : (
                  <Link
                    key={index}
                    component={RouterLink}
                    to={item.href}
                    color="inherit"
                    underline="hover"
                    variant="body2"
                  >
                    {item.label}
                  </Link>
                );
              })}
            </Breadcrumbs>
          )}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box>
              {title && (
                <Typography variant="h4" component="h1" fontWeight={700}>
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
            {action && <Box>{action}</Box>}
          </Box>
        </Box>
      )}

      {children}
    </Container>
  );
}

export default PageContainer;
