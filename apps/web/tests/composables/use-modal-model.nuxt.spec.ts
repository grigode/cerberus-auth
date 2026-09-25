import { describe, expect, it, vi } from 'vitest';
import { useModalModel } from '../../app/composables/use-modal-model.composable';

describe('useModalModel Composable', () => {
  it('should reflect open state from props via isOpen getter', () => {
    const props = { open: false };
    const emit = vi.fn();

    const { isOpen } = useModalModel(props, emit);
    expect(isOpen.value).toBe(false);
  });

  it('should emit update:open when isOpen setter is called', () => {
    const props = { open: false };
    const emit = vi.fn();

    const { isOpen } = useModalModel(props, emit);
    isOpen.value = true;

    expect(emit).toHaveBeenCalledWith('update:open', true);
  });

  it('closeModal should emit update:open with false', () => {
    const props = { open: true };
    const emit = vi.fn();

    const { closeModal } = useModalModel(props, emit);
    closeModal();

    expect(emit).toHaveBeenCalledWith('update:open', false);
  });

  it('openModal should emit update:open with true', () => {
    const props = { open: false };
    const emit = vi.fn();

    const { openModal } = useModalModel(props, emit);
    openModal();

    expect(emit).toHaveBeenCalledWith('update:open', true);
  });

  it('toggleModal should flip current open state and emit', () => {
    const props = { open: false };
    const emit = vi.fn();

    const { toggleModal } = useModalModel(props, emit);
    toggleModal();

    expect(emit).toHaveBeenCalledWith('update:open', true);
  });
});
