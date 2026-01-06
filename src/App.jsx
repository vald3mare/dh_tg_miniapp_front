import './App.css';
import { useState, useEffect } from 'react';
import HomePage from './Pages/HomePage';
import ServicesPage from './Pages/ServicesPage';
import TariffsPage from './Pages/TariffsPage';
import ProfilePage from './Pages/ProfilePage';
import NavigationBar from './Components/NavigationBar';
import api from './services/api';

/**
 * Генерирует UUID v4 (случайный UUID)
 * Используется для создания ID тестовых пользователей
 * Формат: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const initializeTelegramApp = async () => {
      try {
        // 1️⃣ Инициализируем Telegram WebApp
        if (window.Telegram?.WebApp) {
          console.log('📱 Telegram WebApp инициализирован');
          window.Telegram.WebApp.ready();
          window.Telegram.WebApp.expand();
        } else {
          console.warn('⚠️  Telegram WebApp недоступен (VPN или не Telegram)');
        }

        // 2️⃣ Проверяем есть ли уже authToken и userId
        const existingToken = localStorage.getItem('authToken');
        const existingUserId = localStorage.getItem('userId');

        console.log('🔍 Проверка localStorage:', {
          hasToken: !!existingToken,
          hasUserId: !!existingUserId,
        });

        if (existingToken && existingUserId) {
          console.log('✅ Токен найден в localStorage, пропускаем login:', existingUserId);
          setIsAuthenticated(true);
          setIsAuthLoading(false);
          return;
        }

        // 3️⃣ Получаем initData из Telegram (если доступна)
        const initData = window.Telegram?.WebApp?.initData;
        console.log('📋 initData доступна:', !!initData);

        if (initData) {
          // 4️⃣ Есть initData - отправляем на login
          console.log('🔐 Отправляем initData на бэкенд для login...');
          try {
            const loginResponse = await api.login(initData);
            
            console.log('📨 Login response получен:', {
              hasToken: !!loginResponse?.token,
              hasUser: !!loginResponse?.user,
              userId: loginResponse?.user?.id,
            });

            if (loginResponse?.token && loginResponse?.user?.id) {
              console.log('✅ Login успешен! userId:', loginResponse.user.id);
              localStorage.setItem('authToken', loginResponse.token);
              localStorage.setItem('userId', loginResponse.user.id);
              console.log('💾 Данные сохранены в localStorage');
              setIsAuthenticated(true);
            } else {
              throw new Error('Ответ от login не содержит требуемые данные');
            }
          } catch (loginError) {
            console.error('❌ Ошибка при login:', loginError.message);
            console.log('📱 Используем fallback - создаем тестового пользователя');
            
            // Fallback: создаем временного пользователя для тестирования
            // Используем правильный UUID v4 формат
            const testUserId = generateUUID();
            localStorage.setItem('userId', testUserId);
            localStorage.setItem('authToken', 'test-token-' + generateUUID());
            localStorage.setItem('telegramTest', 'true');
            
            console.log('✅ Fallback пользователь создан:', testUserId);
            setIsAuthenticated(true);
          }
        } else {
          // Нет initData (VPN или не Telegram)
          console.warn('⚠️  initData недоступна');
          console.log('📝 Создаем тестового пользователя для разработки...');
          
          // Используем правильный UUID v4 формат
          const testUserId = generateUUID();
          localStorage.setItem('userId', testUserId);
          localStorage.setItem('authToken', 'test-token-' + generateUUID());
          localStorage.setItem('telegramTest', 'true');
          
          console.log('✅ Тестовый пользователь создан:', testUserId);
          setIsAuthenticated(true);
        }

      } catch (error) {
        console.error('❌ Критическая ошибка при инициализации:', error);
        
        // Даже при критической ошибке создаем fallback пользователя
        // Используем правильный UUID v4 формат
        const testUserId = generateUUID();
        localStorage.setItem('userId', testUserId);
        localStorage.setItem('authToken', 'test-token-' + generateUUID());
        localStorage.setItem('telegramTest', 'true');
        
        console.warn('⚠️  Fallback пользователь создан из-за ошибки:', testUserId);
        setIsAuthenticated(true);
      } finally {
        setIsAuthLoading(false);
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