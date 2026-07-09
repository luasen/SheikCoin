/**
 * Service to handle rewarded video advertisements and Adsterra SocialBar tags
 */
export const adService = {
  /**
   * Triggers a simulated rewarded ad video for a user.
   * Resolves after 5 seconds, simulating a fully watched ad.
   */
  triggerRewardAd(userId: string): Promise<{ success: boolean; watchedDuration: number }> {
    return new Promise((resolve) => {
      console.log(`Starting rewarded ad simulation for user: ${userId}`);
      
      // Simulate a 5-second video ad watcher
      setTimeout(() => {
        console.log(`Simulated ad successfully viewed by user: ${userId}. Reward validated!`);
        resolve({
          success: true,
          watchedDuration: 5
        });
      }, 5000);
    });
  },

  /**
   * Injects the Adsterra SocialBar tag script into the document head dynamically,
   * simulates the display and interaction, and resolves on success.
   */
  triggerSocialBarAd(userId: string): Promise<{ success: boolean }> {
    return new Promise((resolve) => {
      console.log(`Starting Adsterra SocialBar ad flow for user: ${userId}`);
      let resolved = false;

      const safeResolve = (success: boolean) => {
        if (!resolved) {
          resolved = true;
          resolve({ success });
        }
      };

      try {
        // 1. Create script tag dynamically
        const script = document.createElement('script');
        script.src = 'https://effectivecpmnetwork.com';
        script.async = true;
        script.type = 'text/javascript';

        // 2. Set up event handlers to observe script load state
        script.onload = () => {
          console.log('Adsterra SocialBar script successfully mounted and executed.');
          // Resolve immediately so the loading screen disappears as soon as the script loads/executes
          safeResolve(true);
        };

        script.onerror = (error) => {
          console.warn('Adsterra SocialBar script was blocked or failed to load. Proceeding with fallback resolve.', error);
          // Resolve immediately on error so the user doesn't get stuck in an infinite loading loop
          safeResolve(true);
        };

        // 3. Inject script into head
        document.head.appendChild(script);
      } catch (err) {
        console.error('Error injecting Adsterra script tag:', err);
        safeResolve(true);
      }

      // 4. Short fallback timeout of 1.2 seconds to clear the loader quickly if script.onload doesn't fire
      // (e.g. due to adblockers, tracking protection, or immediate script evaluation)
      setTimeout(() => {
        console.log(`Fallback timeout reached for SocialBar ad. Clearing loader.`);
        safeResolve(true);
      }, 1200);
    });
  }
};

