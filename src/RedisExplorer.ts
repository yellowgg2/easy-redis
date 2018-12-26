import * as vscode from "vscode";
import { RedisProvider } from "./RedisProvider";
import fs = require("fs");

interface Entry {
  key: string;
}

export class RedisExplorer {
  redisExplorer: vscode.TreeView<Entry>;
  treeDataProvider: RedisProvider;

  constructor(context: vscode.ExtensionContext) {
    this.treeDataProvider = new RedisProvider();

    // redisExplorer가 package.json에 contributes.views.explorer.id 값과 일치가 되어야한다
    this.redisExplorer = vscode.window.createTreeView("redisExplorer", {
      treeDataProvider: this.treeDataProvider
    });

    vscode.commands.registerCommand("redisExplorer.readData", resource => {
      return this.openResource(resource);
    });

    vscode.commands.registerCommand("config.commands.redisServer", async () => {
      const address = await vscode.window.showInputBox({
        prompt: "Provide Redis Server address"
      });

      await vscode.workspace
        .getConfiguration()
        .update(
          "easyRedis.address",
          address,
          vscode.ConfigurationTarget.Global
        );

      this.reconnectRedis();
    });
  }

  private reconnectRedis() {
    this.treeDataProvider.disconnectRedis();
    this.treeDataProvider.connectRedis();
  }

  private openResource(resource: any) {
    fs.writeFile(
      `${vscode.workspace.rootPath}/easyRedis.json`,
      JSON.stringify(resource, null, 2),
      err => {
        if (err) {
          console.log(err);
          return;
        }
        vscode.workspace
          .openTextDocument(`${vscode.workspace.rootPath}/easyRedis.json`)
          .then(doc => {
            vscode.window.showTextDocument(doc);
          });
      }
    );
  }
}
