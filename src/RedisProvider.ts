import * as vscode from "vscode";

interface Entry {
  key: string;
  value: string;
}

export class RedisProvider implements vscode.TreeDataProvider<Entry> {
  constructor() {}
  getTreeItem(element: Entry): vscode.TreeItem {
    return new vscode.TreeItem(
      element.key,
      vscode.TreeItemCollapsibleState.Collapsed
    );
  }
  getChildren(element: Entry): vscode.ProviderResult<Entry[]> {
    return [{ key: "aaa", value: "bbb" }, { key: "ccc", value: "ddd" }];
  }
}
