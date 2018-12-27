import * as vscode from "vscode";
import { RedisProvider } from "./RedisProvider";
import fs = require("fs");

interface Entry {
  key: string;
}

export class RedisExplorer {
  redisExplorer: vscode.TreeView<Entry>;
  treeDataProvider: RedisProvider;
  lastResource: any;

  constructor(context: vscode.ExtensionContext) {
    this.treeDataProvider = new RedisProvider();
    this.lastResource = undefined;

    // redisExplorer가 package.json에 contributes.views.explorer.id 값과 일치가 되어야한다
    this.redisExplorer = vscode.window.createTreeView("redisExplorer", {
      treeDataProvider: this.treeDataProvider
    });

    vscode.commands.registerCommand("redisExplorer.readData", resource => {
      this.lastResource = resource;
      return this.openResource(resource);
    });

    vscode.commands.registerCommand("redisExplorer.delData", () => {});

    vscode.commands.registerCommand("config.commands.redisServer", async () => {
      const address = await vscode.window.showInputBox({
        prompt: "Provide Redis Server address"
      });

      if (address === "") {
        vscode.window.showInformationMessage(
          "Please put a correct Redis Server address."
        );
        return;
      }

      await vscode.workspace
        .getConfiguration()
        .update(
          "easyRedis.address",
          address,
          vscode.ConfigurationTarget.Global
        );

      this.reconnectRedis();
      this.treeDataProvider.refresh();
    });

    vscode.commands.registerCommand(
      "config.commands.redisServer.addItem",
      () => {
        console.log("Add Item");
      }
    );
    vscode.commands.registerCommand(
      "config.commands.redisServer.delItem",
      () => {
        if (this.lastResource.key) {
          this.treeDataProvider.deleteRedis(this.lastResource.key);
          this.treeDataProvider.refresh();
        }
      }
    );

    vscode.workspace.onDidSaveTextDocument(event => {
      fs.readFile(event.fileName, (err, data) => {
        try {
          const readData = JSON.parse(data.toString());
          this.treeDataProvider.setRedisObject(this.lastResource.key, readData);
        } catch (e) {
          this.treeDataProvider.setRedisValue(
            this.lastResource.key,
            data.toString()
          );
        }
      });
    });
  }

  private reconnectRedis() {
    this.treeDataProvider.disconnectRedis();
    this.treeDataProvider.connectRedis();
  }

  private openResource(resource: any) {
    console.log(resource);
    fs.writeFile(
      `${vscode.workspace.rootPath}/.easyRedis.redis`,
      resource.type === "string"
        ? resource.value
        : JSON.stringify(resource.value, null, 2),
      err => {
        if (err) {
          console.log(err);
          return;
        }
        vscode.workspace
          .openTextDocument(`${vscode.workspace.rootPath}/.easyRedis.redis`)
          .then(doc => {
            vscode.window.showTextDocument(doc);
          });
      }
    );
  }
}
