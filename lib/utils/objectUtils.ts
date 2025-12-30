export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function deepMerge<T, U>(target: T, source: U): T & U {
  const result = { ...target } as T & U;
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        result[key] = deepMerge(result[key] as any, source[key] as any);
      } else {
        result[key] = source[key] as any;
      }
    }
  }
  
  return result;
}

export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  
  for (const key of keys) {
    if (obj.hasOwnProperty(key)) {
      result[key] = obj[key];
    }
  }
  
  return result;
}

export function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  
  for (const key of keys) {
    delete result[key];
  }
  
  return result;
}

export function isEmpty(obj: any): boolean {
  if (obj === null || obj === undefined) return true;
  
  if (typeof obj === 'object') {
    return Object.keys(obj).length === 0;
  }
  
  if (Array.isArray(obj)) {
    return obj.length === 0;
  }
  
  if (typeof obj === 'string') {
    return obj.trim() === '';
  }
  
  return false;
}

export function getNestedValue(obj: any, path: string, defaultValue: any = undefined): any {
  return path.split('.').reduce((acc, part) => {
    return acc?.[part] ?? defaultValue;
  }, obj);
}

export function setNestedValue(obj: any, path: string, value: any): any {
  const parts = path.split('.');
  const last = parts.pop() as string;
  
  const target = parts.reduce((acc, part) => {
    if (!acc[part]) {
      acc[part] = {};
    }
    return acc[part];
  }, obj);
  
  target[last] = value;
  
  return obj;
}

export function mapKeys(obj: any, mapper: (key: string) => string): any {
  return Object.keys(obj).reduce((result, key) => {
    result[mapper(key)] = obj[key];
    return result;
  }, {} as any);
}

export function mapValues<T, U>(obj: Record<string, T>, mapper: (value: T, key: string) => U): Record<string, U> {
  return Object.keys(obj).reduce((result, key) => {
    result[key] = mapper(obj[key], key);
    return result;
  }, {} as Record<string, U>);
}

export function invert(obj: Record<string, string>): Record<string, string> {
  return Object.keys(obj).reduce((result, key) => {
    result[obj[key]] = key;
    return result;
  }, {} as Record<string, string>);
}

export function toQueryString(obj: Record<string, any>): string {
  return Object.keys(obj)
    .filter(key => obj[key] !== undefined && obj[key] !== null)
    .map(key => {
      const value = obj[key];
      
      if (Array.isArray(value)) {
        return value.map(v => `${encodeURIComponent(key)}[]=${encodeURIComponent(v)}`).join('&');
      }
      
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join('&');
}

export function fromQueryString(query: string): Record<string, string | string[]> {
  return query.split('&').reduce((result, pair) => {
    const [key, value] = pair.split('=');
    const decodedKey = decodeURIComponent(key);
    const decodedValue = decodeURIComponent(value || '');
    
    if (decodedKey.endsWith('[]')) {
      const arrayKey = decodedKey.slice(0, -2);
      
      if (!result[arrayKey]) {
        result[arrayKey] = [];
      }
      
      (result[arrayKey] as string[]).push(decodedValue);
    } else {
      result[decodedKey] = decodedValue;
    }
    
    return result;
  }, {} as Record<string, string | string[]>);
}

export function camelCaseToSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

export function snakeCaseToCamelCase(str: string): string {
  return str.replace(/_[a-z]/g, letter => letter[1].toUpperCase());
}

export function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(item => toCamelCase(item));
  }
  
  if (typeof obj === 'object' && obj !== null) {
    return Object.keys(obj).reduce((result, key) => {
      result[snakeCaseToCamelCase(key)] = toCamelCase(obj[key]);
      return result;
    }, {} as any);
  }
  
  return obj;
}

export function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(item => toSnakeCase(item));
  }
  
  if (typeof obj === 'object' && obj !== null) {
    return Object.keys(obj).reduce((result, key) => {
      result[camelCaseToSnakeCase(key)] = toSnakeCase(obj[key]);
      return result;
    }, {} as any);
  }
  
  return obj;
}