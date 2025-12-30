export function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  
  return result;
}

export function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

export function removeDuplicates<T>(array: T[]): T[] {
  return [...new Set(array)];
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

export function sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

export function findById<T extends { id: string }>(array: T[], id: string): T | undefined {
  return array.find(item => item.id === id);
}

export function findIndexById<T extends { id: string }>(array: T[], id: string): number {
  return array.findIndex(item => item.id === id);
}

export function filterBy<T>(array: T[], key: keyof T, value: any): T[] {
  return array.filter(item => item[key] === value);
}

export function includesAny<T>(array: T[], values: T[]): boolean {
  return array.some(item => values.includes(item));
}

export function includesAll<T>(array: T[], values: T[]): boolean {
  return values.every(value => array.includes(value));
}

export function difference<T>(array1: T[], array2: T[]): T[] {
  return array1.filter(item => !array2.includes(item));
}

export function intersection<T>(array1: T[], array2: T[]): T[] {
  return array1.filter(item => array2.includes(item));
}

export function union<T>(array1: T[], array2: T[]): T[] {
  return [...new Set([...array1, ...array2])];
}

export function range(start: number, end: number, step: number = 1): number[] {
  const result: number[] = [];
  
  for (let i = start; i <= end; i += step) {
    result.push(i);
  }
  
  return result;
}

export function sample<T>(array: T[], count: number = 1): T | T[] {
  const shuffled = shuffleArray(array);
  
  if (count === 1) {
    return shuffled[0];
  }
  
  return shuffled.slice(0, count);
}

export function partition<T>(array: T[], predicate: (item: T) => boolean): [T[], T[]] {
  return array.reduce((result, item) => {
    result[predicate(item) ? 0 : 1].push(item);
    return result;
  }, [[], []] as [T[], T[]]);
}

export function flatten<T>(array: T[][]): T[] {
  return array.reduce((result, item) => result.concat(item), [] as T[]);
}

export function zip<T, U>(array1: T[], array2: U[]): [T, U][] {
  const minLength = Math.min(array1.length, array2.length);
  const result: [T, U][] = [];
  
  for (let i = 0; i < minLength; i++) {
    result.push([array1[i], array2[i]]);
  }
  
  return result;
}

export function unzip<T, U>(array: [T, U][]): [T[], U[]] {
  return array.reduce((result, [first, second]) => {
    result[0].push(first);
    result[1].push(second);
    return result;
  }, [[], []] as [T[], U[]]);
}