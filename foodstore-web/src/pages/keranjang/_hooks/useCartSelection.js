import { useCallback } from 'react';

export default function useCartSelection(items, updateItems) {
    const selectedItems = items.filter((item) => item.checked !== false);
    const allSelected = items.length > 0 && selectedItems.length === items.length;
    const partiallySelected = selectedItems.length > 0 && !allSelected;
    const selectAllRef = useCallback((node) => {
        if (node) node.indeterminate = partiallySelected;
    }, [partiallySelected]);

    return {
        selectedItems,
        selectedCount: selectedItems.length,
        allSelected,
        selectAllRef,
        toggleItem: (id) => updateItems((current) => current.map((item) => item._id === id
            ? { ...item, checked: item.checked === false } : item), 'Pilihan menu diperbarui.'),
        toggleAll: () => updateItems((current) => {
            const checked = !current.every((item) => item.checked !== false);
            return current.map((item) => ({ ...item, checked }));
        }, 'Pilihan menu diperbarui.'),
        removeSelected: () => updateItems((current) => current.filter((item) => item.checked === false), 'Menu yang dipilih dihapus.'),
    };
}
