import { Context } from "grammy";
import {
  isInstagram,
  isTikTok,
  isPosts,
  isHackerNews,
  isDribbble,
  isBluesky,
  isReddit,
  isSpotify,
} from "../helpers/platforms";
import { isBanned } from "../helpers/banned";
import { askToExpandTemplate } from "../helpers/templates";

/**
 * Sends a reply in chat asking the user if they want to expand
 * links in the message with 2 buttons: Yes and No
 * @param chatId Telegram Chat ID
 * @param msgId Telegram Message ID
 * @param identifier Unique identifier for this message
 * @param link Link to expand
 * @param isDeletable Whether the original message can be deleted
 */
export const askToExpand = async (ctx: Context, identifier: string, link: string, isDeletable: boolean) => {
  if (!ctx || !ctx.chat?.id) return;

  const chatId = ctx.chat?.id;
  if (isBanned(chatId)) return;

  const insta = isInstagram(link);
  const tiktok = isTikTok(link);
  const posts = isPosts(link);
  const hn = isHackerNews(link);
  const dribbble = isDribbble(link);
  const bluesky = isBluesky(link);
  const reddit = isReddit(link);
  const spotify = isSpotify(link);
  const platform = insta
    ? "instagram"
    : tiktok
    ? "tiktok"
    : posts
    ? "posts"
    : hn
    ? "hackernews"
    : dribbble
    ? "dribbble"
    : bluesky
    ? "bluesky"
    : reddit
    ? "reddit"
    : spotify
    ? "spotify"
    : "twitter";

  try {
    const originalReplyId = ctx.update?.message?.reply_to_message?.message_id;

    await ctx
      .reply(askToExpandTemplate(link), {
        reply_to_message_id: ctx.msg?.message_id,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "✅ Yes",
                callback_data: `expand:yes:${identifier}:${platform}:${originalReplyId}:${isDeletable}`,
                // callback_data has a 64 byte limit!!!
              },
              {
                text: "❌ No",
                callback_data: `expand:no:${identifier}:${platform}`,
              },
            ],
          ],
        },
      })
      .catch((error) => {
        console.error(`[Error] Could not send ask-to-expand message.`);
        console.error(error);
        return;
      });
  } catch (error) {
    // @ts-ignore
    console.error({
      message: "Error sending ask-to-expand message",
      // @ts-ignore
      error: error.message,
    });
    return;
  }
};
