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
import { Logger } from './logger';

describe('Logger', () => {
  let mockConsole: jest.Mocked<Console>;
  let logger: Logger;

  beforeEach(() => {
    mockConsole = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    } as unknown as jest.Mocked<Console>;
    logger = new Logger(mockConsole);
    logger.level = Level.Warn;
  });

  describe('log', () => {
    it('should not log messages below log level', () => {
      logger.debug('something');
      logger.info('something');

      expect(mockConsole.debug).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
    });

    it('should log messages above log level', () => {
      logger.warn('something');
      logger.error('something');

      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
      expect(mockConsole.error).toHaveBeenCalledTimes(1);
    });

    it('should log a message with prefix and level tag', () => {
      logger.warn('a', 'b');

      expect(mockConsole.warn).toHaveBeenCalledWith('[SPA]', '[WARN]', 'a', 'b');
    });

    it('should delegate to the console method for the level', () => {
      logger.error('something');

      expect(mockConsole.error).toHaveBeenCalledWith(expect.any(String), expect.any(String), 'something');
    });
  });
});
