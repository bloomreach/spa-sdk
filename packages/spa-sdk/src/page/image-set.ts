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

import { injectable, inject } from 'inversify';
import { ImageFactory, ImageModel, Image } from './image';

export const ImageSetModelToken = Symbol.for('ImageSetModelToken');

export const TYPE_IMAGE_SET = 'imageset';

interface ImageSetDataModel {
  description: string | null;
  displayName: string;
  fileName: string;
  id: string;
  localeString: string | null;
  name: string;
  original: ImageModel | null;
  thumbnail: ImageModel | null;
  [property: string]: any;
}

/**
 * Image set model.
 */
export interface ImageSetModel {
  data: ImageSetDataModel;
  type: typeof TYPE_IMAGE_SET;
}

export interface ImageSet {
  /**
   * @return The image set description.
   */
  getDescription(): string | undefined;

  /**
   * @return The image set display name.
   */
  getDisplayName(): string;

  /**
   * @return The image set file name.
   */
  getFileName(): string;

  /**
   * @return The image set id.
   */
  getId(): string;

  /**
   * @return The image set locale.
   */
  getLocale(): string | undefined;

  /**
   * @return The image name.
   */
  getName(): string;

  /**
   * @return The original image.
   */
  getOriginal(): Image | undefined;

  /**
   * @return The thumbnail.
   */
  getThumbnail(): Image | undefined;

  /**
   * @param variant The variant name.
   * @return The image variant, or undefined if it doesn't exist.
   */
  getVariant(variant: string): Image | undefined;

  /**
   * @param variants Optional array of variant names to retrieve. If not provided, returns all variants.
   * @return A map of variant names to Image objects.
   */
  getVariants(variants?: string[]): Record<string, Image>;
}

@injectable()
export class ImageSetImpl implements ImageSet {
  private original?: Image;

  private thumbnail?: Image;

  private variants: Record<string, Image> = {};

  constructor(
    @inject(ImageSetModelToken) protected model: ImageSetModel,
    @inject(ImageFactory) imageFactory: ImageFactory,
  ) {
    this.original = model.data.original ? imageFactory(model.data.original) : undefined;

    this.thumbnail = model.data.thumbnail ? imageFactory(model.data.thumbnail) : undefined;

    this.loadVariants(imageFactory);
  }

  getDescription(): string | undefined {
    return this.model.data.description ?? undefined;
  }

  getDisplayName(): string {
    return this.model.data.displayName;
  }

  getFileName(): string {
    return this.model.data.fileName ?? undefined;
  }

  getId(): string {
    return this.model.data.id;
  }

  getLocale(): string | undefined {
    return this.model.data.localeString ?? undefined;
  }

  getName(): string {
    return this.model.data.name;
  }

  getOriginal(): Image | undefined {
    return this.original;
  }

  getThumbnail(): Image | undefined {
    return this.thumbnail;
  }

  getVariant(variant: string): Image | undefined {
    return this.variants[variant] ?? undefined;
  }

  getVariants(variants?: string[]): Record<string, Image> {
    if (variants) {
      // Return only the requested variants
      return variants.reduce((acc, variant) => {
        const variantImage = this.variants[variant];
        if (variantImage) {
          acc[variant] = variantImage;
        }
        return acc;
      }, {} as Record<string, Image>);
    }

    // Return a copy of all variants
    return { ...this.variants };
  }

  private loadVariants(imageFactory: ImageFactory): void {
    this.variants = {};
    const knownImageSetProperties = [
      'name',
      'displayName',
      'fileName',
      'description',
      'contentType',
      'localeString',
      'id',
    ];

    Object.keys(this.model.data)
      .filter((key) => !knownImageSetProperties.includes(key))
      .forEach((variant) => {
        const variantData = this.model.data[variant];
        if (variantData != null && typeof variantData === 'object') {
          this.variants[variant] = imageFactory(variantData as ImageModel);
        }
      });
  }
}

/**
 * Checks whether a value is an image set.
 * @param value The value to check.
 */
export function isImageSet(value: unknown): value is ImageSet {
  return value instanceof ImageSetImpl;
}
