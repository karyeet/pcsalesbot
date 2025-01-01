export abstract class StorageAbstract {
  target: string;
  constructor(target: string) {
    this.target = target;
  }

  abstract init(): Promise<void>;

  abstract add_tracked_term(
    guildid: string,
    userid: string,
    term: string,
  ): Promise<void>;
  abstract get_tracked_terms(
    guildid: string,
    userid: string,
  ): Promise<string[]>;
  abstract remove_tracked_term(
    guildid: string,
    userid: string,
    term: string,
  ): Promise<boolean>;

  abstract add_banned_term(
    guildid: string,
    userid: string,
    term: string,
  ): Promise<void>;
  abstract get_banned_terms(guildid: string, userid: string): Promise<string[]>;
  abstract remove_banned_term(
    guildid: string,
    userid: string,
    term: string,
  ): Promise<boolean>;

  // return a map of {guildid: {userid: [terms] }}
  abstract get_all_tracked_terms(): Promise<Map<string, Map<string, string[]>>>;

  // return a map of {guildid: {userid: [terms] }}
  abstract get_all_banned_terms(): Promise<Map<string, Map<string, string[]>>>;

  // channels to make posts in
  abstract set_channel(guildid: string, channelid: string): Promise<void>;
  abstract get_channel(guildid: string): Promise<string | null>;
  abstract get_channels(): Promise<Map<string, string>>; // {guildid: channelid}

  abstract set_timestamp(subreddit: string, timestamp: number): Promise<void>;
  abstract get_timestamp(subreddit: string): Promise<number>;
  abstract get_timestamps(): Promise<Map<string, number>>; // {subreddit: timestamp}
}
