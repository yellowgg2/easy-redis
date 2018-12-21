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

    if (configuration.easyRedis.address) {
      this.redisHandler = new RedisHandler(
        configuration.easyRedis.address,
        6379
      );
    }
  }
  getTreeItem(element: Entry): vscode.TreeItem {
    let treeItem = new vscode.TreeItem(element.key);
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

  async getChildren(element: Entry): Promise<Entry[]> {
    if (!element) {
      // root
      const result = await this.redisHandler.getKeys();
      return result.map((value: string) => {
        return { key: value };
      });
    }

    return [];
  }
}
