import type { ReactElement } from 'react';
import { Skeleton, Box, Card, CardContent, Stack } from '@mui/material';

export interface PageSkeletonProps {
  type?: 'card' | 'list' | 'form' | 'dashboard';
}

/** Skeleton loader for different page types */
export function PageSkeleton({ type = 'card' }: PageSkeletonProps): ReactElement {
  if (type === 'list') {
    return (
      <Stack spacing={2}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
            </Box>
          </Box>
        ))}
      </Stack>
    );
  }

  if (type === 'form') {
    return (
      <Stack spacing={3}>
        <Skeleton variant="text" width="30%" height={32} />
        <Skeleton variant="rounded" height={56} />
        <Skeleton variant="rounded" height={56} />
        <Skeleton variant="rounded" height={120} />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Skeleton variant="rounded" width={100} height={40} />
          <Skeleton variant="rounded" width={100} height={40} />
        </Box>
      </Stack>
    );
  }

  if (type === 'dashboard') {
    return (
      <Box>
        <Skeleton variant="text" width="40%" height={40} sx={{ mb: 3 }} />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 2,
            mb: 3,
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rounded" height={120} />
          ))}
        </Box>
        <Skeleton variant="rounded" height={300} />
      </Box>
    );
  }

  // Default: card skeleton
  return (
    <Card>
      <CardContent>
        <Skeleton variant="text" width="50%" height={32} sx={{ mb: 2 }} />
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Skeleton variant="text" width="70%" />
      </CardContent>
    </Card>
  );
}

export default PageSkeleton;
