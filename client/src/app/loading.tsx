'use client';
import { LoadingSpinner } from '@/components';
import { CenterLayout } from '@/components';
import React from 'react';
const Loading = React.memo(() => {
  return (
    <>
      <CenterLayout
        Element={`section`}
        className={`
					flex flex-col justify-center
					items-center h-screen w-screen
					overflow-hidden  top-0
					left-0 bottom-0 right-0 z-50
        `}
      >
        <LoadingSpinner />
      </CenterLayout>
    </>
  );
});
export default Loading;
