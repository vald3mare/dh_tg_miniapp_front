import './NavigationBar.css';
import { useState } from 'react';
import HomeIcon from '@mui/icons-material/Home';
import PetsIcon from '@mui/icons-material/Pets';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PersonIcon from '@mui/icons-material/Person';

export default function NavigationBar({ active, onNavigate }) {
  const [pressed, setPressed] = useState(null);

  const handlePress = (item) => {
    setPressed(item);
    if (onNavigate) {
      onNavigate(item);
    }
    setTimeout(() => setPressed(null), 300);
  };

  return (
    <div className="nav-bar">
      <div 
        className={`nav-item ${active === 'home' ? 'active' : ''} ${pressed === 'home' ? 'pressed' : ''}`}
        onClick={() => handlePress('home')}
        role="button"
        tabIndex="0"
      >
        <HomeIcon />
        <span>Главная</span>
      </div>
      <div 
        className={`nav-item ${active === 'services' ? 'active' : ''} ${pressed === 'services' ? 'pressed' : ''}`}
        onClick={() => handlePress('services')}
        role="button"
        tabIndex="0"
      >
        <PetsIcon />
        <span>Услуги</span>
      </div>
      <div 
        className={`nav-item ${active === 'tariffs' ? 'active' : ''} ${pressed === 'tariffs' ? 'pressed' : ''}`}
        onClick={() => handlePress('tariffs')}
        role="button"
        tabIndex="0"
      >
        <CreditCardIcon />
        <span>Тарифы</span>
      </div>
      <div 
        className={`nav-item ${active === 'profile' ? 'active' : ''} ${pressed === 'profile' ? 'pressed' : ''}`}
        onClick={() => handlePress('profile')}
        role="button"
        tabIndex="0"
      >
        <PersonIcon />
        <span>Профиль</span>
      </div>
    </div>
  );
}