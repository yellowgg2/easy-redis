"use strict";
import * as vscode from "vscode";
import { RedisExplorer } from "./RedisExplorer";

export function activate(context: vscode.ExtensionContext) {
  vscode.commands.registerCommand("config.commands.redisServer", async () => {
    const address = await vscode.window.showInputBox({
      prompt: "Provide Redis Server address"
    });

    await vscode.workspace
      .getConfiguration()
      .update("easyRedis.address", address, vscode.ConfigurationTarget.Global);
  });
  new RedisExplorer(context);
}
