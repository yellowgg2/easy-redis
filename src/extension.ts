"use strict";
import * as vscode from "vscode";
import { RedisExplorer } from "./RedisExplorer";

export function activate(context: vscode.ExtensionContext) {
  new RedisExplorer(context);
}
