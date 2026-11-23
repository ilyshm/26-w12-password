/**
 * 사이버보안 원칙을 준수하는 비밀번호 유틸리티 모듈
 * - CSPRNG(crypto.getRandomValues) 기반 안전한 난수 생성
 * - k-익명성(최소 전송 원칙) 기반 HIBP Range API 연동
 * - 메모리 외 비밀번호 및 해시값 영구 저장 및 console.log 출력 금지
 */

const CHAR_SETS = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower: 'abcdefghijklmnopqrstuvwxyz',
  number: '0123456789',
  symbol: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

const COMMON_PATTERNS = [
  '1234', '2345', '3456', '4567', '5678', '6789', '7890', '0987',
  'qwer', 'asdf', 'zxcv', 'password', 'admin', 'qwerty', 'pass', 'root'
];

/**
 * 비밀번호 실시간 강도 측정 (브라우저 내부 연산)
 * @param {string} password 
 * @returns {{
 *   score: number,
 *   level: number,
 *   label: string,
 *   color: string,
 *   criteria: {
 *     minLength: boolean,
 *     strongLength: boolean,
 *     hasLower: boolean,
 *     hasUpper: boolean,
 *     hasNumber: boolean,
 *     hasSymbol: boolean,
 *     hasNoPatterns: boolean
 *   },
 *   feedback: string[]
 * }}
 */
export function calculatePasswordStrength(password) {
  if (!password) {
    return {
      score: 0,
      level: 0,
      label: '입력 대기',
      color: '#94a3b8',
      criteria: {
        minLength: false,
        strongLength: false,
        hasLower: false,
        hasUpper: false,
        hasNumber: false,
        hasSymbol: false,
        hasNoPatterns: true,
      },
      feedback: ['비밀번호를 입력하여 강도를 검사하세요.'],
    };
  }

  const length = password.length;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  const minLength = length >= 8;
  const strongLength = length >= 12;

  // 연속 3회 동일 문자 감지 (예: aaa, 111)
  const hasRepeating = /(.)\1\1/.test(password);

  // 일반적인 키보드 배열 및 취약 단어 감지
  const lowerPwd = password.toLowerCase();
  const hasCommonPattern = COMMON_PATTERNS.some((pat) => lowerPwd.includes(pat));
  const hasNoPatterns = !hasRepeating && !hasCommonPattern;

  // 점수 계산 (0 ~ 100)
  let rawScore = 0;

  // 1. 길이 점수 (최대 40점)
  if (length >= 16) {
    rawScore += 40;
  } else if (length >= 12) {
    rawScore += 30;
  } else if (length >= 8) {
    rawScore += 18;
  } else {
    rawScore += length * 2;
  }

  // 2. 문자 종류 다양성 (최대 40점)
  let typeCount = 0;
  if (hasLower) typeCount += 1;
  if (hasUpper) typeCount += 1;
  if (hasNumber) typeCount += 1;
  if (hasSymbol) typeCount += 1;

  rawScore += typeCount * 10;

  // 4종류 문자 모두 포함 시 가산점
  if (typeCount === 4) {
    rawScore += 5;
  }

  // 3. 패턴 감점 및 보너스
  if (hasRepeating) {
    rawScore -= 15;
  }
  if (hasCommonPattern) {
    rawScore -= 20;
  }
  if (hasNoPatterns && length >= 10) {
    rawScore += 15;
  }

  const score = Math.max(0, Math.min(100, rawScore));

  // 5단계 판정
  let level = 0;
  let label = '매우 약함';
  let color = '#ef4444'; // Red

  if (score >= 85 && minLength && typeCount >= 3) {
    level = 4;
    label = '매우 강함';
    color = '#10b981'; // Emerald
  } else if (score >= 65 && minLength && typeCount >= 2) {
    level = 3;
    label = '강함';
    color = '#3b82f6'; // Blue
  } else if (score >= 45 && minLength) {
    level = 2;
    label = '보통';
    color = '#f59e0b'; // Amber
  } else if (score >= 25) {
    level = 1;
    label = '약함';
    color = '#f97316'; // Orange
  } else {
    level = 0;
    label = '매우 약함';
    color = '#ef4444'; // Red
  }

  // 구체적인 개선 피드백
  const feedback = [];
  if (!minLength) {
    feedback.push('최소 8자 이상(권장 12자 이상)으로 늘려주세요.');
  } else if (!strongLength) {
    feedback.push('12자 이상으로 설정하면 무차별 대입 공격에 훨씬 안전해집니다.');
  }

  if (!hasLower) feedback.push('소문자(a-z)를 하나 이상 포함하세요.');
  if (!hasUpper) feedback.push('대문자(A-Z)를 하나 이상 포함하세요.');
  if (!hasNumber) feedback.push('숫자(0-9)를 하나 이상 포함하세요.');
  if (!hasSymbol) feedback.push('특수문자(!@#$%^&* 등)를 포함하여 엔트로피를 높이세요.');

  if (hasRepeating) {
    feedback.push('동일한 문자가 3번 이상 연속 반복되지 않도록 변경하세요.');
  }
  if (hasCommonPattern) {
    feedback.push('1234, qwer, password 등 쉽게 유추 가능한 패턴을 피하세요.');
  }

  if (feedback.length === 0) {
    feedback.push('보안 강도가 우수합니다! 정기적으로 비밀번호를 변경해 관리하세요.');
  }

  return {
    score,
    level,
    label,
    color,
    criteria: {
      minLength,
      strongLength,
      hasLower,
      hasUpper,
      hasNumber,
      hasSymbol,
      hasNoPatterns,
    },
    feedback,
  };
}

