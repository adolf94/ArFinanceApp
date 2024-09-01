import { exp } from "mathjs";



export default function replaceById<T> (item : T | T[], array : T[], prop : string = "id") : T[]{
  if (!array) array = []
  if (!item) return array;
  let index = array.findIndex(e => e[prop] = item[prop])
  if (Array.isArray(item)) {
    return array.reduce((prev, cur) => {
      return replaceById(cur, prev, prop)
    },array)
  } else {
    array[index] = item
  }


  return [...array];

}



