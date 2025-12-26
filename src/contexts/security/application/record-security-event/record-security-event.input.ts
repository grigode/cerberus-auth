import { JSONT } from 'src/contexts/shared/domain';

import { ActorTypeE, TargetTypeE } from '../../domain';

export interface RecordSecurityEventInput {
  type: string;
  actorType: ActorTypeE;
  actorId?: string;
  targetType?: TargetTypeE;
  targetId?: string;
  ip: string;
  userAgent: string;
  metadata: JSONT;
}
