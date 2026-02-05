import React, { useCallback, useState } from 'react';
import { Upload, Image, Camera, FileImage } from 'lucide-react';

const ImageUploader = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onUpload(file);
    }
  }, [onUpload]);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      onUpload(file);
    }
  }, [onUpload]);

  const exampleImages = [
    { name: 'Engine', icon: '🔧', desc: 'Car engine parts' },
    { name: 'Circuit', icon: '⚡', desc: 'Electronic circuit board' },
    { name: 'Appliance', icon: '🏠', desc: 'Home appliances' },
    { name: 'Anatomy', icon: '🫀', desc: 'Human anatomy' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Understand <span className="gradient-text">How Things Work</span>
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Upload any image of a machine, device, or system. Tap on any part to get 
          AI-powered explanations tailored to your skill level.
        </p>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative glass rounded-3xl p-12 text-center cursor-pointer 
          transition-all duration-300 group
          ${isDragging 
            ? 'border-primary-400 border-2 glow-primary bg-primary-900/20' 
            : 'border-2 border-dashed border-gray-600 hover:border-primary-500'
          }
        `}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className={`
          w-20 h-20 mx-auto mb-6 rounded-full 
          flex items-center justify-center transition-all duration-300
          ${isDragging ? 'bg-primary-500 scale-110' : 'bg-gray-700 group-hover:bg-primary-600'}
        `}>
          <Upload className={`w-10 h-10 ${isDragging ? 'text-white' : 'text-gray-300'}`} />
        </div>
        
        <h3 className="text-xl font-semibold text-white mb-2">
          {isDragging ? 'Drop your image here!' : 'Upload an Image'}
        </h3>
        <p className="text-gray-400 mb-4">
          Drag and drop or click to select
        </p>
        <p className="text-sm text-gray-500">
          Supports: JPG, PNG, WebP, GIF (max 10MB)
        </p>
      </div>

      {/* Example Use Cases */}
      <div className="mt-12">
        <h3 className="text-center text-gray-400 text-sm uppercase tracking-wider mb-6">
          Try it with
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {exampleImages.map((example) => (
            <div
              key={example.name}
              className="glass rounded-xl p-4 text-center hover:border-primary-500 transition-all cursor-pointer group"
            >
              <span className="text-4xl block mb-2 group-hover:scale-110 transition-transform">
                {example.icon}
              </span>
              <p className="text-white font-medium">{example.name}</p>
              <p className="text-gray-500 text-xs">{example.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features Preview */}
      <div className="mt-16 grid md:grid-cols-3 gap-6">
        <div className="glass rounded-xl p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary-600/20 flex items-center justify-center">
            <Camera className="w-6 h-6 text-primary-400" />
          </div>
          <h4 className="text-white font-semibold mb-2">Tap-to-Explain</h4>
          <p className="text-gray-400 text-sm">
            Click on any part of the image to get detailed explanations
          </p>
        </div>
        
        <div className="glass rounded-xl p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent-600/20 flex items-center justify-center">
            <FileImage className="w-6 h-6 text-accent-400" />
          </div>
          <h4 className="text-white font-semibold mb-2">What-If Mode</h4>
          <p className="text-gray-400 text-sm">
            Explore hypothetical scenarios and cause-effect relationships
          </p>
        </div>
        
        <div className="glass rounded-xl p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-600/20 flex items-center justify-center">
            <Image className="w-6 h-6 text-green-400" />
          </div>
          <h4 className="text-white font-semibold mb-2">Skill Levels</h4>
          <p className="text-gray-400 text-sm">
            Adjust explanation complexity from novice to expert
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
