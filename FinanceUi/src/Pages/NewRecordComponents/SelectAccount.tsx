import { useQuery } from "@tanstack/react-query";
import { ACCOUNT_GROUP, fetchGroups } from "../../repositories/accountgroups";
import { ACCOUNT, fetchAccounts } from "../../repositories/accounts";
import {
  Box,
  Dialog,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Close,
  ArrowForwardIos as IcoArrowForwardIos,
} from "@mui/icons-material";
import React, { useEffect, useState, useMemo } from "react";
import { Account, AccountGroup, Vendor } from "FinanceApi";
import { v4 as uuid } from "uuid";
import {
  fetchVendors,
  useMutateVendor,
  VENDOR,
} from "../../repositories/vendors";
import Calculator from "../../components/Calculator";

interface SelectAccountProps<T> {
  value: T;
  onChange: (value: T) => void;
  onClose: () => void;
  selectType: string;
  typeId?: string;
  show: boolean;
  internalKey: string;
}

interface AcctGroupListItem {
    id: string;
    name: string;
    hotkeyName: string;
    hotkeyStart: number,
    hotkey:string,
    
}

function AcctGroupListItem<T>({ acct, onClick, internalKey, idSelected }: { acct: T, onClick: (acct: T) => void, idSelected : string }) {

    let item = acct as unknown as AcctGroupListItem
    
    let diff = item.hotkeyName.length -item.name.length
    
    return <ListItemButton
        selected={item.id === (idSelected || "")}
        onClick={() => onClick(acct)}
    >
        <Box component="span">{item.hotkeyName.slice(0, item.hotkeyStart)}</Box>
        <Box component="span" sx={{fontWeight:'bold'}}>
            {item.hotkeyName.slice(item.hotkeyStart, item.hotkeyStart + item.hotkey.length - diff)}
            
        </Box>
        {diff > 0 && <Box component="span" sx={{fontWeight:'bold', color:"#cecece"}}>
            {item.hotkeyName.slice(-diff)}

		</Box>}
        <Box component="span">{item.hotkeyStart==item.name.length?"":item.hotkeyName.slice(item.hotkeyStart + item.hotkey.length)}</Box>

        
        {/*<Box element="span" sx={{fontWeight:'bold'}}>{acct.name.slice(0, acct.hotkey.length)}</Box>*/}
        {/*{acct.hotkey.length > acct.name.length?*/}
        {/*    <Box component="span" sx={{fontWeight:"bold",color: 'text.disabled'}}>{acct.hotkey.slice(acct.name.length)}</Box>:*/}
        {/*    acct.name.slice(acct.hotkey.length)}*/}
    </ListItemButton> 
}


