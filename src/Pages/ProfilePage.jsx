import './ProfilePage.css';
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function ProfilePage() {
  // ==================== СОСТОЯНИЕ ====================
  // Данные профиля пользователя
  const [userInfo, setUserInfo] = useState({
    id: null,
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    avatar: '?',
    subscriptionPlan: 'free',
    subscriptionExpiresAt: null,
    pets: [],
  });

  // История заказов и подписок
  const [orders, setOrders] = useState([]);
  
  // UI состояние
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Форма редактирования профиля (только те поля которые может изменить пользователь)
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });

  // Форма добавления питомца
  const [showAddPetForm, setShowAddPetForm] = useState(false);
  const [newPet, setNewPet] = useState({ name: '', breed: '', age: '' });

  // ==================== ПОЛУЧЕНИЕ ДАННЫХ TELEGRAM ====================
  /**
   * Получить данные пользователя из Telegram WebApp
   * ВАЖНО: Это работает только когда приложение открыто в Telegram
   */
  const getTelegramUserData = () => {
    try {
      const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
      if (telegramUser) {
        console.log('✅ Данные Telegram получены:', telegramUser);
        return {
          firstName: telegramUser.first_name || '',
          lastName: telegramUser.last_name || '',
          username: telegramUser.username,
          telegramId: telegramUser.id,
          avatar: (telegramUser.first_name?.[0] || '?') + (telegramUser.last_name?.[0] || ''),
        };
      } else {
        console.log('⚠️  Telegram данные недоступны (не открыто в Telegram)');
      }
    } catch (error) {
      console.log('❌ Ошибка при чтении Telegram данных:', error);
    }
    return null;
  };

  // ==================== ЗАГРУЗКА ПРОФИЛЯ ====================
  /**
   * Загрузить данные профиля пользователя при монтировании компонента
   * Получает существующего пользователя по ID из localStorage
   * или создает нового если необходимо
   */
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        
        // 1. Получаем сохраненный userId из localStorage
        let userId = localStorage.getItem('userId');
        console.log('🔍 userId из localStorage:', userId);

        // 2. Если userId нет, пытаемся получить из Telegram
        if (!userId) {
          const telegramData = getTelegramUserData();
          if (!telegramData) {
            throw new Error('Не удалось получить данные пользователя. Откройте приложение через Telegram.');
          }
          console.log('📱 Используем Telegram данные:', telegramData);
        }

        // 3. Если у нас есть userId - загружаем профиль
        if (userId) {
          console.log('📥 Загружаем профиль пользователя:', userId);
          const userProfile = await api.getProfile(userId);
          
          if (!userProfile) {
            throw new Error('Профиль не найден');
          }

          // Обновляем состояние с реальными данными
          const firstName = userProfile.firstName || '';
          const lastName = userProfile.lastName || '';
          
          setUserInfo({
            id: userProfile.id,
            firstName,
            lastName,
            email: userProfile.email || '',
            phoneNumber: userProfile.phoneNumber || '',
            avatar: (firstName[0] || '?') + (lastName[0] || ''),
            subscriptionPlan: userProfile.subscriptionPlan || 'free',
            subscriptionExpiresAt: userProfile.subscriptionExpiresAt,
            pets: [],
          });

          // Инициализируем editForm с реальными данными
          setEditForm({
            firstName,
            lastName,
            email: userProfile.email || '',
            phoneNumber: userProfile.phoneNumber || '',
          });

          // 4. Загружаем питомцев пользователя
          console.log('🐕 Загружаем питомцев пользователя:', userId);
          const pets = await api.getPets(userId);
          setUserInfo((prev) => ({
            ...prev,
            pets: pets || [],
          }));

          // 5. Загружаем историю заказов
          console.log('📜 Загружаем заказы пользователя:', userId);
          const userOrders = await api.getOrders(userId);
          setOrders(userOrders || []);

          console.log('✅ Профиль успешно загружен');
        }
      } catch (err) {
        console.error('❌ Ошибка при загрузке профиля:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // ==================== РЕДАКТИРОВАНИЕ ПРОФИЛЯ ====================
  /**
   * Сохранить изменения профиля на бэкенде
   * Отправляет только измененные поля
   */
  const handleEditProfile = async () => {
    try {
      if (!userInfo.id) {
        throw new Error('ID пользователя не найден');
      }

      console.log('📤 Отправляем обновление профиля:', { userId: userInfo.id, data: editForm });
      
      const updatedUser = await api.updateProfile(userInfo.id, editForm);
      console.log('✅ Профиль обновлен:', updatedUser);
      
      // Обновляем локальное состояние
      const firstName = updatedUser.firstName || '';
      const lastName = updatedUser.lastName || '';
      
      setUserInfo((prev) => ({
        ...prev,
        firstName,
        lastName,
        email: updatedUser.email || '',
        phoneNumber: updatedUser.phoneNumber || '',
        avatar: (firstName[0] || '?') + (lastName[0] || ''),
      }));
      
      setIsEditing(false);
      alert('✅ Профиль успешно обновлён!');
    } catch (err) {
      console.error('❌ Ошибка при обновлении профиля:', err);
      alert(`Не удалось обновить профиль: ${err.message}`);
    }
  };

  // ==================== УПРАВЛЕНИЕ ПИТОМЦАМИ ====================
  /**
   * Добавить нового питомца пользователя
   * Валидирует данные и отправляет на бэкенд
   */
  const handleAddPet = async () => {
    try {
      // Валидация
      if (!newPet.name.trim() || !newPet.breed.trim() || !newPet.age) {
        alert('❌ Пожалуйста, заполните все поля питомца');
        return;
      }

      if (!userInfo.id) {
        throw new Error('ID пользователя не найден');
      }

      const petData = {
        name: newPet.name.trim(),
        breed: newPet.breed.trim(),
        age: parseInt(newPet.age),
        userId: userInfo.id,
        description: '', // Опционально - может быть добавлено позже
      };

      console.log('📤 Отправляем новое животное:', petData);
      const createdPet = await api.createPet(petData);
      console.log('✅ Питомец создан:', createdPet);

      // Добавляем питомца в список
      setUserInfo((prev) => ({
        ...prev,
        pets: [...prev.pets, createdPet],
      }));

      // Очищаем форму
      setNewPet({ name: '', breed: '', age: '' });
      setShowAddPetForm(false);
      alert('✅ Питомец успешно добавлен!');
    } catch (err) {
      console.error('❌ Ошибка при добавлении питомца:', err);
      alert(`Не удалось добавить питомца: ${err.message}`);
    }
  };

  /**
   * Удалить питомца пользователя
   * Запрашивает подтверждение перед удалением
   */
  const handleDeletePet = async (petId, petName) => {
    try {
      if (!confirm(`Вы уверены что хотите удалить ${petName}?`)) {
        return;
      }

      console.log('🗑️  Удаляем питомца:', petId);
      await api.deletePet(petId);
      console.log('✅ Питомец удален');

      // Удаляем из локального списка
      setUserInfo((prev) => ({
        ...prev,
        pets: prev.pets.filter((p) => p.id !== petId),
      }));
      
      alert('✅ Питомец успешно удален!');
    } catch (err) {
      console.error('❌ Ошибка при удалении питомца:', err);
      alert(`Не удалось удалить питомца: ${err.message}`);
    }
  };

  /**
   * TODO: Управление подпиской (изменение тарифа)
   * Должно перенаправлять на страницу тарифов или открывать модальное окно
   */
  const handleChangePlan = () => {
    console.log('📋 Переход на изменение плана подписки');
    // window.location.href = '/tariffs';
    alert('Функция смены тарифа будет доступна в следующем обновлении');
  };

  // ==================== РЕНДЕРИНГ ====================
  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Мой профиль</h1>
      </div>

      <div className="profile-container">
        {loading ? (
          <div className="loading">⏳ Загрузка профиля...</div>
        ) : error ? (
          <div className="error">❌ {error}</div>
        ) : (
          <>
            {/* ========== ИНФОРМАЦИЯ ПОЛЬЗОВАТЕЛЯ ========== */}
            <div className="profile-card">
              <div className="avatar">
                <span>{userInfo.avatar}</span>
              </div>
              {!isEditing ? (
                <>
                  <div className="user-info">
                    <h2>
                      {userInfo.firstName} {userInfo.lastName}
                    </h2>
                    <p className="email">{userInfo.email || 'Email не указан'}</p>
                    <p className="phone">{userInfo.phoneNumber || 'Телефон не указан'}</p>
                  </div>
                  <button className="edit-button" onClick={() => setIsEditing(true)}>
                    ✏️ Редактировать
                  </button>
                </>
              ) : (
                <>
                  {/* Форма редактирования профиля */}
                  <div className="edit-form">
                    <input
                      type="text"
                      value={editForm.firstName || ''}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                      placeholder="Имя"
                    />
                    <input
                      type="text"
                      value={editForm.lastName || ''}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                      placeholder="Фамилия"
                    />
                    <input
                      type="email"
                      value={editForm.email || ''}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      placeholder="Email"
                    />
                    <input
                      type="tel"
                      value={editForm.phoneNumber || ''}
                      onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                      placeholder="Телефон"
                    />
                    <button onClick={handleEditProfile}>💾 Сохранить</button>
                    <button onClick={() => setIsEditing(false)}>❌ Отмена</button>
                  </div>
                </>
              )}
            </div>

            {/* ========== ПИТОМЦЫ ========== */}
            <div className="pets-section">
              <h3>🐕 Мои питомцы</h3>
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
                      <button
                        className="delete-pet-button"
                        onClick={() => handleDeletePet(pet.id, pet.name)}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="no-pets">У вас еще нет питомцев</p>
                )}
              </div>

              {/* Форма добавления питомца */}
              {!showAddPetForm ? (
                <button className="add-pet-button" onClick={() => setShowAddPetForm(true)}>
                  ➕ Добавить питомца
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
                  <button onClick={handleAddPet}>💾 Добавить</button>
                  <button onClick={() => setShowAddPetForm(false)}>❌ Отмена</button>
                </div>
              )}
            </div>

            {/* ========== ПОДПИСКА ========== */}
            <div className="subscription-section">
              <h3>💳 Подписка</h3>
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
                <button className="change-plan-button" onClick={handleChangePlan}>
                  🔄 Изменить план
                </button>
              </div>
            </div>

            {/* ========== ИСТОРИЯ ОПЕРАЦИЙ ========== */}
            <div className="history-section">
              <h3>📜 История</h3>
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
                <p className="no-orders">История операций пуста</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}