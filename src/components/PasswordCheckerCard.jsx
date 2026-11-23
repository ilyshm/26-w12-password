import { useState } from 'react';
import { calculatePasswordStrength, checkPwnedPassword } from '../utils/passwordSecurity';

export default function PasswordCheckerCard({ password, onPasswordChange }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingPwned, setIsCheckingPwned] = useState(false);
  const [pwnedResult, setPwnedResult] = useState(null);
  const [pwnedError, setPwnedError] = useState(null);

  const strength = calculatePasswordStrength(password);

  const handleCheckPwned = async () => {
    if (!password.trim()) {
      alert('유출 여부를 확인할 비밀번호를 먼저 입력해 주세요.');
      return;
    }

    setIsCheckingPwned(true);
    setPwnedResult(null);
    setPwnedError(null);

    try {
      const result = await checkPwnedPassword(password);
      setPwnedResult(result);
    } catch (err) {
      setPwnedError(err.message || '유출 확인 중 네트워크 오류가 발생했습니다.');
    } finally {
      setIsCheckingPwned(false);
    }
  };

  const handleInputChange = (e) => {
    onPasswordChange(e.target.value);
    // 입력 변경 시 이전 유출 검사 결과 초기화
    if (pwnedResult || pwnedError) {
      setPwnedResult(null);
      setPwnedError(null);
    }
  };

  // 5단계 게이지 색상 및 너비 계산
  const getGaugeWidth = () => {
    if (!password) return '0%';
    const widths = ['20%', '40%', '60%', '80%', '100%'];
    return widths[strength.level] || '20%';
  };

  return (
    <div className="card checker-card">
      <div className="card-header">
        <div className="card-title-group">
          <span className="card-icon">🔍</span>
          <div>
            <h2 className="card-title">비밀번호 강도 & 유출 점검</h2>
            <p className="card-subtitle">
              실시간 강도 검사 및 k-익명성 기반 유출 내역 조회
            </p>
          </div>
        </div>
      </div>

      <div className="card-body">
        {/* 비밀번호 입력 영역 */}
        <div className="input-group">
          <label htmlFor="password-input" className="input-label">
            점검할 비밀번호 입력
          </label>
          <div className="password-input-wrapper">
            <input
              id="password-input"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handleInputChange}
              placeholder="비밀번호를 입력하거나 생성기에서 가져오세요"
              className="password-input"
              autoComplete="off"
              spellCheck="false"
            />
            <button
              type="button"
              className="toggle-visibility-btn"
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
            >
              {showPassword ? '🙈 숨김' : '👁️ 표시'}
            </button>
          </div>
        </div>

        {/* 실시간 5단계 강도 게이지 */}
        <div className="strength-section">
          <div className="strength-header">
            <span className="strength-title">실시간 보안 강도</span>
            <span
              className="strength-badge"
              style={{ backgroundColor: strength.color }}
            >
              {strength.label} ({strength.score}점)
            </span>
          </div>

          <div className="gauge-container">
            <div
              className="gauge-bar"
              style={{
                width: getGaugeWidth(),
                backgroundColor: strength.color,
              }}
            />
          </div>

          <div className="gauge-levels">
            <span className={strength.level >= 0 && password ? 'active' : ''}>매우 약함</span>
            <span className={strength.level >= 1 ? 'active' : ''}>약함</span>
            <span className={strength.level >= 2 ? 'active' : ''}>보통</span>
            <span className={strength.level >= 3 ? 'active' : ''}>강함</span>
            <span className={strength.level >= 4 ? 'active' : ''}>매우 강함</span>
          </div>
        </div>

        {/* 세부 검증 기준 체크리스트 */}
        <div className="criteria-grid">
          <div className={`criteria-item ${strength.criteria.minLength ? 'valid' : ''}`}>
            <span className="criteria-bullet">{strength.criteria.minLength ? '✓' : '•'}</span>
            <span>최소 8자 이상 ({password.length}자)</span>
          </div>
          <div className={`criteria-item ${strength.criteria.strongLength ? 'valid' : ''}`}>
            <span className="criteria-bullet">{strength.criteria.strongLength ? '✓' : '•'}</span>
            <span>권장 12자 이상</span>
          </div>
          <div className={`criteria-item ${strength.criteria.hasLower ? 'valid' : ''}`}>
            <span className="criteria-bullet">{strength.criteria.hasLower ? '✓' : '•'}</span>
            <span>소문자 (a-z)</span>
          </div>
          <div className={`criteria-item ${strength.criteria.hasUpper ? 'valid' : ''}`}>
            <span className="criteria-bullet">{strength.criteria.hasUpper ? '✓' : '•'}</span>
            <span>대문자 (A-Z)</span>
          </div>
          <div className={`criteria-item ${strength.criteria.hasNumber ? 'valid' : ''}`}>
            <span className="criteria-bullet">{strength.criteria.hasNumber ? '✓' : '•'}</span>
            <span>숫자 (0-9)</span>
          </div>
          <div className={`criteria-item ${strength.criteria.hasSymbol ? 'valid' : ''}`}>
            <span className="criteria-bullet">{strength.criteria.hasSymbol ? '✓' : '•'}</span>
            <span>특수문자 (!@#$)</span>
          </div>
          <div className={`criteria-item ${strength.criteria.hasNoPatterns ? 'valid' : 'invalid'}`}>
            <span className="criteria-bullet">{strength.criteria.hasNoPatterns ? '✓' : '✕'}</span>
            <span>연속/쉬운 패턴 없음</span>
          </div>
        </div>

        {/* 개선 피드백 메시지 */}
        <div className="feedback-box">
          <div className="feedback-title">💡 보안 개선 권장사항:</div>
          <ul className="feedback-list">
            {strength.feedback.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>

        {/* k-익명성 유출 확인 영역 */}
        <div className="pwned-check-section">
          <div className="pwned-action-row">
            <button
              type="button"
              className="btn btn-primary check-pwned-btn"
              onClick={handleCheckPwned}
              disabled={isCheckingPwned || !password}
            >
              {isCheckingPwned ? (
                <>
                  <span className="spinner"></span> HIBP 유출 내역 조회 중...
                </>
              ) : (
                '🛡️ k-익명성 유출 여부 확인'
              )}
            </button>
            <span className="k-anonymity-tag">최소 전송(5글자 해시) 원칙 준수</span>
          </div>

          {/* 에러 상태 안내 */}
          {pwnedError && (
            <div className="result-banner result-error">
              <strong>조회 오류:</strong> {pwnedError}
            </div>
          )}

          {/* 유출 검사 결과 */}
          {pwnedResult && (
            <div
              className={`result-banner ${
                pwnedResult.breached ? 'result-breached' : 'result-safe'
              }`}
            >
              {pwnedResult.breached ? (
                <div>
                  <div className="result-title">
                    🚨 <strong>위험: 과거 해킹 사고로 유출된 비밀번호입니다!</strong>
                  </div>
                  <p className="result-detail">
                    Have I Been Pwned 데이터베이스에 총{' '}
                    <span className="breach-count">
                      {pwnedResult.count.toLocaleString()}회
                    </span>{' '}
                    유출된 기록이 있습니다. 다른 계정에서도 즉시 사용을 중단하고 새 비밀번호로 교체하세요.
                  </p>
                  <p className="result-k-note">
                    (검증 원리: SHA-1 접두사 <code>{pwnedResult.prefix}</code>만 전송 후 브라우저에서 대조)
                  </p>
                </div>
              ) : (
                <div>
                  <div className="result-title">
                    🛡️ <strong>안전: 유출 데이터베이스에서 발견되지 않았습니다.</strong>
                  </div>
                  <p className="result-detail">
                    Have I Been Pwned 데이터베이스(10억 건 이상) 내에 일치하는 유출 기록이 없습니다.
                  </p>
                  <p className="result-k-note">
                    (검증 원리: SHA-1 접두사 <code>{pwnedResult.prefix}</code>만 전송 후 브라우저에서 대조 완료)
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
