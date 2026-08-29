import React, { useState } from 'react';

export type UploadData = 
  | { type: 'text'; content: string }
  | { type: 'file'; content: string };

// ждёт от родителя 
interface DataUploaderProps {
  onChange: (data: UploadData) => void;
  initialUploadData?:{ type: 'text'; content: string }
}

export default function DataUploader({ onChange, initialUploadData={ type: 'text', content:"" }}: DataUploaderProps) {
  // Состояние для переключателя
  const [mode, setMode] = useState<'text' | 'file'>(initialUploadData.type);
  
  // Состояния для данных
  const [text, setText] = useState(initialUploadData.content);
  const [file, setFile] = useState<File | null>(null);

  const handleSwitchMode = (newMode: 'text' | 'file') => {
    setMode(newMode);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);

      const file = e.target.files[0];
      let textFile = "";
      if (file) {
        const fileReader = new FileReader();
        fileReader.onload = () => {
          const fileContent = fileReader.result as string;
          textFile+=fileContent;
        };
        fileReader.readAsText(file);
      }
      onChange({type:'file', content:textFile})

    }
  };

  // const handleSubmit = () => {
  //   if (mode === 'text') {
  //     if (!text.trim()) {
  //       alert('Вставьте код автомата');
  //       return;
  //     }
  //     onChange({ type: 'text', content: text });
  //   } else {
  //     if (!file) {
  //       alert('Выберите файл');
  //       return;
  //     }
  //     onChange({ type: 'file', file });
  //   }
    
  //   // Опционально: очистка после отправки
  //   // setText('');
  //   // setFile(null);
  // };

  // Базовые стили для наглядности (лучше вынести в CSS/Tailwind)
  const tabStyle = (isActive: boolean) => ({
    padding: '8px 16px',
    cursor: 'pointer',
    border: '1px solid #ccc',
    borderBottom: isActive ? 'none' : '1px solid #ccc',
    backgroundColor: isActive ? '#fff' : '#f9f9f9',
    borderRadius: '4px 4px 0 0',
    marginBottom: '-1px',
    fontWeight: isActive ? 'bold' : 'normal',
  });
  // console.log(mode)
  return (
    <div style={{ maxWidth: '500px', fontFamily: 'sans-serif' }}>
      {/* Переключатель режимов (Вкладки) */}
      <div style={{ display: 'flex', gap: '4px' }}>
        <div style={tabStyle(mode === 'text')} onClick={() => handleSwitchMode('text')}>
          Вставить текст
        </div>
        <div style={tabStyle(mode === 'file')} onClick={() => handleSwitchMode('file')}>
          Загрузить файл
        </div>
      </div>
    
      {/* Область ввода */}
      <div style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '0 4px 4px 4px' }}>
          <div style={{display:(()=>{return mode==='text'?'block':'none';})()}}>
          <textarea key='text' 
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              onChange({type:'text', content:e.target.value})
            }}
            placeholder="Вставьте ваши данные сюда..."
            style={{ width: '100%', minHeight: '150px', boxSizing: 'border-box', padding: '8px' }}
            />
            </div>
            
        <div style={{display:mode==='file'?'block':'none'}}>
          <div key='file'>
            <input type="file" onChange={handleFileChange} />
            {file && <p style={{ marginTop: '8px', fontSize: '14px' }}>Выбран: {file.name}</p>}
          </div>
          </div>
        
      </div>
    </div>
  );
}