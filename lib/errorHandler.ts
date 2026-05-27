export function getSafeErrorMessage(error: unknown): string {
  if (!error) return '알 수 없는 오류가 발생했습니다.';
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return '알 수 없는 오류가 발생했습니다.';
}
