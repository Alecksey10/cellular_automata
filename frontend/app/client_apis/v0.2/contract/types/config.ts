/**
 * Полная схема конфигурации автомата.
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
   */
  params: Record<string, ParamDef>;

  /**
   * Действия (кнопки), которые можно вызвать через runAction().
   * Ключ — идентификатор действия, передаваемый в IAutomaton.runAction().
   */
  actions: Record<string, ActionDef>;
}

/**
 * Описание одного параметра конфигурации.
 * На основе этих данных ConfigPanel автоматически генерирует UI-виджет.
 */
export interface ParamDef {
  /** Тип значения параметра */
  type: "number" | "string" | "boolean";

  /** Значение по умолчанию (используется при init и reset) */
  default: number | string | boolean;

  /** Человекочитаемое название (если нет — используется ключ) */
  label?: string;

  /** Подсказка / описание параметра */
  description?: string;

  /**
   * Тип UI-виджета для редактирования.
   *
   * - "scroller"  → слайдер (number, требует min/max)
   * - "input"     → текстовое поле (string | number)
   * - "combobox"  → выпадающий список (string, требует options)
   * - "checkbox"  → чекбокс (boolean)
   * - "radio"     → радиокнопки (string, требует options)
   */
  ui: "scroller" | "input" | "combobox" | "checkbox" | "radio";

  /** Варианты для combobox / radio */
  options?: string[];

  /** Минимальное значение (для scroller / input number) */
  min?: number;

  /** Максимальное значение (для scroller / input number) */
  max?: number;

  /** Шаг изменения (для scroller / input number) */
  step?: number;

  /**
   * Можно ли редактировать в UI.
   * false → виджет отображается, но заблокирован (read-only).
   * Полезно для параметров, которые автомат вычисляет сам.
   *
   * @default true
   */
  editable?: boolean;
}

/**
 * Описание действия (кнопки).
 * При нажатии вызывается IAutomaton.runAction(actionId).
 */
export interface ActionDef {
  /** Текст на кнопке */
  label: string;

  /** Подсказка */
  description?: string;
}