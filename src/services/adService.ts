/**
 * Service to simulate rewarded video advertisements
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
  }
};
