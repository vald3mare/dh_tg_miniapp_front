import './ProfilePage.css';
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function ProfilePage() {
  // Тестовые данные по умолчанию
  const testUserData = {
    id: 'test-user-123',
    name: 'Иван Петров',
    email: 'ivan@example.com',
    phone: '+7 (999) 123-45-67',
    avatar: 'ИП',
    subscriptionPlan: 'premium',
    subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  };

  // TODO: Получить данные пользователя из Telegram
  // Попытка получить данные из Telegram WebApp
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
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [showAddPetForm, setShowAddPetForm] = useState(false);
  const [newPet, setNewPet] = useState({ name: '', breed: '', age: '' });

  // Загрузить профиль и данные при монтировании компонента
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem('userId') || testUserData.id;

        // Загрузить профиль пользователя
        const userProfile = await api.getProfile(userId);
        setUserInfo((prev) => ({
          ...prev,
          ...userProfile,
        }));
        setEditForm(userProfile);

        // Загрузить список питомцев
        const pets = await api.getPets(userId);
        setUserInfo((prev) => ({
          ...prev,
          pets: pets || [],
        }));

        // Загрузить историю заказов
        const userOrders = await api.getOrders(userId);
        setOrders(userOrders || []);
      } catch (err) {
        console.log('Ошибка загрузки профиля:', err.message);
        // TODO: Обработать ошибку подключения к API
        setError('Не удалось загрузить данные профиля');
        // Используем тестовые данные если API недоступен
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

  // TODO: Обновить профиль пользователя
  // Функция для сохранения отредактированных данных
  const handleEditProfile = async () => {
    try {
      const userId = localStorage.getItem('userId') || testUserData.id;
      const updatedUser = await api.updateProfile(userId, editForm);
      setUserInfo((prev) => ({
        ...prev,
        ...updatedUser,
      }));
      setIsEditing(false);
      // TODO: Показать тост уведомление "Профиль обновлён"
      console.log('Профиль успешно обновлён');
    } catch (err) {
      console.log('Ошибка при обновлении профиля:', err.message);
      // TODO: Показать сообщение об ошибке
      alert('Не удалось обновить профиль');
    }
  };

  // TODO: Добавить нового питомца
  // Функция для добавления питомца
  const handleAddPet = async () => {
    try {
      if (!newPet.name || !newPet.breed || !newPet.age) {
        alert('Пожалуйста, заполните все поля');
        return;
      }

      const userId = localStorage.getItem('userId') || testUserData.id;
      const createdPet = await api.createPet({
        ...newPet,
        userId,
        age: parseInt(newPet.age),
      });

      setUserInfo((prev) => ({
        ...prev,
        pets: [...prev.pets, createdPet],
      }));

      setNewPet({ name: '', breed: '', age: '' });
      setShowAddPetForm(false);
      // TODO: Показать тост уведомление "Питомец добавлен"
      console.log('Питомец успешно добавлен');
    } catch (err) {
      console.log('Ошибка при добавлении питомца:', err.message);
      // TODO: Показать сообщение об ошибке
      alert('Не удалось добавить питомца');
    }
  };

  // TODO: Удалить питомца
  // Функция для удаления питомца
  const handleDeletePet = async (petId) => {
    try {
      if (!confirm('Вы уверены?')) return;

      await api.deletePet(petId);
      setUserInfo((prev) => ({
        ...prev,
        pets: prev.pets.filter((p) => p.id !== petId),
      }));
      // TODO: Показать тост уведомление "Питомец удалён"
      console.log('Питомец удален');
    } catch (err) {
      console.log('Ошибка при удалении питомца:', err.message);
      alert('Не удалось удалить питомца');
    }
  };

  // TODO: Управление подпиской (изменение тарифа)
  const handleChangePlan = () => {
    // TODO: Перейти на страницу тарифов или открыть модальное окно
    console.log('Переход на изменение плана подписки');
    // window.location.href = '/tariffs';
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Мой профиль</h1>
      </div>

      <div className="profile-container">
        {loading ? (
          <div className="loading">Загрузка профиля...</div>
        ) : (
          <>
            {/* Информация пользователя */}
            <div className="profile-card">
              <div className="avatar">
                <span>{userInfo.avatar}</span>
              </div>
              {!isEditing ? (
                <>
                  <div className="user-info">
                    <h2>{userInfo.name}</h2>
                    <p className="email">{userInfo.email}</p>
                    <p className="phone">{userInfo.phone}</p>
                  </div>
                  <button className="edit-button" onClick={() => setIsEditing(true)}>
                    Редактировать
                  </button>
                </>
              ) : (
                <>
                  {/* TODO: Форма редактирования профиля - сделать UI для редактирования полей */}
                  <div className="edit-form">
                    <input
                      type="text"
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="Имя"
                    />
                    <input
                      type="email"
                      value={editForm.email || ''}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      placeholder="Email"
                    />
                    <input
                      type="tel"
                      value={editForm.phone || ''}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="Телефон"
                    />
                    <button onClick={handleEditProfile}>Сохранить</button>
                    <button onClick={() => setIsEditing(false)}>Отмена</button>
                  </div>
                </>
              )}
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
                      {/* TODO: Добавить кнопки редактирования и удаления питомца */}
                      <button
                        className="delete-pet-button"
                        onClick={() => handleDeletePet(pet.id)}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="no-pets">Питомцев нет</p>
                )}
              </div>

              {/* TODO: Оформить UI для добавления питомца (форма в модальном окне или раскрывающейся секции) */}
              {!showAddPetForm ? (
                <button className="add-pet-button" onClick={() => setShowAddPetForm(true)}>
                  + Добавить питомца
                </button>
              ) : (
                <div className="add-pet-form">
                  <input
                    type="text"
                    value={newPet.name}
                    onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                    placeholder="Имя питомца"
                  />
                  <input
                    type="text"
                    value={newPet.breed}
                    onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })}
                    placeholder="Порода"
                  />
                  <input
                    type="number"
                    value={newPet.age}
                    onChange={(e) => setNewPet({ ...newPet, age: e.target.value })}
                    placeholder="Возраст (в годах)"
                  />
                  <button onClick={handleAddPet}>Добавить</button>
                  <button onClick={() => setShowAddPetForm(false)}>Отмена</button>
                </div>
              )}
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
                {/* TODO: Добавить функционал изменения плана подписки */}
                <button className="change-plan-button" onClick={handleChangePlan}>
                  Изменить план
                </button>
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