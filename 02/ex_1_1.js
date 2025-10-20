async function* createNumberGenerator(limit, delay = 1000) {
    for (let i = 1; i <= limit; i++) {
        // Имитируем асинхронную операцию
        await new Promise(resolve => setTimeout(resolve, delay));
        yield i;
    }
}

// Альтернативная версия с более реалистичной асинхронностью
async function* createNumberGeneratorAdvanced(limit, delay = 1000) {
    let current = 1;
    
    while (current <= limit) {
        // Создаем промис с задержкой
        const promise = new Promise(resolve => {
            setTimeout(() => {
                resolve(current);
            }, delay);
        });
        
        // Ждем выполнения промиса и yield'им результат
        const result = await promise;
        yield result;
        current++;
    }
}

// Тестируем
const testGenerator = async () => {
    console.log("🔄 Запуск простого генератора:");
    const generator = createNumberGenerator(3, 1000);
    
    for await (const number of generator) {
        console.log(`Получено число: ${number}`);
    }
    
    console.log("✅ Генератор завершен!");
};

// testGenerator();
