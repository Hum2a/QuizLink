import React from 'react';
import {
  FaUser,
  FaUsers,
  FaCrown,
  FaPlay,
  FaStop,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaLock,
  FaUnlock,
  FaSave,
  FaTimes,
  FaEdit,
  FaPowerOff,
  FaSignOutAlt,
  FaCog,
  FaUserMinus,
  FaCopy,
  FaRedo,
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
} from 'react-icons/fa';

// Define a limited set of commonly used icons to reduce bundle size
const iconMap: Record<
  string,
  React.ComponentType<{ className?: string; size?: number }>
> = {
  // FontAwesome icons
  FaUser: FaUser,
  FaUsers: FaUsers,
  FaCrown: FaCrown,
  FaPlay: FaPlay,
  FaStop: FaStop,
  FaPause: FaPause,
  FaVolumeUp: FaVolumeUp,
  FaVolumeMute: FaVolumeMute,
  FaLock: FaLock,
  FaUnlock: FaUnlock,
  FaSave: FaSave,
  FaTimes: FaTimes,
  FaEdit: FaEdit,
  FaPowerOff: FaPowerOff,
  FaSignOutAlt: FaSignOutAlt,
  FaCog: FaCog,
  FaUserMinus: FaUserMinus,
  FaCopy: FaCopy,
  FaRedo: FaRedo,
  FaHeart: FaHeart,
  FaStar: FaStar,
  FaSmile: FaSmile,
  FaGamepad: FaGamepad,
  FaTrophy: FaTrophy,
  FaRocket: FaRocket,
  FaMagic: FaMagic,
  FaFire: FaFire,
  FaSun: FaSun,
  FaMoon: FaMoon,
};

interface IconRendererProps {
  iconName?: string;
  fallback?: React.ComponentType;
  className?: string;
  size?: number;
}

const IconRenderer: React.FC<IconRendererProps> = ({
  iconName,
  fallback: Fallback = FaUser,
  className,
  size = 24,
}) => {
  if (!iconName) {
    return <Fallback className={className} size={size} />;
  }

  const IconComponent = iconMap[iconName];

  if (!IconComponent) {
    return <Fallback className={className} size={size} />;
  }

  return <IconComponent className={className} size={size} />;
};

export default IconRenderer;
