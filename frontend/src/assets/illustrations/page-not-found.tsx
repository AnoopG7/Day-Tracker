import type { SvgIconProps } from '@mui/material/SvgIcon';
import { memo } from 'react';
import SvgIcon from '@mui/material/SvgIcon';
import { BackgroundShape } from './background-shape';

// ----------------------------------------------------------------------

type SvgProps = SvgIconProps & { hideBackground?: boolean };

function PageNotFoundIllustrationComponent({ hideBackground, sx, ...other }: SvgProps) {
  return (
    <SvgIcon
      viewBox="0 0 480 360"
      xmlns="http://www.w3.org/2000/svg"
      sx={[
        (theme) => ({
          '--primary-light': theme.palette.primary.light,
          '--primary-main': theme.palette.primary.main,
          '--primary-dark': theme.palette.primary.dark,
          '--primary-darker': theme.palette.primary.dark,
          width: 320,
          maxWidth: 1,
          flexShrink: 0,
          height: 'auto',
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {!hideBackground && <BackgroundShape />}

      <image href="/character-question.webp" height="300" x="205" y="30" />

      <path
        fill="var(--primary-main)"
        d="M111.045 142.2c58.7-1 58.6-88.3 0-89.2-58.6 1-58.6 88.3 0 89.2z"
        opacity="0.12"
      />

      <path fill="#FFD666" d="M111.045 121c30.8-.5 30.8-46.3 0-46.8-30.8.5-30.8 46.3 0 46.8z" />

      {/* First 4 */}
      <path
        fill="url(#paint0_linear_404)"
        d="M169.245 261h-11.3v-66.6c0-4.5-1.5-5.6-5.6-5.6-5.3.3-13.8-1.4-17.1 4l-55 68.3c-2.7 3.3-1.8 8.8-2 12.8 0 4.1 1.5 5.6 5.6 5.6h54.7v21.7c-.9 7.9 9.1 5.2 13.7 5.6 4.1 0 5.6-1.5 5.6-5.6v-21.7h11.4c4.4 0 5.6-1.5 5.6-5.6-.3-4.8 2-13.8-5.6-12.9zm-30.8 0h-36l36-44.4V261z"
      />

      {/* Middle 0 - Hollow ring/cylinder using path for proper transparency */}
      <path
        fill="url(#paint1_linear_404)"
        d="M 260 257 m -60, 0 a 60,60 0 1,0 120,0 a 60,60 0 1,0 -120,0 Z M 260 257 m -40, 0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0 Z"
        fillRule="evenodd"
      />

      {/* Last 4 */}
      <path
        fill="url(#paint2_linear_404)"
        d="M438.545 261h-11.3v-66.6c0-4.5-1.5-5.6-5.6-5.6-5.3.3-13.8-1.4-17.1 4l-55 68.3c-2.7 3.3-1.8 8.8-2 12.8 0 4.1 1.5 5.6 5.6 5.6h54.7v21.7c-.9 7.9 9.1 5.2 13.7 5.6 4.1 0 5.6-1.5 5.6-5.6v-21.7h11.4c4.4 0 5.6-1.5 5.6-5.6-.3-4.8 2-13.8-5.6-12.9zm-30.8 0h-36l36-44.4V261z"
      />

      <defs>
        <linearGradient
          id="paint0_linear_404"
          x1="240"
          x2="240"
          y1="187.309"
          y2="307.306"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--primary-light)" />
          <stop offset="1" stopColor="var(--primary-dark)" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_404"
          x1="240"
          x2="240"
          y1="187.309"
          y2="307.306"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--primary-light)" />
          <stop offset="1" stopColor="var(--primary-dark)" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_404"
          x1="240"
          x2="240"
          y1="187.309"
          y2="307.306"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--primary-light)" />
          <stop offset="1" stopColor="var(--primary-dark)" />
        </linearGradient>
      </defs>
    </SvgIcon>
  );
}

export const PageNotFoundIllustration = memo(PageNotFoundIllustrationComponent);
