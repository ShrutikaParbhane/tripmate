import React, { createContext, useContext, useState, useEffect } from 'react';

type TextSize = 'sm' | 'md' | 'lg';

interface TextSizeContextType {
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  scaleFactor: number;
}

const TextSizeContext = createContext<TextSizeContextType>({
  textSize: 'md',
  setTextSize: () => {},
  scaleFactor: 1,
});

export const TextSizeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [textSize, setTextSizeState] = useState<TextSize>(() => {
    return (localStorage.getItem('tripmate_text_size') as TextSize) || 'md';
  });

  const setTextSize = (size: TextSize) => {
    setTextSizeState(size);
    localStorage.setItem('tripmate_text_size', size);
  };

  const scaleFactor = textSize === 'sm' ? 0.9 : textSize === 'lg' ? 1.15 : 1;

  useEffect(() => {
    document.documentElement.style.setProperty('--text-scale', scaleFactor.toString());
  }, [scaleFactor]);

  return (
    <TextSizeContext.Provider value={{ textSize, setTextSize, scaleFactor }}>
      {children}
    </TextSizeContext.Provider>
  );
};

export const useTextSize = () => useContext(TextSizeContext);
