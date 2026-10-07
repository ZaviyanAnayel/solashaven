import { ChronicleArticle } from "./types";

// Daily SEO chronicles, published by the `solashaven-daily-chronicle` cron.
// The cron worker appends one new article per day. Newest first.
export const DAILY_STORIES: ChronicleArticle[] = [];
