import Native from '../components/native';
import { isAudio, isVideo } from '../utils/dom';

/**
 *
 * @class NativeMedia
 * @description Class that wraps the native HTML5 video/audio tags
 */
class NativeMedia extends Native {
    /**
     * Creates an instance of NativeMedia.
     *
     * @param {HTMLMediaElement} element
     * @param {IFile} mediaFile
     * @returns {NativeMedia}
     * @memberof NativeMedia
     */
    constructor(element, mediaFile) {
        if (!isAudio(element) && !isVideo(element)) {
            throw new TypeError('Native method only supports video/audio tags');
        }
        super(element, mediaFile);
        return this;
    }
    /**
     *
     *
     * @param {string} mimeType
     * @returns {boolean}
     * @memberof NativeMedia
     */
    public canPlayType(mimeType) {
        return !!(this.element.canPlayType(mimeType).replace('no', ''));
    }

    public load() {
        this.element.load();
    }

    public destroy() {
        console.log(this.element);
    }
}

export default NativeMedia;