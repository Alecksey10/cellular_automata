import React, { useEffect, useState } from 'react';
import DataUploader, { type UploadData } from '../ui/DataUploader';

export interface CellularAutomatonFormData {
  name: string;
  slug: string;
  description: string;
  sourceCode: UploadData;
}

interface CellularAutomatonFormProps {
  onChange: (data: CellularAutomatonFormData) => void;
  initData?:CellularAutomatonFormData
}

export default function CellularAutomatonForm({ onChange, initData={name:"", slug:"", description:"", sourceCode:{ type: 'text',content: "" }}}: CellularAutomatonFormProps) {
  const [name, setName] = useState(initData.name);
  const [slug, setSlug] = useState(initData.slug);
  const [description, setDescription] = useState(initData.description);
  const [sourceCode, setSourceCode] = useState<UploadData>({ type: 'text', content: initData.sourceCode.content });

  const [errors, setErrors] = useState<{
    name?: string;
    slug?:string;
    description?: string;
    sourceCode?: string;
  }>({});

  const validate = () => {
    const newErrors: {
      name?: string;
      slug?:string;
      description?: string;
      sourceCode?: string;
    } = {};

    if (!name.trim()) {
      newErrors.name = 'Введите название клеточного автомата';
    }

    // if (!description.trim()) {
    //   newErrors.description = 'Введите описание клеточного автомата';
    // }

    if (!sourceCode) {
      newErrors.sourceCode = 'Добавьте исходный код клеточного автомата';
    } else if (sourceCode.type === 'text' && !sourceCode.content.trim()) {
      newErrors.sourceCode = 'Исходный код не может быть пустым';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const onChangeHandler = useEffect(()=>{

    // if (!validate()) {
    //   return;
    // }

    onChange({
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      sourceCode: sourceCode as UploadData,
    });
  }, [name,slug, description, sourceCode]);

  return (
    <form
      style={{
        maxWidth: '700px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        fontFamily: 'sans-serif',
      }}
    >
      <div>
        <label
          htmlFor="automaton-name"
          style={{
            display: 'block',
            marginBottom: '6px',
            fontWeight: 600,
          }}
        >
          Название клеточного автомата
        </label>

        <input
          id="automaton-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Например: Игра Жизнь"
          style={{
            width: '100%',
            padding: '10px',
            boxSizing: 'border-box',
            border: errors.name ? '1px solid #d32f2f' : '1px solid #ccc',
            borderRadius: '4px',
          }}
        />

        {errors.name && (
          <p style={{ color: '#d32f2f', marginTop: '6px', fontSize: '14px' }}>
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="automaton-slug"
          style={{
            display: 'block',
            marginBottom: '6px',
            fontWeight: 600,
          }}
        >
          Дополнительные наименования автомата
        </label>

        <textarea
          id="automaton-slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="Как называется клеточный автомат иначе"
          style={{
            width: '100%',
            minHeight: '120px',
            padding: '10px',
            boxSizing: 'border-box',
            border: errors.slug ? '1px solid #d32f2f' : '1px solid #ccc',
            borderRadius: '4px',
            resize: 'vertical',
          }}
        />

        {errors.slug && (
          <p style={{ color: '#d32f2f', marginTop: '6px', fontSize: '14px' }}>
            {errors.slug}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="automaton-description"
          style={{
            display: 'block',
            marginBottom: '6px',
            fontWeight: 600,
          }}
        >
          Описание клеточного автомата
        </label>

        <textarea
          id="automaton-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Опишите правила работы клеточного автомата..."
          style={{
            width: '100%',
            minHeight: '120px',
            padding: '10px',
            boxSizing: 'border-box',
            border: errors.description ? '1px solid #d32f2f' : '1px solid #ccc',
            borderRadius: '4px',
            resize: 'vertical',
          }}
        />

        {errors.description && (
          <p style={{ color: '#d32f2f', marginTop: '6px', fontSize: '14px' }}>
            {errors.description}
          </p>
        )}
      </div>

      <div>
        <p
          style={{
            margin: '0 0 8px',
            fontWeight: 600,
          }}
        >
          Исходный код клеточного автомата
        </p>

        <DataUploader onChange={setSourceCode} initialUploadData={{type:'text', content:sourceCode?.content}} />

        {errors.sourceCode && (
          <p style={{ color: '#d32f2f', marginTop: '6px', fontSize: '14px' }}>
            {errors.sourceCode}
          </p>
        )}
      </div>
    </form>
  );
}