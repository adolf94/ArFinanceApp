import React, { createContext, useContext } from 'react';

interface HeaderContextType {
  height: number
  bottomHeight: number,
  set: (nextValue: HeaderContextType) => void
}

export const HeaderContextDefaultValue = {
  height: 0,
  bottomHeight: 0,
  set: (value: HeaderContextType) => { }
}
export const HeaderContext = createContext<HeaderContextType>(HeaderContextDefaultValue)

const useHeaderContext = () => {
  const data = useContext(HeaderContext)
  return data
}


export default useHeaderContext;