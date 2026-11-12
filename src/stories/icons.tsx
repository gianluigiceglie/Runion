import { ArrowRight, Heart, PersonSimpleRun, Plus, Star } from '@phosphor-icons/react';

/** Shared icon picker for story controls: maps a name to a Phosphor icon element. */
export const iconOptions = ['none', 'PersonSimpleRun', 'Plus', 'Star', 'Heart', 'ArrowRight'] as const;
export const iconMapping = {
  none: undefined,
  PersonSimpleRun: <PersonSimpleRun />,
  Plus: <Plus />,
  Star: <Star />,
  Heart: <Heart />,
  ArrowRight: <ArrowRight />,
};
export const iconArg = {
  options: iconOptions,
  mapping: iconMapping,
  control: { type: 'select' as const },
};
