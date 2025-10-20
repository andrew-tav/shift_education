function createCountdownTimer(initialTime) {
    let time = initialTime;
    let timerId = null;
    let isRunning = false;
    const callbacks = {
        tick: [],
        complete: [],
        pause: [],
        reset: []
    };

    function executeCallbacks(type, data = null) {
        if (callbacks[type]) {
            callbacks[type].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Ошибка в callback:', error);
                }
            });
        }
    }

    function tick() {
        if (time > 0) {
            time--;
            executeCallbacks('tick', time);
            
            if (time === 0) {
                stop();
                executeCallbacks('complete');
            }
        }
    }

    function stop() {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
            isRunning = false;
        }
    }

    return {
        start: function() {
            if (!isRunning && time > 0) {
                isRunning = true;
                timerId = setInterval(tick, 1000);
            }
            return this;
        },
        
        pause: function() {
            if (isRunning) {
                stop();
                executeCallbacks('pause', time);
            }
            return this;
        },
        
        reset: function() {
            stop();
            time = initialTime;
            executeCallbacks('reset', time);
            return this;
        },
        
        setTime: function(newTime) {
            stop();
            time = newTime;
            initialTime = newTime;
            return this;
        },
        
        getTime: function() {
            return time;
        },
        
        isRunning: function() {
            return isRunning;
        },
        
        onTick: function(callback) {
            callbacks.tick.push(callback);
            return this;
        },
        
        onComplete: function(callback) {
            callbacks.complete.push(callback);
            return this;
        },
        
        onPause: function(callback) {
            callbacks.pause.push(callback);
            return this;
        },
        
        onReset: function(callback) {
            callbacks.reset.push(callback);
            return this;
        }
    };
}

// Проверка работы
console.log("Создаем таймер на 5 секунд:");
const timer = createCountdownTimer(5);

// Добавляем обработчики событий
timer.onTick((time) => {
    console.log(`⏰ Осталось: ${time} сек`);
});

timer.onComplete(() => {
    console.log('🎉 Время вышло!');
});

timer.onPause((time) => {
    console.log(`⏸️ Таймер на паузе на ${time} сек`);
});

timer.onReset((time) => {
    console.log(`🔄 Таймер сброшен до ${time} сек`);
});

// Запускаем таймер
console.log("Запускаем таймер:");
timer.start();

// Через 2 секунды ставим на паузу
setTimeout(() => {
    console.log("Ставим на паузу:");
    timer.pause();
    
    // Через 2 секунды продолжаем
    setTimeout(() => {
        console.log("Продолжаем:");
        timer.start();
    }, 2000);
}, 2000);

// Через 8 секунд сбрасываем
setTimeout(() => {
    console.log("Сбрасываем таймер:");
    timer.reset();
    
    // Перезапускаем с новым временем
    setTimeout(() => {
        console.log("Новый таймер на 3 секунды:");
        timer.setTime(3).start();
    }, 1000);
}, 8000);
