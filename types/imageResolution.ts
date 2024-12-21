export type ImageResolution = {
  width: number;
  height: number;
};

export class ImageResolutions {
  static readonly SQUARE: ImageResolution = {
    width: 1024,
    height: 1024
  };

  static readonly LANDSCAPE: ImageResolution = {
    width: 1216,
    height: 832
  };

  static readonly PORTRAIT: ImageResolution = {
    width: 832,
    height: 1216
  };

  static getResolution(type: 'square' | 'landscape' | 'portrait'): ImageResolution {
    switch (type) {
      case 'square':
        return this.SQUARE;
      case 'landscape':
        return this.LANDSCAPE;
      case 'portrait':
        return this.PORTRAIT;
    }
  }
}
