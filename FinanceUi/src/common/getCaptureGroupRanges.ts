

function getCaptureGroupRanges(regexString) {
    let realCaptureGroupRanges = [];
    const capturingGroupStarts = []; // Stack to hold start indices
    let inCharacterClass = false;
  
    for (let i = 0; i < regexString.length; i++) {
        const char = regexString[i];
        const nextChar = regexString[i + 1];
        const nextNextChar = regexString[i + 2];
  
        if (char === '\\') { // Handle escape sequences
            i++; // Skip the next character as it's escaped
            continue;
        }
  
        if (char === '[') { // Enter character class
            inCharacterClass = true;
            continue;
        }
        if (char === ']') { // Exit character class
            inCharacterClass = false;
            continue;
        }
  
        if (!inCharacterClass) {
            if (char === '(') {
                // Check if it's a capturing group (not non-capturing or special)
                const isCapturing = !(nextChar === '?' && (nextNextChar === ':' || nextNextChar === '=' || nextNextChar === '!' || nextNextChar === '<'));
                if (isCapturing) {
                    capturingGroupStarts.push(i); // Push the start index
                }
            } else if (char === ')') {
                if (capturingGroupStarts.length > 0) {
                    const startIndex = capturingGroupStarts.pop(); // Pop the start index
                    // Use unshift to add the range to the beginning of the array,
                    // ensuring outermost groups (which are popped last) come first.
                    realCaptureGroupRanges.unshift({ start: startIndex, end: i });
                }
            }
        }
    }

    realCaptureGroupRanges = realCaptureGroupRanges.sort((a, b) => a.start - b.start)
                    .map((e,i)=>({...e, matchIndex:i}))
    return realCaptureGroupRanges;
  }
  

  export default getCaptureGroupRanges