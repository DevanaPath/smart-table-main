import {createComparison, defaultRules} from "../lib/compare.js";

const compare = createComparison(defaultRules, { skipEmptyTargetValues: true });

export function initFiltering(elements, indexes) {
    Object.keys(indexes).forEach((elementName) => {
        elements[elementName].append(
            ...Object.values(indexes[elementName]).map(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                return option;
            })
        );
    });

    return (data, state, action) => {
        if (action && action.name === 'clear') {
            const parent = action.parentElement;
            const input = parent.querySelector('input');
            const fieldName = action.dataset.field;
            if (input) {
                input.value = '';
                state[fieldName] = '';
            }
        }
        return data.filter(row => compare(row, state));
    };
}
