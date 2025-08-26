'use client';

import React, { useState } from 'react';
import { Calendar, Clock, Repeat, X } from 'lucide-react';

interface DurationSelectorProps {
  value: string;
  onChange: (duration: string) => void;
}

const DurationSelector: React.FC<DurationSelectorProps> = ({ value, onChange }) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customDuration, setCustomDuration] = useState('');

  const quickOptions = [
    { value: 'one-time', label: 'One-time', icon: Clock },
    { value: 'recurring', label: 'Recurring', icon: Repeat },
    { value: 'indefinite', label: 'Ongoing', icon: Calendar },
  ];

  const handleQuickOption = (optionValue: string) => {
    onChange(optionValue);
    setShowCustomInput(false);
    setCustomDuration('');
  };

  const handleCustomSubmit = () => {
    if (customDuration.trim()) {
      onChange(customDuration.trim());
      setShowCustomInput(false);
      setCustomDuration('');
    }
  };

  const handleClear = () => {
    onChange('');
    setShowCustomInput(false);
    setCustomDuration('');
  };

  return (
    <div className="space-y-3">
      {/* Quick Options */}
      <div className="grid grid-cols-3 gap-3">
        {quickOptions.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleQuickOption(option.value)}
              className={`p-3 rounded-lg border-2 transition-colors ${
                value === option.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Icon size={20} className="mx-auto mb-2" />
              <div className="text-sm font-medium">{option.label}</div>
            </button>
          );
        })}
      </div>

      {/* Custom Duration Input */}
      {showCustomInput ? (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={customDuration}
              onChange={(e) => setCustomDuration(e.target.value)}
              placeholder="e.g., 2 weeks, 1 month, until finals"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleCustomSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Set
            </button>
            <button
              type="button"
              onClick={() => setShowCustomInput(false)}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowCustomInput(true)}
          className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
        >
          + Add Custom Duration
        </button>
      )}

      {/* Selected Duration Display */}
      {value && (
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Duration: {value === 'one-time' ? 'One-time' : 
                         value === 'recurring' ? 'Recurring' : 
                         value === 'indefinite' ? 'Ongoing' : value}
            </span>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Event Date Picker (for events) */}
      {value === 'one-time' && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar size={16} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Event Date</span>
          </div>
          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      )}

      {/* Recurring Options */}
      {value === 'recurring' && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Repeat size={16} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Recurring Pattern</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Until</option>
              <option>For</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default DurationSelector; 