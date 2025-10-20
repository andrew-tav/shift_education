function createIdGenerator() {
    const counters = {};
    
    return {
        next: function(prefix = 'item') {
            if (!counters[prefix]) {
                counters[prefix] = 0;
            }
            counters[prefix]++;
            return `${prefix}_${counters[prefix]}`;
        },
        
        reset: function(prefix = null) {
            if (prefix) {
                counters[prefix] = 0;
            } else {
                // Сбрасываем все счетчики
                Object.keys(counters).forEach(key => {
                    counters[key] = 0;
                });
            }
        },
        
        getCounters: function() {
            return { ...counters }; // возвращаем копию
        },
        
        getNextValue: function(prefix) {
            return counters[prefix] ? counters[prefix] + 1 : 1;
        }
    };
}

// Проверка работы
const idGen = createIdGenerator();

console.log("Генерация ID для пользователей:");
console.log(idGen.next('user')); // 'user_1'
console.log(idGen.next('user')); // 'user_2'
console.log(idGen.next('user')); // 'user_3'

console.log("Генерация ID для заказов:");
console.log(idGen.next('order')); // 'order_1'
console.log(idGen.next('order')); // 'order_2'

console.log("Генерация ID без префикса:");
console.log(idGen.next()); // 'item_1'

console.log("Текущие счетчики:", idGen.getCounters());
// { user: 3, order: 2, item: 1 }

console.log("Следующее значение для user:", idGen.getNextValue('user')); // 4

// Сброс только user
idGen.reset('user');
console.log("После сброса user:", idGen.getCounters());
// { user: 0, order: 2, item: 1 }

console.log("Новый user ID:", idGen.next('user')); // 'user_1'
