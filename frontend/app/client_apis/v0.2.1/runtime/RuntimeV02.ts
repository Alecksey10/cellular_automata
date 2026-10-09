import type { IAutomaton } from "../contract/IAutomaton";
import { BaseRuntimeProgram } from "./BaseRuntimeProgram";
import type { EventBus } from "./EventBus";
import type { RuntimeParams } from "./RuntimeParams";

/**
 * Runtime для API v0.2.
 *
 * Пока что не добавляет ничего сверх базового класса,
 * но в будущем может:
 *   - валидировать ConfigSchema по спецификации v0.2
 *   - добавлять новые callback-методы
 *   - обрабатывать новые типы RenderData
 */
export class RuntimeV02 extends BaseRuntimeProgram {
  constructor(
    automaton: IAutomaton,
    eventBus: EventBus,
    paramsOverrides?: Partial<RuntimeParams>,
  ) {
    super(automaton, eventBus, paramsOverrides);
  }

  getApiVersion(): string {
    return "0.2";
  }
}