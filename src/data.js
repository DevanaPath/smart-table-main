const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';

export function initData() {
    // переменные для кеширования данных
    let sellers;
    let customers;
    let lastResult;
    let lastQuery;

    // функция для приведения строк в тот вид, который нужен нашей таблице
    const mapRecords = (data) => data.map(item => ({
        id: item.receipt_id,
        date: item.date,
        seller: sellers[item.seller_id],
        customer: customers[item.customer_id],
        total: item.total_amount
    }));

    // функция получения индексов
    const getIndexes = async () => {
        if (!sellers || !customers) {
            try {
                [sellers, customers] = await Promise.all([
                    fetch(`${BASE_URL}/sellers`).then(res => res.json()),
                    fetch(`${BASE_URL}/customers`).then(res => res.json()),
                ]);
            } catch (error) {
                console.error("Failed to fetch indexes:", error);
                // Задаем пустые объекты при ошибке, чтобы приложение не упало
                sellers = {};
                customers = {};
            }
        }

        return { sellers, customers };
    };

    // функция получения записей о продажах с сервера
    const getRecords = async (query, isUpdated = false) => {
        const qs = new URLSearchParams(query);
        const nextQuery = qs.toString();

        if (lastQuery === nextQuery && !isUpdated) {
            return lastResult || { total: 0, items: [] };
        }

        try {
            const response = await fetch(`${BASE_URL}/records?${nextQuery}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const records = await response.json();

            lastQuery = nextQuery;
            lastResult = {
                total: records.total,
                items: mapRecords(records.items)
            };

            return lastResult;
        } catch (error) {
            console.error("Failed to fetch records:", error);
            // Возвращаем пустые данные при ошибке сети
            return { total: 0, items: [] };
        }
    };

    return {
        getIndexes,
        getRecords
    };
}