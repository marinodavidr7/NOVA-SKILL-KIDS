'use client';

import { useServerInsertedHTML } from 'next/navigation';

export function InlineScript({ html }: { html: string }) {
  useServerInsertedHTML(() => {
    return <script dangerouslySetInnerHTML={{ __html: html }} />;
  });
  return null;
}
