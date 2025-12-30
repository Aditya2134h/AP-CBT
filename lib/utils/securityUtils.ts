// Browser security utilities for the CBT system

export function preventRightClick() {
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });
}

export function preventCopyPaste() {
  document.addEventListener('copy', (e) => {
    e.preventDefault();
  });
  
  document.addEventListener('cut', (e) => {
    e.preventDefault();
  });
  
  document.addEventListener('paste', (e) => {
    e.preventDefault();
  });
}

export function preventKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Prevent common keyboard shortcuts
    const forbiddenKeys = [
      'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
      'PrintScreen', 'Escape', 'Tab',
    ];
    
    const ctrlKeys = [
      'c', 'x', 'v', 's', 'p', 'a', 'f', 'n', 'o', 'u', 'i',
    ];
    
    const metaKeys = [
      'q', 'w', 'h', 'm', 'r',
    ];
    
    if (forbiddenKeys.includes(e.key)) {
      e.preventDefault();
      return;
    }
    
    if ((e.ctrlKey || e.metaKey) && ctrlKeys.includes(e.key.toLowerCase())) {
      e.preventDefault();
      return;
    }
    
    if (e.metaKey && metaKeys.includes(e.key.toLowerCase())) {
      e.preventDefault();
      return;
    }
  });
}

export function detectTabSwitch() {
  let hidden = 'hidden';
  let visibilityChange = 'visibilitychange';
  
  if (typeof document.hidden !== 'undefined') {
    hidden = 'hidden';
    visibilityChange = 'visibilitychange';
  } else if (typeof (document as any).msHidden !== 'undefined') {
    hidden = 'msHidden';
    visibilityChange = 'msvisibilitychange';
  } else if (typeof (document as any).webkitHidden !== 'undefined') {
    hidden = 'webkitHidden';
    visibilityChange = 'webkitvisibilitychange';
  }
  
  document.addEventListener(visibilityChange, () => {
    if ((document as any)[hidden]) {
      // Tab was switched away
      console.warn('Tab switch detected');
      // Log security event
    } else {
      // Tab was switched back
      console.log('Tab switched back');
    }
  }, false);
}

export function detectDeveloperTools() {
  // Check if dev tools are open
  const devToolsOpen = () => {
    const threshold = 160;
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    const orientation = widthThreshold ? 'vertical' : 'horizontal';
    
    if (widthThreshold || heightThreshold) {
      console.warn(`Developer tools detected (${orientation})`);
      // Log security event
    }
  };
  
  // Check periodically
  setInterval(devToolsOpen, 1000);
}

export function enforceFullscreen() {
  const enterFullscreen = () => {
    const element = document.documentElement;
    
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if ((element as any).webkitRequestFullscreen) {
      (element as any).webkitRequestFullscreen();
    } else if ((element as any).msRequestFullscreen) {
      (element as any).msRequestFullscreen();
    }
  };
  
  const exitHandler = () => {
    if (!document.fullscreenElement && 
        !(document as any).webkitFullscreenElement && 
        !(document as any).msFullscreenElement) {
      console.warn('Fullscreen mode exited');
      // Log security event and potentially end test
    }
  };
  
  document.addEventListener('fullscreenchange', exitHandler);
  document.addEventListener('webkitfullscreenchange', exitHandler);
  document.addEventListener('msfullscreenchange', exitHandler);
  
  enterFullscreen();
}

export function detectScreenshot() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'PrintScreen') {
      console.warn('Screenshot attempt detected');
      // Log security event
    }
  });
}

export function detectMultipleTabs() {
  // This is a simplified approach - in production, you'd need a more robust solution
  const tabId = Math.random().toString(36).substring(2);
  localStorage.setItem('cbtTabId', tabId);
  
  const checkForMultipleTabs = () => {
    const currentTabId = localStorage.getItem('cbtTabId');
    
    if (currentTabId !== tabId) {
      console.warn('Multiple tabs detected');
      // Log security event
    }
  };
  
  setInterval(checkForMultipleTabs, 1000);
}

export function monitorMouseMovement() {
  let lastX = 0;
  let lastY = 0;
  let lastTime = Date.now();
  
  document.addEventListener('mousemove', (e) => {
    const currentTime = Date.now();
    const timeDiff = currentTime - lastTime;
    const xDiff = Math.abs(e.clientX - lastX);
    const yDiff = Math.abs(e.clientY - lastY);
    
    // Detect suspicious mouse movement patterns
    if (timeDiff < 100 && (xDiff > 500 || yDiff > 500)) {
      console.warn('Suspicious mouse movement detected');
      // Log security event
    }
    
    lastX = e.clientX;
    lastY = e.clientY;
    lastTime = currentTime;
  });
}

export function monitorKeyboardPatterns() {
  const keyPresses: { key: string; time: number }[] = [];
  const maxHistory = 20;
  
  document.addEventListener('keydown', (e) => {
    keyPresses.push({ key: e.key, time: Date.now() });
    
    if (keyPresses.length > maxHistory) {
      keyPresses.shift();
    }
    
    // Analyze keyboard patterns for suspicious activity
    // This is a simplified example - real implementation would be more sophisticated
    if (keyPresses.length >= 5) {
      const lastFive = keyPresses.slice(-5);
      const timeDiffs = lastFive.slice(1).map((press, i) => 
        press.time - lastFive[i].time
      );
      
      // Detect unusually fast typing
      if (timeDiffs.every(diff => diff < 50)) {
        console.warn('Suspicious keyboard pattern detected');
        // Log security event
      }
    }
  });
}

export function initSecurityMonitoring() {
  // Initialize all security features
  preventRightClick();
  preventCopyPaste();
  preventKeyboardShortcuts();
  detectTabSwitch();
  detectDeveloperTools();
  enforceFullscreen();
  detectScreenshot();
  detectMultipleTabs();
  monitorMouseMovement();
  monitorKeyboardPatterns();
  
  console.log('Security monitoring initialized');
}