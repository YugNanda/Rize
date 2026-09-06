/**
 * Utility to merge class names (lightweight clsx alternative).
 * Filters falsy values and joins remaining strings.
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
