import { Card, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, LinearProgress } from "@mui/material"
import UserContributionChip from "./UserContributionChip"
import { useQuery } from "@tanstack/react-query"
import numeral from "numeral"
import { useEffect, useMemo, useState } from "react"
import moment from "moment"
import cron from 'cron-parser'
import { getMemberProfiles, MEMBER_PROFILE, NewContribution, useMutateMemberProfile } from "../../../repositories/memberProfile"
import { enqueueSnackbar } from "notistack"
import { Contribution, MemberProfile } from "../../../@types/FinanceApi/memberProfile"
import {CoopOption, User, } from "FinanceApi"
import * as React from "react"


interface MemberProfilesProps {
  clients: User[],
  year:number,
  option:CoopOption,
  tab: string
}

const MemberProfiles = ({ clients, year, option, tab }: MemberProfilesProps) => {

  const { data: members } = useQuery<MemberProfile[]>({ queryKey: [MEMBER_PROFILE, { year }], queryFn: () => getMemberProfiles(year), enabled: !!option })
  const [iterations, setIterations] = useState<any[]>([])
  const { addContribution: add } = useMutateMemberProfile(year)
  const membersWithName = useMemo(() => {
    if (!members) return []
    return members.map((member: any) => {
      let user = clients.find((c: User) => c.id == member.userId)
      let contributions = member.contributions.map((e: { label: string, color: string } & Contribution) => {
        e.label = numeral(e.amount).format("0.0a")
        e.color = 'success'
        return e
      }).sort((a: Contribution, b: Contribution) => a.index - b.index)


      return {
        ...member,
        contributions,
        totalContribution: numeral(member.contributions.reduce((p: number, c: Contribution) => p + c.amount, 0)).format("0,0"),
        user
      }
    })
  }, [members])



  const addContribution = (data: NewContribution, member: any) => {
    add.mutateAsync({ ...data, year })
      .then(() => {
        enqueueSnackbar(`Successfully Added ${member.user.name}'s Contribution # ${data.index}`, { variant: 'success' })

      }).catch(err => {
        if (err?.response.status == "409") enqueueSnackbar(`Contribution # ${data.index}/ ${member.user.name} already exists`, { variant: 'error' })
      })
  }

  useEffect(() => {
    if (!option) return

    let items = [];
    let expression = moment(option.firstInstallment).format(option?.frequency?.cron);
    let interval = cron.parseExpression(expression, {
      currentDate: moment(option.firstInstallment).toDate()
    });
    let i = 1;
    items.push({
      index: 1,
      date: moment(option.firstInstallment),
      dateStr: moment(option.firstInstallment).format("YYYY-MM-DD"),
      label: moment(option.firstInstallment).format("MMM-DD")
    })
    while (i < option.installmentCount) {
      let x = interval.next();
      i++
      items.push({
        index: i,
        date: moment(x.toDate()),
        dateStr: moment(x.toDate()).format("YYYY-MM-DD"),
        label: moment(x.toDate()).format("MMM DD")
      })
    }
    setIterations(items);

  }, [option])
  return <Card variant="outlined">
    {tab == "table" && 
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell colSpan={4}>Members</TableCell>
          </TableRow>
        </TableHead>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Total</TableCell>

            {iterations.map(e => <TableCell><div>{e.label}</div></TableCell>)}
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {members && membersWithName.map((member: any) => <TableRow>
            <TableCell sx={{ whiteSpace: 'nowrap' }} >{member.user.name}</TableCell>
            <TableCell> {member.totalContribution}</TableCell>

            {iterations.map((iteration, i) => <TableCell sx={{ p: 1 }} >
              <UserContributionChip index={i} forDate={iteration.dateStr} member={member} onCreate={(data: any) => addContribution(data, member)} />
            </TableCell>)}

          </TableRow>)}

        </TableBody>
      </Table>
    </TableContainer>}
    {tab == "slim" &&
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell colSpan={4}>Members</TableCell>
          </TableRow>
        </TableHead>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Progress</TableCell>
            <TableCell>Total Count</TableCell>
            <TableCell>Total Amount</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {members && membersWithName.map((member: any, i: number) => <TableRow>
            <TableCell sx={{ whiteSpace: 'nowrap' }} >{member.user.name}</TableCell>
            <TableCell>
              <LinearProgress variant="determinate" sx={{ minWidth: '15vw', height: 7, borderRadius: 4 }} value={(member.contributions.length / option.installmentCount) * 100} />
            </TableCell>
            <TableCell>{member.contributions.length}</TableCell>
            <TableCell>{member.totalContribution}</TableCell>
            <TableCell>{<UserContributionChip index={member.contributions.length} type="button" forDate={iterations[member.contributions.length]?.dateStr} member={member} onCreate={(data: any) => addContribution(data, member)} />}</TableCell>
            

          </TableRow>)}

        </TableBody>
      </Table>

    </TableContainer>}
  </Card>
}

export default MemberProfiles