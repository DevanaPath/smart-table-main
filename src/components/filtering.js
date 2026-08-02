import { createComparison, defaultRules } from "../lib/compare.js";

export function initFiltering(elements) {
  const updateIndexes = (elements, indexes) => {
    Object.keys(indexes).forEach((elementName) => {
      const select = elements[elementName];
      if (!select) return;
      
      // Очищаем старые значения (кроме placeholder'а)
      Array.from(select.options).slice(1).forEach(opt => opt.remove());
      
      select.append(...Object.values(indexes[elementName]).map(name => {
        const el = document.createElement('option');
        el.textContent = name;
        el.value = name;
        return el;
      }));
    });
  };

  const applyFiltering = (query, state, action) => {
    if (action && action.name === 'clear') {
      const fieldName = action.dataset.field;
      const parent = action.parentElement;
      const input = parent.querySelector('input');
      if (input) input.value = '';
      state[fieldName] = '';
    }

    const filter = {};
    Object.keys(elements).forEach(key => {
      const el = elements[key];
      if (el && ['INPUT', 'SELECT'].includes(el.tagName) && el.value) {
        filter[`filter[${el.name}]`] = el.value;
      }
    });

    return Object.keys(filter).length 
      ? Object.assign({}, query, filter) 
      : query;
  };

  return { updateIndexes, applyFiltering };
}