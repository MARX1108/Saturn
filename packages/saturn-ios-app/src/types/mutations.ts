/**
 * Type definition for mutation results from TanStack Query
 */

export interface MutationResult<TData, TError, TVariables> {
  mutate: (
    variables: TVariables,
    options?: MutationOptions<TData, TError>
  ) => void;
  isLoading: boolean;
  isError: boolean;
  error: TError | null;
  isSuccess: boolean;
  data?: TData;
}

export interface MutationOptions<TData, TError> {
  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
}
