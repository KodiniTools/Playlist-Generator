import { describe, it, expect, vi, afterEach } from 'vitest'
import { createHistory } from '../useHistory'

interface State {
  value: number
}

function setup(limit = 50) {
  const state: State = { value: 0 }
  const history = createHistory({
    capture: () => ({ ...state }),
    restore: (s: State) => {
      state.value = s.value
    },
    limit,
  })
  const set = (label: string, v: number, coalesceKey: string | null = null) => {
    history.record(label, { coalesceKey })
    state.value = v
  }
  return { state, history, set }
}

describe('createHistory', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts empty', () => {
    const { history } = setup()
    expect(history.canUndo.value).toBe(false)
    expect(history.canRedo.value).toBe(false)
    expect(history.undo()).toBeNull()
    expect(history.redo()).toBeNull()
  })

  it('undoes and redoes in order and reports labels', () => {
    const { state, history, set } = setup()
    set('a', 1)
    set('b', 2)

    expect(history.undoLabel.value).toBe('b')
    expect(history.undo()).toBe('b')
    expect(state.value).toBe(1)
    expect(history.redoLabel.value).toBe('b')

    expect(history.undo()).toBe('a')
    expect(state.value).toBe(0)
    expect(history.canUndo.value).toBe(false)

    expect(history.redo()).toBe('a')
    expect(state.value).toBe(1)
    expect(history.redo()).toBe('b')
    expect(state.value).toBe(2)
    expect(history.canRedo.value).toBe(false)
  })

  it('discards redo steps when a new action is recorded', () => {
    const { state, history, set } = setup()
    set('a', 1)
    set('b', 2)
    history.undo()
    set('c', 3)

    expect(history.canRedo.value).toBe(false)
    expect(history.undo()).toBe('c')
    expect(state.value).toBe(1)
  })

  it('coalesces rapid records with the same key into one step', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 1, 12, 0, 0))
    const { state, history, set } = setup()

    set('typing', 1, 'name')
    vi.advanceTimersByTime(300)
    set('typing', 2, 'name')
    vi.advanceTimersByTime(300)
    set('typing', 3, 'name')

    expect(history.undo()).toBe('typing')
    expect(state.value).toBe(0)
    expect(history.canUndo.value).toBe(false)
  })

  it('starts a new step once the coalesce window has passed', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 1, 12, 0, 0))
    const { state, history, set } = setup()

    set('typing', 1, 'name')
    vi.advanceTimersByTime(1500)
    set('typing', 2, 'name')

    history.undo()
    expect(state.value).toBe(1)
    history.undo()
    expect(state.value).toBe(0)
  })

  it('does not record while a snapshot is being restored', () => {
    const state: State = { value: 0 }
    const history = createHistory({
      capture: () => ({ ...state }),
      restore: (s: State) => {
        state.value = s.value
        // A restore that triggers a "mutation" must not create a new step.
        history.record('nested')
      },
    })
    history.record('a')
    state.value = 1
    history.undo()
    expect(history.canUndo.value).toBe(false)
    expect(history.canRedo.value).toBe(true)
  })

  it('drops the oldest steps beyond the limit', () => {
    const { state, history, set } = setup(3)
    for (let i = 1; i <= 5; i++) set(`s${i}`, i)

    expect(history.undo()).toBe('s5')
    expect(history.undo()).toBe('s4')
    expect(history.undo()).toBe('s3')
    expect(history.canUndo.value).toBe(false)
    expect(state.value).toBe(2)
  })

  it('clear() empties both stacks', () => {
    const { history, set } = setup()
    set('a', 1)
    history.undo()
    history.clear()
    expect(history.canUndo.value).toBe(false)
    expect(history.canRedo.value).toBe(false)
  })

  it('rejects invalid options', () => {
    // @ts-expect-error intentionally wrong
    expect(() => createHistory({ capture: null, restore: () => {} })).toThrow(TypeError)
  })
})
