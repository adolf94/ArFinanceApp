import { exp } from "mathjs";

export default function replaceById<T>(
  item: T | T[],
  array: T[],
  prop: string = "id",
): T[] {
  if (!array) array = [];
  if (!item) return array;

  if (Array.isArray(item)) {
    return item.reduce((prev, cur) => {
      return replaceById(cur, prev, prop);
    }, array);
  } else {
      let index = array.findIndex((e) => (e[prop] === item[prop]));
      if (index === -1) {
          return [...array, item]
      }
      array[index] = item;
  }

  return [...array];
}
