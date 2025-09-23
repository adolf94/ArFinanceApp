import { Box, Card, Grid2 as Grid, Typography } from "@mui/material";
import {PieChart} from "@mui/x-charts"
import { useLiveQuery } from "dexie-react-hooks";
import db from "../../components/LocalDb";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ACCOUNT_GROUP, fetchGroups } from "../../repositories/accountgroups";
import numeral from "numeral";
import { getRandomShadeOfGreen, getRandomShadeOfRed } from "../../common/randomShades";
import { CardBody } from "reactstrap";



const AccountChart = ()=>{
	const {data:groups, isLoading} = useQuery({
		queryKey: [ACCOUNT_GROUP],
		queryFn: ()=>fetchGroups()
	})
  const data = useLiveQuery(()=>db.accounts.toArray(),[])

	const computed = useMemo(()=>{
		if(!groups || !data) return[
			{
				id: "assets",
				innerRadius: 0,
				outerRadius: 70,
				data: [],
				valueFormatter: (data)=>data,
			},
			{
				id: "liabilities",
				innerRadius: 90,
				outerRadius: 120,
				data: [],
				valueFormatter: (data)=>data
			}
		]


		let asset = 0
		let liability = 0
		

		let computedData = data.reduce((p,c,i)=>{
			if(c.type != "892f20e5-b8dc-42b6-10c9-08dabb20ff77") return p
			if(c.balance >= 0){
				let item = p.asset.find(e=>e.groupId==c.accountGroupId)
				if(!item){
					let group = groups.find(e=>e.id == c.accountGroupId)
					item = {
						id : c.accountGroupId,
						groupId : c.accountGroupId,
						label : `Asset: ${group.name || c.accountGroupId}`,
						color : getRandomShadeOfGreen(),
						value : c.balance
					}
					p.asset = [...p.asset,item]
				}else{
					item.value += c.balance
				}
				asset += c.balance
			}else{
				let item = p.liability.find(e=>e.groupId==c.accountGroupId)
				if(!item){
					let group = groups.find(e=>e.id == c.accountGroupId)
					item = {
						id : c.accountGroupId,
						color : getRandomShadeOfRed(),
						groupId : c.accountGroupId,
						label : `Liability: ${group.name || c.accountGroupId}`,
						value : -c.balance
					}
					p.liability = [...p.liability,item]
				}else{
					item.value -= c.balance
				}
				liability -= c.balance
			}
			return p
		}, {liability : [] , asset : []}) 

		let fullangle = liability == asset ? '' : asset>liability ? "asset":"liability"

		let angleOfLower = liability == asset ? 280 : asset>liability ? (( liability *100 / asset)/100 *360 - 90).toFixed(0):(( asset * 100 / liability)/100 *360 - 90).toFixed(0)


		let output  = [
			{
				id: "assets",
				innerRadius: 0,
				outerRadius: 100,
				data: computedData.asset,
				startAngle: -90,
				cx:190,
				cy:172,
				endAngle: fullangle == "asset" ? "280" : angleOfLower,
				valueFormatter: (data)=>numeral(data.value).format("0,0.00")
			},
			{
				id: "liabilities",
				innerRadius: 120,
				outerRadius: 160,
				data: computedData.liability,
				startAngle: -90,
				cx:190,
				cy:172,
				endAngle: fullangle == "liability" ? "280" : angleOfLower,
				valueFormatter: (data)=>numeral(data.value).format("0,0.00")
			}
		]

		return output



	}, [data, groups])


  return (
		<Grid size={12} sx={{p:3}}>
				<Card>
					<CardBody>
						
						<Box sx={{ flexGrow: 1, justifyItems:"center"}}>
						<Typography variant="h6">Assets vs Liabilities</Typography>
							<PieChart
								series={computed}
								width={400}
								height={350}
								title="Assets vs Liabilities"
								slotProps={{
									legend: { hidden: true },
								}}
							/>
						</Box>
						
					</CardBody>
				</Card>
        
		</Grid>
  );



}

export default AccountChart