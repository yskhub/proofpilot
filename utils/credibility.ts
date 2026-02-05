
export interface CredibilityRating {
  score: number;
  reason: string;
}

const HIGH_CREDIBILITY_DOMAINS = [
  'reuters.com', 'apnews.com', 'bbc.com', 'nytimes.com', 'wsj.com', 
  'bloomberg.com', 'nature.com', 'science.org', 'thelancet.com',
  'who.int', 'un.org', 'nasa.gov', 'nih.gov', 'cdc.gov',
  'britannica.com', 'wikipedia.org'
];

const LOW_CREDIBILITY_DOMAINS = [
  'twitter.com', 'x.com', 'facebook.com', 'reddit.com', 'medium.com',
  'blogspot.com', 'wordpress.com', 'youtube.com', 'quora.com', 'tiktok.com'
];

export const scoreSource = (url: string): CredibilityRating => {
  try {
    const domain = new URL(url).hostname.toLowerCase().replace('www.', '');
    
    // Check known high-integrity lists
    if (HIGH_CREDIBILITY_DOMAINS.some(d => domain === d || domain.endsWith('.' + d))) {
      return { score: 0.95, reason: 'Verified High-Integrity Domain' };
    }

    // Check TLDs
    if (domain.endsWith('.gov')) {
      return { score: 1.0, reason: 'Official Government Repository' };
    }
    if (domain.endsWith('.edu')) {
      return { score: 0.9, reason: 'Academic/Educational Institution' };
    }
    if (domain.endsWith('.int')) {
      return { score: 0.95, reason: 'International Organization' };
    }

    // Check low-integrity / social lists
    if (LOW_CREDIBILITY_DOMAINS.some(d => domain === d || domain.endsWith('.' + d))) {
      return { score: 0.3, reason: 'User-Generated Content / Social Media' };
    }

    // Default for recognized news organizations or general commercial
    if (domain.endsWith('.org')) {
      return { score: 0.7, reason: 'Non-Profit Organization' };
    }

    return { score: 0.6, reason: 'Standard Commercial Domain' };
  } catch (e) {
    return { score: 0.5, reason: 'Unverifiable Domain Structure' };
  }
};
