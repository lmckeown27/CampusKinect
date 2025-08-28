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
                  ? 'border-[#708d81] bg-[#f0f2f0] text-[#708d81]'
                  : 'border-[#708d81] hover:border-[#5a7268]'
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
              className="flex-1 px-3 py-2 border border-[#708d81] rounded-lg focus:ring-2 focus:ring-[#708d81] focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleCustomSubmit}
              className="px-4 py-2 bg-[#708d81] text-white rounded-lg hover:bg-[#5a7268] transition-colors"
            >
              Set
            </button>
            <button
              type="button"
              onClick={() => setShowCustomInput(false)}
              className="px-3 py-2 text-[#708d81] hover:text-[#5a7268] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowCustomInput(true)}
          className="w-full p-3 border-2 border-dashed border-[#708d81] rounded-lg text-[#708d81] hover:border-[#5a7268] hover:text-[#5a7268] transition-colors"
        >
          + Add Custom Duration
        </button>
      )}

      {/* Selected Duration Display */}
      {value && (
        <div className="flex items-center justify-between p-3 bg-[#f0f2f0] border border-[#708d81] rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock size={16} className="text-[#708d81]" />
            <span className="text-sm font-medium text-[#708d81]">
              Duration: {value === 'one-time' ? 'One-time' : 
                         value === 'recurring' ? 'Recurring' : 
                         value === 'indefinite' ? 'Ongoing' : value}
            </span>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-[#708d81] hover:text-[#5a7268] transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Event Date Picker (for events) */}
      {value === 'one-time' && (
        <div className="p-3 bg-[#f8f9f6] border border-[#708d81] rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar size={16} className="text-[#708d81]" />
            <span className="text-sm font-medium text-[#708d81]">Event Date</span>
          </div>
          <input
            type="date"
            className="w-full px-3 py-2 border border-[#708d81] rounded-lg focus:ring-2 focus:ring-[#708d81] focus:border-transparent"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      )}

      {/* Recurring Options */}
      {value === 'recurring' && (
        <div className="p-3 bg-[#f8f9f6] border border-[#708d81] rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Repeat size={16} className="text-[#708d81]" />
            <span className="text-sm font-medium text-[#708d81]">Recurring Pattern</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select className="px-3 py-2 border border-[#708d81] rounded-lg focus:ring-2 focus:ring-[#708d81] focus:border-transparent">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <select className="px-3 py-2 border border-[#708d81] rounded-lg focus:ring-2 focus:ring-[#708d81] focus:border-transparent">
              <option value="1">Every 1</option>
              <option value="2">Every 2</option>
              <option value="3">Every 3</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default DurationSelector; 