import * as vscode from "vscode";
import RedisHandler from "./RedisHandler";
import * as path from "path";

interface Entry {
  key: string;
}

export class RedisProvider implements vscode.TreeDataProvider<Entry> {
  private redisHandler: any | undefined = undefined;
  private _onDidChangeTreeData: vscode.EventEmitter<
    any
  > = new vscode.EventEmitter<any>();
  readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData
    .event;

  constructor() {
    this.redisHandler = new RedisHandler();
    this.connectRedis();
  }

  public refresh(): any {
    console.log("Refresh Fire!!!!");
    this._onDidChangeTreeData.fire();
  }

  async connectRedis() {
    const configuration = vscode.workspace.getConfiguration();

    if (configuration.easyRedis.address !== "") {
      console.log("Redis connect to : ", configuration.easyRedis.address);
      this.redisHandler
        .connect(
          configuration.easyRedis.address,
          6379
        )
        .then(() => {
          this.refresh();
        });
    }
  }

  disconnectRedis(): void {
    this.redisHandler.disconnect();
  }

  async getTreeItem(element: Entry): Promise<vscode.TreeItem> {
    if (!this.redisHandler) {
      return Promise.reject();
    }

    let treeItem = new vscode.TreeItem(element.key);
    const result = await this.redisHandler.getValue(element.key);

    treeItem.command = {
      command: "redisExplorer.readData",
      title: "Read Data",
      arguments: [{ key: element.key, value: result, type: typeof result }]
    };
    treeItem.iconPath = {
      light: path.join(
        __filename,
        "..",
        "..",
        "resources",
        "light",
        "dependency.svg"
      ),
      dark: path.join(
        __filename,
        "..",
        "..",
        "resources",
        "dark",
        "dependency.svg"
      )
    };
    return treeItem;
  }

  async getChildren(element: Entry | undefined): Promise<Entry[]> {
    if (!element && this.redisHandler) {
      // root
      try {
        const result = await this.redisHandler.getKeys();
        return result.map((value: string) => {
          return { key: value };
        });
      } catch (e) {
        return [];
      }
    }

    return [];
  }

  setRedisValue(key: string, value: string) {
    this.redisHandler.setValue(key, value);
  }

  setRedisObject(key: string, value: any) {
    this.redisHandler.setObject(key, value);
  }

  deleteRedis(key: string) {
    this.redisHandler.delete(key);
  }
}
