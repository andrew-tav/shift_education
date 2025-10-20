function createAuthSystem() {
    const users = {};
    const roles = {
        admin: ['read', 'write', 'delete', 'manage_users'],
        moderator: ['read', 'write', 'delete'],
        user: ['read']
    };

    return {
        addUser: function(username, permissions) {
            users[username] = {
                permissions: [...permissions],
                loginAttempts: 0,
                isBlocked: false
            };
            return `Пользователь ${username} добавлен`;
        },
        
        addUserByRole: function(username, role) {
            if (!roles[role]) {
                return `Роль ${role} не существует`;
            }
            return this.addUser(username, roles[role]);
        },
        
        checkPermission: function(username, permission) {
            const user = users[username];
            if (!user || user.isBlocked) {
                return false;
            }
            return user.permissions.includes(permission);
        },
        
        updateUser: function(username, newPermissions) {
            if (users[username]) {
                users[username].permissions = [...newPermissions];
                return `Права пользователя ${username} обновлены`;
            }
            return `Пользователь ${username} не найден`;
        },
        
        loginAttempt: function(username, success) {
            if (!users[username]) return false;
            
            if (success) {
                users[username].loginAttempts = 0;
                return true;
            } else {
                users[username].loginAttempts++;
                if (users[username].loginAttempts >= 3) {
                    users[username].isBlocked = true;
                    return `Пользователь ${username} заблокирован`;
                }
                return `Неудачная попытка входа. Осталось попыток: ${3 - users[username].loginAttempts}`;
            }
        },
        
        unblockUser: function(username) {
            if (users[username]) {
                users[username].isBlocked = false;
                users[username].loginAttempts = 0;
                return `Пользователь ${username} разблокирован`;
            }
        },
        
        getUserInfo: function(username) {
            if (!users[username]) return null;
            return {
                username: username,
                permissions: [...users[username].permissions],
                loginAttempts: users[username].loginAttempts,
                isBlocked: users[username].isBlocked
            };
        }
    };
}

// Проверка работы
const auth = createAuthSystem();

// Добавляем пользователей
console.log(auth.addUserByRole('alice', 'admin'));
console.log(auth.addUserByRole('bob', 'user'));

// Проверяем права
console.log("Alice может удалять?", auth.checkPermission('alice', 'delete')); // true
console.log("Bob может писать?", auth.checkPermission('bob', 'write')); // false

// Симуляция попыток входа
console.log(auth.loginAttempt('bob', false)); // Неудачная попытка...
console.log(auth.loginAttempt('bob', false)); // Неудачная попытка...
console.log(auth.loginAttempt('bob', false)); // Пользователь заблокирован

console.log("Bob заблокирован?", auth.getUserInfo('bob').isBlocked); // true

// Разблокируем
console.log(auth.unblockUser('bob'));
console.log("Bob заблокирован?", auth.getUserInfo('bob').isBlocked); // false
