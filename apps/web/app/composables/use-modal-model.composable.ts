/**
 * Standardizes two-way binding and open/close controls for modal dialogs.
 * Provides a reactive `isOpen` computed property and safe void-returning actions.
 */
export function useModalModel(
  props: { open: boolean },
  emit: (event: 'update:open', value: boolean) => void,
) {
  const isOpen = computed({
    get: () => props.open,
    set: (value: boolean) => emit('update:open', value),
  });

  const closeModal = () => {
    isOpen.value = false;
  };

  const openModal = () => {
    isOpen.value = true;
  };

  const toggleModal = () => {
    isOpen.value = !isOpen.value;
  };

  return {
    isOpen,
    closeModal,
    openModal,
    toggleModal,
  };
}
