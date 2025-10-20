function createAdvancedCounter(initialValue = 0) {
    let value = initialValue;
    const startValue = initialValue;
    const history = [];

    return {
        increment: function(amount = 1) {
            value += amount;
            history.push(`+${amount}`);
            return value;
        },
        
        decrement: function(amount = 1) {
            value -= amount;
            history.push(`-${amount}`);
            return value;
        },
        
        getValue: function() {
            return value;
        },
        
        getHistory: function() {
            return [...history]; // возвращаем копию массива
        },
        
        reset: function() {
            value = startValue;
            history.length = 0; // очищаем историю
            return value;
        }
    };
}

// Проверка работы
const counter = createAdvancedCounter(10);
console.log("Начальное значение:", counter.getValue()); // 10
console.log("Увеличиваем на 5:", counter.increment(5)); // 15
console.log("Уменьшаем на 3:", counter.decrement(3)); // 12
console.log("История операций:", counter.getHistory()); // ['+5', '-3']
console.log("Сброс:", counter.reset()); // 10
console.log("История после сброса:", counter.getHistory()); // []
