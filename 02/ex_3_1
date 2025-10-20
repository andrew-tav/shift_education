function createControllableAsyncGenerator(dataSource, options = {}) {
    const {
        chunkSize = 1,
        delay = 100,
        onStateChange = null
    } = options;
    
    let currentState = 'ready'; // ready, running, paused, stopped, completed
    let currentIndex = 0;
    let controller = null;
    
    const updateState = (newState) => {
        currentState = newState;
        if (onStateChange) {
            onStateChange(newState, currentIndex);
        }
    };
    
    const asyncGenerator = async function* () {
        updateState('running');
        controller = new AbortController();
        
        try {
            while (currentState !== 'stopped' && currentIndex < dataSource.length) {
                // Проверяем не приостановлен ли генератор
                if (currentState === 'paused') {
                    console.log('⏸️ Генератор приостановлен...');
                    await new Promise(resolve => {
                        const checkInterval = setInterval(() => {
                            if (currentState !== 'paused') {
                                clearInterval(checkInterval);
                                resolve();
                            }
                            
                            if (controller.signal.aborted) {
                                clearInterval(checkInterval);
                                resolve();
                            }
                        }, 100);
                    });
                    
                    if (controller.signal.aborted) {
                        break;
                    }
                }
                
                if (currentState === 'stopped') {
                    break;
                }
                
                // Yield'им данные
                const chunk = dataSource.slice(
                    currentIndex, 
                    currentIndex + chunkSize
                );
                
                for (const item of chunk) {
                    yield {
                        data: item,
                        index: currentIndex,
                        state: currentState,
                        timestamp: new Date().toISOString()
                    };
                    currentIndex++;
                }
                
                // Задержка между итерациями
                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(resolve, delay);
                    
                    controller.signal.addEventListener('abort', () => {
                        clearTimeout(timeout);
                        reject(new Error('Generator stopped'));
                    });
                });
            }
            
            if (currentIndex >= dataSource.length) {
                updateState('completed');
                yield { type: 'complete', message: 'All data processed' };
            } else {
                updateState('stopped');
                yield { type: 'stopped', message: 'Generator stopped by user' };
            }
            
        } catch (error) {
            if (error.message !== 'Generator stopped') {
                console.error('Generator error:', error);
                updateState('error');
                yield { type: 'error', message: error.message };
            }
        }
    };
    
    // Методы управления
    const methods = {
        pause: () => {
            if (currentState === 'running') {
                updateState('paused');
                console.log('⏸️ Генератор приостановлен');
            }
        },
        
        resume: () => {
            if (currentState === 'paused') {
                updateState('running');
                console.log('▶️ Генератор возобновлен');
            }
        },
        
        stop: () => {
            updateState('stopped');
            if (controller) {
                controller.abort();
            }
            console.log('🛑 Генератор остановлен');
        },
        
        getState: () => ({
            state: currentState,
            index: currentIndex,
            total: dataSource.length,
            progress: ((currentIndex / dataSource.length) * 100).toFixed(1)
        }),
        
        restart: () => {
            methods.stop();
            currentIndex = 0;
            updateState('ready');
            console.log('🔄 Генератор перезапущен');
        }
    };
    
    return {
        generator: asyncGenerator(),
        ...methods
    };
}

// Тестируем управляемый генератор
const testControllableGenerator = async () => {
    console.log("🎮 Тестируем управляемый генератор:");
    
    const testData = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`);
    const { generator, pause, resume, stop, getState } = 
        createControllableAsyncGenerator(testData, {
            chunkSize: 2,
            delay: 500,
            onStateChange: (state, index) => {
                console.log(`🔸 Состояние: ${state}, индекс: ${index}`);
            }
        });
    
    // Запускаем потребление генератора
    const consumeGenerator = async () => {
        for await (const item of generator) {
            console.log(`📦 Получено: ${item.data} (${item.state})`);
            
            // Автоматически останавливаемся на 5-м элементе для демонстрации
            if (item.index === 5) {
                console.log('⏸️ Автопауза на элементе 5');
                pause();
                
                // Возобновляем через 3 секунды
                setTimeout(() => {
                    console.log('▶️ Автовозобновление');
                    resume();
                }, 3000);
            }
            
            // Останавливаем на 15-м элементе
            if (item.index === 15) {
                console.log('🛑 Автостоп на элементе 15');
                stop();
                break;
            }
        }
    };
    
    // Запускаем потребление
    consumeGenerator();
    
    // Периодически выводим состояние
    const stateInterval = setInterval(() => {
        const state = getState();
        console.log(`📊 Состояние: ${state.state}, прогресс: ${state.progress}%`);
        
        if (state.state === 'stopped' || state.state === 'completed') {
            clearInterval(stateInterval);
        }
    }, 1000);
};

// testControllableGenerator();
