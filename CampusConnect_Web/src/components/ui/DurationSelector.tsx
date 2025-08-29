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



  return (
    <div className="space-y-3">
      {/* Quick Options */}
      <div className="flex gap-3">
        {quickOptions.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleQuickOption(option.value)}
              className={`w-1/2 p-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                value === option.value
                  ? 'text-white'
                  : 'text-[#708d81] hover:text-[#5a7268]'
              }`}
              style={{
                backgroundColor: value === option.value ? '#708d81' : '#f0f2f0',
              }}
              onMouseEnter={(e) => {
                if (value !== option.value) {
                  e.currentTarget.style.backgroundColor = '#e8ebe8';
                }
              }}
              onMouseLeave={(e) => {
                if (value !== option.value) {
                  e.currentTarget.style.backgroundColor = '#f0f2f0';
                }
              }}
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
              className="px-4 py-2 text-white rounded-lg transition-colors cursor-pointer"
              style={{ backgroundColor: '#708d81' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#5a7268';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#708d81';
              }}
            >
              Set
            </button>
            <button
              type="button"
              onClick={() => setShowCustomInput(false)}
              className="px-3 py-2 text-[#708d81] transition-colors cursor-pointer"
              style={{ backgroundColor: '#f0f2f0' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e8ebe8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f0f2f0';
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowCustomInput(true)}
          className="w-1/2 p-3 rounded-lg text-[#708d81] transition-colors cursor-pointer"
          style={{ backgroundColor: '#f0f2f0', border: '2px dashed #708d81' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e8ebe8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f2f0';
          }}
        >
          + Add Custom Duration
        </button>
      )}

      {/* Selected Duration Display */}
      {value && (
        <div className="flex items-center p-3 bg-[#f0f2f0] border border-[#708d81] rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock size={16} className="text-[#708d81]" />
            <span className="text-sm font-medium text-[#708d81]">
              {value === 'one-time' ? 'This is a single event or transaction that happens once.' : 
               value === 'recurring' ? 'This repeats on a regular schedule (daily, weekly, or monthly).' : 
               value === 'indefinite' ? 'This is an ongoing service or item with no set end date.' : 
               `Custom duration: ${value}`}
            </span>
          </div>
        </div>
      )}


    </div>
  );
};

export default DurationSelector; 