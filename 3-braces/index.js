/**
 * Проверяет, является ли строка с правильными скобками
 *
 * @param {string} s - Строка, содержащая символы скобок
 * @returns {boolean} - true, если последовательность правильная, иначе false
 */
function isValid(s) {
  if (s.length === 0) return true;

  if (s.length % 2 !== 0) return false;

  const stack = [];

  const matchingBrackets = {
    ')': '(',
    ']': '[',
    '}': '{'
  };

  for (let i = 0; i < s.length; i++) {
    const char = s[i];

    if (char === '(' || char === '[' || char === '{') {
      stack.push(char);
    }
    else if (char === ')' || char === ']' || char === '}') {
      if (stack.length === 0) {
        return false;
      }

      const lastOpen = stack.pop();

      if (lastOpen !== matchingBrackets[char]) {
        return false;
      }
    }
    else {
      return false;
    }
  }

  return stack.length === 0;
}

console.log(isValid("{[]}"));    // true
console.log(isValid(""));        // true
console.log(isValid("()"));      // true
console.log(isValid("()[]{}"));  // true
console.log(isValid("((()))"));  // true
console.log(isValid("(]"));      // false
console.log(isValid("([)]"));    // false
console.log(isValid("("));       // false
console.log(isValid("((())"));   // false

