import { Box, Tooltip, Typography } from "@mui/material";
import getCaptureGroupRanges from "../../common/getCaptureGroupRanges";



const RegexPinpointer = ({regexString, selectedIndex})=>{
  let captureGroupRanges = getCaptureGroupRanges(regexString);

  // Filter out the outermost group if it encompasses the entire regex string
  captureGroupRanges = captureGroupRanges.filter(range => {
    return !(range.start === 0 && range.end === regexString.length - 1);
  });

  // Sort ranges by their start index to ensure correct rendering order
  captureGroupRanges.sort((a, b) => a.start - b.start);

  // --- NEW MODIFICATION ---
  // Assign matchIndex to each range after filtering and sorting
  captureGroupRanges = captureGroupRanges.map((range, index) => ({
    ...range,
    matchIndex: index + 1 // Assign sequential index for display
  }));
  // --- END NEW MODIFICATION ---

  const segments = [];
  let lastIndex = 0;

  captureGroupRanges.forEach((range) => {
    // Add segment before the current group
    if (range.start > lastIndex) {
      segments.push(
        <Typography component="span" key={`text-${lastIndex}`}  variant="body2" >
          {regexString.substring(lastIndex, range.start)}
        </Typography>
      );
    }

    // Handle the capture group segment - always highlight including parentheses
    const segmentToHighlight = regexString.substring(range.start, range.end + 1);

    // Use range.matchIndex directly for the displayed group number
    const displayedGroupNumber = range.matchIndex;

    // Add the highlighted segment
    segments.push(
      <Tooltip title={`Capture Group ${displayedGroupNumber}`} arrow key={`group-${range.start}-${range.end}`}>
        <Typography
          component="span"
          sx={{
            backgroundColor: selectedIndex == range.matchIndex ? 'rgba(0, 255, 0, 0.4 )' : "unset",
            fontWeight: "bold",
            borderRadius: '4px',
            padding: '2px 0px', // Small padding to make background visible
            cursor: 'pointer',
            // fontFamily: 'monospace',
            transition: 'background-color 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: 'rgba(0, 255, 0, 0.4)',
              outline: '1px solid limegreen',
            },
          }}
          variant="body2"
        >
          {segmentToHighlight}
        </Typography>
      </Tooltip>
    );

    lastIndex = range.end + 1;
  });

  // Add any remaining text after the last processed segment
  if (lastIndex < regexString.length) {
    segments.push(
      <Typography component="span" variant="body2" key={`text-${lastIndex}`} sx={{ fontFamily: 'monospace' }}>
        {regexString.substring(lastIndex)}
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        overflowX: 'auto', // For long regex strings
        display: 'inline-block', // To wrap content
        whiteSpace: 'pre-wrap', // Preserve whitespace and wrap
      }}
    >
      {segments}
    </Box>
  );

  
}

export default RegexPinpointer