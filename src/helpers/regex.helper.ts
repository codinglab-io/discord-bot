const socialNetworksUrlRegex = new RegExp(
  '^(https?://)?(www.)?(facebook.com|fb.me|twitter.com|vxtwitter.com|instagram.com|linkedin.com|youtube.com|youtu.be|pinterest.com|snapchat.com|tiktok.com)/[a-zA-Z0-9.-/?=&#_]+$',
);
const punctuationRegex = new RegExp(/[.,!?]/g);
const emojiRegex = new RegExp(/(\p{Extended_Pictographic}|\p{Emoji_Component})/gu);
const quoiDetectorRegex = new RegExp(/\b\s*[q][u][o][i]\s*$/i);

export const isASocialNetworkUrl = (url: string): boolean => {
  return socialNetworksUrlRegex.test(url);
};

export const removePunctuation = (text: string) => text.replaceAll(punctuationRegex, '');
export const removeEmoji = (text: string) => text.replaceAll(emojiRegex, '');
export const endWithQuoi = (text: string) =>
  quoiDetectorRegex.test(removeEmoji(removePunctuation(text)));