function SelectAccount(props: SelectAccountProps<any>) {
  const { data: stgAcctGroups, isLoading: groupLoading } = useQuery({
    queryKey: [ACCOUNT_GROUP],
      placeholderData:[],
      queryFn: fetchGroups,
  });
  const { data: stgAccounts, isLoading: acctLoading } = useQuery({
      queryKey: [ACCOUNT], 
      placeholderData:[], 
      queryFn: fetchAccounts,
  });
  const { data: vendors, isLoading: vendorLoading } = useQuery<Vendor[]>({
    queryKey: [VENDOR],
      placeholderData:[],
      queryFn: fetchVendors,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const mutateVendor = useMutateVendor();

  const [acctGroup, setAcctGroup] = useState<(AccountGroup | Vendor) & { hotkey : string }>();
  const [acct, setAcct] = useState<Account>();
    const [hotkey,setHotkey] = useState<string>("")
    const [type,setType] = useState<string>("")
  const theme = useTheme();
  const sm = useMediaQuery(theme.breakpoints.down("lg"));

    const setValue = (value) => {

        setAcct(value);
        props.onChange({ ...value });
        if(value !== null && acct !==null && acct?.id === value?.id ) props.onClose()
    };

    const accountGroups = useMemo(()=>{


        let commonStart = stgAcctGroups
            .filter((e) => e.accountTypeId === props.typeId)
            .reduce((prev,cur,ci,s)=>{
                //will check if string has match
                // s.forEach((sv,si,ss)=>{
                // will check on any matching

                let len = prev.reduce((p,e,i)=>{
                    if(e==cur.name.slice(0,e.length).toLowerCase()
                        && p < e.length
                    ) return e.length
                    return p
                },0) + 1

                let hotkey = ""
                let currentHotkey = ""
                let hasMatch = true
                while(hasMatch){
                    // to add 1 to len\
                    hotkey = currentHotkey
                    currentHotkey = cur.name.slice(0,len).toLowerCase()

                    hasMatch = s.some((e,i)=>
                        ci!=i && e.name.slice(0,len).toLowerCase() === currentHotkey)
                    len++
                }
                if(hotkey != "") prev.push(hotkey)
                // })  
                return prev

            },[])

        console.log("grpcommon", commonStart)
        // stgAcctGroups
        //     .filter((e) => e.accountTypeId === props.typeId)
        //     .map((v,i,s)=>{
        //        
        //        
        //        
        //     })
        //


        return stgAcctGroups
            .filter((e) => e.accountTypeId === props.typeId)
            .map((v,i,s)=> {

                let preHotkeyMatch = commonStart.reduce((p,e,i)=>{
                    if(e==v.name.slice(0,e.length).toLowerCase()
                        && p.length < e.length
                    ) return e
                    return p
                },"")
                v.hotkeyStart = preHotkeyMatch.length
                v.commonStartName = preHotkeyMatch
                return {...v}
            })
            .map((v,i,s)=>{
                let hs = v.hotkeyStart
                let len = 1
                let hotkeyItem = s.reduce((prev,cur,ci)=>{
                    if(ci==i) return prev;
                    let chs = cur.hotkeyStart
                    let vhs = v.hotkeyStart
                    let clen = cur.hotkeyStart  + len
                    let vlen = v.hotkeyStart + len


                    // if(cur.name.slice(0,hs).toLowerCase() != (v.commonStartName)) return prev;

                    if(cur.name.slice(chs,clen).toLowerCase() != (prev.hotkey)) return prev;
                    if( v.name.toLowerCase() == v.commonStartName )  return {
                        name:v.name,
                        hotkeyName : v.name + i,
                        hotkey: i.toString()
                    } 
                    
                    let hotkey  = v.name.slice(hs,vlen).toLowerCase()
                    
                    if( v.name.slice(vhs).length == len ){
                        return {
                            name:v.name,
                            hotkeyName : v.name + i,
                            hotkey: i.toString()
                        }
                    }

                    while(cur.name.slice(chs,chs + len).toLowerCase() == hotkey){
                        len += 1
                        if( v.name.slice(vhs).length == len &&
                            v.name.slice(vhs,vhs + len).toLowerCase() == cur.name.slice(chs,chs + len).toLowerCase()) return {
                            name:v.name,
                            hotkeyName : v.name + i,
                            hotkey:i
                        }
                        hotkey = v.name.slice(vhs,vhs + len).toLowerCase()
                    }
                    return {
                        name:v.name,
                        hotkeyName : v.name,
                        hotkey: hotkey
                    }
                }, {
                    name: v.name,
                    hotkeyName : v.name,
                    hotkey: v.name.slice(hs, hs + len).toLowerCase()
                })


                let returnItem ={
                    ...v,
                    hotkeyName : hotkeyItem.hotkeyName,
                    hotkey: hotkeyItem.hotkey
                }
                console.log(hotkeyItem)
                return returnItem
        })
    },[stgAcctGroups, props.typeId])
    
    
    const accounts = useMemo(()=>{
        if(!acctGroup) return []


        let commonStart = stgAccounts
            .filter((e) => e.accountGroupId === acctGroup.id)
            .reduce((prev,cur,ci,s)=>{
                //will check if string has match
                // s.forEach((sv,si,ss)=>{
                    // will check on any matching
                    
                    let len = prev.reduce((p,e,i)=>{
                        if(e==cur.name.slice(0,e.length).toLowerCase()
                            && p < e.length
                        ) return e.length
                        return p
                    },0) + 1

                    let hotkey = ""
                    let currentHotkey = ""
                    let hasMatch = true
                    while(hasMatch){
                        // to add 1 to len\
                        hotkey = currentHotkey
                        currentHotkey = cur.name.slice(0,len).toLowerCase()
                            
                        hasMatch = s.some((e,i)=>
                            ci!=i && e.name.slice(0,len).toLowerCase() === currentHotkey)
                        len++                        
                    }
                    if(hotkey != "") prev.push(hotkey)
                // })  
                return prev
                            
            },[])
        
        console.log("common", commonStart)

        return stgAccounts
            .filter((e) => e.accountGroupId === acctGroup.id)
            .map((v,i,s)=> {

                let preHotkeyMatch = commonStart.reduce((p,e,i)=>{
                    if(e==v.name.slice(0,e.length).toLowerCase()
                        && p.length < e.length
                    ) return e
                    return p
                },"")
                v.hotkeyStart = preHotkeyMatch.length
                v.commonStartName = preHotkeyMatch
                return {...v}
            })
            .map((v,i,s)=>{
                let hs = v.hotkeyStart
                let len = 1
                let hotkeyItem = s.reduce((prev,cur,ci)=>{
                    if(ci==i) return prev;
                    let chs = cur.hotkeyStart
                    let vhs = v.hotkeyStart
                    let clen = cur.hotkeyStart  + len
                    let vlen = v.hotkeyStart + len
                    
                    
                    // if(cur.name.slice(0,hs).toLowerCase() != (v.commonStartName)) return prev;

                    if( v.name.toLowerCase() == v.commonStartName )  return {
                        name:v.name,
                        hotkeyName : v.name + i,
                        hotkey: i.toString()
                    }

                    if(cur.name.slice(chs,clen).toLowerCase() != (prev.hotkey)) return prev;
                    let hotkey  = v.name.slice(hs,vlen).toLowerCase()
                    if( v.name.slice(vhs).length == len ){
                        return {
                            name:v.name,
                            hotkeyName : v.name + i,
                            hotkey: hotkey + i.toString()
                        }
                    }
                    
                    while(cur.name.slice(chs,chs + len).toLowerCase() == hotkey){
                        len += 1
                        if( v.name.slice(vhs).length == len &&
                            v.name.slice(vhs,vhs + len).toLowerCase() == cur.name.slice(chs,chs + len).toLowerCase()) return {
                            name:v.name,
                            hotkeyName : v.name + i,
                            hotkey:i
                        }
                        hotkey = v.name.slice(vhs,vhs + len).toLowerCase()
                    }
                    return {
                        name:v.name,
                        hotkeyName : v.name,
                        hotkey: hotkey
                    }
                }, {
                    name: v.name,
                    hotkeyName : v.name,
                    hotkey: v.name.slice(hs, hs + len).toLowerCase()
                })


                let returnItem ={
                    ...v,
                    parentHotkey:acctGroup.hotkey,
                    totalHotkey:acctGroup.hotkey + hotkeyItem.hotkey,
                    hotkeyName : hotkeyItem.hotkeyName,
                    hotkey: hotkeyItem.hotkey
                }
                console.log(hotkeyItem)
                return returnItem
            })
        
        
        //
        // return stgAccounts
        //     .filter((e) => e.accountGroupId === acctGroup.id)
        //     .map((v,i,s)=>{
        //         let len = 1
        //         let hotkeyItem = s.reduce((prev,cur,ci)=>{
        //             if(ci==i) return prev;
        //             if(cur.name.slice(0,len).toLowerCase() != prev.hotkey) return prev;
        //             let hotkey  = v.name.slice(0,len).toLowerCase()
        //             while(cur.name.slice(0,len).toLowerCase() == hotkey){
        //                 len += 1
        //                 if(len == v.name.length &&
        //                     cur.name.slice(0,len).toLowerCase() == v.name.slice(0,len).toLowerCase()) return {
        //                     name:v.name,
        //                     hotkey: prev.name.toLowerCase() + i
        //                 }
        //                 hotkey = v.name.slice(0,len).toLowerCase()
        //             }
        //             return {
        //                 name:v.name,
        //                 hotkey: hotkey
        //             }
        //         }, {
        //             name: v.name,   
        //             hotkey: v.name.slice(0, len).toLowerCase()
        //         })
        //        
        //         return {
        //             ...v,
        //             parentHotkey:acctGroup.hotkey,
        //             totalHotkey:acctGroup.hotkey + hotkeyItem.hotkey,
        //             hotkey: hotkeyItem.hotkey
        //         }
        //     })
    },[stgAccounts, acctGroup])
    
    
    
    
    
    
  useEffect(() => {
    if (!props.value) return;
    const value = props.value;
    if (props.selectType === "account") {
      if (value.accountGroup == null)
        value.accountGroup = (accountGroups || []).find(
          (e) => e.id === value.accountGroupId,
        );
      setAcctGroup(value.accountGroup);
      setAcct(value);
    }
  }, [props.value, accountGroups, props.selectType]);

    useEffect(() => {
        let hkLen = hotkey.length
        let acctG = {
            partialSearch : false,
            exactSearch : false
        }
        //
        let acctGMatch = accountGroups.find(a=>{
            acctG = {
                partialSearch : false,
                exactSearch : false
            }
            //
            if(hkLen >= a.hotkey.length) acctG.exactSearch = true
            if(acctG.exactSearch){
                return hotkey.slice(0,a.hotkey.length) == a.hotkey
            }
                        
            if(hkLen < a.hotkey.length) acctG.partialSearch = true
            
            return a.hotkey.slice(0,hkLen) == hotkey
        })
        
        if(!acctGMatch){
           //startFromScratch 
            setAcctGroup(null)
            if(hotkey.length > 1)setHotkey(hotkey.slice(-1))
            return
        }
        if(acctG.partialSearch){
            //continue
            return;
        }
        //there is a match for acctGroup - to be selected
        let acctHotkey = hotkey.slice(acctGMatch.hotkey.length)
        
        if(acctGroup?.id != acctGMatch.id){
            setAcctGroup(acctGMatch)
            return;
        }
        if(!acctHotkey) return  
        let partialSearch = false;
        let acctMatch = accounts.find(a=>{
            acctG = {
                partialSearch : false,
                exactSearch : false
            }
            //
            if(acctHotkey.length == a.hotkey.length){
                //exact match --- to be selected
                return acctHotkey == a.hotkey
            }
            if(acctHotkey.length > a.hotkey.length)  return false
            if(a.hotkey.slice(0, acctHotkey.length) == acctHotkey){
                partialSearch = true
                return true
            }
            return false
        })
        if(partialSearch){
            //continue w/o select
            return
        }
        if(!!acctMatch){
            setValue(acctMatch)
            setHotkey("")
            return
        }

        setValue(null)
        setHotkey(hotkey.slice(-1))
        return;
    }, [hotkey]);  
    
    
  useEffect(() => {
      
      if(props.selectType == "vendor")  return 
      if(props.selectType != type){
          setType(props.selectType)
          setHotkey("");
      }
        let eventFn = (evt)=>{
            if(evt.keyCode === 13){
                if(!!acct) {
                    props.onChange({ ...acct });
                    props.onClose()
                    return;
                }
                return 
            }
          
            setHotkey(e=>e+evt.key)
        }
        window.addEventListener('keypress',eventFn)
      return ()=>window.removeEventListener("keypress", eventFn);
      
  },[props.selectType, acct])
    

    const createNewVendor = () => {
        if(mutateVendor.loading) return
        let newVendor = {
            id: uuid(),
            name: searchQuery,
            enabled: true,
        }
        props.onChange(newVendor);
        setSearchQuery("");
        props.onClose();
        mutateVendor
          .create(newVendor)
          .then((e) => {
            props.onChange(e);
          }).catch(e=>props.onChange(null));
  };

  const onClose = () => {
    setSearchQuery("");
    props.onClose();
  };

  const filteredVendors = (vendors || []).filter(
    (f) => f.name.indexOf(searchQuery.toLowerCase()) > -1,
  );

  return (
    <Grid container>
      <Grid item xs={12} sx={{ px: 2, pt: 1 }}>
        <Grid container sx={{ display: "flex", justifyItems: "center" }}>
          <Grid item sx={{ flexGrow: 1 }}>
              {hotkey}
            {props.selectType == "vendor" ? (
              <TextField
                value={searchQuery}
                fullWidth
                onChange={(evt) => setSearchQuery(evt.target.value)}
                variant="standard"
                placeholder="Search Vendors"
              />
            ) : (
              <Typography variant="body1" sx={{ pt: 1 }}>
                Select
              </Typography>
            )}
          </Grid>
          <Grid item sx={{ flexShrink: 1 }}>
            <IconButton onClick={() => onClose()}>
              <Close />
            </IconButton>
          </Grid>
        </Grid>
      </Grid>
      {props.selectType === "account" && !groupLoading && (
        <>
          <Grid item xs={6}>
            <List>
              {(accountGroups || [])
                  .map((e, i) => {
                  return (
                    <ListItemButton
                      selected={!!acctGroup && e.id === acctGroup?.id}
                      onClick={() => setAcctGroup(e)}
                      key={i}
                    >
                        <Box component="span">{e.commonStartName}</Box>
                        <Box component="span" sx={{fontWeight:'bold'}}>{ e.hotkeyName.slice(e.hotkeyStart, e.hotkey.length)}</Box>
                        <Box component="span">{e.hotkeyName.slice(e.hotkeyStart + e.hotkey.length)}</Box>
                        
                        
                        
                        {/*<Box component="span" sx={{fontWeight:'bold'}}>{e.name.slice(0, e.hotkey.length)}</Box>*/}
                        
                        {/*<Box component="span" sx={{fontWeight:'bold'}}>{e.name.slice(0, e.hotkey.length)}</Box>*/}
                        {/*{e.hotkey.length > e.name? */}
                        {/*    <Box component="span" sx={{fontWeight:"bold"}}>{e.hotkey.slice(e.name.length)}</Box>:*/}
                        {/*    e.name.slice(e.hotkey.length)}*/}
                    </ListItemButton>   
                  );
                })}
            </List>
          </Grid>
          <Grid item xs={6}>
            <List>=
              {(accounts || [])
                .filter((e) => acctGroup && e.accountGroupId === acctGroup?.id)
                .map((f) => (
                    <AcctGroupListItem
                        acct={f}
                        idSelected={acct?.id }
                        onClick={() => setValue(f)}
                        key={props.internalKey + "_" + f.id}
                    >
                  </AcctGroupListItem>
                ))}
            </List>
          </Grid>
        </>
      )}
      {props.selectType === "vendor" && (
        <Grid item xs={8}>
          <List>
            {(filteredVendors || []).map((e, i) => (
              <ListItemButton
                selected={e.id === acct?.id}
                onClick={() => setValue(e)}
                key={i}
              >
                {e.name}
              </ListItemButton>
            ))}
            {searchQuery &&
              !filteredVendors.some((f) => f.name.startsWith(searchQuery)) && (
                <ListItem button onClick={createNewVendor}>
                  Add "{searchQuery}"
                </ListItem>
              )}
          </List>
        </Grid>
      )}
    </Grid>
  );
}

function SelectAccountContainer(props: SelectAccountProps<any>) {
  const theme = useTheme();
  const sm = useMediaQuery(theme.breakpoints.down("lg"));

  return (
    <>
      {props.show && !sm && (
        <Box display={{ xs: "none", sm: "block" }}>
          {props.selectType !== "calculate" && <SelectAccount {...props} />}
          {props.selectType === "calculate" && <Calculator {...props} />}
        </Box>
      )}
      <Dialog
        open={props.show && sm}
        fullScreen
        sx={{
          position: "absolute",
          top: "40%",
        }}
        maxWidth="lg"
        onClose={props.onClose}
      >
        {props.selectType !== "calculate" && <SelectAccount {...props} />}
        {props.selectType === "calculate" && <Calculator {...props} />}
      </Dialog>
    </>
  );
}

export default SelectAccountContainer;
