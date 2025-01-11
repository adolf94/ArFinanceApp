import {NavigateFunction, useNavigate } from "react-router-dom";


export const navigate = {
    push : (()=>{}) as any
}

const NavigateSetter = () => {

    navigate.push = useNavigate()


    return null;


}

export  default  NavigateSetter;