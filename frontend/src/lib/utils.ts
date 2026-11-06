import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Register the app's fluid type scale with tailwind-merge.
 *
 * Without this, `text-caption` (a custom font size) is mistaken for a text
 * colour and silently removes `text-primary-foreground` from base components.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'display-xl',
            'display-lg',
            'display-md',
            'display-sm',
            'heading-xl',
            'heading-lg',
            'heading-md',
            'heading-sm',
            'body-lg',
            'body',
            'body-sm',
            'caption',
            'caption-sm',
            'micro',
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
