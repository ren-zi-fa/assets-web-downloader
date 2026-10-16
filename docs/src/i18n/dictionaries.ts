import type { Dictionary, Lang } from './types';
import { en } from './en';
import { id } from './id';

export const dictionaries: Record<Lang, Dictionary> = { id, en };
