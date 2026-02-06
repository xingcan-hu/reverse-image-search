'use client';

import type { ComponentProps } from 'react';
import NextLink from 'next/link';

export type AppLinkProps = ComponentProps<typeof NextLink>;

export default function AppLink({ prefetch, ...props }: AppLinkProps) {
  return (
    <NextLink
      {...props}
      prefetch={prefetch === undefined ? false : prefetch}
    />
  );
}
