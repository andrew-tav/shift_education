async function* createPaginatedAPIGenerator(baseURL, pageSize = 10) {
    let currentPage = 1;
    let hasMore = true;
    let totalProcessed = 0;
    
    console.log(`🚀 Запуск пагинации: ${baseURL}, размер страницы: ${pageSize}`);
    
    while (hasMore) {
        console.log(`📄 Загружаем страницу ${currentPage}...`);
        
        try {
            // Имитируем API запрос
            const response = await mockAPI.fetchPage(currentPage, pageSize);
            
            if (!response.data || response.data.length === 0) {
                console.log('ℹ️ Получена пустая страница, завершаем.');
                break;
            }
            
            // Yield'им каждый элемент текущей страницы
            for (const item of response.data) {
                totalProcessed++;
                yield {
                    item: item,
                    page: currentPage,
                    totalProcessed: totalProcessed,
                    isLastPage: !response.hasMore
                };
            }
            
            // Проверяем, есть ли еще данные
            hasMore = response.hasMore;
            currentPage++;
            
            if (!hasMore) {
                console.log(`✅ Все данные загружены. Всего элементов: ${totalProcessed}`);
            }
            
        } catch (error) {
            console.error(`❌ Ошибка при загрузке страницы ${currentPage}:`, error.message);
            yield {
                error: `Ошибка страницы ${currentPage}: ${error.message}`,
                page: currentPage
            };
            break;
        }
    }
}

// Улучшенная версия с конфигурацией
async function* createAdvancedPaginatedGenerator({
    baseURL,
    pageSize = 10,
    maxPages = 100,
    delayBetweenPages = 200
}) {
    let currentPage = 1;
    let hasMore = true;
    let totalYielded = 0;
    
    while (hasMore && currentPage <= maxPages) {
        console.log(`📥 Страница ${currentPage}...`);
        
        await new Promise(resolve => setTimeout(resolve, delayBetweenPages));
        
        try {
            const response = await mockAPI.fetchPage(currentPage, pageSize);
            
            if (!response.data || response.data.length === 0) {
                console.log('🏁 Нет данных на странице, завершаем.');
                break;
            }
            
            // Yield'им элементы страницы
            for (const item of response.data) {
                totalYielded++;
                yield {
                    data: item,
                    metadata: {
                        page: currentPage,
                        itemIndex: totalYielded,
                        totalPages: Math.ceil(response.total / pageSize),
                        isLastItem: totalYielded === response.total
                    }
                };
            }
            
            hasMore = response.hasMore;
            currentPage++;
            
        } catch (error) {
            console.error(`💥 Критическая ошибка: ${error.message}`);
            yield { 
                error: true, 
                message: `Страница ${currentPage}: ${error.message}`,
                fatal: true 
            };
            break;
        }
    }
    
    console.log(`🎉 Пагинация завершена. Обработано страниц: ${currentPage - 1}, элементов: ${totalYielded}`);
}

// Тестируем
const testPagination = async () => {
    console.log("🧪 Тестируем пагинацию API:");
    
    const generator = createPaginatedAPIGenerator('https://api.example.com/data', 5);
    
    for await (const result of generator) {
        if (result.error) {
            console.log(`⚠️ ${result.error}`);
        } else {
            console.log(`📦 ${result.item} (стр. ${result.page}, всего: ${result.totalProcessed})`);
        }
    }
};

// testPagination();
