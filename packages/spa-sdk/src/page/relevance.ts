/*
 * Copyright 2019-2025 Bloomreach
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

/* eslint-disable max-len */
/**
 * Meta-data of a visitor.
 * @see https://documentation.bloomreach.com/library/enterprise/enterprise-features/targeting/visitors-visits-and-cookies.html
 */
/* eslint-enable max-len */
export interface Visitor {
  /**
   * The visitor identifier.
   */
  id: string;

  /**
   * An HTTP-header using to pass the visitor id to the Page Model API.
   */
  header: string;

  /**
   * New visitor flag.
   */
  new: boolean;
}

/* eslint-disable max-len */
/**
 * Meta-data of a current visit.
 * @see https://documentation.bloomreach.com/library/enterprise/enterprise-features/targeting/visitors-visits-and-cookies.html
 */
/* eslint-enable max-len */
export interface Visit {
  /**
   * The visit identifier.
   */
  id: string;

  /**
   * New visit flag.
   */
  new: boolean;
}
