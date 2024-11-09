import {
    Box,
    Grid2 as Grid,
    Paper,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs
} from "@mui/material"
import {useQuery} from "@tanstack/react-query"
import {getByMemberId, LOAN} from "../../repositories/loan"
import useUserInfo from "../../components/userContext"
import * as React from "react"
import {useEffect, useState} from "react"
import ClientRow from "./ClientRow";
import {Loan, MemberProfile} from "FinanceApi"
import {getMemberProfile, MEMBER_PROFILE} from "../../repositories/memberProfile";
import moment from "moment"
import {FormattedAmount} from "../../components/NumberInput";



const CoBorrowerView = ({year} : {year:number})=>{
    const {user} = useUserInfo()
    const {data: loans} = useQuery<Loan[]>({queryKey:[LOAN, {coBorrowerId: user.userId!}], queryFn: ()=>getByMemberId(user.userId!)})
    const {data: memberProfile } = useQuery<MemberProfile>({ queryKey: [MEMBER_PROFILE, { userId: user.userId!, year }], queryFn: () => getMemberProfile(user.userId!, year) })
    
    const [tab,setTab] = useState("borrowers")
    const [data,setData] = useState<any[]>([])


    useEffect(()=>{
        if(!loans) return
        let data = loans.filter(l=>l.status=="Active").reduce((p : any[],c: Loan)=>{
            let item = p.find(e=>e.userId ==c.userId )
            if(!item){
                p.push({
                    userId : c.userId,
                    loans: [c]
                })
            }else{
                item.loans.push(c)
            }
            return p;
        },[])
        setData(data)
    },[loans])


    return <>
        <Box >
            <Paper>
                <Grid container width="100%">
                            
                    <Grid size={12}>
                        <Tabs
                            value={tab}
                            onChange={(_, value)=>setTab(value)}
                            textColor="secondary"
                            indicatorColor="secondary"
                            aria-label="secondary tabs example"
                        >
                            <Tab value="contribution" label="Contributions"/>
                            <Tab value="borrowers" label="Clients / Borrowers" />
                        </Tabs>
                    </Grid>
                    {tab=="contribution" && <Grid size={12}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>#</TableCell>
                                        <TableCell>For Date</TableCell>
                                        <TableCell>Date Received</TableCell>
                                        <TableCell>Amount</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {!!memberProfile && memberProfile.contributions.map(l=><TableRow key={l.index}>
                                        <TableCell>{l.index}</TableCell>
                                        <TableCell>{moment(l.forDate).format("MMM DD")}</TableCell>
                                        <TableCell>{moment(l.date).format("MMM DD")}</TableCell>
                                        <TableCell>{FormattedAmount(l.amount)}</TableCell>
                                    </TableRow>)}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>}
                    {tab == "borrowers" && <Grid size={12}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell></TableCell>
                                        <TableCell>Client </TableCell>
                                        <TableCell>Principal </TableCell>
                                        <TableCell>Interests</TableCell>
                                        <TableCell>Payments</TableCell>
                                        <TableCell>Balance</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.map(d=><ClientRow item={d} />)}
                                </TableBody>
                            </Table>
                        </TableContainer>    
                    </Grid>}
                </Grid>
            </Paper>
        </Box>
    </>
}

export default CoBorrowerView