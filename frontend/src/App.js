import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import ImageCanvas from './components/ImageCanvas';
import ChatPanel from './components/ChatPanel';
import DifficultySlider from './components/DifficultySlider';
import ImageUploader from './components/ImageUploader';
import WhatIfMode from './components/WhatIfMode';
import { analyzeImage, askFollowUp, askWhatIf } from './services/api';

function App() {
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [difficulty, setDifficulty] = useState(2); // 1-5 scale, 2 = beginner-friendly
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [whatIfMode, setWhatIfMode] = useState(false);
  const [components, setComponents] = useState([]);

  const difficultyLabels = ['Novice', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

  const handleImageUpload = useCallback(async (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      setImage(e.target.result);
      setImageFile(file);
      setMessages([]);
      setSelectedPoint(null);
      setComponents([]);
      
      setIsLoading(true);
      try {
        const response = await analyzeImage(file, difficultyLabels[difficulty - 1]);
        setSessionId(response.sessionId);
        setComponents(response.components || []);
        setMessages([{
          type: 'assistant',
          content: response.analysis,
          timestamp: new Date()
        }]);
      } catch (error) {
        setMessages([{
          type: 'error',
          content: 'Failed to analyze image. Please try again.',
          timestamp: new Date()
        }]);
      }
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  }, [difficulty]);

  const handleCanvasTap = useCallback(async (x, y, imageWidth, imageHeight) => {
    if (!sessionId || isLoading) return;
    
    setSelectedPoint({ x, y });
    setIsLoading(true);

    const userMessage = {
      type: 'user',
      content: `Tapped on image at position (${Math.round(x)}%, ${Math.round(y)}%)`,
      isTap: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await askFollowUp(
        sessionId,
        `What is at position (${x}%, ${y}%) in the image? Explain this component in detail.`,
        { x, y },
        difficultyLabels[difficulty - 1]
      );
      
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: response.answer,
        timestamp: new Date()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'error',
        content: 'Failed to analyze this region. Please try again.',
        timestamp: new Date()
      }]);
    }
    setIsLoading(false);
  }, [sessionId, isLoading, difficulty]);

  const handleSendMessage = useCallback(async (message) => {
    if (!sessionId || isLoading) return;
    
    setIsLoading(true);
    setMessages(prev => [...prev, {
      type: 'user',
      content: message,
      timestamp: new Date()
    }]);

    try {
      const response = whatIfMode 
        ? await askWhatIf(sessionId, message, difficultyLabels[difficulty - 1])
        : await askFollowUp(sessionId, message, selectedPoint, difficultyLabels[difficulty - 1]);
      
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: response.answer,
        isWhatIf: whatIfMode,
        timestamp: new Date()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'error',
        content: 'Failed to get response. Please try again.',
        timestamp: new Date()
      }]);
    }
    setIsLoading(false);
  }, [sessionId, isLoading, whatIfMode, selectedPoint, difficulty]);

  const handleDifficultyChange = useCallback((newDifficulty) => {
    setDifficulty(newDifficulty);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        {!image ? (
          <ImageUploader onUpload={handleImageUpload} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Left Panel - Image & Controls */}
            <div className="space-y-4">
              <div className="glass rounded-2xl p-4">
                <ImageCanvas 
                  image={image}
                  onTap={handleCanvasTap}
                  selectedPoint={selectedPoint}
                  components={components}
                  isLoading={isLoading}
                />
              </div>
              
              <div className="glass rounded-2xl p-4 space-y-4">
                <DifficultySlider 
                  value={difficulty}
                  onChange={handleDifficultyChange}
                  labels={difficultyLabels}
                />
                
                <WhatIfMode 
                  enabled={whatIfMode}
                  onToggle={() => setWhatIfMode(!whatIfMode)}
                />
                
                <button
                  onClick={() => {
                    setImage(null);
                    setImageFile(null);
                    setSessionId(null);
                    setMessages([]);
                    setSelectedPoint(null);
                    setComponents([]);
                  }}
                  className="w-full py-2 px-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                >
                  Upload New Image
                </button>
              </div>
            </div>
            
            {/* Right Panel - Chat */}
            <div className="glass rounded-2xl overflow-hidden flex flex-col h-[calc(100vh-180px)]">
              <ChatPanel 
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                whatIfMode={whatIfMode}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
