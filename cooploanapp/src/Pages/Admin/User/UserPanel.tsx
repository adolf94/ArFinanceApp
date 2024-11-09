import {
  Box,
  Card,
  Chip,
  FormControl,
  Grid2 as Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import {
  GroupAdd,
  ManageAccounts,
  TableChart,
  TableView,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { useState } from "react";
import { getAll, USER } from "../../../repositories/users";
import CreateMemberProfile from "./CreateMemberProfile";
import { COOP_OPTION, getOptionByYear } from "../../../repositories/coopOption";
import MemberProfiles from "./MemberProfiles";
import {
  MEMBER_PROFILE,
  getMemberProfiles,
} from "../../../repositories/memberProfile";
import * as React from "react";

interface UserPanelProps {}

const years = (() => {
  let initial = 2023
  let items = []
  while (initial <= moment().add(1, 'year').year()) {
    items.push(initial)
    initial++
  }
  return items
})()

const UserPanel = (_: UserPanelProps) => {
  const [year, setYear] = useState(moment().year());
  const [tab, setTab] = useState("slim");
  const { data: clients, isLoading } = useQuery({
    queryKey: [USER],
    queryFn: () => getAll(),
  });
  const { data: option } = useQuery({
    queryKey: [COOP_OPTION, { year }],
    queryFn: () => getOptionByYear(year),
    retry: false,
    staleTime: 600000,
    gcTime: 24 * 60 * 60 * 1000,
  });

  const { data: members } = useQuery({
    queryKey: [MEMBER_PROFILE, { year }],
    queryFn: () => getMemberProfiles(year),
    enabled: !!option,
  });

  const [selectedUser, setSelected] = useState(null);

  return (
    <Box sx={{ width: "100%" }}>
      <Grid container>
        <Grid
          container
          size={12}
          sx={{ justifyContent: "end", p: 1, px: 2 }}
        >

          <Box>
            <IconButton onClick={()=>setTab("table")}><TableView /></IconButton>
            <IconButton onClick={()=>setTab("slim")}><TableChart /></IconButton>
          </Box>
          <Box>
            <FormControl >
              <InputLabel id="demo-simple-select-label">Year</InputLabel>
              <Select
                value={year}
                label="Year"
                size="small"
                onChange={(evt) => setYear(Number.parseInt(evt.target.value.toString()))}
              >
                {years.map(e => <MenuItem value={e}>{e}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>


        </Grid>
        <Grid size={{ sm: 12 }} sx={{ p: 2 }}>
          <MemberProfiles
            members={members}
            clients={clients}
            year={year}
            option={option}
            tab={tab}
          />
        </Grid>
        <Grid size={{ sm: 12 }} sx={{ p: 2 }}>
          <Card variant="outlined">
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell colSpan={4}>All Users</TableCell>
                  </TableRow>
                </TableHead>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Mobile Number</TableCell>
                    <TableCell>Roles</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!isLoading &&
                    clients.map((client: any) => (
                      <TableRow>
                        <TableCell>{client.name}</TableCell>
                        <TableCell>{client.mobileNumber}</TableCell>
                        <TableCell>
                          {client.roles.map((e: string) => (
                            <Chip label={e} size="small" color="info" />
                          ))}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Add as a coop member">
                            <IconButton onClick={() => setSelected(client)}>
                              <GroupAdd />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit information">
                            <IconButton>
                              <ManageAccounts />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>
      {selectedUser && (
        <CreateMemberProfile
          user={selectedUser}
          year={year}
          onClose={() => setSelected(null)}
        />
      )}
    </Box>
  );
};

export default UserPanel;
