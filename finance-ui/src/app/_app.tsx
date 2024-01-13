import { AppProps } from 'next/app';
import React, { ReactNode, useEffect, useState } from 'react';


function App({ Component, pageProps }: AppProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(true)
    console.log("test")
  },[])

  //@ts-ignore
  return render ? <Component {...pageProps} >

    </>: null;
}
export default App;
