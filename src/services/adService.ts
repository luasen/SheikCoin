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

      try {
        // 1. Create script tag dynamically
        const script = document.createElement('script');
        script.src = 'https://effectivecpmnetwork.com';
        script.async = true;
        script.type = 'text/javascript';

        // 2. Set up event handlers to observe script load state
        script.onload = () => {
          console.log('Adsterra SocialBar script successfully mounted and executed.');
        };

        script.onerror = (error) => {
          console.warn('Adsterra SocialBar script was blocked or failed to load. Proceeding with fallback resolve.', error);
        };

        // 3. Inject script into head
        document.head.appendChild(script);
      } catch (err) {
        console.error('Error injecting Adsterra script tag:', err);
      }

      // 4. Simulate exposure detection and resolve after 3.5 seconds
      // A fallback timeout ensures the user gets rewarded even if an AdBlocker is active or script loading fails.
      setTimeout(() => {
        console.log(`SocialBar ad interaction completed successfully for user: ${userId}`);
        resolve({ success: true });
      }, 3500);
    });
  }
};

