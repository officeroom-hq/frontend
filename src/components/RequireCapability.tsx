import type { ReactNode } from 'react';
import type { Capability } from '../lib/permissions';
import { useSession } from '../lib/session';
import { AccessDenied } from './ui/states';

/** Route-level guard. Renders the access-denied state instead of the page when the role lacks the capability. */
export function RequireCapability({ capability, children }: { capability: Capability; children: ReactNode }) {
  const { can } = useSession();
  if (!can(capability)) return <AccessDenied />;
  return <>{children}</>;
}
