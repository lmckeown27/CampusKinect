'use client';

import React, { useState } from 'react';
import { Calendar, Clock, Repeat, X } from 'lucide-react';

interface DurationSelectorProps {
  value: string;
  onChange: (duration: string) => void;
}

const DurationSelector: React.FC<DurationSelectorProps> = ({ value, onChange }) => {
  const [selectedFrequency, setSelectedFrequency] = useState('daily');

  const quickOptions = [
    { value: 'one-time', label: 'One-time', icon: Clock },
    { value: 'recurring', label: 'Recurring', icon: Repeat },
    { value: 'ongoing', label: 'Ongoing', icon: Calendar },
  ];

  const handleQuickOption = (optionValue: string) => {
    onChange(optionValue);
  };



  return (
    <div className="space-y-3">
                      {/* Quick Options */}
                <div className="flex flex-col gap-3">
                  {quickOptions.map((option, index) => {
                    const Icon = option.icon;
                    return (
                      <React.Fragment key={option.value}>
                        {index > 0 && <div className="h-3"></div>}
                        <div className="flex items-start gap-4">
                          <button
                            type="button"
                            onClick={() => handleQuickOption(option.value)}
                            className={`w-48 p-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                              value === option.value
                                ? 'text-white'
                                : 'text-[#708d81] hover:text-[#5a7268]'
                            }`}
                            style={{
                              backgroundColor: value === option.value ? '#708d81' : '#f0f2f0',
                              color: value === option.value ? 'white' : '#708d81',
                              cursor: 'pointer'
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
                            <Icon 
                              size={20} 
                              className="mx-auto mb-2" 
                              style={{ color: 'inherit' }}
                            />
                            <div 
                              className="text-sm font-medium" 
                              style={{ color: 'inherit' }}
                            >
                              {option.label}
                            </div>
                          </button>
                          
                          {/* Duration Details Display - Always Visible */}
                          <div className="bg-[#525252] border border-[#708d81] rounded-lg p-4 max-w-md">
                            {option.value === 'one-time' && (
                              <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-[#708d81]">Event Date</span>
                                </div>
                                <input
                                  type="date"
                                  className="w-full px-3 py-2 border border-[#708d81] rounded-lg focus:ring-2 focus:ring-[#708d81] focus:border-transparent cursor-pointer"
                                  style={{
                                    colorScheme: 'light',
                                    backgroundColor: '#ffffff'
                                  }}
                                  min={new Date().toISOString().split('T')[0]}
                                  defaultValue={new Date().toISOString().split('T')[0]}
                                />
                              </div>
                            )}
                            
                            {option.value === 'recurring' && (
                              <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-[#708d81]">Recurring Pattern</span>
                                </div>
                                <div className="space-y-3">
                                  {/* Frequency Type Selector */}
                                  <select 
                                    className="w-full px-3 py-2 border border-[#708d81] rounded-lg focus:ring-2 focus:ring-[#708d81] focus:border-transparent"
                                    value={selectedFrequency}
                                    onChange={(e) => setSelectedFrequency(e.target.value)}
                                  >
                                    <option value="daily">Every Day</option>
                                    <option value="weekly">Every Week</option>
                                    <option value="monthly">Every Month</option>
                                  </select>
                                  
                                  {/* Dynamic Interval Selector */}
                                  <select className="w-full px-3 py-2 border border-[#708d81] rounded-lg focus:ring-2 focus:ring-[#708d81] focus:border-transparent">
                                    {selectedFrequency === 'daily' && (
                                      <>
                                        <option value="1">1 day</option>
                                        <option value="2">2 days</option>
                                        <option value="3">3 days</option>
                                        <option value="4">4 days</option>
                                        <option value="5">5 days</option>
                                        <option value="6">6 days</option>
                                      </>
                                    )}
                                    {selectedFrequency === 'weekly' && (
                                      <>
                                        <option value="1">1 week</option>
                                        <option value="2">2 weeks</option>
                                        <option value="3">3 weeks</option>
                                      </>
                                    )}
                                    {selectedFrequency === 'monthly' && (
                                      <>
                                        <option value="1">1 month</option>
                                        <option value="2">2 months</option>
                                        <option value="3">3 months</option>
                                        <option value="4">4 months</option>
                                        <option value="5">5 months</option>
                                        <option value="6">6 months</option>
                                        <option value="7">7 months</option>
                                        <option value="8">8 months</option>
                                        <option value="9">9 months</option>
                                        <option value="10">10 months</option>
                                        <option value="11">11 months</option>
                                      </>
                                    )}
                                  </select>
                                </div>
                              </div>
                            )}
                            
                            {option.value === 'ongoing' && (
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-[#708d81]">Ongoing - No end date</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>






    </div>
  );
};

export default DurationSelector; 