
import {Button, Chip, IconButton, Menu, MenuItem, Typography } from "@mui/material"
import { useConfirm } from "material-ui-confirm";
import moment from "moment";
import numeral from "numeral";
import { useState } from "react";
import { Contribution, MemberProfile } from "../../../@types/FinanceApi/memberProfile.js";
import { User } from "FinanceApi";
import NewContributionDialog from "./NewContributionDialog";
import * as React from "react";
import { Add } from "@mui/icons-material";

interface UserContributionChip {
    index: number,
    member: MemberProfile & {user: User, contributions: (Contribution & {label:string, color:any})[]},
    onCreate: (data:any)=> void,
    forDate: string,
    type?: "button" | "chip"
}

const UserContributionChip = ({index, member, forDate, onCreate, type}: UserContributionChip)=>{

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const confirm = useConfirm()
    const open = Boolean(anchorEl);


    const isMenuEnabled = index <= member.contributions.length;
    const handleClick = (event: any) => {
        if( index == member.contributions.length) return setAnchorEl(event.currentTarget);
        if(!isMenuEnabled) return
    };
    const handleClose = () => {
      setAnchorEl(null);
    };
    const contribution = (()=>{
        if(member.contributions[index]){
            return member.contributions[index]
          }else{
            return {
              amount:0,
              label:'-',
              color:'default'
            }
          }
    })()


    const quickAdd = ()=>{
        confirm({
            title:<Typography variant="body1">This is will add contribution to <b>{member.user.name}</b>  </Typography> ,
            confirmationText: 'Add Contribution',
            confirmationButtonProps: {variant:'contained'},
            description: <>
            
            <Typography variant="body1"><b>Amount : </b>{numeral(member.initialAmount + (member.increments! * index)).format("0,0")}  </Typography> 
            <Typography variant="body1"><b>Date :</b>{moment().format("MMM DD")}  </Typography>
        </>})
          .then(()=>{
            onCreate({
              date: moment().format("YYYY-MM-DD"),
              userId: member.userId,
              forDate,
              index:index + 1,
              amount: member.initialAmount + (member.increments! * index)
            })
            setAnchorEl(null)
          })
    }
    
    const add = (data: any)=>{
        onCreate({
            userId: member.userId,
            forDate,
            index:index + 1,
            ...data
        })
        setAnchorEl(null)
    }

    
    
    if(type=="button") return <>
        <Button variant="outlined" size="small" onClick={quickAdd} > + 500 </Button>

        <NewContributionDialog member={member} forDate={forDate} index={index} onConfirm={(data: any)=>add(data)}>
            <Button variant="outlined" size="small" >+</Button>
        </NewContributionDialog>
    </>

    return <>
        <Chip label={contribution?.label} sx={{cursor:isMenuEnabled?'pointer':'not-allowed'}} onClick={handleClick} color={contribution.color} size="small"/>
        <Menu open={open}   

            onClose={handleClose}
            anchorEl={anchorEl}
        >
            <NewContributionDialog member={member} forDate={forDate} index={index} onConfirm={(data: any)=>add(data)}>
                <MenuItem>Add Contribution </MenuItem>
            </NewContributionDialog>
            <MenuItem onClick={quickAdd}>Add Contribution ({numeral(member.initialAmount + (member.increments! * index)).format("0,0")} / {moment().format("MMM DD")})</MenuItem>
        </Menu>
    </>
     
}

export default UserContributionChip