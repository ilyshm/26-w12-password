import { useState } from 'react';
import PasswordCheckerCard from './components/PasswordCheckerCard';
import PasswordGeneratorCard from './components/PasswordGeneratorCard';
import KAnonymityExplainer from './components/KAnonymityExplainer';
import './App.css';

function App() {
  const [password, setPassword] = useState('');
  const [notification, setNotification] = useState('');

  const handleInspectGeneratedPassword = (generatedPwd) => {
    setPassword(generatedPwd);
    setNotification('⚡ 생성된 비밀번호가 점검창에 적용되었습니다.');
    setTimeout(() => setNotification(''), 3000);
  };

  return (
    <div className="dashboard-container">
      {/* 글로벌 상단 헤더 */}
      <header className="dashboard-header">
        <div className="header-badge-row">
          <span className="badge badge-cyber">CYBERSECURITY LAB</span>
          <span className="badge badge-neutral">k-Anonymity Engine</span>
          <span className="badge badge-success">Zero Storage Policy</span>
        </div>
        <h1 className="header-title">
          <span className="gradient-text">비밀번호 보안 점검 대시보드</span>
        </h1>
        <p className="header-description">
          암호학적 난수 생성(CSPRNG), 브라우저 내부 실시간 강도 분석,
          그리고 k-익명성(최소 전송 원칙) 기반 유출 점검을 한곳에서 제공합니다.
        </p>

        {notification && (
          <div className="toast-notification" role="status">
            {notification}
          </div>
        )}
      </header>

      {/* 대시보드 2단 반응형 그리드 */}
      <main className="dashboard-grid">
        <section className="grid-column primary-column">
          <PasswordCheckerCard
            password={password}
            onPasswordChange={setPassword}
          />
        </section>

        <section className="grid-column secondary-column">
          <PasswordGeneratorCard
            onInspectPassword={handleInspectGeneratedPassword}
          />
          <KAnonymityExplainer />
        </section>
      </main>

      {/* 하단 푸터 */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-left">
            <span className="footer-title">🛡️ CyberGuard Security Principles</span>
            <p className="footer-text">
              본 시스템은 브라우저 내 Web Crypto API를 사용하여 동작하며, 입력된 비밀번호는
              서버나 로컬 저장소에 절대 저장되지 않습니다. 유출 확인 시에는 SHA-1 해시의 앞 5글자만 안전하게 전송됩니다.
            </p>
          </div>
          <div className="footer-right">
            <span>Course: 26-w12-password</span>
            <span>Security Engineering</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
