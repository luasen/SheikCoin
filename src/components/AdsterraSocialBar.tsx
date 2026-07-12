import { useEffect } from 'react';

export default function AdsterraSocialBar() {
  useEffect(() => {
    const scriptSrc = 'https://pl30303020.effectivecpmnetwork.com/f4/38/5b/f4385b9ca752c1aaf812ae0cef5852c5.js';
    
    // Check if the script is already present to prevent duplicate injection
    const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);
    
    if (existingScript) {
      console.log('AdsTerra Social Bar script already loaded.');
      return;
    }

    console.log('Injecting AdsTerra Social Bar script safely...');
    
    const script = document.createElement('script');
    script.src = scriptSrc;
    script.async = true;
    script.id = 'adsterra-social-bar-script';
    
    // Error handling
    script.onerror = (err) => {
      console.error('Failed to load AdsTerra Social Bar script:', err);
    };

    // Append script to document head
    document.head.appendChild(script);

    // Cleanup function on component unmount
    return () => {
      console.log('Cleaning up AdsTerra Social Bar script...');
      const addedScript = document.getElementById('adsterra-social-bar-script');
      if (addedScript && addedScript.parentNode) {
        addedScript.parentNode.removeChild(addedScript);
      }
      
      // Some scripts append styling or divs dynamically to the body.
      // We don't want to break third party scripts, but we can clean up any added overlay elements if needed.
      // Usually, just removing the script element prevents new network requests and duplicate triggers.
    };
  }, []);

  return null;
}
