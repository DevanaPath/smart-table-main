export function initFiltering(elements) {
    // Функция вызывается один раз при старте, чтобы заполнить списки
    const updateIndexes = (elements, indexes) => {
        Object.keys(indexes).forEach((elementName) => {
            elements[elementName].append(...Object.values(indexes[elementName]).map(name => {
                const el = document.createElement('option');
                el.textContent = name;
                el.value = name;
                return el;
            }))
        })
    }

    const applyFiltering = (query, state, action) => {
        // Локальная очистка поля при нажатии на крестик
        if (action && action.name === 'clear') {
            const parent = action.parentElement;
            const input = parent.querySelector('input');
            if (input) {
                input.value = '';
                state[action.dataset.field] = '';
            }
        }

        // Собираем непустые поля фильтра
        const filter = {};
        Object.keys(elements).forEach(key => {
            if (elements[key]) {
                if (['INPUT', 'SELECT'].includes(elements[key].tagName) && elements[key].value) { 
                    // Сервер ожидает формат filter[name]=value
                    filter[`filter[${elements[key].name}]`] = elements[key].value; 
                }
            }
        })

        // Если есть что фильтровать — добавляем в query, иначе возвращаем query как был
        return Object.keys(filter).length ? Object.assign({}, query, filter) : query; 
    }

    return {
        updateIndexes,
        applyFiltering
    }
}