import './App.css';
import { useState, useEffect } from 'react';
import HomePage from './Pages/HomePage';
import ServicesPage from './Pages/ServicesPage';
import TariffsPage from './Pages/TariffsPage';
import ProfilePage from './Pages/ProfilePage';
import NavigationBar from './Components/NavigationBar';
import api from './services/api';
import { init, initData } from '@telegram-apps/sdk';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [telegramUser, setTelegramUser] = useState(null);

  useEffect(() => {
    const initializeTelegramApp = async () => {
      try {
        console.log('🚀 === ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ===');
        
        // 1️⃣ Инициализируем Telegram SDK
        try {
          await init();
          console.log('✅ Telegram SDK инициализирован');
          window.dispatchEvent(new Event('miniAppReady'));
        } catch (sdkError) {
          console.warn('⚠️  Telegram SDK инициализация ошибка (возможно VPN):', sdkError.message);
        }

        // 2️⃣ Получаем данные пользователя из Telegram
        try {
          initData.restore();
          const user = initData.user();
          
          if (user) {
            console.log('✅ Данные Telegram пользователя получены:', {
              id: user.id,
              firstName: user.first_name,
              lastName: user.last_name,
              username: user.username,
              isPremium: user.is_premium,
            });
            
            setTelegramUser(user);
            window.telegramUser = user;
            
            // Сохраняем в localStorage как userId
            localStorage.setItem('userId', user.id.toString());
            localStorage.setItem('telegramId', user.id.toString());
            localStorage.setItem('telegramVerified', 'true');
            console.log('💾 Telegram данные сохранены в localStorage');
            
            setIsAuthenticated(true);
          } else {
            console.warn('⚠️  Telegram данные недоступны (не в Telegram или VPN)');
            // Fallback для разработки
            throw new Error('Telegram user data not available');
          }
        } catch (telegramError) {
          console.warn('⚠️  Не удалось получить Telegram данные:', telegramError.message);
          console.log('📝 Используем fallback пользователя для разработки...');
          
          // Fallback - создаем тестового пользователя
          const testUserId = 'dev-' + Math.random().toString(36).substring(7);
          localStorage.setItem('userId', testUserId);
          localStorage.setItem('telegramTest', 'true');
          
          console.log('✅ Fallback пользователь создан:', testUserId);
          setIsAuthenticated(true);
        }

      } catch (error) {
        console.error('❌ КРИТИЧЕСКАЯ ОШИБКА при инициализации:', error);
        setIsAuthenticated(true); // Даже при ошибке продолжаем работу
      } finally {
        setIsAuthLoading(false);
        console.log('🚀 === ИНИЦИАЛИЗАЦИЯ ЗАВЕРШЕНА ===\n');
      }
    };

    initializeTelegramApp();
  }, []);

  const renderPage = () => {
    if (isAuthLoading) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#f5f9ff',
        }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '18px', color: '#476CEE', fontFamily: 'Bartina' }}>
              ⏳ Загрузка приложения...
            </p>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'services':
        return <ServicesPage />;
      case 'tariffs':
        return <TariffsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="app">
      {isAuthenticated && renderPage()}
      {isAuthenticated && (
        <div className="nav-wrapper">
          <NavigationBar active={currentPage} onNavigate={setCurrentPage} />
        </div>
      )}
    </div>
  );
}

export default App;