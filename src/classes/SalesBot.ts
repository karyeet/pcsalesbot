import {StorageAbstract} from './StorageAbstract';

export interface notification_info {
  price: number; // extracted from post title
  notify_list: Map<string, string[]>;
}

export class SalesBot {
  storage_driver: StorageAbstract;
  tracked_terms: Map<string, Map<string, string[]>> | undefined;
  banned_terms: Map<string, Map<string, string[]>> | undefined;
  channels: Map<string, string> | undefined;
  timestamps: Map<string, number> | undefined;
  constructor(storage_driver: StorageAbstract) {
    this.storage_driver = storage_driver;
    void this.init();
  }
  async init() {
    await this.storage_driver.init();
    this.tracked_terms = await this.storage_driver.get_all_tracked_terms();
    this.banned_terms = await this.storage_driver.get_all_banned_terms();
    this.channels = await this.storage_driver.get_channels();
    this.timestamps = await this.storage_driver.get_timestamps();
  }

  check_init() {
    const vars = [
      this.tracked_terms,
      this.banned_terms,
      this.channels,
      this.timestamps,
    ];
    for (let i = 0; i < vars.length; i++) {
      const variable = vars[i];
      if (typeof variable === 'undefined') {
        throw `[ERROR] SalesBot variable ${i} is undefined.`;
      }
    }
    return true;
  }

  // might need to optimize this later, but for now it's fine as my use case is very small
  // return a map of guilds to users to notify
  get_users_to_notify(post_title: string): Map<string, string[]> {
    this.check_init();
    post_title = post_title.toLowerCase();
    const users_to_notify: Map<string, string[]> = new Map();
    // for each guildid
    for (const guildid of this.tracked_terms!.keys()) {
      // get the map for the guild
      const user_ids = this.tracked_terms!.get(guildid)!;
      // for each userid in the guild
      for (const userid of user_ids.keys()) {
        // get the terms per user
        const user_terms = user_ids.get(userid)!;
        // for each term per user
        for (const term of user_terms) {
          // if the post title includes the term
          if (post_title.includes(term)) {
            // add the user to the list of users to notify
            if (users_to_notify.has(guildid)) {
              users_to_notify.get(guildid)!.push(userid);
            } else {
              users_to_notify.set(guildid, [userid]);
            }
            // break out of the loop for this user
            break;
          }
        }
      }
    }
    return users_to_notify;
  }

  async add_tracked_term(
    guildid: string,
    userid: string,
    term: string,
  ): Promise<void> {
    this.check_init();
    await this.storage_driver.add_tracked_term(guildid, userid, term);
    this.tracked_terms = await this.storage_driver.get_all_tracked_terms();
  }

  async remove_tracked_term(
    guildid: string,
    userid: string,
    term: string,
  ): Promise<boolean> {
    this.check_init();
    const result = await this.storage_driver.remove_tracked_term(
      guildid,
      userid,
      term,
    );
    if (result) {
      this.tracked_terms = await this.storage_driver.get_all_tracked_terms();
    }
    return result;
  }

  async add_banned_term(
    guildid: string,
    userid: string,
    term: string,
  ): Promise<void> {
    this.check_init();
    await this.storage_driver.add_banned_term(guildid, userid, term);
    this.banned_terms = await this.storage_driver.get_all_banned_terms();
  }

  async remove_banned_term(
    guildid: string,
    userid: string,
    term: string,
  ): Promise<boolean> {
    this.check_init();
    const result = await this.storage_driver.remove_banned_term(
      guildid,
      userid,
      term,
    );
    if (result) {
      this.banned_terms = await this.storage_driver.get_all_banned_terms();
    }
    return result;
  }

  async set_channel(guildid: string, channelid: string): Promise<void> {
    this.check_init();
    await this.storage_driver.set_channel(guildid, channelid);
    this.channels = await this.storage_driver.get_channels();
  }
}
