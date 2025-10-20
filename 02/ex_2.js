async function* createRobustGenerator(dataArray, delay = 500) {
    for (const item of dataArray) {
        await new Promise(resolve => setTimeout(resolve, delay));
        
        try {
            // Имитируем возможные ошибки
            if (item === null || item === undefined) {
                throw new Error(`Получено недопустимое значение: ${item}`);
            }
            
            if (item === 'error') {
                throw new Error('Искусственная ошибка обработки');
            }
            
            yield { success: true, data: `Обработано: ${item}` };
            
        } catch (error) {
            yield { success: false, error: error.message };
        }
    }
}

// Улучшенная версия с логгированием
async function* createRobustGeneratorWithLogging(dataArray, delay = 500) {
    let index = 0;
    
    for (const item of dataArray) {
        console.log(`🔹 Обрабатываем элемент ${index + 1}/${dataArray.length}`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        
        try {
            // Валидация данных
            if (item == null) {
                throw new Error('Элемент не может быть null или undefined');
            }
            
            if (typeof item === 'string' && item.toLowerCase() === 'error') {
                throw new Error('Сгенерирована тестовая ошибка');
            }
            
            // Имитация успешной обработки
            const processed = `🎯 ${item.toUpperCase()}_PROCESSED`;
            yield { 
                success: true, 
                data: processed,
                index: index,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.warn(`⚠️ Ошибка при обработке элемента ${index}:`, error.message);
            yield { 
                success: false, 
                error: error.message,
                index: index,
                timestamp: new Date().toISOString()
            };
        }
        
        index++;
    }
}

// Тестируем
const testErrorHandling = async () => {
    console.log("🧪 Тестируем обработку ошибок:");
    
    const testData = ['apple', null, 'banana', 'error', 'cherry'];
    const generator = createRobustGeneratorWithLogging(testData, 800);
    
    let successCount = 0;
    let errorCount = 0;
    
    for await (const result of generator) {
        if (result.success) {
            successCount++;
            console.log(`✅ Успех: ${result.data}`);
        } else {
            errorCount++;
            console.log(`❌ Ошибка: ${result.error}`);
        }
    }
    
    console.log(`\n📊 Итоги: Успехов: ${successCount}, Ошибок: ${errorCount}`);
};

// testErrorHandling();
