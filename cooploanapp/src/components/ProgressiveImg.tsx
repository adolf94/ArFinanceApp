import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";



const ProgressiveImage = (props : any) => {
    const [imgSrc, setImgSrc] = useState(props.placeholdersrc || props.src)
    const isLoading = useState(true)

    useEffect(() => {
        const img = new Image();
        img.src = props.src;
        img.onload = () => {
            setImgSrc(props.src);
        };
    }, [props.src]);

    return <Box {...props} sx={{
        ...props.sx, width: '100%', ...(imgSrc == props.src ? {
            filter: "blur(0px)",
            transition: "filter 0.5s linear"
        }: {
            filter: 'blur(10px)',
            clipPath: 'inset(0)'
        }) }} component="img" src={imgSrc} />
}

export default ProgressiveImage;