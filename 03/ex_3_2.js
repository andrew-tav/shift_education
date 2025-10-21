class AsyncGeneratorUtils {
    /**
     * Объединяет несколько асинхронных генераторов в один
     */
    static async *merge(...generators) {
        const promises = generators.map(async function* (gen) {
            for await (const value of gen) {
                yield { source: gen, value };
            }
        }());
        
        // Используем Promise.race для получения значений по мере готовности
        const nextPromises = promises.map(async (iterator, index) => ({
            index,
            value: await iterator.next()
        }));
        
        while (nextPromises.length > 0) {
            const { index, value } = await Promise.race(nextPromises);
            
            if (value.done) {
                nextPromises.splice(index, 1);
            } else {
                yield value.value;
                nextPromises[index] = promises[index].next().then(value => ({ index, value }));
            }
        }
    }
    
    /**
     * Простая версия merge для учебных целей
     */
    static async *mergeSimple(...generators) {
        let activeGenerators = generators.map(async function* (gen, index) {
            for await (const value of gen) {
                yield { source: index, value };
            }
        }());
        
        while (activeGenerators.length > 0) {
            for (let i = 0; i < activeGenerators.length; i++) {
                try {
                    const result = await activeGenerators[i].next();
                    if (!result.done) {
                        yield result.value;
                    } else {
                        activeGenerators.splice(i, 1);
                        i--;
                    }
                } catch (error) {
                    console.error(`Ошибка в генераторе ${i}:`, error);
                    activeGenerators.splice(i, 1);
                    i--;
                }
            }
        }
    }
    
    /**
     * Фильтрует значения асинхронного генератора
     */
    static async *filter(generator, predicate) {
        for await (const value of generator) {
            if (await predicate(value)) {
                yield value;
            }
        }
    }
    
    /**
     * Преобразует значения асинхронного генератора
     */
    static async *map(generator, transform) {
        for await (const value of generator) {
            yield await transform(value);
        }
    }
    
    /**
     * Ограничивает выполнение генератора по времени
     */
    static async *withTimeout(generator, timeoutMs) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
        }, timeoutMs);
        
        try {
            for await (const value of generator) {
                if (controller.signal.aborted) {
                    throw new Error('Generator timeout');
                }
                yield value;
            }
        } catch (error) {
            if (error.message === 'Generator timeout') {
                console.log(`⏰ Генератор остановлен по таймауту (${timeoutMs}ms)`);
                yield { error: 'timeout', message: `Timeout after ${timeoutMs}ms` };
            } else {
                throw error;
            }
        } finally {
            clearTimeout(timeoutId);
        }
    }
    
    /**
     * Ограничивает количество элементов генератора
     */
    static async *take(generator, limit) {
        let count = 0;
        for await (const value of generator) {
            if (count >= limit) break;
            yield value;
            count++;
        }
    }
    
    /**
     * Собирает все значения генератора в массив
     */
    static async collect(generator) {
        const results = [];
        for await (const value of generator) {
            results.push(value);
        }
        return results;
    }
    
    /**
     * Создает генератор из массива с асинхронной задержкой
     */
    static async *fromArray(array, delayMs = 0) {
        for (const item of array) {
            if (delayMs > 0) {
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
            yield item;
        }
    }
}

// Демонстрация композиции генераторов
const demonstrateComposition = async () => {
    console.log("🎨 Демонстрация композиции генераторов:");
    
    // Создаем тестовые генераторы
    const numberGenerator = AsyncGeneratorUtils.fromArray(
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 
        200
    );
    
    const stringGenerator = AsyncGeneratorUtils.fromArray(
        ['a', 'b', 'c', 'd', 'e'], 
        300
    );
    
    // Объединяем генераторы
    const mergedGenerator = AsyncGeneratorUtils.mergeSimple(
        numberGenerator,
        stringGenerator
    );
    
    // Применяем фильтр и преобразование
    const processedGenerator = AsyncGeneratorUtils.map(
        AsyncGeneratorUtils.filter(
            mergedGenerator,
            async (item) => {
                if (typeof item.value === 'number') {
                    return item.value % 2 === 0; // Только четные числа
                }
                return true; // Все строки
            }
        ),
        async (item) => {
            if (typeof item.value === 'number') {
                return `Число: ${item.value * 10}`;
            }
            return `Строка: ${item.value.toUpperCase()}`;
        }
    );
    
    // Берем только первые 8 элементов
    const limitedGenerator = AsyncGeneratorUtils.take(processedGenerator, 8);
    
    console.log("Результаты композиции:");
    for await (const value of limitedGenerator) {
        console.log(`📦 ${value}`);
    }
};

// demonstrateComposition();

// Практический пример: обработка данных из нескольких источников
const practicalExample = async () => {
    console.log("🏭 Практический пример: обработка данных из нескольких API");
    
    // Имитация API генераторов
    const userGenerator = AsyncGeneratorUtils.fromArray(
        ['user1', 'user2', 'user3', 'user4'], 
        400
    );
    
    const orderGenerator = AsyncGeneratorUtils.fromArray(
        ['orderA', 'orderB', 'orderC'], 
        500
    );
    
    const notificationGenerator = AsyncGeneratorUtils.fromArray(
        ['notifX', 'notifY', 'notifZ'], 
        350
    );
    
    // Объединяем все источники данных
    const allDataStream = AsyncGeneratorUtils.mergeSimple(
        AsyncGeneratorUtils.map(userGenerator, async user => ({ type: 'user', data: user })),
        AsyncGeneratorUtils.map(orderGenerator, async order => ({ type: 'order', data: order })),
        AsyncGeneratorUtils.map(notificationGenerator, async notif => ({ type: 'notification', data: notif }))
    );
    
    // Обрабатываем с таймаутом
    const processedStream = AsyncGeneratorUtils.withTimeout(allDataStream, 5000);
    
    try {
        for await (const item of processedStream) {
            console.log(`📊 ${item.type}: ${item.data}`);
        }
    } catch (error) {
        console.log('Поток завершен:', error.message);
    }
};

// practicalExample();