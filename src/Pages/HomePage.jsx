import './HomePage.css';
import NavigationBar from '../Components/NavigationBar';

export default function HomePage() {
  // TODO: Заполнить реальными данными об услугах
  // TODO: Реализовать интеграцию с Telegram для запуска пробного периода
  // Обработчик для кнопки "Попробовать бесплатно"
  const handleTrial = () => {
    // TODO: Добавить логику запуска пробного периода
    // Варианты:
    // 1. Перенаправить в Telegram бота
    // 2. Открыть модальное окно для ввода данных
    // 3. Создать订单 в БД с бесплатным тарифом на 7 дней
    
    try {
      const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
      if (telegramUser) {
        console.log('Пользователь Telegram:', telegramUser);
        // TODO: Отправить запрос на бэк для создания пробного периода
        // const response = await api.createTrialSubscription(telegramUser.id);
        alert('Спасибо! 7-дневный пробный период активирован');
      } else {
        alert('Пожалуйста, откройте приложение через Telegram');
      }
    } catch (error) {
      console.log('Ошибка при активации пробного периода:', error);
      // TODO: Показать красивое сообщение об ошибке
      alert('Не удалось активировать пробный период');
    }
  };

  return (
    <div className="home-page">
      {/* ВЕРХНЯЯ ПЛАШКА С ЛОГОТИПОМ */}
      <div className="top-bar animate-fade-in-down">
        {/* TODO: Убедитесь что файл /public/images/Logo.svg существует */}
        <img src="/images/Logo.svg" alt="Логотип" className="logo-image" />
        
        {/* Текст брендинга */}
        <span className="logo-text">СОБАЧЬЕ СЧАСТЬЕ</span>
      </div>

      {/* ГЛАВНЫЙ СИНИЙ БЛОК */}
      <div className="main-content">
        {/* КОНТЕЙНЕР ОБЛАЧКА — центр по горизонтали и вертикали */}
        <div className="cloud-container animate-fade-in-up">
          {/* TODO: Убедитесь что файл /public/images/Cloud.svg существует */}
          <img src="/images/Cloud.svg" alt="Облачко" className="cloud-image" />

          {/* Контент внутри облачка */}
          <div className="cloud-content">
            {/* Заголовок с уникальным УТП */}
            <h1>
              МЫ ЗАБОТИМСЯ О ВАШЕМ <span className="accent">ПИТОМЦЕ</span>
            </h1>
            
            {/* Подзаголовок с описанием услуги */}
            <p>
              Сервис, где вы точно знаете, кому доверяете своего питомца. 
              Вся забота о вашем любимце — в удобном Telegram-боте
            </p>
            
            {/* Кнопка для активации пробного периода */}
            {/* TODO: Добавить обработчик onClick для активации 7-дневного пробного периода */}
            <button className="trial-button" onClick={handleTrial}>
              Попробовать бесплатно 7 дней
            </button>
          </div>
        </div>

        {/* НИЖНИЙ ДУДЛ */}
        <div className="drawing-container animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {/* TODO: Убедитесь что файл /public/images/Doudle.svg существует */}
          <img src="/images/Doudle.svg" alt="Рисунок" className="dog-drawing" />
        </div>
      </div>

      {/* НИЖНЯЯ НАВИГАЦИЯ */}
    </div>
  );
}