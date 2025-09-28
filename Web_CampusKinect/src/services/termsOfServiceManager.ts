class TermsOfServiceManager {
  private static instance: TermsOfServiceManager;
  
  private readonly hasAcceptedTermsKey = 'hasAcceptedTerms';
  private readonly shouldRememberChoiceKey = 'shouldRememberTermsChoice';
  private readonly termsVersionKey = 'acceptedTermsVersion';
  
  // Current terms version - increment when terms are updated
  private readonly currentTermsVersion = '1.0';
  
  private constructor() {}
  
  static getInstance(): TermsOfServiceManager {
    if (!TermsOfServiceManager.instance) {
      TermsOfServiceManager.instance = new TermsOfServiceManager();
    }
    return TermsOfServiceManager.instance;
  }
  
  /**
   * Check if user needs to see terms popup
   */
  shouldShowTermsPopup(userId: string): boolean {
    const userSpecificKey = `${this.hasAcceptedTermsKey}_${userId}`;
    const userSpecificRememberKey = `${this.shouldRememberChoiceKey}_${userId}`;
    const userSpecificVersionKey = `${this.termsVersionKey}_${userId}`;
    
    // Check if user has accepted terms
    const hasAccepted = localStorage.getItem(userSpecificKey) === 'true';
    const shouldRemember = localStorage.getItem(userSpecificRememberKey) === 'true';
    const acceptedVersion = localStorage.getItem(userSpecificVersionKey);
    
    // Show terms if:
    // 1. User has never accepted terms, OR
    // 2. User chose not to remember their choice, OR
    // 3. Terms version has been updated
    return !hasAccepted || !shouldRemember || acceptedVersion !== this.currentTermsVersion;
  }
  
  /**
   * Record that user has accepted terms
   */
  acceptTerms(userId: string, shouldRememberChoice: boolean): void {
    const userSpecificKey = `${this.hasAcceptedTermsKey}_${userId}`;
    const userSpecificRememberKey = `${this.shouldRememberChoiceKey}_${userId}`;
    const userSpecificVersionKey = `${this.termsVersionKey}_${userId}`;
    
    localStorage.setItem(userSpecificKey, 'true');
    localStorage.setItem(userSpecificRememberKey, shouldRememberChoice.toString());
    localStorage.setItem(userSpecificVersionKey, this.currentTermsVersion);
    
    console.log(`📋 Terms accepted for user ${userId}, remember choice: ${shouldRememberChoice}`);
  }
  
  /**
   * Reset terms acceptance for a user (for testing)
   */
  resetTermsAcceptance(userId: string): void {
    const userSpecificKey = `${this.hasAcceptedTermsKey}_${userId}`;
    const userSpecificRememberKey = `${this.shouldRememberChoiceKey}_${userId}`;
    const userSpecificVersionKey = `${this.termsVersionKey}_${userId}`;
    
    localStorage.removeItem(userSpecificKey);
    localStorage.removeItem(userSpecificRememberKey);
    localStorage.removeItem(userSpecificVersionKey);
    
    console.log(`📋 Terms acceptance reset for user ${userId}`);
  }
  
  /**
   * Reset terms acceptance for all users (for testing)
   */
  resetAllTermsAcceptance(): void {
    const keys = Object.keys(localStorage);
    const termsKeys = keys.filter(key => 
      key.includes(this.hasAcceptedTermsKey) || 
      key.includes(this.shouldRememberChoiceKey) || 
      key.includes(this.termsVersionKey)
    );
    
    termsKeys.forEach(key => localStorage.removeItem(key));
    
    console.log('📋 All terms acceptance data cleared - Terms popup will show for all users');
  }
  
  /**
   * Get terms acceptance status for debugging
   */
  getTermsStatus(userId: string): { hasAccepted: boolean; shouldRemember: boolean; version: string | null } {
    const userSpecificKey = `${this.hasAcceptedTermsKey}_${userId}`;
    const userSpecificRememberKey = `${this.shouldRememberChoiceKey}_${userId}`;
    const userSpecificVersionKey = `${this.termsVersionKey}_${userId}`;
    
    return {
      hasAccepted: localStorage.getItem(userSpecificKey) === 'true',
      shouldRemember: localStorage.getItem(userSpecificRememberKey) === 'true',
      version: localStorage.getItem(userSpecificVersionKey)
    };
  }
}

export const termsOfServiceManager = TermsOfServiceManager.getInstance(); 