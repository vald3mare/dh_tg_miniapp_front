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
        console.log('🚀 === ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ===');
        
        // 1️⃣ Инициализируем Telegram WebApp
        if (window.Telegram?.WebApp) {
          console.log('✅ Telegram WebApp доступен');
          window.Telegram.WebApp.ready();
          window.Telegram.WebApp.expand();
          console.log('✅ Telegram WebApp инициализирован и развернут');
        } else {
          console.warn('⚠️  Telegram WebApp НЕ доступен (VPN, разработка или не Telegram)');
        }

        // 2️⃣ Проверяем есть ли уже authToken и userId
        const existingToken = localStorage.getItem('authToken');
        const existingUserId = localStorage.getItem('userId');

        console.log('🔍 Проверка localStorage:', {
          hasToken: !!existingToken,
          hasUserId: !!existingUserId,
          userId: existingUserId,
        });

        if (existingToken && existingUserId) {
          console.log('✅ Токен найден в localStorage, используем существующего пользователя');
          setIsAuthenticated(true);
          setIsAuthLoading(false);
          return;
        }

        // 3️⃣ Получаем initData из Telegram (если доступна)
        const initData = window.Telegram?.WebApp?.initData;
        console.log('📋 initData доступна:', !!initData);
        
        if (initData) {
          console.log('📋 initData длина:', initData.length);
          console.log('📋 initData preview:', initData.substring(0, 100) + '...');
        }

        if (initData) {
          // 4️⃣ Есть initData - отправляем на login
          console.log('🔐 ПОПЫТКА LOGIN: Отправляем initData на бэкенд...');
          try {
            const loginResponse = await api.login(initData);
            
            console.log('📨 LOGIN RESPONSE получен:', {
              hasToken: !!loginResponse?.token,
              hasUser: !!loginResponse?.user,
              userId: loginResponse?.user?.id,
            });

            if (loginResponse?.token && loginResponse?.user?.id) {
              console.log('✅ LOGIN УСПЕШЕН! userId:', loginResponse.user.id);
              localStorage.setItem('authToken', loginResponse.token);
              localStorage.setItem('userId', loginResponse.user.id);
              console.log('💾 Данные сохранены в localStorage');
              setIsAuthenticated(true);
            } else {
              throw new Error('Ответ от login не содержит требуемые данные');
            }
          } catch (loginError) {
            console.error('❌ LOGIN ОШИБКА:', loginError.message);
            console.log('📱 FALLBACK: Создаем тестового пользователя');
            
            // Fallback: создаем временного пользователя для тестирования
            // Используем правильный UUID v4 формат
            const testUserId = generateUUID();
            console.log('🎲 Сгенерирован UUID:', testUserId);
            console.log('✅ UUID длина:', testUserId.length);
            console.log('✅ UUID валиден:', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(testUserId));
            
            localStorage.setItem('userId', testUserId);
            localStorage.setItem('authToken', 'test-token-' + generateUUID());
            localStorage.setItem('telegramTest', 'true');
            
            console.log('✅ FALLBACK пользователь создан:', testUserId);
            console.log('💾 Данные сохранены в localStorage');
            console.log('📊 Проверка localStorage:', {
              userId: localStorage.getItem('userId'),
              userIdLength: localStorage.getItem('userId')?.length,
            });
            setIsAuthenticated(true);
          }
        } else {
          // Нет initData (VPN или не Telegram)
          console.warn('⚠️  initData недоступна - режим разработки');
          console.log('📝 Создаем тестового пользователя для разработки...');
          
          // Используем правильный UUID v4 формат
          const testUserId = generateUUID();
          console.log('🎲 Сгенерирован UUID:', testUserId);
          console.log('✅ UUID длина:', testUserId.length);
          console.log('✅ UUID валиден:', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(testUserId));
          
          localStorage.setItem('userId', testUserId);
          localStorage.setItem('authToken', 'test-token-' + generateUUID());
          localStorage.setItem('telegramTest', 'true');
          
          console.log('✅ Тестовый пользователь создан:', testUserId);
          console.log('💾 Данные сохранены в localStorage');
          console.log('📊 Проверка localStorage:', {
            userId: localStorage.getItem('userId'),
            userIdLength: localStorage.getItem('userId')?.length,
          });
          setIsAuthenticated(true);
        }

      } catch (error) {
        console.error('❌ КРИТИЧЕСКАЯ ОШИБКА при инициализации:', error);
        
        // Даже при критической ошибке создаем fallback пользователя
        // Используем правильный UUID v4 формат
        const testUserId = generateUUID();
        console.log('🎲 Сгенерирован UUID (критическая ошибка):', testUserId);
        console.log('✅ UUID длина:', testUserId.length);
        console.log('✅ UUID валиден:', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(testUserId));
        
        localStorage.setItem('userId', testUserId);
        localStorage.setItem('authToken', 'test-token-' + generateUUID());
        localStorage.setItem('telegramTest', 'true');
        
        console.warn('⚠️  FALLBACK пользователь создан из-за ошибки:', testUserId);
        setIsAuthenticated(true);
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