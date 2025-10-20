function createCache() {
    const storage = new Map();
    let stats = {
        hits: 0,
        misses: 0
    };

    return {
        set: function(key, value) {
            storage.set(key, value);
            return true;
        },
        
        get: function(key) {
            if (storage.has(key)) {
                stats.hits++;
                return storage.get(key);
            } else {
                stats.misses++;
                return null;
            }
        },
        
        has: function(key) {
            return storage.has(key);
        },
        
        delete: function(key) {
            return storage.delete(key);
        },
        
        clear: function() {
            storage.clear();
            stats.hits = 0;
            stats.misses = 0;
        },
        
        getStats: function() {
            return { ...stats }; // возвращаем копию
        },
        
        size: function() {
            return storage.size;
        }
    };
}

// Проверка работы
const cache = createCache();

// Тестируем кэш
cache.set('user_1', { name: 'John', age: 30 });
cache.set('user_2', { name: 'Alice', age: 25 });

console.log("Получаем user_1:", cache.get('user_1')); // { name: 'John', age: 30 }
console.log("Проверяем user_3:", cache.get('user_3')); // null
console.log("Есть ли user_2:", cache.has('user_2')); // true

cache.get('user_1'); // повторный запрос
console.log("Статистика:", cache.getStats()); // { hits: 2, misses: 1 }

console.log("Размер кэша:", cache.size()); // 2
cache.clear();
console.log("Размер после очистки:", cache.size()); // 0
