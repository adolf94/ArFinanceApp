
export function getRandomShadeOfRed() {
    // A hex color code is in the format #RRGGBB.
    // To ensure a shade of red, we'll keep the red component (RR) high
    // and the green (GG) and blue (BB) components low.
  
    // The red component will be a random value between 200 and 255 (C8 to FF in hex).
    const red = Math.floor(Math.random() * 56 + 200);
  
    // The green component will be a random value between 0 and 50 (00 to 32 in hex).
    const green = Math.floor(Math.random() * 75);
    
    // The blue component will be a random value between 0 and 50 (00 to 32 in hex).
    const blue = Math.floor(Math.random() * 75);
  
    // Convert the decimal values to two-digit hex strings.
    const redHex = red.toString(16).padStart(2, '0');
    const greenHex = green.toString(16).padStart(2, '0');
    const blueHex = blue.toString(16).padStart(2, '0');
  
    // Combine them into the final hex color string.
    return `#${redHex}${greenHex}${blueHex}`;
  }


  export function getRandomShadeOfGreen() {
    // A hex color code is in the format #RRGGBB.
    // To ensure a shade of green, we'll keep the green component (GG) high
    // and the red (RR) and blue (BB) components low.
  
    // The red component will be a random value between 0 and 50 (00 to 32 in hex).
    const red = Math.floor(Math.random() * 75);
  
    // The green component will be a random value between 200 and 255 (C8 to FF in hex).
    const green = Math.floor(Math.random() * 56 + 200);
    
    // The blue component will be a random value between 0 and 50 (00 to 32 in hex).
    const blue = Math.floor(Math.random() * 75);
  
    // Convert the decimal values to two-digit hex strings.
    const redHex = red.toString(16).padStart(2, '0');
    const greenHex = green.toString(16).padStart(2, '0');
    const blueHex = blue.toString(16).padStart(2, '0');
  
    // Combine them into the final hex color string.
    return `#${redHex}${greenHex}${blueHex}`;
  }
  