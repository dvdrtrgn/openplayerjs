/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom';
import fs from 'fs';
import HTML5Media from 'media/html5';
import path from 'path';
import { IS_ANDROID, IS_SAFARI } from 'utils/constants';

describe('media > html5', (): void => {
    beforeEach(() => {
        // Mock `canPlayTime` method
        window.HTMLMediaElement.prototype.canPlayType = (mimeType: string): CanPlayTypeResult =>
            (IS_SAFARI() && (mimeType === 'application/vnd.apple.mpegurl' || mimeType === 'application/x-mpegURL')) ||
            (IS_ANDROID() && mimeType === 'application/x-mpegURL') ||
            mimeType === 'video/mp4' ||
            mimeType === 'audio/mp3'
                ? 'probably'
                : '';

        const html = fs.readFileSync(path.resolve(__dirname, '../player.html'), 'utf-8');
        document.documentElement.innerHTML = html.toString();
    });

    test('only play media that is supported natively by the browser (Chrome, desktop)', async () => {
        const media = new HTML5Media(document.getElementById('video') as HTMLMediaElement, {
            type: 'video/mp4',
            src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        });
        expect(media.canPlayType('application/vnd.apple.mpegurl')).toEqual(false);
        expect(media.canPlayType('application/x-mpegURL')).toEqual(false);
        expect(media.canPlayType('video/mp4')).toEqual(true);
        expect(media.canPlayType('audio/mp3')).toEqual(true);
    });
    test('only play media that is supported natively by the browser (Safari, desktop)', async () => {
        // Mock user agent
        Object.defineProperty(navigator, 'userAgent', {
            writable: true,
            value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 12_2_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.2 Safari/605.1.15',
        });

        const media = new HTML5Media(document.getElementById('video') as HTMLMediaElement, {
            type: 'video/mp4',
            src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        });
        expect(media.canPlayType('application/vnd.apple.mpegurl')).toEqual(true);
        expect(media.canPlayType('application/x-mpegURL')).toEqual(true);
        expect(media.canPlayType('video/mp4')).toEqual(true);
        expect(media.canPlayType('audio/mp3')).toEqual(true);
    });
    test('only play media that is supported natively by the browser (Chrome, Android)', async () => {
        // Mock user agent
        Object.defineProperty(navigator, 'userAgent', {
            writable: true,
            value: 'Mozilla/5.0 (Linux; Android 10; SM-A102U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.101 Mobile Safari/537.36',
        });

        const media = new HTML5Media(document.getElementById('video') as HTMLMediaElement, {
            type: 'video/mp4',
            src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        });
        expect(media.canPlayType('application/vnd.apple.mpegurl')).toEqual(false);
        expect(media.canPlayType('application/x-mpegURL')).toEqual(true);
        expect(media.canPlayType('video/mp4')).toEqual(true);
        expect(media.canPlayType('audio/mp3')).toEqual(true);
    });
});
