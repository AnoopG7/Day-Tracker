import { type ReactElement, forwardRef } from 'react';
import { Snackbar, Alert, type AlertColor, Slide, type SlideProps, Grow } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';

export type ToastVariant = AlertColor;
export type ToastPosition = {
  vertical: 'top' | 'bottom';
  horizontal: 'left' | 'center' | 'right';
};
export type ToastTransition = 'slide' | 'grow' | 'fade';

export interface ToastProps {
  open: boolean;
  message: string;
  variant?: ToastVariant;
  duration?: number;
  position?: ToastPosition;
  transition?: ToastTransition;
  onClose: () => void;
  showIcon?: boolean;
}

/** Slide transition from right */
const SlideTransition = forwardRef(function SlideTransition(
  props: SlideProps,
  ref: React.Ref<unknown>
) {
  return <Slide {...props} ref={ref} direction="left" />;
});

/** Grow transition */
const GrowTransition = forwardRef(function GrowTransition(
  props: SlideProps,
  ref: React.Ref<unknown>
) {
  return <Grow {...props} ref={ref} />;
});

const iconMap: Record<ToastVariant, ReactElement> = {
  success: <CheckCircleIcon />,
  error: <ErrorIcon />,
  info: <InfoIcon />,
  warning: <WarningIcon />,
};

/** Toast notification component with animated transitions */
export function Toast({
  open,
  message,
  variant = 'info',
  duration = 4000,
  position = { vertical: 'bottom', horizontal: 'right' },
  transition = 'slide',
  onClose,
  showIcon = true,
}: ToastProps): ReactElement {
  const getTransitionComponent = () => {
    switch (transition) {
      case 'slide':
        return SlideTransition;
      case 'grow':
        return GrowTransition;
      default:
        return undefined;
    }
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={position}
      TransitionComponent={getTransitionComponent()}
      sx={{
        '& .MuiSnackbarContent-root': {
          minWidth: 'auto',
        },
      }}
    >
      <Alert
        onClose={onClose}
        severity={variant}
        variant="filled"
        icon={showIcon ? iconMap[variant] : false}
        sx={{
          minWidth: 280,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          '& .MuiAlert-message': {
            fontSize: '0.9rem',
            fontWeight: 500,
          },
          '& .MuiAlert-icon': {
            fontSize: '1.25rem',
          },
          animation: open ? 'toastEnter 0.3s ease-out' : 'none',
          '@keyframes toastEnter': {
            '0%': {
              opacity: 0,
              transform: 'scale(0.9) translateY(10px)',
            },
            '100%': {
              opacity: 1,
              transform: 'scale(1) translateY(0)',
            },
          },
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}

export default Toast;
