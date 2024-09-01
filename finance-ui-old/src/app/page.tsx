'use client';

import dynamic from "next/dynamic";

//@ts-ignore
export default dynamic(
    //<div>test</div>
    () => import("./MainRouter"),
    { ssr: false }
  )
