import * as vscode from "vscode";
import RedisHandler from "./RedisHandler";
import * as path from "path";

interface Entry {
  key: string;
}

export class RedisProvider implements vscode.TreeDataProvider<Entry> {
  private redisHandler: any | undefined = undefined;
  constructor() {
    const configuration = vscode.workspace.getConfiguration();

    if (configuration.easyRedis.address !== "") {
      this.redisHandler = new RedisHandler(
        configuration.easyRedis.address,
        6379
      );
    }
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
      arguments: [result]
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
    console.log("=================================");
    return treeItem;
  }

  async getChildren(element: Entry): Promise<Entry[]> {
    if (!element && this.redisHandler) {
      // root
      const result = await this.redisHandler.getKeys();
      return result.map((value: string) => {
        return { key: value };
      });
    }

    return [];
  }
}
