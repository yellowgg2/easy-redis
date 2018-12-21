import * as vscode from "vscode";
import { RedisProvider } from "./RedisProvider";

interface Entry {
  key: string;
  value: string;
}

export class RedisExplorer {
  private redisExplorer: vscode.TreeView<Entry>;

  constructor(context: vscode.ExtensionContext) {
    const treeDataProvider = new RedisProvider();

    // redisExplorer가 package.json에 contributes.views.explorer.id 값과 일치가 되어야한다
    this.redisExplorer = vscode.window.createTreeView("redisExplorer", {
      treeDataProvider
    });

    vscode.commands.registerCommand("RedisExplorer.connectUri", resource =>
      console.log(resource)
    );
  }
}
