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
    const sessionShownKey = `termsShownThisSession_${userId}`;
    
    // Check if user has accepted terms
    const hasAccepted = localStorage.getItem(userSpecificKey) === 'true';
    const shouldRemember = localStorage.getItem(userSpecificRememberKey) === 'true';
    const acceptedVersion = localStorage.getItem(userSpecificVersionKey);
    const shownThisSession = sessionStorage.getItem(sessionShownKey) === 'true';
    
    // Show terms if:
    // 1. User has never accepted terms, OR
    // 2. Terms version has been updated, OR
    // 3. User chose "Show Every Login" AND terms haven't been shown this session
    if (!hasAccepted || acceptedVersion !== this.currentTermsVersion) {
      return true;
    }
    
    // If user chose "Remember Choice", never show again
    if (shouldRemember) {
      return false;
    }
    
    // If user chose "Show Every Login", only show if not shown this session
    return !shownThisSession;
  }
  
  /**
   * Record that user has accepted terms
   */
  acceptTerms(userId: string, shouldRememberChoice: boolean): void {
    const userSpecificKey = `${this.hasAcceptedTermsKey}_${userId}`;
    const userSpecificRememberKey = `${this.shouldRememberChoiceKey}_${userId}`;
    const userSpecificVersionKey = `${this.termsVersionKey}_${userId}`;
    const sessionShownKey = `termsShownThisSession_${userId}`;
    
    localStorage.setItem(userSpecificKey, 'true');
    localStorage.setItem(userSpecificRememberKey, shouldRememberChoice.toString());
    localStorage.setItem(userSpecificVersionKey, this.currentTermsVersion);
    
    // Mark that terms have been shown in this session (for "Show Every Login" users)
    sessionStorage.setItem(sessionShownKey, 'true');
    
    console.log(`📋 Terms accepted for user ${userId}, remember choice: ${shouldRememberChoice}`);
  }
  
  /**
   * Reset terms acceptance for a user (for testing)
   */
  resetTermsAcceptance(userId: string): void {
    const userSpecificKey = `${this.hasAcceptedTermsKey}_${userId}`;
    const userSpecificRememberKey = `${this.shouldRememberChoiceKey}_${userId}`;
    const userSpecificVersionKey = `${this.termsVersionKey}_${userId}`;
    const sessionShownKey = `termsShownThisSession_${userId}`;
    
    localStorage.removeItem(userSpecificKey);
    localStorage.removeItem(userSpecificRememberKey);
    localStorage.removeItem(userSpecificVersionKey);
    sessionStorage.removeItem(sessionShownKey);
    
    console.log(`📋 Terms acceptance reset for user ${userId}`);
  }
  
  /**
   * Reset terms acceptance for all users (for testing)
   */
  resetAllTermsAcceptance(): void {
    const localKeys = Object.keys(localStorage);
    const termsKeys = localKeys.filter(key => 
      key.includes(this.hasAcceptedTermsKey) || 
      key.includes(this.shouldRememberChoiceKey) || 
      key.includes(this.termsVersionKey)
    );
    
    const sessionKeys = Object.keys(sessionStorage);
    const sessionTermsKeys = sessionKeys.filter(key => 
      key.includes('termsShownThisSession')
    );
    
    termsKeys.forEach(key => localStorage.removeItem(key));
    sessionTermsKeys.forEach(key => sessionStorage.removeItem(key));
    
    console.log('📋 All terms acceptance data cleared - Terms popup will show for all users');
  }
  
  /**
   * Get terms acceptance status for debugging
   */
  getTermsStatus(userId: string): { hasAccepted: boolean; shouldRemember: boolean; version: string | null; shownThisSession: boolean } {
    const userSpecificKey = `${this.hasAcceptedTermsKey}_${userId}`;
    const userSpecificRememberKey = `${this.shouldRememberChoiceKey}_${userId}`;
    const userSpecificVersionKey = `${this.termsVersionKey}_${userId}`;
    const sessionShownKey = `termsShownThisSession_${userId}`;
    
    return {
      hasAccepted: localStorage.getItem(userSpecificKey) === 'true',
      shouldRemember: localStorage.getItem(userSpecificRememberKey) === 'true',
      version: localStorage.getItem(userSpecificVersionKey),
      shownThisSession: sessionStorage.getItem(sessionShownKey) === 'true'
    };
  }
}

export const termsOfServiceManager = TermsOfServiceManager.getInstance(); 