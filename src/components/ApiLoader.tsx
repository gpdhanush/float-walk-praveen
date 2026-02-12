import { useDataStore } from '@/stores/dataStore';

export function ApiLoader() {
  const isLoading = useDataStore(s => s.isLoading);

  if (!isLoading) return null;

  return (
    <>
      {/* Progress bar at top */}
      {/* <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-primary/20 overflow-hidden">
        <div className="h-full bg-primary animate-progress-line w-full" />
      </div> */}
      
      {/* Full-page overlay with spinner */}
      <div className="fixed inset-0 backdrop-blur-sm z-[9998] flex items-center justify-center">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col items-center gap-4 min-w-[200px]">
          {/* Circular spinner */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          
          {/* Loading text */}
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">Please wait...</p>
            {/* <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Loading data</p> */}
          </div>
        </div>
      </div>
    </>
  );
}
