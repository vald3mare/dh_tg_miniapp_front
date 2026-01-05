import './ServicesPage.css';
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fallbackServices = [
    {
      id: 1,
      title: 'Выгул собаки',
      description: 'Профессиональный выгул с фотоотчётом',
      icon: '🐕',
      basePrice: 299,
    },
    {
      id: 2,
      title: 'Груминг',
      description: 'Полный уход за внешностью питомца',
      icon: '✂️',
      basePrice: 899,
    },
    {
      id: 3,
      title: 'Ветеринарная консультация',
      description: 'Онлайн консультация с ветеринаром',
      icon: '🏥',
      basePrice: 499,
    },
    {
      id: 4,
      title: 'Питание и добавки',
      description: 'Подбор качественного корма и витаминов',
      icon: '🥗',
      basePrice: 599,
    },
  ];

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        const data = await api.getServices();
        setServices(data || fallbackServices);
      } catch (error) {
        console.log('Используются тестовые услуги:', error.message);
        setServices(fallbackServices);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  return (
    <div className="services-page">
      <div className="services-header">
        <h1>Наши услуги</h1>
        <p>Всё для здоровья и счастья вашего питомца</p>
      </div>

      <div className="services-grid">
        {loading ? (
          <div className="loading">Загрузка услуг...</div>
        ) : (
          services.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <p className="service-price">{service.basePrice}₽</p>
              <button className="service-button">Подробнее</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}