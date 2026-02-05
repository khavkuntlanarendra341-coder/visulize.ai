import React from 'react';
import { GraduationCap, Baby, BookOpen, Wrench, Rocket, Brain } from 'lucide-react';

const DifficultySlider = ({ value, onChange, labels }) => {
  const icons = [Baby, BookOpen, Wrench, Rocket, Brain];
  const colors = [
    'from-green-400 to-green-500',
    'from-blue-400 to-blue-500',
    'from-yellow-400 to-yellow-500',
    'from-orange-400 to-orange-500',
    'from-red-400 to-red-500',
  ];

  const descriptions = [
    'Simple explanations with everyday analogies',
    'Basic technical terms with clear examples',
    'Balanced detail for hobbyists',
    'In-depth technical analysis',
    'Expert-level specifications and theory',
  ];

  const Icon = icons[value - 1];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary-400" />
          <span className="text-white font-medium">Explanation Level</span>
        </div>
        <div className={`
          flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium text-white
          bg-gradient-to-r ${colors[value - 1]}
        `}>
          <Icon className="w-4 h-4" />
          {labels[value - 1]}
        </div>
      </div>

      {/* Slider */}
      <div className="relative">
        <input
          type="range"
          min="1"
          max="5"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
          style={{
            background: `linear-gradient(to right, 
              rgb(34, 197, 94) 0%, 
              rgb(34, 197, 94) ${((value - 1) / 4) * 100}%, 
              rgb(55, 65, 81) ${((value - 1) / 4) * 100}%, 
              rgb(55, 65, 81) 100%)`
          }}
        />
        
        {/* Level markers */}
        <div className="flex justify-between mt-1 px-1">
          {labels.map((label, i) => (
            <button
              key={i}
              onClick={() => onChange(i + 1)}
              className={`
                w-3 h-3 rounded-full transition-all
                ${value === i + 1 
                  ? 'bg-white scale-125 shadow-lg' 
                  : 'bg-gray-600 hover:bg-gray-500'
                }
              `}
            />
          ))}
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-400 text-sm text-center">
        {descriptions[value - 1]}
      </p>
    </div>
  );
};

export default DifficultySlider;
