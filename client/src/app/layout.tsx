import '@/styles/globals.css';
import { Providers } from '@/providers';
import { constructMetadata, constructViewport } from '@/utils';

import type { NextWebVitalsMetric } from 'next/app';

export const metadata = constructMetadata();
export const viewport = constructViewport();
export const reportWebVitals = (metric: NextWebVitalsMetric) => {
  if (metric.label === 'web-vital') {
    console.log(metric);
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-a11y-animated-images="system"
      data-a11y-link-underlines="false"
      data-turbo-loaded
    >
      <body className={`overflow-x-hidden`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
