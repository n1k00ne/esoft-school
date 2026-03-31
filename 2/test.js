import { deepClone } from './deepClone';

describe('deepClone', () => {
  describe('примитивные типы', () => {
    test('копирует числа', () => {
      expect(deepClone(42)).toBe(42);
      expect(deepClone(-5.5)).toBe(-5.5);
    });

    test('копирует строки', () => {
      expect(deepClone('hello')).toBe('hello');
      expect(deepClone('')).toBe('');
    });

    test('копирует булевы значения', () => {
      expect(deepClone(true)).toBe(true);
      expect(deepClone(false)).toBe(false);
    });

    test('копирует null и undefined', () => {
      expect(deepClone(null)).toBe(null);
      expect(deepClone(undefined)).toBe(undefined);
    });
  });

  describe('простые объекты', () => {
    test('создает глубокую копию вложенных объектов', () => {
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

      // Проверка независимости вложенных объектов
      copy.details.rooms = 5;
      copy.tags.push("spacious");
      copy.createdAt.setFullYear(2025);
      copy.settings.set("theme", "light");

      expect(original.details.rooms).toBe(3);
      expect(original.tags).toEqual(["cozy", "modern"]);
      expect(original.createdAt).toEqual(new Date("2024-01-01"));
      expect(original.settings.get("theme")).toBe("dark");
    });

    test('копирует все собственные свойства', () => {
      const original = { a: 1, b: 2, c: 3 };
      const copy = deepClone(original);
      
      expect(copy).toEqual(original);
      expect(copy).not.toBe(original);
    });
  });

  describe('циклические ссылки', () => {
    test('корректно обрабатывает циклические ссылки в объектах', () => {
      const circular = { name: "circular" };
      circular.self = circular;
      circular.arr = [1, circular, 3];

      const circularCopy = deepClone(circular);
      
      expect(circularCopy.self).toBe(circularCopy);
      expect(circularCopy.arr[1]).toBe(circularCopy);
    });

    test('корректно обрабатывает циклические ссылки в Map', () => {
      const map = new Map();
      const obj = { key: 'value' };
      map.set('self', map);
      map.set('obj', obj);
      obj.mapRef = map;

      const mapCopy = deepClone(map);
      
      expect(mapCopy.get('self')).toBe(mapCopy);
      expect(mapCopy.get('obj').mapRef).toBe(mapCopy);
    });

    test('корректно обрабатывает циклические ссылки в Set', () => {
      const set = new Set();
      const obj = { key: 'value' };
      set.add(set);
      set.add(obj);
      obj.setRef = set;

      const setCopy = deepClone(set);
      
      expect(setCopy.has(setCopy)).toBe(true);
      expect(Array.from(setCopy)[1].setRef).toBe(setCopy);
    });
  });

  describe('сохранение прототипа', () => {
    class Person {
      constructor(name) {
        this.name = name;
      }
      greet() {
        return `Hello, I'm ${this.name}`;
      }
    }

    test('сохраняет прототип класса', () => {
      const person = new Person("Alice");
      const personCopy = deepClone(person);

      expect(personCopy).toBeInstanceOf(Person);
      expect(personCopy.greet()).toBe("Hello, I'm Alice");
      expect(personCopy.constructor).toBe(Person);
    });

    test('сохраняет прототип объекта', () => {
      const proto = { customMethod() { return 'proto method'; } };
      const obj = Object.create(proto);
      obj.name = 'test';

      const copy = deepClone(obj);
      
      expect(Object.getPrototypeOf(copy)).toBe(proto);
      expect(copy.customMethod()).toBe('proto method');
    });
  });

  describe('функции и символы', () => {
    test('копирует функции', () => {
      const withFunctions = {
        id: Symbol("user"),
        sayHi: function() { return "Hi"; },
        arrow: () => "arrow",
      };

      const funcCopy = deepClone(withFunctions);
      
      expect(typeof funcCopy.sayHi).toBe("function");
      expect(funcCopy.sayHi()).toBe("Hi");
      expect(funcCopy.arrow()).toBe("arrow");
    });

    test('копирует символы', () => {
      const sym1 = Symbol("secret");
      const sym2 = Symbol("key");
      const withSymbols = {
        [sym1]: "hidden",
        [sym2]: 42,
        regular: "value"
      };

      const copy = deepClone(withSymbols);
      const copySymbols = Object.getOwnPropertySymbols(copy);
      
      expect(copySymbols.length).toBe(2);
      expect(copy[sym1]).toBe("hidden");
      expect(copy[sym2]).toBe(42);
    });
  });

  describe('специальные типы', () => {
    test('копирует Date', () => {
      const date = new Date("2024-01-01T12:00:00Z");
      const copy = deepClone(date);
      
      expect(copy).toEqual(date);
      expect(copy).not.toBe(date);
      expect(copy.getTime()).toBe(date.getTime());
      
      // Проверка независимости
      copy.setFullYear(2025);
      expect(date.getFullYear()).toBe(2024);
    });

    test('копирует RegExp', () => {
      const regex = /test/gi;
      const copy = deepClone(regex);
      
      expect(copy).toEqual(regex);
      expect(copy).not.toBe(regex);
      expect(copy.source).toBe(regex.source);
      expect(copy.flags).toBe(regex.flags);
    });

    test('копирует Map', () => {
      const original = new Map([
        ['key1', 'value1'],
        ['key2', { nested: 'value' }],
        [Symbol('sym'), 'symbol value']
      ]);
      
      const copy = deepClone(original);
      
      expect(copy).not.toBe(original);
      expect(copy.get('key1')).toBe('value1');
      expect(copy.get('key2')).toEqual({ nested: 'value' });
      expect(copy.get('key2')).not.toBe(original.get('key2'));
    });

    test('копирует Set', () => {
      const original = new Set([1, 2, { nested: 'value' }, [3, 4]]);
      const copy = deepClone(original);
      
      expect(copy).not.toBe(original);
      expect(copy.has(1)).toBe(true);
      expect(copy.has(2)).toBe(true);
      
      const nestedObj = Array.from(copy).find(item => typeof item === 'object' && !Array.isArray(item));
      const originalNested = Array.from(original).find(item => typeof item === 'object' && !Array.isArray(item));
      expect(nestedObj).toEqual(originalNested);
      expect(nestedObj).not.toBe(originalNested);
    });

    test('копирует ArrayBuffer', () => {
      const buffer = new ArrayBuffer(8);
      const view = new Uint8Array(buffer);
      view.set([1, 2, 3, 4]);
      
      const copy = deepClone(buffer);
      const copyView = new Uint8Array(copy);
      
      expect(copy).not.toBe(buffer);
      expect(copy.byteLength).toBe(8);
      expect(Array.from(copyView)).toEqual([1, 2, 3, 4, 0, 0, 0, 0]);
      
      // Проверка независимости
      copyView[0] = 99;
      expect(view[0]).toBe(1);
    });

    test('копирует TypedArray', () => {
      const typedArray = new Int32Array([1, 2, 3, 4]);
      const copy = deepClone(typedArray);
      
      expect(copy).not.toBe(typedArray);
      expect(copy).toEqual(typedArray);
      expect(copy.buffer).not.toBe(typedArray.buffer);
      
      // Проверка независимости
      copy[0] = 99;
      expect(typedArray[0]).toBe(1);
    });

    test('копирует Error', () => {
      const error = new TypeError('Test error message');
      error.custom = 'custom property';
      
      const copy = deepClone(error);
      
      expect(copy).not.toBe(error);
      expect(copy).toBeInstanceOf(TypeError);
      expect(copy.message).toBe('Test error message');
      expect(copy.custom).toBe('custom property');
      expect(copy.stack).toBe(error.stack);
    });
  });

  describe('геттеры и сеттеры', () => {
    test('сохраняет геттеры и сеттеры', () => {
      const obj = {
        _value: 0,
        get value() { return this._value; },
        set value(v) { this._value = v * 2; }
      };
      
      const copy = deepClone(obj);
      copy.value = 5;
      
      expect(copy.value).toBe(10);
      expect(copy._value).toBe(10);
      expect(obj.value).toBe(0);
    });

    test('сохраняет дескрипторы свойств', () => {
      const obj = {};
      Object.defineProperty(obj, 'readonly', {
        value: 42,
        writable: false,
        enumerable: true,
        configurable: false
      });
      
      const copy = deepClone(obj);
      const descriptor = Object.getOwnPropertyDescriptor(copy, 'readonly');
      
      expect(descriptor.writable).toBe(false);
      expect(descriptor.configurable).toBe(false);
      expect(copy.readonly).toBe(42);
    });
  });

  describe('сложные вложенные структуры', () => {
    test('копирует глубоко вложенные структуры', () => {
      const complex = {
        level1: {
          level2: {
            level3: {
              date: new Date(),
              map: new Map([['deep', { value: 'nested' }]]),
              set: new Set([1, 2, 3]),
              array: [1, { a: 2 }, [3, 4]]
            }
          }
        }
      };
      
      const copy = deepClone(complex);
      
      expect(copy).toEqual(complex);
      expect(copy.level1.level2.level3.map.get('deep')).not.toBe(
        complex.level1.level2.level3.map.get('deep')
      );
      expect(copy.level1.level2.level3.set).not.toBe(complex.level1.level2.level3.set);
    });
  });
});