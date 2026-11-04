// src/engine/keyboardShortcuts.test.ts - Unit Tests for Keyboard Navigation Engine
import { describe, expect, it } from 'vitest'
import {
  isTypingInInputElement,
  resolveKeyboardAction,
  SHORTCUT_CATALOG,
} from './keyboardShortcuts'

describe('keyboardShortcuts Engine', () => {
  it('detects input elements to prevent accidental keystroke capture', () => {
    expect(isTypingInInputElement(null)).toBe(false)

    const dummyDiv = { tagName: 'DIV' } as unknown as EventTarget
    expect(isTypingInInputElement(dummyDiv)).toBe(false)

    const input = { tagName: 'INPUT' } as unknown as EventTarget
    expect(isTypingInInputElement(input)).toBe(true)

    const textarea = { tagName: 'TEXTAREA' } as unknown as EventTarget
    expect(isTypingInInputElement(textarea)).toBe(true)

    const select = { tagName: 'SELECT' } as unknown as EventTarget
    expect(isTypingInInputElement(select)).toBe(true)

    const contentEditable = { tagName: 'DIV', isContentEditable: true } as unknown as EventTarget
    expect(isTypingInInputElement(contentEditable)).toBe(true)

    const roleTextbox = {
      tagName: 'DIV',
      getAttribute: (attr: string) => (attr === 'role' ? 'textbox' : null),
    } as unknown as EventTarget
    expect(isTypingInInputElement(roleTextbox)).toBe(true)
  })

  it('resolves Escape to CLOSE_MODAL_OR_SIDEBAR even inside an input', () => {
    const input = { tagName: 'INPUT' } as unknown as EventTarget
    const action = resolveKeyboardAction('Escape', input)
    expect(action).toBe('CLOSE_MODAL_OR_SIDEBAR')
  })

  it('resolves Tab to TOGGLE_SIDEBAR when not in input', () => {
    const action = resolveKeyboardAction('Tab', null)
    expect(action).toBe('TOGGLE_SIDEBAR')

    const input = { tagName: 'INPUT' } as unknown as EventTarget
    const actionInsideInput = resolveKeyboardAction('Tab', input)
    expect(actionInsideInput).toBeNull()
  })

  it('resolves 1, 2, 3, 4 to respective board views', () => {
    expect(resolveKeyboardAction('1', null)).toBe('SWITCH_VIEW_KANBAN')
    expect(resolveKeyboardAction('2', null)).toBe('SWITCH_VIEW_EISENHOWER')
    expect(resolveKeyboardAction('3', null)).toBe('SWITCH_VIEW_135')
    expect(resolveKeyboardAction('4', null)).toBe('SWITCH_VIEW_IVY_LEE')
  })

  it('resolves action hotkeys: n, f, space, t, d, b, ?', () => {
    expect(resolveKeyboardAction('n', null)).toBe('OPEN_NEW_TASK')
    expect(resolveKeyboardAction('N', null)).toBe('OPEN_NEW_TASK')
    expect(resolveKeyboardAction('f', null)).toBe('OPEN_FOCUS_TIMER')
    expect(resolveKeyboardAction(' ', null, { code: 'Space' })).toBe('OPEN_FOCUS_TIMER')
    expect(resolveKeyboardAction('t', null)).toBe('OPEN_TOOLKIT')
    expect(resolveKeyboardAction('d', null)).toBe('OPEN_DIAGNOSTIC')
    expect(resolveKeyboardAction('b', null)).toBe('OPEN_BACKUP')
    expect(resolveKeyboardAction('?', null)).toBe('OPEN_SHORTCUTS_HELP')
    expect(resolveKeyboardAction('/', null, { shiftKey: true })).toBe('OPEN_SHORTCUTS_HELP')
  })

  it('ignores shortcuts if Ctrl or Meta is held', () => {
    expect(resolveKeyboardAction('n', null, { ctrlKey: true })).toBeNull()
    expect(resolveKeyboardAction('1', null, { metaKey: true })).toBeNull()
  })

  it('validates shortcut catalog integrity for student readability', () => {
    expect(SHORTCUT_CATALOG.length).toBeGreaterThanOrEqual(10)
    for (const item of SHORTCUT_CATALOG) {
      expect(item.keyLabel).toBeTruthy()
      expect(item.actionName).toBeTruthy()
      expect(item.description).toBeTruthy()
    }
  })
})
