import type { AnchorHTMLAttributes } from 'react';

// Standard anchor navigation eliminates the Vinext production RSC prefetch setup
// exception while preserving hash anchors, query parameters, keyboard usage,
// and opening links in a new tab.
export default function Link({
  href,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}
