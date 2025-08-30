import { Box, CircularProgress } from "@mui/material";

const Loader = () => {
  return (
    <Box sx={{width:'100%'}}>
        <Box
        sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "20vh",
        }}
        >
        <CircularProgress size={80} />
        </Box>
    </Box>
  );
};

export default Loader;