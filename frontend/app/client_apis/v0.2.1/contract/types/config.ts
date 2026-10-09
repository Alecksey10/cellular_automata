/**
 * Полная схема конфигурации автомата.
 *
 * Используется RUNTIME для:
 *   - генерации UI (ConfigPanel)
 *   - валидации параметров
 *   - инициализации автомата дефолтами
 */
export interface ConfigSchema {
  /** Отображаемое имя автомата */
  name: string;

  /** Краткое описание (показывается в заголовке) */
  description: string;

  /** Версия API, с которой совместим автомат (например, "0.2") */
  apiVersion: string;

  /**
   * Параметры конфигурации.
   * Ключ — уникальный идентификатор параметра.
   * Значение — описание параметра для UI и валидации.
   *
   * Остаётся плоским Record, чтобы не ломать существующий API.
   */
  params: Record<string, ParamDef>;

  /**
   * Действия (кнопки), которые можно вызвать через runAction().
   */
  actions: Record<string, ActionDef>;

  /**
   * Опциональная структура GUI.
   *
   * Если не задана, ConfigPanel использует старый плоский
   * вывод params + actions.
   */
  sections?: ConfigSectionDef[];
}

/**
 * Рекурсивная секция GUI.
 *
 * Секция может содержать:
 * - параметры;
 * - действия;
 * - другие секции.
 *
 * Все ключи params/actions ссылаются на соответствующие
 * записи ConfigSchema.params и ConfigSchema.actions.
 */
export interface ConfigSectionDef {
  /** Уникальный идентификатор секции внутри GUI-схемы */
  id: string;

  /** Заголовок секции */
  label: string;

  /** Необязательное описание секции */
  description?: string;

  /** Параметры, отображаемые непосредственно в этой секции */
  params?: string[];

  /** Действия, отображаемые непосредственно в этой секции */
  actions?: string[];

  /** Вложенные секции */
  sections?: ConfigSectionDef[];
}

/**
 * Описание одного параметра конфигурации.
 *
 * На основе этих данных ConfigPanel автоматически генерирует UI-виджет.
 */
export interface ParamDef {
  /** Тип значения параметра */
  type: "number" | "string" | "boolean";

  /** Значение по умолчанию */
  default: number | string | boolean;

  /** Человекочитаемое название */
  label?: string;

  /** Подсказка / описание параметра */
  description?: string;

  /**
   * Тип UI-виджета.
   *
   * - "scroller"  → слайдер
   * - "input"     → текстовое поле
   * - "combobox"  → выпадающий список
   * - "checkbox"  → чекбокс
   * - "radio"     → радиокнопки
   */
  ui: "scroller" | "input" | "combobox" | "checkbox" | "radio";

  /** Варианты для combobox / radio */
  options?: string[];

  /** Минимальное значение */
  min?: number;

  /** Максимальное значение */
  max?: number;

  /** Шаг изменения */
  step?: number;

  /**
   * Можно ли редактировать в UI.
   *
   * false → виджет отображается, но заблокирован.
   *
   * @default true
   */
  editable?: boolean;
}

/**
 * Описание действия (кнопки).
 */
export interface ActionDef {
  /** Текст на кнопке */
  label: string;

  /** Подсказка */
  description?: string;
}