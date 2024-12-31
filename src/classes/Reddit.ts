import axios from 'axios';

interface post {
  title: string;
  thumbnail: string | false; // url or default
  item_link: string;
  post_link: string;
  flair: string;
  id: string;
  timestamp: number; // utc
}

export class SubReddit {
  flairs: Set<string>;
  posts: post[];
  new_posts: post[]; // new posts since last update
  name: string;
  last_post_ts: number;
  constructor(
    subreddit: string,
    old_posts: post[] = [],
    last_ts: number | undefined = undefined,
  ) {
    this.name = subreddit;
    this.posts = old_posts;
    this.new_posts = [];
    this.flairs = new Set<string>();
    if (last_ts === undefined) {
      // ts not provided
      if (old_posts[0]?.timestamp) {
        // use last ts from provided posts
        this.last_post_ts = old_posts[0].timestamp;
      } else {
        this.last_post_ts = 0; // no posts provided use 0
      }
    } else {
      this.last_post_ts = last_ts; // use provided ts
    }
  }

  async update() {
    await this.update_posts();
    this.update_flairs();
  }

  // search through posts and add flairs
  update_flairs() {
    for (const post of this.posts) {
      this.flairs.add(post.flair);
    }
  }

  async update_posts() {
    // returns whether update was successful
    const api_posts: post[] = await this.api_get_posts();
    this.new_posts = api_posts.filter((api_post: post) => {
      return api_post.timestamp > this.last_post_ts;
    });
    this.posts = api_posts;
  }

  async api_get_posts(): Promise<post[]> {
    const NEW_POSTS_API_URL = `https://www.reddit.com/r/${this.name}/new.json?sort=new`;
    const res = await axios.get(NEW_POSTS_API_URL);
    const body = res.data;
    let posts: post[] = [];
    try {
      posts = this.parse_posts_res(body);
    } catch (err) {
      console.warn('[ERROR] While getting new posts from reddit');
      console.warn(err);
      console.warn('Corresponding body:');
      console.warn(JSON.stringify(body));
    }
    return posts;
  }

  parse_posts_res(body: any): post[] {
    const posts: post[] = [];
    const res_posts = body.data.children;
    for (const res_post of res_posts) {
      const new_post: post = {
        title: res_post.data.title,
        thumbnail:
          res_post.data.thumbnail === 'default' // if the thumbnail is 'default' set it to false
            ? false
            : res_post.data.thumbnail,
        item_link: res_post.data.url || res_post.data.url_overridden_by_dest,
        post_link: 'https://www.reddit.com' + res_post.data.permalink,
        flair: res_post.data.link_flair_text,
        id: res_post.data.id,
        timestamp: res_post.data.created_utc,
      };
      posts.push(new_post); // add to end of array, since we receive new posts first
    }
    return posts;
  }
}

export class Reddit {
  subreddits: Map<string, SubReddit>;
  constructor(new_subreddits: string[]) {
    this.subreddits = new Map<string, SubReddit>();
    for (const name of new_subreddits) {
      this.add_subreddit(name);
    }
  }

  add_subreddit(name: string, old_posts: post[] = []) {
    this.subreddits.set(name, new SubReddit(name, old_posts));
  }

  async update_subreddits() {
    for (const sb of this.subreddits.values()) {
      await sb.update();
    }
  }
}
