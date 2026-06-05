/*
 * Copyright 2020-2026 Bloomreach
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Level } from './level';

export class Logger {
  level = Level.Error;

  constructor(private console: Console) {}

  debug(...message: unknown[]): void {
    this.log(Level.Debug, ...message);
  }

  info(...message: unknown[]): void {
    this.log(Level.Info, ...message);
  }

  warn(...message: unknown[]): void {
    this.log(Level.Warn, ...message);
  }

  error(...message: unknown[]): void {
    this.log(Level.Error, ...message);
  }

  private log(level: Level, ...message: unknown[]): void {
    const levels = Object.values(Level);
    if (!levels.includes(level) || levels.indexOf(level) < levels.indexOf(this.level)) {
      return;
    }

    this.console[level]('[SPA]', `[${level.toUpperCase()}]`, ...message);
  }
}
