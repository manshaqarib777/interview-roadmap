import {
  ArrowLeft, ArrowRight, Atom, BookOpen, Bookmark, Braces, Check, CheckCircle2,
  ChevronDown, ChevronRight, Clock, Command, Copy, Eye, Flame, Gauge, Layers,
  Lock, Menu, MessageSquare, Minus, Moon, Network, Pencil, Play, Plus,
  RotateCcw, Search, Server, SlidersHorizontal, Sparkles, Square, Sun, Target, Terminal,
  Triangle, Trophy, Type, X, Zap, type LucideIcon,
} from 'lucide-react';

/**
 * Lucide, behind a thin `<Icon name="…" />` facade.
 *
 * The facade keeps every call site on one default size and stroke weight —
 * mixing those is what makes an icon set look assembled rather than designed.
 * Named imports stay tree-shakeable, so only the ~39 glyphs below ship.
 */

const MAP = {
  search: Search, command: Command, sun: Sun, moon: Moon, bookmark: Bookmark,
  check: Check, checkCircle: CheckCircle2, chevronRight: ChevronRight,
  chevronDown: ChevronDown, arrowRight: ArrowRight, arrowLeft: ArrowLeft,
  play: Play, stop: Square, copy: Copy, refresh: RotateCcw, edit: Pencil,
  network: Network, flame: Flame, target: Target, layers: Layers, zap: Zap,
  book: BookOpen, terminal: Terminal, sparkles: Sparkles, braces: Braces,
  type: Type, atom: Atom, triangle: Triangle, message: MessageSquare,
  clock: Clock, trophy: Trophy, eye: Eye, sliders: SlidersHorizontal,
  menu: Menu, x: X, plus: Plus, minus: Minus, gauge: Gauge, lock: Lock,
  server: Server,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof MAP;

/** Glyphs that read better solid than outlined. */
const FILLED = new Set<IconName>(['play', 'stop', 'triangle', 'flame']);

export function Icon({
  name,
  size = 16,
  className,
  filled,
  strokeWidth = 1.75,
}: {
  name: IconName;
  size?: number;
  className?: string;
  filled?: boolean;
  strokeWidth?: number;
}) {
  const C = MAP[name];
  const solid = filled ?? FILLED.has(name);
  return (
    <C
      size={size}
      className={className}
      strokeWidth={strokeWidth}
      fill={solid ? 'currentColor' : 'none'}
      aria-hidden
    />
  );
}

export const MODULE_ICON: Record<string, IconName> = {
  javascript: 'braces',
  typescript: 'type',
  react: 'atom',
  nextjs: 'triangle',
  'interview-prep': 'message',
  laravel: 'server',
};
