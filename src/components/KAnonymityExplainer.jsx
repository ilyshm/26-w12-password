export default function KAnonymityExplainer() {
  return (
    <div className="card explainer-card">
      <div className="card-header">
        <div className="card-title-group">
          <span className="card-icon">🔐</span>
          <div>
            <h3 className="card-title">사이버보안 원리: k-익명성(k-Anonymity)이란?</h3>
            <p className="card-subtitle">
              비밀번호 원문이나 전체 해시를 외부에 유출하지 않고 안전하게 조회하는 기술
            </p>
          </div>
        </div>
      </div>

      <div className="card-body">
        <div className="flow-steps">
          <div className="flow-step">
            <div className="flow-step-number">1</div>
            <div className="flow-step-content">
              <strong>브라우저 내부 SHA-1 계산</strong>
              <p>
                입력된 비밀번호는 브라우저 내부 Web Crypto API(<code>crypto.subtle.digest</code>)를 통해 40자리 해시값으로 변환됩니다.
              </p>
            </div>
          </div>

          <div className="flow-step">
            <div className="flow-step-number">2</div>
            <div className="flow-step-content">
              <strong>최소 전송: 접두사 5글자만 API 요청</strong>
              <p>
                40자리 해시 중 <strong>앞 5자리(예: 5BAA6)</strong>만 HIBP Range API(<code>https://api.pwnedpasswords.com/range/5BAA6</code>)로 보냅니다.
              </p>
            </div>
          </div>

          <div className="flow-step">
            <div className="flow-step-number">3</div>
            <div className="flow-step-content">
              <strong>서버의 익명화 그룹 반환</strong>
              <p>
                서버는 5자리로 시작하는 수백~수천 개의 유출 해시 목록(뒤 35자리:횟수)을 반환합니다. 서버는 사용자가 이 중 어떤 것을 찾는지 전혀 알 수 없습니다.
              </p>
            </div>
          </div>

          <div className="flow-step">
            <div className="flow-step-number">4</div>
            <div className="flow-step-content">
              <strong>브라우저 내부 대조 및 결과 도출</strong>
              <p>
                브라우저가 내려받은 목록에서 내 해시의 뒤 35자리(대문자)를 대조하여 최종 유출 횟수를 사용자 화면에만 표시합니다.
              </p>
            </div>
          </div>
        </div>

        <div className="explainer-footer">
          <div className="footer-badge">
            <span>🛡️ 무전송 원칙 vs 최소 전송 원칙: 비밀번호 원문은 네트워크에 1바이트도 실리지 않습니다.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
