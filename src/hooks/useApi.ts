import { useState, useEffect, useCallback } from 'react';
import { ApiResponse } from '@/types/api';
import { toast } from 'sonner';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseApiOptions {
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  successMessage?: string;
}

/**
 * Custom hook for making API calls with loading and error states
 * 
 * Usage:
 * const { data, isLoading, error, execute, reset } = useApi<Room[]>();
 * 
 * // Fetch data
 * useEffect(() => {
 *   execute(() => getRooms());
 * }, []);
 */
export function useApi<T>(options: UseApiOptions = {}) {
  const { showErrorToast = true, showSuccessToast = false, successMessage } = options;
  
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(async (
    apiCall: () => Promise<ApiResponse<T>>,
    onSuccess?: (data: T) => void,
    onError?: (error: string) => void
  ): Promise<ApiResponse<T>> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await apiCall();
      
      if (response.success) {
        setState({ data: response.data, isLoading: false, error: null });
        if (showSuccessToast && (successMessage || response.message)) {
          toast.success(successMessage || response.message);
        }
        onSuccess?.(response.data);
      } else {
        setState({ data: null, isLoading: false, error: response.message });
        if (showErrorToast) {
          toast.error(response.message);
        }
        onError?.(response.message);
      }
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setState({ data: null, isLoading: false, error: errorMessage });
      if (showErrorToast) {
        toast.error(errorMessage);
      }
      onError?.(errorMessage);
      return {
        success: false,
        message: errorMessage,
        status: 500,
        data: null as unknown as T,
      };
    }
  }, [showErrorToast, showSuccessToast, successMessage]);

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
  };
}

/**
 * Hook for fetching data on component mount
 */
export function useFetch<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  deps: React.DependencyList = [],
  options: UseApiOptions = {}
) {
  const api = useApi<T>(options);

  useEffect(() => {
    api.execute(apiCall);
  }, deps);

  const refetch = useCallback(() => {
    api.execute(apiCall);
  }, [apiCall, api.execute]);

  return { ...api, refetch };
}

/**
 * Hook for mutation operations (create, update, delete)
 */
export function useMutation<T, TInput = unknown>(
  options: UseApiOptions & {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
  } = {}
) {
  const { onSuccess, onError, ...apiOptions } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (
    apiCall: (input: TInput) => Promise<ApiResponse<T>>,
    input: TInput
  ): Promise<ApiResponse<T>> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiCall(input);
      
      if (response.success) {
        if (apiOptions.showSuccessToast !== false) {
          toast.success(apiOptions.successMessage || response.message);
        }
        onSuccess?.(response.data);
      } else {
        setError(response.message);
        if (apiOptions.showErrorToast !== false) {
          toast.error(response.message);
        }
        onError?.(response.message);
      }
      
      setIsLoading(false);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      if (apiOptions.showErrorToast !== false) {
        toast.error(errorMessage);
      }
      onError?.(errorMessage);
      setIsLoading(false);
      return {
        success: false,
        message: errorMessage,
        status: 500,
        data: null as unknown as T,
      };
    }
  }, [onSuccess, onError, apiOptions.showSuccessToast, apiOptions.showErrorToast, apiOptions.successMessage]);

  return { mutate, isLoading, error };
}
