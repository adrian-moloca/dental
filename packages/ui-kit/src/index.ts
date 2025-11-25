/**
 * @dentalos/ui-kit
 * Shared React component library with Radix UI and Tailwind CSS
 *
 * @example
 * ```tsx
 * import { Button, Input, Card } from '@dentalos/ui-kit';
 * import '@dentalos/ui-kit/styles';
 *
 * function MyComponent() {
 *   return (
 *     <Card>
 *       <Input label="Email" type="email" />
 *       <Button variant="primary">Submit</Button>
 *     </Card>
 *   );
 * }
 * ```
 */

// Components
export * from './components';

// Hooks (explicit exports to avoid Toast conflict)
export { useToast } from './hooks/use-toast';
export type { Toast as ToastType } from './hooks/use-toast';

// Tokens
export * from './tokens';

// Utils
export * from './utils';
