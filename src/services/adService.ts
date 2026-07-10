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
   * Injects the Adsterra SocialBar tag script into the document head dynamically
   * in a fire-and-forget manner to prevent any blockages or load failures.
   */
  triggerSocialBarAd(userId: string): void {
    console.log(`Injecting Adsterra SocialBar tag in background for user: ${userId}`);
    try {
      const script = document.createElement('script');
      script.src = 'https://effectivecpmnetwork.com';
      script.async = true;
      script.type = 'text/javascript';
      document.head.appendChild(script);
    } catch (err) {
      console.error('Error injecting Adsterra script tag:', err);
    }
  }
};