const getCrypto = () => {
  if (typeof window !== 'undefined' && window.crypto) {
    return window.crypto;
  }
  return globalThis.crypto;
};

/**
 * CSPRNG(crypto.getRandomValues)를 이용한 안전한 난수 정수 생성 [0, max)
 * 편향(Modulo Bias)을 방지하기 위한 거부 샘플링(Rejection Sampling) 구현
 * @param {number} max 
 * @returns {number}
 */
function getSecureRandomInt(max) {
  if (max <= 0) return 0;
  const limit = Math.floor(0xffffffff / max) * max;
  const buffer = new Uint32Array(1);
  const cryptoObj = getCrypto();

  while (true) {
    cryptoObj.getRandomValues(buffer);
    const val = buffer[0];
    if (val < limit) {
      return val % max;
    }
  }
}

/**
 * 안전한 비밀번호 생성기
 * Math.random()을 절대 사용하지 않고 window.crypto.getRandomValues()만 사용합니다.
 * @param {{
 *   length?: number,
 *   upper?: boolean,
 *   lower?: boolean,
 *   number?: boolean,
 *   symbol?: boolean
 * }} options
 * @returns {string}
 */
export function generateSecurePassword(options = {}) {
  const {
    length = 16,
    upper = true,
    lower = true,
    number = true,
    symbol = true,
  } = options;

  const validLength = Math.max(8, Math.min(32, length));

  // 사용할 문자군 선택
  const requiredPools = [];
  let fullCharset = '';

  if (upper) {
    requiredPools.push(CHAR_SETS.upper);
    fullCharset += CHAR_SETS.upper;
  }
  if (lower) {
    requiredPools.push(CHAR_SETS.lower);
    fullCharset += CHAR_SETS.lower;
  }
  if (number) {
    requiredPools.push(CHAR_SETS.number);
    fullCharset += CHAR_SETS.number;
  }
  if (symbol) {
    requiredPools.push(CHAR_SETS.symbol);
    fullCharset += CHAR_SETS.symbol;
  }

  // 모든 체크박스가 해제된 경우 소문자+숫자 기본 보장
  if (requiredPools.length === 0) {
    requiredPools.push(CHAR_SETS.lower, CHAR_SETS.number);
    fullCharset = CHAR_SETS.lower + CHAR_SETS.number;
  }

  const resultChars = [];

  // 1. 선택된 각 문자군에서 최소 1글자씩 반드시 선발
  for (const pool of requiredPools) {
    const idx = getSecureRandomInt(pool.length);
    resultChars.push(pool[idx]);
  }

  // 2. 남은 자릿수를 전체 선택 문자군에서 채움
  while (resultChars.length < validLength) {
    const idx = getSecureRandomInt(fullCharset.length);
    resultChars.push(fullCharset[idx]);
  }

  // 3. Fisher-Yates 암호학적 셔플 (순서 편향 제거)
  for (let i = resultChars.length - 1; i > 0; i--) {
    const j = getSecureRandomInt(i + 1);
    const temp = resultChars[i];
    resultChars[i] = resultChars[j];
    resultChars[j] = temp;
  }

  return resultChars.join('');
}

/**
 * Web Crypto API를 사용한 SHA-1 해시 계산 (40자리 대문자 Hex 반환)
 * @param {string} plainText 
 * @returns {Promise<string>}
 */
export async function sha1(plainText) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText);
  const hashBuffer = await getCrypto().subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

/**
 * k-익명성(최소 전송 원칙) 기반 HIBP 유출 확인
 * - 비밀번호 원문이나 전체 해시는 절대 전송하지 않음
 * - SHA-1 앞 5자리만 전송하고, 뒤 35자리는 브라우저 내부에서 대문자로 대조
 * @param {string} password 
 * @returns {Promise<{
 *   breached: boolean,
 *   count: number,
 *   prefix: string
 * }>}
 */
export async function checkPwnedPassword(password) {
  if (!password) {
    return { breached: false, count: 0, prefix: '' };
  }

  const hash = await sha1(password);
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5); // 35글자 대문자

  // HIBP Range API 호출 (Add-Padding 헤더 적용)
  const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
    headers: {
      'Add-Padding': 'true',
    },
  });

  if (!response.ok) {
    throw new Error(`HIBP API 조회 실패: HTTP ${response.status}`);
  }

  const responseText = await response.text();
  const lines = responseText.split(/\r?\n/);

  for (const line of lines) {
    const parts = line.split(':');
    if (parts.length >= 2) {
      const lineSuffix = parts[0].trim().toUpperCase();
      const count = parseInt(parts[1].trim(), 10);

      // Add-Padding 적용 시 count가 0인 패딩 행은 유출 내역이 아니므로 제외
      if (lineSuffix === suffix && count > 0) {
        return {
          breached: true,
          count,
          prefix,
        };
      }
    }
  }

  return {
    breached: false,
    count: 0,
    prefix,
  };
}
