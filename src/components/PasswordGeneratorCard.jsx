import { useState } from 'react';
import { generateSecurePassword } from '../utils/passwordSecurity';

export default function PasswordGeneratorCard({ onInspectPassword }) {
  const [length, setLength] = useState(16);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNumber, setIncludeNumber] = useState(true);
  const [includeSymbol, setIncludeSymbol] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState(() =>
    generateSecurePassword({ length: 16, upper: true, lower: true, number: true, symbol: true })
  );
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    if (!includeUpper && !includeLower && !includeNumber && !includeSymbol) {
      alert('최소 1개 이상의 문자 종류를 선택해 주세요.');
      return;
    }

    const newPwd = generateSecurePassword({
      length,
      upper: includeUpper,
      lower: includeLower,
      number: includeNumber,
      symbol: includeSymbol,
    });
    setGeneratedPassword(newPwd);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!generatedPassword) return;
    try {
      await navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('클립보드 복사에 실패했습니다.');
    }
  };

  const handleInspect = () => {
    if (!generatedPassword) return;
    onInspectPassword(generatedPassword);
  };

  return (
    <div className="card generator-card">
      <div className="card-header">
        <div className="card-title-group">
          <span className="card-icon">⚡</span>
          <div>
            <h2 className="card-title">안전한 비밀번호 생성기</h2>
            <p className="card-subtitle">
              CSPRNG(암호학적 난수) 기반 안전한 무작위 비밀번호 생성
            </p>
          </div>
        </div>
      </div>

      <div className="card-body">
        {/* 생성된 비밀번호 표시 창 */}
        <div className="generated-display-wrapper">
          <div className="generated-password-display" tabIndex={0} aria-label="생성된 비밀번호">
            {generatedPassword || '생성 버튼을 누르세요'}
          </div>
          <button
            type="button"
            className={`btn copy-btn ${copied ? 'btn-copied' : 'btn-secondary'}`}
            onClick={handleCopy}
            title="클립보드에 복사"
          >
            {copied ? '✓ 복사됨!' : '📋 복사'}
          </button>
        </div>

        {/* 액션 버튼 그룹 */}
        <div className="generator-actions">
          <button
            type="button"
            className="btn btn-primary generate-btn"
            onClick={handleGenerate}
          >
            🔄 새 비밀번호 생성
          </button>
          <button
            type="button"
            className="btn btn-accent inspect-btn"
            onClick={handleInspect}
            title="이 비밀번호를 강도 및 유출 검사창으로 가져가서 검사합니다"
          >
            👉 이 비밀번호 점검하기
          </button>
        </div>

        {/* 길이 설정 슬라이더 */}
        <div className="option-group">
          <div className="slider-header">
            <label htmlFor="length-slider" className="option-label">
              비밀번호 길이
            </label>
            <span className="length-badge">{length}자</span>
          </div>
          <input
            id="length-slider"
            type="range"
            min="8"
            max="32"
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value, 10))}
            className="length-slider"
          />
          <div className="slider-hints">
            <span>최소 8자</span>
            <span>권장 16자</span>
            <span>최대 32자</span>
          </div>
        </div>

        {/* 문자 종류 체크박스 */}
        <div className="option-group">
          <span className="option-label">포함할 문자 종류</span>
          <div className="checkbox-grid">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={includeUpper}
                onChange={(e) => setIncludeUpper(e.target.checked)}
              />
              <span>대문자 (A-Z)</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={includeLower}
                onChange={(e) => setIncludeLower(e.target.checked)}
              />
              <span>소문자 (a-z)</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={includeNumber}
                onChange={(e) => setIncludeNumber(e.target.checked)}
              />
              <span>숫자 (0-9)</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={includeSymbol}
                onChange={(e) => setIncludeSymbol(e.target.checked)}
              />
              <span>특수문자 (!@#$)</span>
            </label>
          </div>
        </div>

        {/* 보안 안내 메모 */}
        <div className="security-notice-callout">
          <span className="shield-icon">🛡️</span>
          <span>
            <strong>보안 보증:</strong> 본 생성기는 의사 난수인 <code>Math.random()</code> 대신 Web Crypto 표준인 <code>crypto.getRandomValues()</code>만을 사용하여 예측 불가능한 엔트로피를 보장합니다.
          </span>
        </div>
      </div>
    </div>
  );
}
