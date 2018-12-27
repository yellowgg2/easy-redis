import { createClient, RedisClient } from "redis";

class RedisHandler {
  private redisClient: any = undefined;

  constructor(redisHost?: string, port = 6379) {}

  connect(redisHost?: string, port = 6379): Promise<RedisClient> {
    return new Promise(resolve => {
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
    });
  }

  disconnect(): void {
    if (this.redisClient) {
      this.redisClient.end(false);
    }
  }

  get isConnected(): Boolean {
    if (this.redisClient && this.redisClient.connected) {
      return true;
    }
    return false;
  }

  getValue(key: string): Promise<any> {
    if (!this.redisClient) return Promise.reject();

    return new Promise<any>((resolve, reject) => {
      this.redisClient.hgetall(`${key}`, (error: any, result: any[]) => {
        if (error) {
          this.redisClient.get(`${key}`, (error: any, singleResult: any) => {
            if (error) {
              console.log(error);
              reject();
            }
            resolve(singleResult);
          });
          return;
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

  setObject(key: string, value: any) {
    let keys = Object.keys(value);
    let convertArr = [];
    for (let key of keys) {
      convertArr.push(key);
      convertArr.push(value[key]);
    }
    this.redisClient.hmset(key, convertArr);
  }

  setValue(key: string, value: string) {
    this.redisClient.set(key, value);
  }

  delete(key: string) {
    this.redisClient.del(key);
  }
}
export default RedisHandler;
