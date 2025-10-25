import React from 'react';
import * as FaIcons from 'react-icons/fa';
import * as MdIcons from 'react-icons/md';
import * as IoIcons from 'react-icons/io5';
import * as HiIcons from 'react-icons/hi2';
import * as BiIcons from 'react-icons/bi';
import * as AiIcons from 'react-icons/ai';
import * as BsIcons from 'react-icons/bs';
import * as TbIcons from 'react-icons/tb';
import * as VscIcons from 'react-icons/vsc';
import { FaUser } from 'react-icons/fa';

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
  console.log('IconRenderer called with iconName:', iconName);

  if (!iconName) {
    console.log('No iconName provided, using fallback');
    return <Fallback className={className} size={size} />;
  }

  const IconComponent = allIcons[
    iconName as keyof typeof allIcons
  ] as React.ComponentType<{ className?: string; size?: number }>;

  if (!IconComponent) {
    console.log('IconComponent not found for:', iconName);
    return <Fallback className={className} size={size} />;
  }

  console.log('Rendering icon:', iconName);
  return <IconComponent className={className} size={size} />;
};

export default IconRenderer;
