import './ProfilePage.css';
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function ProfilePage() {
  // Тестовые данные
  const testUserData = {
    id: 'test-user-123',
    name: 'Иван Петров',
    email: 'ivan@example.com',
    phone: '+7 (999) 123-45-67',
    avatar: 'ИП',
    subscriptionPlan: 'premium',
    subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  };

  // Попытка получить данные из Telegram
  const getTelegramUser = () => {
    try {
      const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
      if (telegramUser) {
        return {
          name: `${telegramUser.first_name || ''} ${telegramUser.last_name || ''}`.trim(),
          email: telegramUser.username ? `@${telegramUser.username}` : 'Не указана',
          phone: 'Не указан',
          avatar: (telegramUser.first_name?.[0] || 'П') + (telegramUser.last_name?.[0] || 'П'),
        };
      }
    } catch (error) {
      console.log('Telegram данные недоступны, используются тестовые значения');
    }
    return null;
  };

  const [userInfo, setUserInfo] = useState({
    ...testUserData,
    ...(getTelegramUser() || {}),
    pets: [],
  });

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузить профиль и данные
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem('userId') || testUserData.id;

        // Загрузить профиль
        const userProfile = await api.getProfile(userId);
        setUserInfo((prev) => ({
          ...prev,
          ...userProfile,
        }));

        // Загрузить питомцев
        const pets = await api.getPets(userId);
        setUserInfo((prev) => ({
          ...prev,
          pets: pets || [],
        }));

        // Загрузить историю операций
        const userOrders = await api.getOrders(userId);
        setOrders(userOrders || []);
      } catch (err) {
        console.log('Используются тестовые данные:', err.message);
        setUserInfo((prev) => ({
          ...prev,
          pets: [
            { id: 1, name: 'Макс', breed: 'Лабрадор', age: 3 },
            { id: 2, name: 'Лайки', breed: 'Хаски', age: 2 },
          ],
        }));
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Мой профиль</h1>
      </div>

      <div className="profile-container">
        {loading ? (
          <div className="loading">Загрузка профиля...</div>
        ) : error ? (
          <div className="error">Ошибка загрузки данных</div>
        ) : (
          <>
            {/* Информация пользователя */}
            <div className="profile-card">
              <div className="avatar">
                <span>{userInfo.avatar}</span>
              </div>
              <div className="user-info">
                <h2>{userInfo.name}</h2>
                <p className="email">{userInfo.email}</p>
                <p className="phone">{userInfo.phone}</p>
              </div>
              <button className="edit-button">Редактировать</button>
            </div>

            {/* Питомцы */}
            <div className="pets-section">
              <h3>Мои питомцы</h3>
              <div className="pets-list">
                {userInfo.pets && userInfo.pets.length > 0 ? (
                  userInfo.pets.map((pet) => (
                    <div key={pet.id} className="pet-card">
                      <div className="pet-icon">🐕</div>
                      <div className="pet-info">
                        <h4>{pet.name}</h4>
                        <p>{pet.breed}</p>
                        <p className="age">{pet.age} лет</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-pets">Питомцев нет</p>
                )}
              </div>
              <button className="add-pet-button">+ Добавить питомца</button>
            </div>

            {/* Подписка */}
            <div className="subscription-section">
              <h3>Подписка</h3>
              <div className="subscription-card">
                <p className="plan">
                  План: <strong>{userInfo.subscriptionPlan?.toUpperCase() || 'free'}</strong>
                </p>
                <p className="expires">
                  Действует до:{' '}
                  <strong>
                    {userInfo.subscriptionExpiresAt
                      ? new Date(userInfo.subscriptionExpiresAt).toLocaleDateString('ru-RU')
                      : 'Не активна'}
                  </strong>
                </p>
                <button className="change-plan-button">Изменить план</button>
              </div>
            </div>

            {/* История операций */}
            <div className="history-section">
              <h3>История</h3>
              {orders && orders.length > 0 ? (
                orders.map((order) => (
                  <div key={order.id} className="history-item">
                    <span className="history-label">{order.description}</span>
                    <span className="history-date">
                      {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                    </span>
                    <span className="history-price">-{order.amount}₽</span>
                  </div>
                ))
              ) : (
                <p className="no-orders">Заказов нет</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}