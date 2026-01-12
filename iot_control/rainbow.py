import time
import board
import neopixel

# CONFIGURATION
LED_COUNT = 20        # LEDs per strip
BRIGHTNESS = 0.2      # 0.0 to 1.0
LEFT_PIN = board.D18  # GPIO 18 (Physical Pin 12)
RIGHT_PIN = board.D21 # GPIO 21 (Physical Pin 40)

# Initialize both strips
left_strip = neopixel.NeoPixel(
    LEFT_PIN, LED_COUNT, brightness=BRIGHTNESS, auto_write=False
)
right_strip = neopixel.NeoPixel(
    RIGHT_PIN, LED_COUNT, brightness=BRIGHTNESS, auto_write=False
)

def wheel(pos):
    """Generate rainbow colors (0-255)"""
    pos = pos & 255
    if pos < 85:
        return (pos * 3, 255 - pos * 3, 0)
    elif pos < 170:
        pos -= 85
        return (255 - pos * 3, 0, pos * 3)
    else:
        pos -= 170
        return (0, pos * 3, 255 - pos * 3)

def update_rainbows(offset):
    for i in range(LED_COUNT):
        # Calculate color index
        color_idx = (i * 256 // LED_COUNT) + offset
        
        # Left Strip: Standard flow
        left_strip[i] = wheel(color_idx)
        
        # Right Strip: Reversed flow (looks mirrored)
        right_strip[(LED_COUNT - 1) - i] = wheel(color_idx)

print("Running Dual Strips... Press Ctrl+C to stop.")

try:
    offset = 0
    while True:
        update_rainbows(offset)
        
        # Send data to both strips
        left_strip.show()
        right_strip.show()
        
        # Increment offset to animate colors
        offset = (offset + 2) % 256
        time.sleep(0.01)

except KeyboardInterrupt:
    # Cleanup: Turn off all LEDs
    left_strip.fill((0, 0, 0))
    right_strip.fill((0, 0, 0))
    left_strip.show()
    right_strip.show()
    print("\nLEDs turned off.")
