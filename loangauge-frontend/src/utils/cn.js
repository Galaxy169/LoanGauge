/** Tiny classnames joiner — filters falsy values and merges strings. */
export function cn(...args) {
  return args.filter(Boolean).join(' ');
}
