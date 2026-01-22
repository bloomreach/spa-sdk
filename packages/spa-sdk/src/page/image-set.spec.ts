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

import { ImageSetImpl, ImageSetModel, ImageSet, TYPE_IMAGE_SET, isImageSet } from './image-set';
import { ImageFactory, ImageModel, Image } from './image';

let imageFactory: jest.MockedFunction<ImageFactory>;

const model = {
  data: {
    description: null,
    displayName: 'Banner',
    fileName: 'something.jpg',
    id: 'some-id',
    localeString: null,
    name: 'something',
    original: null,
    thumbnail: null,
  },
  type: TYPE_IMAGE_SET,
} as ImageSetModel;

function createImageSet(imageSetModel = model) {
  return new ImageSetImpl(imageSetModel, imageFactory);
}

beforeEach(() => {
  imageFactory = jest.fn();
});

describe('ImageSetImpl', () => {
  let imageSet: ImageSet;

  beforeEach(() => {
    imageSet = createImageSet();
  });

  describe('getDescription', () => {
    it('should return undefined when there is no description', () => {
      expect(imageSet.getDescription()).toBeUndefined();
    });

    it('should return an image set file name', () => {
      const image = createImageSet({ ...model, data: { ...model.data, description: 'something' } });

      expect(image.getDescription()).toBe('something');
    });
  });

  describe('getDisplayName', () => {
    it('should return a display name', () => {
      expect(imageSet.getDisplayName()).toBe('Banner');
    });
  });

  describe('getFileName', () => {
    it('should return an image set file name', () => {
      expect(imageSet.getFileName()).toBe('something.jpg');
    });
  });

  describe('getId', () => {
    it('should return an image set id', () => {
      expect(imageSet.getId()).toBe('some-id');
    });
  });

  describe('getName', () => {
    it('should return an image set name', () => {
      expect(imageSet.getName()).toBe('something');
    });
  });

  describe('getLocale', () => {
    it('should return an image set locale', () => {
      const imageSetWithLocale = createImageSet({ ...model, data: { ...model.data, localeString: 'some-locale' } });

      expect(imageSetWithLocale.getLocale()).toBe('some-locale');
    });

    it('should return undefined when there is no locale', () => {
      expect(imageSet.getLocale()).toBeUndefined();
    });
  });

  describe('getOriginal', () => {
    it('should return undefined when there is no original image', () => {
      const imageSetWithoutOriginal = createImageSet();

      expect(imageSetWithoutOriginal.getOriginal()).toBeUndefined();
    });

    it('should return an original image', () => {
      const imageModel = {} as ImageModel;
      const image = {} as Image;
      imageFactory.mockReturnValueOnce(image);

      const menu = createImageSet({ ...model, data: { ...model.data, original: imageModel } });

      expect(menu.getOriginal()).toBe(image);
    });
  });

  describe('getThumbnail', () => {
    it('should return undefined when there is no thumbnail', () => {
      const imageSetWithoutThumbnail = createImageSet();

      expect(imageSetWithoutThumbnail.getThumbnail()).toBeUndefined();
    });

    it('should return a thumbnail', () => {
      const imageModel = {} as ImageModel;
      const image = {} as Image;
      imageFactory.mockReturnValueOnce(image);

      const menu = createImageSet({ ...model, data: { ...model.data, thumbnail: imageModel } });

      expect(menu.getThumbnail()).toBe(image);
    });
  });

  describe('getVariant', () => {
    it('should return undefined when variant does not exist', () => {
      expect(imageSet.getVariant('nonexistent')).toBeUndefined();
    });

    it('should return undefined when variant is null', () => {
      const imageSetWithNullVariant = createImageSet({
        ...model,
        data: { ...model.data, customVariant: null },
      });

      expect(imageSetWithNullVariant.getVariant('customVariant')).toBeUndefined();
    });

    it('should return undefined when variant is not an object', () => {
      const imageSetWithStringVariant = createImageSet({
        ...model,
        data: { ...model.data, customVariant: 'not-an-image' },
      });

      expect(imageSetWithStringVariant.getVariant('customVariant')).toBeUndefined();
    });

    it('should return an image variant when it exists', () => {
      const imageModel = {} as ImageModel;
      const image = {} as Image;
      imageFactory.mockReturnValueOnce(image);

      const imageSetWithVariant = createImageSet({
        ...model,
        data: { ...model.data, small: imageModel },
      });

      expect(imageSetWithVariant.getVariant('small')).toBe(image);
      expect(imageFactory).toHaveBeenCalledWith(imageModel);
    });
  });

  describe('getVariants', () => {
    it('should return all variants when no arguments provided', () => {
      const originalImageModel = {} as ImageModel;
      const thumbnailImageModel = {} as ImageModel;
      const smallImageModel = {} as ImageModel;
      const largeImageModel = {} as ImageModel;

      const originalImage = {} as Image;
      const thumbnailImage = {} as Image;
      const smallImage = {} as Image;
      const largeImage = {} as Image;

      // eslint-disable-next-line @typescript-eslint/no-shadow
      imageFactory.mockImplementation((model: ImageModel) => {
        if (model === originalImageModel) { return originalImage; }
        if (model === thumbnailImageModel) { return thumbnailImage; }
        if (model === smallImageModel) { return smallImage; }
        if (model === largeImageModel) { return largeImage; }
        return {} as Image;
      });

      const imageSetWithVariants = createImageSet({
        ...model,
        data: {
          ...model.data,
          original: originalImageModel,
          thumbnail: thumbnailImageModel,
          small: smallImageModel,
          large: largeImageModel,
        },
      });

      const variants = imageSetWithVariants.getVariants();

      expect(variants).toHaveProperty('original', originalImage);
      expect(variants).toHaveProperty('thumbnail', thumbnailImage);
      expect(variants).toHaveProperty('small', smallImage);
      expect(variants).toHaveProperty('large', largeImage);
      expect(Object.keys(variants).length).toBe(4);
    });

    it('should exclude known non-image properties when returning all variants', () => {
      const imageModel = {} as ImageModel;
      const image = {} as Image;
      imageFactory.mockReturnValueOnce(image);

      const imageSetWithVariant = createImageSet({
        ...model,
        data: { ...model.data, customVariant: imageModel },
      });

      const variants = imageSetWithVariant.getVariants();

      expect(variants).not.toHaveProperty('description');
      expect(variants).not.toHaveProperty('displayName');
      expect(variants).not.toHaveProperty('fileName');
      expect(variants).not.toHaveProperty('id');
      expect(variants).not.toHaveProperty('localeString');
      expect(variants).not.toHaveProperty('name');
    });

    it('should return only requested variants when arguments provided', () => {
      const smallImageModel = {} as ImageModel;
      const largeImageModel = {} as ImageModel;
      const mediumImageModel = {} as ImageModel;

      const smallImage = {} as Image;
      const largeImage = {} as Image;
      const mediumImage = {} as Image;

      imageFactory
        .mockReturnValueOnce(smallImage)
        .mockReturnValueOnce(largeImage)
        .mockReturnValueOnce(mediumImage);

      const imageSetWithVariants = createImageSet({
        ...model,
        data: {
          ...model.data,
          small: smallImageModel,
          large: largeImageModel,
          medium: mediumImageModel,
        },
      });

      const variants = imageSetWithVariants.getVariants(['small', 'large']);

      expect(variants).toHaveProperty('small', smallImage);
      expect(variants).toHaveProperty('large', largeImage);
      expect(variants).not.toHaveProperty('medium');
      expect(Object.keys(variants).length).toBe(2);
    });

    it('should exclude non-existent variants when specific variants requested', () => {
      const smallImageModel = {} as ImageModel;
      const smallImage = {} as Image;
      imageFactory.mockReturnValueOnce(smallImage);

      const imageSetWithVariant = createImageSet({
        ...model,
        data: { ...model.data, small: smallImageModel },
      });

      const variants = imageSetWithVariant.getVariants(['small', 'nonexistent', 'large']);

      expect(variants).toHaveProperty('small', smallImage);
      expect(variants).not.toHaveProperty('nonexistent');
      expect(variants).not.toHaveProperty('large');
      expect(Object.keys(variants).length).toBe(1);
    });

    it('should exclude null and non-object variants', () => {
      const validImageModel = {} as ImageModel;
      const validImage = {} as Image;
      imageFactory.mockReturnValueOnce(validImage);

      const imageSetWithMixedVariants = createImageSet({
        ...model,
        data: {
          ...model.data,
          valid: validImageModel,
          nullVariant: null,
          stringVariant: 'not-an-image',
          numberVariant: 123,
        },
      });

      const variants = imageSetWithMixedVariants.getVariants();

      expect(variants).toHaveProperty('valid', validImage);
      expect(variants).not.toHaveProperty('nullVariant');
      expect(variants).not.toHaveProperty('stringVariant');
      expect(variants).not.toHaveProperty('numberVariant');
      expect(Object.keys(variants).length).toBe(1);
    });

    it('should return empty object when no variants exist', () => {
      const variants = imageSet.getVariants();

      expect(variants).toEqual({});
      expect(Object.keys(variants).length).toBe(0);
    });

    it('should return empty object when requested variants do not exist', () => {
      const variants = imageSet.getVariants(['nonexistent1', 'nonexistent2']);

      expect(variants).toEqual({});
      expect(Object.keys(variants).length).toBe(0);
    });
  });
});

describe('isImageSet', () => {
  it('should return true', () => {
    const imageSet = createImageSet();

    expect(isImageSet(imageSet)).toBe(true);
  });

  it('should return false', () => {
    expect(isImageSet(undefined)).toBe(false);
    expect(isImageSet({})).toBe(false);
  });
});
