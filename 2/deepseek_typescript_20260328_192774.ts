/**
 * Выполняет глубокое копирование объекта с поддержкой:
 * - вложенных объектов и массивов
 * - циклических ссылок (через WeakMap)
 * - специальных типов: Date, Map, Set, RegExp, ArrayBuffer, TypedArray и др.
 * - функций и символов
 * - сохранения прототипа исходного объекта
 *
 * @param source - Исходный объект для копирования
 * @param cache - WeakMap для отслеживания уже скопированных объектов (предотвращает циклы)
 * @returns Глубокая копия исходного объекта
 */
export function deepClone<T>(source: T, cache = new WeakMap<object, any>()): T {
  // Примитивные типы, null, undefined возвращаем как есть
  if (source === null || typeof source !== 'object') {
    return source;
  }

  // Обработка циклических ссылок
  if (cache.has(source as object)) {
    return cache.get(source as object);
  }

  // Обработка Date
  if (source instanceof Date) {
    const copy = new Date(source.getTime());
    cache.set(source, copy);
    return copy as T;
  }

  // Обработка RegExp
  if (source instanceof RegExp) {
    const copy = new RegExp(source.source, source.flags);
    cache.set(source, copy);
    return copy as T;
  }

  // Обработка Map
  if (source instanceof Map) {
    const copy = new Map();
    cache.set(source, copy);
    for (const [key, value] of source) {
      copy.set(deepClone(key, cache), deepClone(value, cache));
    }
    return copy as T;
  }

  // Обработка Set
  if (source instanceof Set) {
    const copy = new Set();
    cache.set(source, copy);
    for (const value of source) {
      copy.add(deepClone(value, cache));
    }
    return copy as T;
  }

  // Обработка ArrayBuffer и SharedArrayBuffer
  if (source instanceof ArrayBuffer) {
    const copy = source.slice(0);
    cache.set(source, copy);
    return copy as T;
  }

  // Обработка TypedArray (Int8Array, Uint8Array, и т.д.)
  if (ArrayBuffer.isView(source)) {
    const copy = new (source.constructor as any)(source.buffer.slice(0));
    cache.set(source, copy);
    return copy as T;
  }

  // Обработка Error (ошибки)
  if (source instanceof Error) {
    const copy = new (source.constructor as any)(source.message);
    copy.stack = source.stack;
    copy.name = source.name;
    cache.set(source, copy);
    return copy as T;
  }

  // Обработка обычных объектов и массивов
  // Сохраняем прототип исходного объекта
  const proto = Object.getPrototypeOf(source);
  const copy: any = Array.isArray(source) ? [] : Object.create(proto);
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