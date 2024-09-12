'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { JSXElementConstructor, ReactNode } from 'react';
import { Events, ThemeProvider } from '.';

const queryClient = new QueryClient();

export const Providers: React.FC<
  Readonly<{
    children: React.ReactNode;
  }>
> = ({ children }) => {
  return (
    <>
      <ProviderStack
        providers={[
          [
            ThemeProvider,
            {
              attribute: 'class',
              defaultTheme: 'light',
              enableSystem: true,
            },
          ],
          [Events, {}],
          [QueryClientProvider, { client: queryClient }],
        ]}
      >
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} />
          {children}
        </QueryClientProvider>
      </ProviderStack>
    </>
  );
};

type NoInfer<T> = [T][T extends any ? 0 : 1];

type ContainsChildren = {
  children?: React.ReactNode;
};

function ProviderStack<Providers extends [ContainsChildren, ...ContainsChildren[]]>({
  providers,
  children,
}: {
  providers: {
    [k in keyof Providers]: [
      JSXElementConstructor<Providers[k]>,
      Omit<NoInfer<Providers[k]>, 'children'>,
    ];
  };
  children: ReactNode;
}) {
  let node = children;

  for (const [Provider, props] of providers) {
    node = <Provider {...props}>{node}</Provider>;
  }

  return node;
}
