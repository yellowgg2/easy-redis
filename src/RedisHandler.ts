import { createClient } from "redis";

class RedisHandler {
  private redisClient: any = undefined;

  constructor(redisHost?: string, port?: number) {
    const options = {
      host: redisHost,
      port
    };
    this.redisClient = createClient(options);
    this.redisClient.on("connect", () => {
      console.log("Redis Connected!!!!!!!!!!!!!!!!!!!");
    });

    this.redisClient.on("error", (err: any) => {
      console.log("Something went wrong " + err);
    });
  }

  getValue(key: string): Promise<any> {
    if (!this.redisClient) return Promise.reject();

    return new Promise<any>((resolve, reject) => {
      this.redisClient.hgetall(`${key}`, (error: any, result: any[]) => {
        if (error) {
          console.log(error);
          reject();
        }
        resolve(result);
      });
    }).catch(e => {
      console.log(e);
      return {};
    });
  }

  getKeys(): Promise<string[]> {
    if (!this.redisClient) return Promise.reject();

    return new Promise<string[]>((resolve, reject) => {
      this.redisClient.keys("*", (error: any, result: any[]) => {
        if (error) {
          console.log(error);
          reject();
        }
        resolve(result);
      });
    }).catch(e => {
      console.log(e);
      return [];
    });
  }
}
export default RedisHandler;
