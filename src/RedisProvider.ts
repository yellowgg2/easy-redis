import * as vscode from "vscode";
import RedisHandler from "./RedisHandler";
import * as path from "path";

enum ItemType {
  Server = 0,
  Item = 1,
  ItemSelected = 2
}

interface Entry {
  key: string;
  type: ItemType;
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

  public refresh() {
    console.log("Refresh Fire!!!!");
    this._onDidChangeTreeData.fire();
  }

  async connectRedis() {
    const configuration = vscode.workspace.getConfiguration();

    if (configuration.easyRedis.address !== "") {
      console.log("Redis connect to : ", configuration.easyRedis.address);
      this.redisHandler
        .connect(configuration.easyRedis.address, 6379)
        .then(() => {
          this.refresh();
        });
    }
  }

  disconnectRedis() {
    this.redisHandler.disconnect();
  }

  async getTreeItem(element: Entry): Promise<vscode.TreeItem> {
    if (!this.redisHandler) {
      return Promise.reject();
    }

    let treeItem = new vscode.TreeItem(
      element.key,
      element.type === ItemType.Server
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None
    );

    let result;
    if (element.type === ItemType.Server) {
      result = await this.redisHandler.getInfo();
    } else {
      result = await this.redisHandler.getValue(element.key);
    }

    treeItem.iconPath = {
      light: path.join(
        __filename,
        "..",
        "..",
        "resources",
        "light",
        element.type === ItemType.Server
          ? "baseline_device_hub_black_18dp.png"
          : "baseline_web_asset_black_18dp.png"
      ),
      dark: path.join(
        __filename,
        "..",
        "..",
        "resources",
        "dark",
        element.type === ItemType.Server
          ? "baseline_device_hub_white_18dp.png"
          : "baseline_web_asset_white_18dp.png"
      )
    };

    treeItem.command = {
      command: "redisExplorer.readData",
      title: "Read Data",
      arguments: [
        {
          key: element.key,
          value: result,
          type: typeof result,
          iconType: element.type
        }
      ]
    };

    if (element.type !== ItemType.Server) {
      treeItem.contextValue = "redisNode";
    }
    return treeItem;
  }

  async getChildren(element: Entry | undefined): Promise<Entry[]> {
    if (!element) {
      const configuration = vscode.workspace.getConfiguration();
      return [{ key: configuration.easyRedis.address, type: ItemType.Server }];
    } else if (element.type === ItemType.Server) {
      try {
        const result = await this.redisHandler.getKeys();
        return result.map((value: string) => {
          return { key: value, type: ItemType.Item };
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

  flushAll() {
    this.redisHandler.flushAll();
  }
}
