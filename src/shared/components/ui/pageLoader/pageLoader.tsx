import { Spinner } from '@/shared/components/ui/spinner/spinner';

export const PageLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
};
