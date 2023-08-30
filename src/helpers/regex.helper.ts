const socialNetworksUrlRegex = new RegExp(
  '^(https?://)?(www.)?(facebook.com|fb.me|twitter.com|vxtwitter.com|instagram.com|linkedin.com|youtube.com|youtu.be|pinterest.com|snapchat.com|tiktok.com)/[a-zA-Z0-9.-/?=&#_]+$',
);
export const isASocialNetworkUrl = (url: string): boolean => {
  return socialNetworksUrlRegex.test(url);
};
