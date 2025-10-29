'use client';

import { useState } from 'react';

interface IconSelectorProps {
  value: string;
  onChange: (icon: string) => void;
}

const COMMON_ICONS = [
  { emoji: '📱', name: 'Mobile Phone' },
  { emoji: '💻', name: 'Laptop' },
  { emoji: '🖥️', name: 'Desktop' },
  { emoji: '⌨️', name: 'Keyboard' },
  { emoji: '🖱️', name: 'Mouse' },
  { emoji: '🎧', name: 'Headphones' },
  { emoji: '📷', name: 'Camera' },
  { emoji: '🎮', name: 'Gaming' },
  { emoji: '⌚', name: 'Watch' },
  { emoji: '🔋', name: 'Battery' },
  { emoji: '👕', name: 'Clothing' },
  { emoji: '👔', name: 'Tie' },
  { emoji: '👗', name: 'Dress' },
  { emoji: '👠', name: 'Heels' },
  { emoji: '👟', name: 'Shoes' },
  { emoji: '👜', name: 'Bag' },
  { emoji: '💄', name: 'Makeup' },
  { emoji: '💍', name: 'Ring' },
  { emoji: '🕶️', name: 'Sunglasses' },
  { emoji: '🎒', name: 'Backpack' },
  { emoji: '🏠', name: 'Home' },
  { emoji: '🛋️', name: 'Couch' },
  { emoji: '🛏️', name: 'Bed' },
  { emoji: '🪑', name: 'Chair' },
  { emoji: '🚪', name: 'Door' },
  { emoji: '🪟', name: 'Window' },
  { emoji: '💡', name: 'Light' },
  { emoji: '🕯️', name: 'Candle' },
  { emoji: '🖼️', name: 'Frame' },
  { emoji: '🧺', name: 'Basket' },
  { emoji: '⚽', name: 'Soccer' },
  { emoji: '🏀', name: 'Basketball' },
  { emoji: '🏈', name: 'Football' },
  { emoji: '⚾', name: 'Baseball' },
  { emoji: '🎾', name: 'Tennis' },
  { emoji: '🏐', name: 'Volleyball' },
  { emoji: '🏓', name: 'Table Tennis' },
  { emoji: '🏸', name: 'Badminton' },
  { emoji: '🥊', name: 'Boxing' },
  { emoji: '🎯', name: 'Target' },
  { emoji: '📚', name: 'Books' },
  { emoji: '✏️', name: 'Pencil' },
  { emoji: '📝', name: 'Note' },
  { emoji: '🎨', name: 'Art' },
  { emoji: '🎭', name: 'Theater' },
  { emoji: '🎪', name: 'Circus' },
  { emoji: '🎬', name: 'Movie' },
  { emoji: '🎤', name: 'Microphone' },
  { emoji: '🎸', name: 'Guitar' },
  { emoji: '🎹', name: 'Piano' },
  { emoji: '🍔', name: 'Food' },
  { emoji: '☕', name: 'Coffee' },
  { emoji: '🍕', name: 'Pizza' },
  { emoji: '🍰', name: 'Cake' },
  { emoji: '🍎', name: 'Apple' },
  { emoji: '🥗', name: 'Salad' },
  { emoji: '🍜', name: 'Noodles' },
  { emoji: '🍪', name: 'Cookie' },
  { emoji: '🧃', name: 'Juice' },
  { emoji: '🍷', name: 'Wine' },
  { emoji: '🚗', name: 'Car' },
  { emoji: '🚲', name: 'Bicycle' },
  { emoji: '🛵', name: 'Scooter' },
  { emoji: '✈️', name: 'Airplane' },
  { emoji: '🚢', name: 'Ship' },
  { emoji: '🎁', name: 'Gift' },
  { emoji: '🎈', name: 'Balloon' },
  { emoji: '🎉', name: 'Party' },
  { emoji: '🔧', name: 'Tools' },
  { emoji: '🔨', name: 'Hammer' },
  { emoji: '⚙️', name: 'Settings' },
  { emoji: '🔑', name: 'Key' },
  { emoji: '🧰', name: 'Toolbox' },
  { emoji: '💊', name: 'Medicine' },
  { emoji: '💉', name: 'Syringe' },
  { emoji: '🩺', name: 'Stethoscope' },
  { emoji: '🌡️', name: 'Thermometer' },
  { emoji: '🧴', name: 'Lotion' },
  { emoji: '🧼', name: 'Soap' },
  { emoji: '🧽', name: 'Sponge' },
  { emoji: '🧹', name: 'Broom' },
  { emoji: '🌟', name: 'Star' },
  { emoji: '⭐', name: 'Star Fill' },
  { emoji: '🎯', name: 'Target' },
  { emoji: '📦', name: 'Package' },
  { emoji: '🛒', name: 'Shopping Cart' },
  { emoji: '💳', name: 'Credit Card' },
  { emoji: '💰', name: 'Money' },
  { emoji: '🏷️', name: 'Tag' },
];

export default function IconSelector({ value, onChange }: IconSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredIcons = COMMON_ICONS.filter((icon) =>
    icon.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (emoji: string) => {
    onChange(emoji);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative">
      {/* Selected Icon Display */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 border-2 border-gray-300 rounded-lg flex items-center justify-center text-4xl hover:border-primary-600 transition bg-white"
        >
          {value || '❓'}
        </button>
        <div className="flex-1">
          <input
            type="text"
            value={value}
            readOnly
            placeholder="Click to select an icon"
            className="input-field mb-2 cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          />
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="btn-outline w-full text-sm py-2"
          >
            {isOpen ? 'Close' : 'Select Icon'}
          </button>
        </div>
      </div>

      {/* Icon Picker Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white border-2 border-gray-300 rounded-lg shadow-xl max-h-96 overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b sticky top-0 bg-white">
            <input
              type="text"
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              autoFocus
            />
          </div>

          {/* Icons Grid */}
          <div className="p-3 overflow-y-auto max-h-80">
            {filteredIcons.length > 0 ? (
              <div className="grid grid-cols-6 gap-2">
                {filteredIcons.map((icon) => (
                  <button
                    key={icon.emoji}
                    type="button"
                    onClick={() => handleSelect(icon.emoji)}
                    className={`p-3 text-3xl rounded hover:bg-primary-50 transition border-2 ${
                      value === icon.emoji
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-transparent'
                    }`}
                    title={icon.name}
                  >
                    {icon.emoji}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No icons found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
