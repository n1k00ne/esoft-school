/**
 * Выполняет глубокое копирование объекта с поддержкой:
 * - вложенных объектов и массивов
 * - циклических ссылок (через WeakMap)
 * - специальных типов: Date, Map, Set, RegExp, ArrayBuffer, TypedArray и др.
 * - функций и символов
 * - сохранения прототипа исходного объекта
 *
 * @param {*} source - Исходный объект для копирования
 * @param {WeakMap} cache - WeakMap для отслеживания уже скопированных объектов (предотвращает циклы)
 * @returns {*} Глубокая копия исходного объекта
 */
export function deepClone(source, cache = new WeakMap()) {
  // Примитивные типы, null, undefined возвращаем как есть
  if (source === null || typeof source !== 'object') {
    return source;
  }

  // Обработка циклических ссылок
  if (cache.has(source)) {
    return cache.get(source);
  }

  // Обработка Date
  if (source instanceof Date) {
    const copy = new Date(source.getTime());
    cache.set(source, copy);
    return copy;
  }

  // Обработка RegExp
  if (source instanceof RegExp) {
    const copy = new RegExp(source.source, source.flags);
    cache.set(source, copy);
    return copy;
  }

  // Обработка Map
  if (source instanceof Map) {
    const copy = new Map();
    cache.set(source, copy);
    for (const [key, value] of source) {
      copy.set(deepClone(key, cache), deepClone(value, cache));
    }
    return copy;
  }

  // Обработка Set
  if (source instanceof Set) {
    const copy = new Set();
    cache.set(source, copy);
    for (const value of source) {
      copy.add(deepClone(value, cache));
    }
    return copy;
  }

  // Обработка ArrayBuffer и SharedArrayBuffer
  if (source instanceof ArrayBuffer) {
    const copy = source.slice(0);
    cache.set(source, copy);
    return copy;
  }

  // Обработка TypedArray (Int8Array, Uint8Array, и т.д.)
  if (ArrayBuffer.isView(source)) {
    const copy = new (source.constructor)(source.buffer.slice(0));
    cache.set(source, copy);
    return copy;
  }

  // Обработка Error (ошибки)
  if (source instanceof Error) {
    const copy = new (source.constructor)(source.message);
    copy.stack = source.stack;
    copy.name = source.name;
    cache.set(source, copy);
    return copy;
  }

  // Обработка обычных объектов и массивов
  // Сохраняем прототип исходного объекта
  const proto = Object.getPrototypeOf(source);
  const copy = Array.isArray(source) ? [] : Object.create(proto);
  cache.set(source, copy);

  // Копируем все собственные свойства, включая неперечисляемые и символы
  const allProperties = [
    ...Object.getOwnPropertyNames(source),
    ...Object.getOwnPropertySymbols(source),
  ];

  for (const key of allProperties) {
    const descriptor = Object.getOwnPropertyDescriptor(source, key);
    if (descriptor) {
      // Рекурсивно копируем значение, если оно есть
      const value = descriptor.value;
      if (value !== undefined) {
        descriptor.value = deepClone(value, cache);
      }
      // Обработка геттеров/сеттеров — их копируем без изменений
      // (функции доступа остаются функциями доступа)
      Object.defineProperty(copy, key, descriptor);
    }
  }

  return copy;
}

// 1. Простой объект с вложенными структурами
const original = {
  name: "Home",
  details: {
    rooms: 3,
    address: {
      city: "Moscow",
      zip: 101000
    }
  },
  tags: ["cozy", "modern"],
  createdAt: new Date("2024-01-01"),
  settings: new Map([["theme", "dark"], ["notifications", true]]),
  uniqueId: Symbol("id")
};

const copy = deepClone(original);

// Проверка независимости
copy.details.rooms = 5;
copy.tags.push("spacious");
copy.createdAt.setFullYear(2025);
copy.settings.set("theme", "light");

console.log(original.details.rooms);   // 3 — не изменилось
console.log(original.tags);            // ["cozy", "modern"] — без "spacious"
console.log(original.createdAt);       // 2024-01-01 — не изменилось
console.log(original.settings.get("theme")); // "dark" — не изменилось


// 2. Циклические ссылки
const circular = { name: "circular" };
circular.self = circular;
circular.arr = [1, circular, 3];

const circularCopy = deepClone(circular);
console.log(circularCopy.self === circularCopy); // true (структура сохранена)
console.log(circularCopy.arr[1] === circularCopy); // true


// 3. Сохранение прототипа
class Person {
  constructor(name) {
    this.name = name;
  }
  greet() {
    return `Hello, I'm ${this.name}`;
  }
}

const person = new Person("Alice");
const personCopy = deepClone(person);

console.log(personCopy instanceof Person); // true
console.log(personCopy.greet());           // "Hello, I'm Alice"
console.log(personCopy.constructor === Person); // true


// 4. Функции и символы
const withFunctions = {
  id: Symbol("user"),
  sayHi: function() { return "Hi"; },
  arrow: () => "arrow",
  [Symbol("secret")]: "hidden"
};

const funcCopy = deepClone(withFunctions);
console.log(typeof funcCopy.sayHi);        // "function"
console.log(funcCopy.sayHi());             // "Hi"
console.log(Object.getOwnPropertySymbols(funcCopy).length); // 2 (символы скопированы)