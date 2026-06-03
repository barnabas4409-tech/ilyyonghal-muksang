/**
 * 한국어 조사 선택 유틸리티
 * 마지막 글자의 받침(종성) 유무에 따라 조사를 결정한다.
 */

function hasFinalConsonant(char: string): boolean {
  const code = char.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return false; // 한글 범위 밖
  return (code - 0xac00) % 28 !== 0;
}

function lastChar(str: string): string {
  return str.trim().slice(-1);
}

/** 받침 있으면 "으로", 없으면 "로" */
export function josaRo(name: string): string {
  return hasFinalConsonant(lastChar(name)) ? '으로' : '로';
}

/** 받침 있으면 "은", 없으면 "는" */
export function josaEun(name: string): string {
  return hasFinalConsonant(lastChar(name)) ? '은' : '는';
}

/** 받침 있으면 "이", 없으면 "" */
export function josaI(name: string): string {
  return hasFinalConsonant(lastChar(name)) ? '이' : '';
}
