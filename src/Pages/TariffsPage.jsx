import './TariffsPage.css';
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function TariffsPage() {
  const [tariffs, setTariffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTariff, setSelectedTariff] = useState(null);

  const fallbackTariffs = [
    {
      id: 1,
      name: 'Базовый',
      monthlyPrice: 499,
      features: [
        '2 выгула в неделю',
        'Еженедельный отчёт',
        'Поддержка 24/7',
      ],
      isPopular: false,
    },
    {
      id: 2,
      name: 'Премиум',
      monthlyPrice: 1299,
      features: [
        'Ежедневный выгул',
        'Ежедневный фотоотчёт',
        'Консультации ветеринара',
        'Приоритетная поддержка',
      ],
      isPopular: true,
    },
    {
      id: 3,
      name: 'VIP',
      monthlyPrice: 2499,
      features: [
        'Неограниченные услуги',
        'Персональный менеджер',
        'Экстренный выезд',
        'Видео-отчёты HD',
      ],
      isPopular: false,
    },
  ];

  useEffect(() => {
    const loadTariffs = async () => {
      try {
        setLoading(true);
        const data = await api.getTariffs();
        setTariffs(data || fallbackTariffs);
      } catch (error) {
        console.log('Используются тестовые тарифы:', error.message);
        setTariffs(fallbackTariffs);
      } finally {
        setLoading(false);
      }
    };

    loadTariffs();
  }, []);

  const handleSelectTariff = async (tariff) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        alert('Пожалуйста, авторизуйтесь');
        return;
      }

      // Создать платёж
      const payment = await api.createPayment(userId, tariff.id, tariff.monthlyPrice);
      
      // Редирект на Юкассу
      if (payment.confirmationUrl) {
        window.location.href = payment.confirmationUrl;
      }
    } catch (error) {
      alert('Ошибка: ' + error.message);
    }
  };

  return (
    <div className="tariffs-page">
      <div className="tariffs-header">
        <h1>Тарифные планы</h1>
        <p>Выберите подходящий вариант для вас</p>
      </div>

      <div className="tariffs-grid">
        {loading ? (
          <div className="loading">Загрузка тарифов...</div>
        ) : (
          tariffs.map((tariff) => (
            <div
              key={tariff.id}
              className={`tariff-card ${tariff.isPopular ? 'highlight' : ''}`}
            >
              <h3>{tariff.name}</h3>
              <div className="price">
                <span className="amount">{tariff.monthlyPrice}₽</span>
                <span className="period">/месяц</span>
              </div>
              <ul className="features">
                {tariff.features.map((feature, idx) => (
                  <li key={idx}>✓ {feature}</li>
                ))}
              </ul>
              <button
                className={`select-button ${tariff.isPopular ? 'active' : ''}`}
                onClick={() => handleSelectTariff(tariff)}
              >
                Выбрать план
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}