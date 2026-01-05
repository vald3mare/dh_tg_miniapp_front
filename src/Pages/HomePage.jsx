import './HomePage.css';
import NavigationBar from '../Components/NavigationBar';

export default function HomePage() {
  return (
    <div className="home-page">
      {/* ВЕРХНЯЯ ПЛАШКА С ЛОГОТИПОМ */}
      <div className="top-bar animate-fade-in-down">
        {/* ← СЮДА ТВОЙ SVG-ЛОГОТИП */}
        <img src="/images/Logo.svg" alt="Логотип" className="logo-image" />
        
        {/* Текст с Bartina */}
        <span className="logo-text">СОБАЧЬЕ СЧАСТЬЕ</span>
      </div>

      {/* ГЛАВНЫЙ СИНИЙ БЛОК */}
      <div className="main-content">
        {/* КОНТЕЙНЕР ОБЛАЧКА — центр по горизонтали и вертикали */}
        <div className="cloud-container animate-fade-in-up">
          {/* ← СЮДА ТВОЁ ОБЛАЧКО (325x262 px) */}
          <img src="/images/Cloud.svg" alt="Облачко" className="cloud-image" />

          {/* Контент внутри облачка */}
          <div className="cloud-content">
            {/* Заголовок с Bartina Bold */}
            <h1>
              МЫ ЗАБОТИМСЯ О ВАШЕМ <span className="accent">ПИТОМЦЕ</span>
            </h1>
            
            {/* Подзаголовок */}
            <p>
              Сервис, где вы точно знаете, кому доверяете своего питомца. 
              Вся забота о вашем любимце — в удобном Telegram-боте
            </p>
            
            {/* Кнопка с Manrope Bold */}
            <button className="trial-button">
              Попробовать бесплатно 7 дней
            </button>
          </div>
        </div>

        {/* НИЖНИЙ ДУДЛ */}
        <div className="drawing-container animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {/* ← СЮДА ТВОЙ РИСУНОК СОБАКИ С ЧЕЛОВЕКОМ */}
          <img src="/images/Doudle.svg" alt="Рисунок" className="dog-drawing" />
        </div>
      </div>

      {/* НИЖНЯЯ НАВИГАЦИЯ */}
    </div>
  );
}