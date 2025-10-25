import React, { useState, useMemo } from 'react';
import { FaTimes, FaSearch, FaCheck } from 'react-icons/fa';
import * as FaIcons from 'react-icons/fa';
import * as MdIcons from 'react-icons/md';
import * as IoIcons from 'react-icons/io5';
import * as HiIcons from 'react-icons/hi2';
import * as BiIcons from 'react-icons/bi';
import * as AiIcons from 'react-icons/ai';
import * as BsIcons from 'react-icons/bs';
import * as TbIcons from 'react-icons/tb';
import * as VscIcons from 'react-icons/vsc';

interface IconPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (iconName: string) => void;
  currentIcon?: string;
}

// Popular icon categories for easy browsing
const iconCategories = {
  Popular: [
    'FaUser',
    'FaUserCircle',
    'FaUserTie',
    'FaUserGraduate',
    'FaUserAstronaut',
    'FaUserNinja',
    'FaUserSecret',
    'FaUserMd',
    'FaUserCog',
    'FaUserCheck',
    'FaRobot',
    'FaGhost',
    'FaCat',
    'FaDog',
    'FaFish',
    'FaHorse',
    'FaDragon',
    'FaHeart',
    'FaStar',
    'FaGem',
    'FaCrown',
    'FaTrophy',
    'FaMedal',
    'FaAward',
    'FaRocket',
    'FaPlane',
    'FaCar',
    'FaMotorcycle',
    'FaBicycle',
    'FaShip',
    'FaGamepad',
    'FaDice',
    'FaPuzzlePiece',
    'FaChess',
    'FaChessKing',
    'FaChessQueen',
  ],
  Animals: [
    'FaCat',
    'FaDog',
    'FaFish',
    'FaHorse',
    'FaDragon',
    'FaDove',
    'FaCrow',
    'FaSpider',
    'FaBug',
    'FaFrog',
    'FaSnake',
    'FaPaw',
    'FaFeather',
    'FaEgg',
  ],
  Professions: [
    'FaUserTie',
    'FaUserGraduate',
    'FaUserMd',
    'FaUserSecret',
    'FaUserCog',
    'FaUserCheck',
    'FaUserShield',
    'FaUserGear',
    'FaUserDoctor',
    'FaUserNurse',
    'FaUserGraduate',
    'FaUserTie',
    'FaUserAstronaut',
    'FaUserNinja',
  ],
  Gaming: [
    'FaGamepad',
    'FaDice',
    'FaPuzzlePiece',
    'FaChess',
    'FaChessKing',
    'FaChessQueen',
    'FaChessRook',
    'FaChessBishop',
    'FaChessKnight',
    'FaChessPawn',
    'FaDiceD6',
    'FaDiceD20',
    'FaDiceOne',
    'FaDiceTwo',
    'FaDiceThree',
    'FaDiceFour',
    'FaDiceFive',
    'FaDiceSix',
    'FaPuzzlePiece',
    'FaPuzzlePiece',
    'FaPuzzlePiece',
  ],
  Nature: [
    'FaTree',
    'FaLeaf',
    'FaFlower',
    'FaSun',
    'FaMoon',
    'FaStar',
    'FaCloud',
    'FaCloudRain',
    'FaSnowflake',
    'FaFire',
    'FaWater',
    'FaMountain',
    'FaSeedling',
    'FaRecycle',
    'FaGlobe',
    'FaGlobeAmericas',
    'FaGlobeEurope',
    'FaGlobeAsia',
  ],
  Technology: [
    'FaRobot',
    'FaCog',
    'FaGear',
    'FaMicrochip',
    'FaMemory',
    'FaHardDrive',
    'FaKeyboard',
    'FaMouse',
    'FaMonitor',
    'FaLaptop',
    'FaTablet',
    'FaMobile',
    'FaWifi',
    'FaBluetooth',
    'FaBatteryFull',
    'FaBatteryHalf',
    'FaBatteryEmpty',
    'FaPlug',
    'FaPowerOff',
    'FaShield',
    'FaLock',
    'FaUnlock',
    'FaKey',
  ],
  Sports: [
    'FaTrophy',
    'FaMedal',
    'FaAward',
    'FaFutbol',
    'FaBasketball',
    'FaBaseball',
    'FaVolleyball',
    'FaTennis',
    'FaGolf',
    'FaSwimming',
    'FaRunning',
    'FaBicycle',
    'FaMotorcycle',
    'FaCar',
    'FaPlane',
    'FaRocket',
    'FaShip',
    'FaAnchor',
  ],
  Emotions: [
    'FaSmile',
    'FaLaugh',
    'FaGrin',
    'FaGrinBeam',
    'FaGrinHearts',
    'FaGrinSquint',
    'FaGrinSquintTears',
    'FaGrinTears',
    'FaGrinTongue',
    'FaGrinTongueSquint',
    'FaGrinTongueWink',
    'FaGrinWink',
    'FaGrinStars',
    'FaGrinBeamSweat',
    'FaGrinWink',
    'FaGrinSquint',
    'FaGrinHearts',
    'FaGrinStars',
    'FaGrinBeamSweat',
  ],
};

// Combine all icon libraries
const allIcons = {
  ...FaIcons,
  ...MdIcons,
  ...IoIcons,
  ...HiIcons,
  ...BiIcons,
  ...AiIcons,
  ...BsIcons,
  ...TbIcons,
  ...VscIcons,
};

const IconPicker: React.FC<IconPickerProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentIcon,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Popular');
  const [selectedIcon, setSelectedIcon] = useState<string>(
    currentIcon || 'FaUser'
  );

  // Filter icons based on search term
  const filteredIcons = useMemo(() => {
    if (searchTerm) {
      return Object.keys(allIcons)
        .filter(iconName =>
          iconName.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 100); // Limit to 100 results for performance
    }

    if (selectedCategory === 'Popular') {
      return iconCategories.Popular;
    }

    return (
      iconCategories[selectedCategory as keyof typeof iconCategories] || []
    );
  }, [searchTerm, selectedCategory]);

  const handleIconSelect = (iconName: string) => {
    setSelectedIcon(iconName);
  };

  const handleConfirm = () => {
    onSelect(selectedIcon);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="icon-picker-overlay">
      <div className="icon-picker-modal">
        <div className="icon-picker-header">
          <h3>Choose Your Avatar</h3>
          <button
            className="btn-close"
            onClick={onClose}
            title="Close Icon Picker"
            aria-label="Close Icon Picker"
          >
            <FaTimes />
          </button>
        </div>

        <div className="icon-picker-search">
          <div className="search-input-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search icons..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="icon-picker-categories">
          {Object.keys(iconCategories).map(category => (
            <button
              key={category}
              className={`category-btn ${
                selectedCategory === category ? 'active' : ''
              }`}
              onClick={() => {
                setSelectedCategory(category);
                setSearchTerm('');
              }}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="icon-picker-grid">
          {filteredIcons.map(iconName => {
            const IconComponent = allIcons[
              iconName as keyof typeof allIcons
            ] as React.ComponentType;
            if (!IconComponent) return null;

            return (
              <button
                key={iconName}
                className={`icon-option ${
                  selectedIcon === iconName ? 'selected' : ''
                }`}
                onClick={() => handleIconSelect(iconName)}
                title={iconName}
              >
                <IconComponent />
                {selectedIcon === iconName && (
                  <div className="selected-indicator">
                    <FaCheck />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="icon-picker-footer">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-confirm" onClick={handleConfirm}>
            <FaCheck /> Select Icon
          </button>
        </div>
      </div>
    </div>
  );
};

export default IconPicker;
