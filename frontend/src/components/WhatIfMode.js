import React from 'react';
import { Lightbulb, Zap, AlertTriangle, HelpCircle } from 'lucide-react';

const WhatIfMode = ({ enabled, onToggle }) => {
  return (
    <div className="space-y-3">
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={`
          w-full flex items-center justify-between p-4 rounded-xl transition-all
          ${enabled 
            ? 'bg-gradient-to-r from-accent-600/30 to-purple-600/30 border-2 border-accent-500' 
            : 'bg-gray-800 border-2 border-gray-700 hover:border-gray-600'
          }
        `}
      >
        <div className="flex items-center gap-3">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center
            ${enabled ? 'bg-accent-500' : 'bg-gray-700'}
          `}>
            <Lightbulb className={`w-5 h-5 ${enabled ? 'text-white' : 'text-gray-400'}`} />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className={`font-medium ${enabled ? 'text-accent-300' : 'text-white'}`}>
                What-If Mode
              </span>
              {enabled && (
                <span className="px-2 py-0.5 bg-accent-500/30 text-accent-300 text-xs rounded-full">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">
              Explore hypothetical scenarios
            </p>
          </div>
        </div>
        
        {/* Toggle Switch */}
        <div className={`
          w-12 h-6 rounded-full p-1 transition-colors
          ${enabled ? 'bg-accent-500' : 'bg-gray-600'}
        `}>
          <div className={`
            w-4 h-4 rounded-full bg-white transition-transform
            ${enabled ? 'translate-x-6' : 'translate-x-0'}
          `} />
        </div>
      </button>

      {/* What-If Examples (shown when enabled) */}
      {enabled && (
        <div className="bg-accent-900/20 rounded-xl p-4 border border-accent-700/30 space-y-3">
          <h4 className="text-sm font-medium text-accent-300 flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            Try asking questions like:
          </h4>
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-sm">
              <Zap className="w-4 h-4 text-yellow-400 mt-0.5" />
              <span className="text-gray-300">"What happens if the power supply fails?"</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5" />
              <span className="text-gray-300">"What would go wrong if I skip this step?"</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <Lightbulb className="w-4 h-4 text-accent-400 mt-0.5" />
              <span className="text-gray-300">"How could I improve this design?"</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatIfMode;
