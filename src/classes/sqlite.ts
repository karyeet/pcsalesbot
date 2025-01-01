import sqlite3 from 'sqlite3';
import {type Database, open} from 'sqlite';
import {StorageAbstract} from './StorageAbstract';

export class sqlite implements StorageAbstract {
  target: string;
  db: Database | undefined;

  constructor(file: string) {
    this.target = file;
  }

  async init(): Promise<void> {
    this.db = await open({
      filename: this.target,
      driver: sqlite3.Database,
    });

    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS tracked_terms (
        guildid TEXT,
        userid TEXT,
        term TEXT,
        PRIMARY KEY (guildid, userid, term)
      );

      CREATE TABLE IF NOT EXISTS banned_terms (
        guildid TEXT,
        userid TEXT,
        term TEXT,
        PRIMARY KEY (guildid, userid, term)
      );

      CREATE TABLE IF NOT EXISTS channels (
        guildid TEXT PRIMARY KEY,
        channelid TEXT
      );

      CREATE TABLE IF NOT EXISTS timestamps (
        subreddit TEXT PRIMARY KEY,
        timestamp INTEGER
      );
    `);
  }

  async add_tracked_term(
    guildid: string,
    userid: string,
    term: string,
  ): Promise<void> {
    await this.db!.run(
      'INSERT OR IGNORE INTO tracked_terms (guildid, userid, term) VALUES (?, ?, ?)',
      [guildid, userid, term],
    );
  }

  async get_tracked_terms(guildid: string, userid: string): Promise<string[]> {
    const rows = await this.db!.all(
      'SELECT term FROM tracked_terms WHERE guildid = ? AND userid = ?',
      [guildid, userid],
    );
    return rows.map((row: any) => row.term);
  }

  async remove_tracked_term(
    guildid: string,
    userid: string,
    term: string,
  ): Promise<boolean> {
    const result = await this.db!.run(
      'DELETE FROM tracked_terms WHERE guildid = ? AND userid = ? AND term = ?',
      [guildid, userid, term],
    );
    if (result.changes && result.changes > 0) {
      return true;
    } else {
      return false;
    }
  }

  async add_banned_term(
    guildid: string,
    userid: string,
    term: string,
  ): Promise<void> {
    await this.db!.run(
      'INSERT OR IGNORE INTO banned_terms (guildid, userid, term) VALUES (?, ?, ?)',
      [guildid, userid, term],
    );
  }

  async get_banned_terms(guildid: string, userid: string): Promise<string[]> {
    const rows = await this.db!.all(
      'SELECT term FROM banned_terms WHERE guildid = ? AND userid = ?',
      [guildid, userid],
    );
    return rows.map((row: any) => row.term);
  }

  async remove_banned_term(
    guildid: string,
    userid: string,
    term: string,
  ): Promise<boolean> {
    const result = await this.db!.run(
      'DELETE FROM banned_terms WHERE guildid = ? AND userid = ? AND term = ?',
      [guildid, userid, term],
    );
    if (result.changes && result.changes > 0) {
      return true;
    } else {
      return false;
    }
  }

  async get_all_tracked_terms(): Promise<Map<string, Map<string, string[]>>> {
    const rows = await this.db!.all('SELECT * FROM tracked_terms');
    const result = new Map<string, Map<string, string[]>>();

    for (const row of rows) {
      if (!result.has(row.guildid)) {
        result.set(row.guildid, new Map<string, string[]>());
      }
      const userMap = result.get(row.guildid)!;
      if (!userMap.has(row.userid)) {
        userMap.set(row.userid, []);
      }
      userMap.get(row.userid)!.push(row.term);
    }

    return result;
  }

  async get_all_banned_terms(): Promise<Map<string, Map<string, string[]>>> {
    const rows = await this.db!.all('SELECT * FROM banned_terms');
    const result = new Map<string, Map<string, string[]>>();

    for (const row of rows) {
      if (!result.has(row.guildid)) {
        result.set(row.guildid, new Map<string, string[]>());
      }
      const userMap = result.get(row.guildid)!;
      if (!userMap.has(row.userid)) {
        userMap.set(row.userid, []);
      }
      userMap.get(row.userid)!.push(row.term);
    }

    return result;
  }

  async set_channel(guildid: string, channelid: string): Promise<void> {
    await this.db!.run(
      'INSERT OR REPLACE INTO channels (guildid, channelid) VALUES (?, ?)',
      [guildid, channelid],
    );
  }

  async get_channel(guildid: string): Promise<string | null> {
    const row = await this.db!.get(
      'SELECT channelid FROM channels WHERE guildid = ?',
      [guildid],
    );
    return row ? row.channelid : null;
  }

  async get_channels(): Promise<Map<string, string>> {
    const rows = await this.db!.all('SELECT * FROM channels');
    const result = new Map<string, string>();
    rows.forEach((row: any) => {
      result.set(row.guildid, row.channelid);
    });
    return result;
  }

  async set_timestamp(subreddit: string, timestamp: number): Promise<void> {
    await this.db!.run(
      'INSERT OR REPLACE INTO timestamps (subreddit, timestamp) VALUES (?, ?)',
      [subreddit, timestamp],
    );
  }

  async get_timestamp(subreddit: string): Promise<number> {
    const row = await this.db!.get(
      'SELECT timestamp FROM timestamps WHERE subreddit = ?',
      [subreddit],
    );
    return row ? row.timestamp : 0;
  }

  async get_timestamps(): Promise<Map<string, number>> {
    const rows = await this.db!.all('SELECT * FROM timestamps');
    const result = new Map<string, number>();
    rows.forEach((row: any) => {
      result.set(row.subreddit, row.timestamp);
    });
    return result;
  }
}
