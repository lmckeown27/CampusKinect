'use client';

import React, { useState } from 'react';
import { Calendar, Clock, Infinity } from 'lucide-react';

interface DurationSelectorProps {
  durationType: 'one-time' | 'recurring' | 'event';
  duration: number;
  eventStart: string;
  eventEnd: string;
  onDurationChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}

export default function DurationSelector({
  durationType,
  duration,
  eventStart,
  eventEnd,
  onDurationChange,
  errors
}: DurationSelectorProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [showDurationInput, setShowDurationInput] = useState(false);

  const quickPresets = [
    { label: '1 day', value: 1 },
    { label: '3 days', value: 3 },
    { label: '1 week', value: 7 },
    { label: '2 weeks', value: 14 },
    { label: '1 month', value: 30 },
  ];

  const handleDurationTypeChange = (type: 'one-time' | 'recurring' | 'event') => {
    onDurationChange('durationType', type);
    
    // Reset related fields
    if (type === 'event') {
      onDurationChange('duration', 1);
      onDurationChange('eventStart', '');
      onDurationChange('eventEnd', '');
    } else if (type === 'one-time') {
      onDurationChange('eventStart', '');
      onDurationChange('eventEnd', '');
    } else {
      onDurationChange('eventStart', '');
      onDurationChange('eventEnd', '');
    }
  };

  const handleQuickPreset = (days: number) => {
    onDurationChange('duration', days);
    setShowDurationInput(false);
  };

  const handleIndefiniteToggle = () => {
    if (durationType === 'recurring') {
      onDurationChange('duration', duration === -1 ? 30 : -1);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-4">
      {/* Duration Type Selection */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { value: 'one-time', label: 'One-time', icon: Clock },
          { value: 'recurring', label: 'Recurring', icon: Infinity },
          { value: 'event', label: 'Event', icon: Calendar }
        ].map(type => {
          const Icon = type.icon;
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => handleDurationTypeChange(type.value as any)}
              className={`p-3 border-2 rounded-lg text-center transition-colors ${
                durationType === type.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Icon className="w-5 h-5 mx-auto mb-1" />
              <div className="text-sm font-medium">{type.label}</div>
            </button>
          );
        })}
      </div>

      {/* Duration Options based on type */}
      {durationType === 'one-time' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              How many days should this post be active?
            </label>
            <button
              type="button"
              onClick={() => setShowDurationInput(!showDurationInput)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showDurationInput ? 'Hide' : 'Custom'}
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-2">
            {quickPresets.map(preset => (
              <button
                key={preset.value}
                type="button"
                onClick={() => handleQuickPreset(preset.value)}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  duration === preset.value
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom Duration Input */}
          {showDurationInput && (
            <div>
              <input
                type="number"
                min="1"
                max="365"
                value={duration}
                onChange={(e) => onDurationChange('duration', parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter number of days"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter a number between 1 and 365 days
              </p>
            </div>
          )}
        </div>
      )}

      {durationType === 'recurring' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              How often should this post recur?
            </label>
            <button
              type="button"
              onClick={() => setShowDurationInput(!showDurationInput)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showDurationInput ? 'Hide' : 'Custom'}
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-2">
            {quickPresets.map(preset => (
              <button
                key={preset.value}
                type="button"
                onClick={() => handleQuickPreset(preset.value)}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  duration === preset.value
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Every {preset.label}
              </button>
            ))}
          </div>

          {/* Custom Duration Input */}
          {showDurationInput && (
            <div>
              <input
                type="number"
                min="1"
                max="365"
                value={duration === -1 ? '' : duration}
                onChange={(e) => onDurationChange('duration', parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter number of days"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter a number between 1 and 365 days
              </p>
            </div>
          )}

          {/* Indefinite Option */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleIndefiniteToggle}
              className={`p-2 rounded-lg transition-colors ${
                duration === -1
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Infinity className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-700">
              Run indefinitely
            </span>
          </div>
        </div>
      )}

      {durationType === 'event' && (
        <div className="space-y-3">
          {/* Event Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Start Date *
            </label>
            <input
              type="datetime-local"
              value={eventStart}
              onChange={(e) => onDurationChange('eventStart', e.target.value)}
              min={getMinDate()}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.eventStart ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.eventStart && (
              <p className="mt-1 text-sm text-red-600">{errors.eventStart}</p>
            )}
          </div>

          {/* Event End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event End Date (Optional)
            </label>
            <input
              type="datetime-local"
              value={eventEnd}
              onChange={(e) => onDurationChange('eventEnd', e.target.value)}
              min={eventStart || getMinDate()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty for single-day events
            </p>
          </div>
        </div>
      )}

      {/* Summary Display */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="text-sm text-gray-700">
          <span className="font-medium">Summary: </span>
          {durationType === 'one-time' && (
            <span>This post will be active for {duration} day{duration !== 1 ? 's' : ''}</span>
          )}
          {durationType === 'recurring' && (
            <span>
              This post will recur every {duration === -1 ? 'indefinitely' : `${duration} day${duration !== 1 ? 's' : ''}`}
            </span>
          )}
          {durationType === 'event' && (
            <span>
              Event on {formatDate(eventStart)}
              {eventEnd && eventEnd !== eventStart && ` until ${formatDate(eventEnd)}`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
} 

import React, { useState } from 'react';
import { Calendar, Clock, Infinity } from 'lucide-react';

interface DurationSelectorProps {
  durationType: 'one-time' | 'recurring' | 'event';
  duration: number;
  eventStart: string;
  eventEnd: string;
  onDurationChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}

export default function DurationSelector({
  durationType,
  duration,
  eventStart,
  eventEnd,
  onDurationChange,
  errors
}: DurationSelectorProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [showDurationInput, setShowDurationInput] = useState(false);

  const quickPresets = [
    { label: '1 day', value: 1 },
    { label: '3 days', value: 3 },
    { label: '1 week', value: 7 },
    { label: '2 weeks', value: 14 },
    { label: '1 month', value: 30 },
  ];

  const handleDurationTypeChange = (type: 'one-time' | 'recurring' | 'event') => {
    onDurationChange('durationType', type);
    
    // Reset related fields
    if (type === 'event') {
      onDurationChange('duration', 1);
      onDurationChange('eventStart', '');
      onDurationChange('eventEnd', '');
    } else if (type === 'one-time') {
      onDurationChange('eventStart', '');
      onDurationChange('eventEnd', '');
    } else {
      onDurationChange('eventStart', '');
      onDurationChange('eventEnd', '');
    }
  };

  const handleQuickPreset = (days: number) => {
    onDurationChange('duration', days);
    setShowDurationInput(false);
  };

  const handleIndefiniteToggle = () => {
    if (durationType === 'recurring') {
      onDurationChange('duration', duration === -1 ? 30 : -1);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-4">
      {/* Duration Type Selection */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { value: 'one-time', label: 'One-time', icon: Clock },
          { value: 'recurring', label: 'Recurring', icon: Infinity },
          { value: 'event', label: 'Event', icon: Calendar }
        ].map(type => {
          const Icon = type.icon;
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => handleDurationTypeChange(type.value as any)}
              className={`p-3 border-2 rounded-lg text-center transition-colors ${
                durationType === type.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Icon className="w-5 h-5 mx-auto mb-1" />
              <div className="text-sm font-medium">{type.label}</div>
            </button>
          );
        })}
      </div>

      {/* Duration Options based on type */}
      {durationType === 'one-time' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              How many days should this post be active?
            </label>
            <button
              type="button"
              onClick={() => setShowDurationInput(!showDurationInput)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showDurationInput ? 'Hide' : 'Custom'}
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-2">
            {quickPresets.map(preset => (
              <button
                key={preset.value}
                type="button"
                onClick={() => handleQuickPreset(preset.value)}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  duration === preset.value
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom Duration Input */}
          {showDurationInput && (
            <div>
              <input
                type="number"
                min="1"
                max="365"
                value={duration}
                onChange={(e) => onDurationChange('duration', parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter number of days"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter a number between 1 and 365 days
              </p>
            </div>
          )}
        </div>
      )}

      {durationType === 'recurring' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              How often should this post recur?
            </label>
            <button
              type="button"
              onClick={() => setShowDurationInput(!showDurationInput)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showDurationInput ? 'Hide' : 'Custom'}
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-2">
            {quickPresets.map(preset => (
              <button
                key={preset.value}
                type="button"
                onClick={() => handleQuickPreset(preset.value)}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  duration === preset.value
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Every {preset.label}
              </button>
            ))}
          </div>

          {/* Custom Duration Input */}
          {showDurationInput && (
            <div>
              <input
                type="number"
                min="1"
                max="365"
                value={duration === -1 ? '' : duration}
                onChange={(e) => onDurationChange('duration', parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter number of days"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter a number between 1 and 365 days
              </p>
            </div>
          )}

          {/* Indefinite Option */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleIndefiniteToggle}
              className={`p-2 rounded-lg transition-colors ${
                duration === -1
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Infinity className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-700">
              Run indefinitely
            </span>
          </div>
        </div>
      )}

      {durationType === 'event' && (
        <div className="space-y-3">
          {/* Event Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Start Date *
            </label>
            <input
              type="datetime-local"
              value={eventStart}
              onChange={(e) => onDurationChange('eventStart', e.target.value)}
              min={getMinDate()}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.eventStart ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.eventStart && (
              <p className="mt-1 text-sm text-red-600">{errors.eventStart}</p>
            )}
          </div>

          {/* Event End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event End Date (Optional)
            </label>
            <input
              type="datetime-local"
              value={eventEnd}
              onChange={(e) => onDurationChange('eventEnd', e.target.value)}
              min={eventStart || getMinDate()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty for single-day events
            </p>
          </div>
        </div>
      )}

      {/* Summary Display */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="text-sm text-gray-700">
          <span className="font-medium">Summary: </span>
          {durationType === 'one-time' && (
            <span>This post will be active for {duration} day{duration !== 1 ? 's' : ''}</span>
          )}
          {durationType === 'recurring' && (
            <span>
              This post will recur every {duration === -1 ? 'indefinitely' : `${duration} day${duration !== 1 ? 's' : ''}`}
            </span>
          )}
          {durationType === 'event' && (
            <span>
              Event on {formatDate(eventStart)}
              {eventEnd && eventEnd !== eventStart && ` until ${formatDate(eventEnd)}`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
} 