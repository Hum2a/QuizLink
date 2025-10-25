import React, { useState } from 'react';
import { FaTimes, FaSearch, FaCheck } from 'react-icons/fa';
import {
  FaUser,
  FaUsers,
  FaCrown,
  FaHeart,
  FaStar,
  FaSmile,
  FaGamepad,
  FaTrophy,
  FaRocket,
  FaMagic,
  FaFire,
  FaSun,
  FaMoon,
  FaCat,
  FaDog,
  FaRobot,
  FaGhost,
  FaGem,
  FaMedal,
  FaAward,
  FaPlane,
  FaCar,
  FaMotorcycle,
  FaBicycle,
  FaShip,
  FaSubway,
  FaBus,
  FaTaxi,
  FaTruck,
  FaHelicopter,
  FaTrain,
  FaAnchor,
  FaFlag,
  FaMap,
  FaGlobe,
  FaCompass,
  FaBinoculars,
  FaCamera,
  FaVideo,
  FaMusic,
  FaMicrophone,
  FaHeadphones,
  FaGuitar,
  FaDrum,
  FaPaintBrush,
  FaPalette,
  FaImage,
  FaFilm,
  FaTheaterMasks,
  FaMask,
  FaHatCowboy,
  FaGlasses,
  FaEye,
  FaEyeSlash,
  FaDeaf,
  FaHandPeace,
  FaHandPointUp,
  FaThumbsUp,
  FaThumbsDown,
  FaHandRock,
  FaHandPaper,
  FaHandScissors,
  FaHandLizard,
  FaHandSpock,
  FaHandPointDown,
  FaHandPointLeft,
  FaHandPointRight,
  FaHandHolding,
  FaHandHoldingHeart,
  FaHandHoldingWater,
  FaHandHoldingUsd,
  FaHandHoldingMedical,
  FaHands,
  FaHandsHelping,
  FaHandsWash,
} from 'react-icons/fa';

interface IconPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (iconName: string) => void;
  currentIcon?: string;
}

// Simplified icon list with only existing icons
const availableIcons = [
  'FaUser',
  'FaUsers',
  'FaCrown',
  'FaHeart',
  'FaStar',
  'FaSmile',
  'FaGamepad',
  'FaTrophy',
  'FaRocket',
  'FaMagic',
  'FaFire',
  'FaSun',
  'FaMoon',
  'FaCat',
  'FaDog',
  'FaRobot',
  'FaGhost',
  'FaGem',
  'FaMedal',
  'FaAward',
  'FaPlane',
  'FaCar',
  'FaMotorcycle',
  'FaBicycle',
  'FaShip',
  'FaSubway',
  'FaBus',
  'FaTaxi',
  'FaTruck',
  'FaHelicopter',
  'FaTrain',
  'FaAnchor',
  'FaFlag',
  'FaMap',
  'FaGlobe',
  'FaCompass',
  'FaBinoculars',
  'FaCamera',
  'FaVideo',
  'FaMusic',
  'FaMicrophone',
  'FaHeadphones',
  'FaGuitar',
  'FaDrum',
  'FaPaintBrush',
  'FaPalette',
  'FaImage',
  'FaFilm',
  'FaTheaterMasks',
  'FaMask',
  'FaHatCowboy',
  'FaGlasses',
  'FaEye',
  'FaEyeSlash',
  'FaDeaf',
  'FaHandPeace',
  'FaHandPointUp',
  'FaThumbsUp',
  'FaThumbsDown',
  'FaHandRock',
  'FaHandPaper',
  'FaHandScissors',
  'FaHandLizard',
  'FaHandSpock',
  'FaHandPointDown',
  'FaHandPointLeft',
  'FaHandPointRight',
  'FaHandHolding',
  'FaHandHoldingHeart',
  'FaHandHoldingWater',
  'FaHandHoldingUsd',
  'FaHandHoldingMedical',
  'FaHands',
  'FaHandsHelping',
  'FaHandsWash',
];

const iconComponents: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  FaUser,
  FaUsers,
  FaCrown,
  FaHeart,
  FaStar,
  FaSmile,
  FaGamepad,
  FaTrophy,
  FaRocket,
  FaMagic,
  FaFire,
  FaSun,
  FaMoon,
  FaCat,
  FaDog,
  FaRobot,
  FaGhost,
  FaGem,
  FaMedal,
  FaAward,
  FaPlane,
  FaCar,
  FaMotorcycle,
  FaBicycle,
  FaShip,
  FaSubway,
  FaBus,
  FaTaxi,
  FaTruck,
  FaHelicopter,
  FaTrain,
  FaAnchor,
  FaFlag,
  FaMap,
  FaGlobe,
  FaCompass,
  FaBinoculars,
  FaCamera,
  FaVideo,
  FaMusic,
  FaMicrophone,
  FaHeadphones,
  FaGuitar,
  FaDrum,
  FaPaintBrush,
  FaPalette,
  FaImage,
  FaFilm,
  FaTheaterMasks,
  FaMask,
  FaHatCowboy,
  FaGlasses,
  FaEye,
  FaEyeSlash,
  FaDeaf,
  FaHandPeace,
  FaHandPointUp,
  FaThumbsUp,
  FaThumbsDown,
  FaHandRock,
  FaHandPaper,
  FaHandScissors,
  FaHandLizard,
  FaHandSpock,
  FaHandPointDown,
  FaHandPointLeft,
  FaHandPointRight,
  FaHandHolding,
  FaHandHoldingHeart,
  FaHandHoldingWater,
  FaHandHoldingUsd,
  FaHandHoldingMedical,
  FaHands,
  FaHandsHelping,
  FaHandsWash,
};

const IconPicker: React.FC<IconPickerProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentIcon,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<string>(
    currentIcon || 'FaUser'
  );

  const filteredIcons = availableIcons.filter(iconName =>
    iconName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            title="Close"
            aria-label="Close"
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
              aria-label="Search icons"
            />
          </div>
        </div>

        <div className="icon-picker-grid">
          {filteredIcons.map(iconName => {
            const IconComponent = iconComponents[iconName];
            const isSelected = selectedIcon === iconName;

            return (
              <div
                key={iconName}
                className={`icon-option ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedIcon(iconName)}
                title={iconName}
              >
                {IconComponent && <IconComponent size={32} />}
                {isSelected && (
                  <div className="selected-indicator">
                    <FaCheck />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="icon-picker-footer">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-confirm" onClick={handleConfirm}>
            <FaCheck /> Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default IconPicker;
