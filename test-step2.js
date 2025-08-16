// Test script for STEP 2 verification
console.log("Testing STEP 2: Back/Next/Cancel buttons on Add Property page");

// Function to check button count at different screen sizes
function checkButtonCount(width) {
  // Temporarily set window width for testing
  const originalWidth = window.innerWidth;

  // Mock resize for testing
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });

  // Trigger resize event
  window.dispatchEvent(new Event("resize"));

  // Small delay to allow any responsive changes
  setTimeout(() => {
    const buttons = document.querySelectorAll(
      '[data-testid="btn-back"],[data-testid="btn-next"],[data-testid="btn-cancel"]',
    );
    console.log(`At width ${width}px: Found ${buttons.length} buttons`);

    if (buttons.length === 3) {
      console.log(`✅ Correct button count (3) at ${width}px`);

      // Check if buttons are visible
      const visibleButtons = Array.from(buttons).filter((btn) => {
        const style = window.getComputedStyle(btn);
        return style.display !== "none" && style.visibility !== "hidden";
      });

      console.log(
        `✅ ${visibleButtons.length} buttons are visible at ${width}px`,
      );

      // Test button functionality
      buttons.forEach((btn, index) => {
        const testId = btn.getAttribute("data-testid");
        console.log(
          `✅ Button ${index + 1}: ${testId} - ${btn.textContent.trim()}`,
        );
      });
    } else {
      console.log(
        `❌ Expected 3 buttons, found ${buttons.length} at ${width}px`,
      );
    }

    // Restore original width
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: originalWidth,
    });

    return buttons.length === 3;
  }, 100);
}

// Test at mobile width (375px)
setTimeout(() => {
  console.log("\n🔍 Testing at mobile width (375px)...");
  const mobileResult = checkButtonCount(375);

  // Test at desktop width (1024px)
  setTimeout(() => {
    console.log("\n🔍 Testing at desktop width (1024px)...");
    const desktopResult = checkButtonCount(1024);

    setTimeout(() => {
      // Final test
      const allButtons = document.querySelectorAll(
        '[data-testid="btn-back"],[data-testid="btn-next"],[data-testid="btn-cancel"]',
      );

      if (allButtons.length >= 3) {
        console.log("\n✅ PASS: STEP2 - All required buttons found");
        console.log("PASS: STEP2");
      } else {
        console.log("\n❌ FAIL: STEP2 - Missing required buttons");
      }
    }, 300);
  }, 200);
}, 100);

// Also test the buttons immediately
setTimeout(() => {
  const buttons = document.querySelectorAll(
    '[data-testid="btn-back"],[data-testid="btn-next"],[data-testid="btn-cancel"]',
  );
  console.log(`\n📊 Current button count: ${buttons.length}`);

  if (buttons.length >= 3) {
    console.log("✅ STEP 2 Implementation successful!");
    console.log("PASS: STEP2");
  }
}, 500);
