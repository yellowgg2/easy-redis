import { createClient, RedisClient } from "redis";
import * as vscode from "vscode";

class RedisHandler {
  private redisClient: any = undefined;

  constructor(redisHost?: string, port = 6379) {}

  connect(redisHost?: string, port = 6379): Promise<RedisClient> {
    return new Promise(resolve => {
      const options = {
        url: redisHost,
        retry_strategy: (retry: any) => {
          vscode.window.showInformationMessage(
            `${
              retry.error.code
            } error occurs. Please check the address you just put in.`
          );
          resolve();
          return new Error("Retry time exhausted");
        }
      };
      this.redisClient = createClient(options);
      this.redisClient.on("connect", () => {
        console.log("Redis Connected!!!!!!!!!!!!!!!!!!!");
        resolve();
      });

      this.redisClient.on("error", (err: any) => {
        console.log("Something went wrong " + err);
        resolve();
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
    if (!this.isConnected) return Promise.reject();

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
    if (!this.isConnected) return Promise.reject();

    return new Promise<string[]>((resolve, reject) => {
      this.redisClient.keys("*", (error: any, result: any[]) => {
        if (error) {
          reject();
          return;
        }
        resolve(result.sort());
      });
    }).catch(e => {
      return [];
    });
  }

  getInfo(): Promise<string> {
    if (!this.isConnected) return Promise.reject();

    return new Promise<string>((resolve, reject) => {
      this.redisClient.info((error: any, result: any) => {
        if (error) {
          reject();
          return "";
        }
        resolve(result);
      });
    }).catch(e => {
      return "";
    });
  }

  setObject(key: string, value: any) {
    if (!this.isConnected) return;
    let keys = Object.keys(value);
    let convertArr = [];
    for (let key of keys) {
      convertArr.push(key);
      convertArr.push(value[key]);
    }
    this.redisClient.hmset(key, convertArr);
  }

  setValue(key: string, value: string) {
    if (!this.isConnected) return;
    this.redisClient.set(key, value);
  }

  delete(key: string) {
    if (!this.isConnected) return;
    this.redisClient.del(key);
  }

  flushAll() {
    if (!this.isConnected) return;
    this.redisClient.flushall();
  }
}
export default RedisHandler;
