/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom';
import fs from 'fs';
import HTML5Media from 'media/html5';
import path from 'path';
import { IS_ANDROID, IS_SAFARI } from 'utils/constants';

describe('media > html5', (): void => {
    let media: HTML5Media;
    let video: HTMLMediaElement;

    beforeAll(() => {
        window.HTMLMediaElement.prototype.canPlayType = (mimeType: string): CanPlayTypeResult =>
            (IS_SAFARI() && (mimeType === 'application/vnd.apple.mpegurl' || mimeType === 'application/x-mpegURL')) ||
            (IS_ANDROID() && mimeType === 'application/x-mpegURL') ||
            mimeType === 'video/mp4' ||
            mimeType === 'audio/mp3'
                ? 'probably'
                : '';
        window.HTMLMediaElement.prototype.load = (): void => {};
        const html = fs.readFileSync(path.resolve(__dirname, '../player.html'), 'utf-8');
        document.documentElement.innerHTML = html.toString();
        video = document.getElementById('video') as HTMLMediaElement;
    });

    beforeEach(() => {
        media = new HTML5Media(video);
    });

    test('only play media that is supported natively by the browser (Chrome, desktop)', () => {
        expect(media.canPlayType('application/vnd.apple.mpegurl')).toEqual(false);
        expect(media.canPlayType('application/x-mpegURL')).toEqual(false);
        expect(media.canPlayType('video/mp4')).toEqual(true);
        expect(media.canPlayType('audio/mp3')).toEqual(true);
    });
    test('only play media that is supported natively by the browser (Safari, desktop)', () => {
        // Mock user agent
        Object.defineProperty(navigator, 'userAgent', {
            writable: true,
            value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 12_2_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.2 Safari/605.1.15',
        });

        expect(media.canPlayType('application/vnd.apple.mpegurl')).toEqual(true);
        expect(media.canPlayType('application/x-mpegURL')).toEqual(true);
        expect(media.canPlayType('video/mp4')).toEqual(true);
        expect(media.canPlayType('audio/mp3')).toEqual(true);
    });
    test('only play media that is supported natively by the browser (Chrome, Android)', () => {
        // Mock user agent
        Object.defineProperty(navigator, 'userAgent', {
            writable: true,
            value: 'Mozilla/5.0 (Linux; Android 10; SM-A102U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.101 Mobile Safari/537.36',
        });

        expect(media.canPlayType('application/vnd.apple.mpegurl')).toEqual(false);
        expect(media.canPlayType('application/x-mpegURL')).toEqual(true);
        expect(media.canPlayType('video/mp4')).toEqual(true);
        expect(media.canPlayType('audio/mp3')).toEqual(true);
    });

    // test('load a regular source (MP4, MP3, M3U8, etc.) that is not live', () =>
    //     new Promise<void>((resolve) => {
    //         video.addEventListener('loadeddata', (): void => {
    //             expect(video.classList.contains('op-dvr__enabled')).toEqual(false);
    //             video.classList.remove('op-dvr__enabled');
    //             resolve();
    //         });
    //         try {
    //             media.src = {
    //                 src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    //                 type: 'video/mp4',
    //             };
    //             media.load();
    //         } catch (err) {
    //             throw new Error('error');
    //         }
    //     }));

    // test('load a live streaming source', () =>
    //     new Promise<void>((resolve) => {
    //         video.addEventListener('loadeddata', (): void => {
    //             expect(video.classList.contains('op-dvr__enabled')).toEqual(true);
    //             video.classList.remove('op-dvr__enabled');
    //             resolve();
    //         });
    //         try {
    //             media.src = {
    //                 src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    //                 type: 'application/x-mpegURL',
    //             };
    //             media.load();
    //         } catch (err) {
    //             throw new Error('error');
    //         }
    //     }));

    // test('load an invalid source', () => {
    //     const promises = [];
    //     promises.push(
    //         new Promise<void>((resolve) => {
    //             video.addEventListener('error', (e): void => {
    //                 const target = e.target as HTMLMediaElement;
    //                 const error = target?.error;
    //                 expect(error?.code).toEqual(error?.MEDIA_ERR_SRC_NOT_SUPPORTED);
    //                 resolve();
    //             });
    //             try {
    //                 media.src = {
    //                     src: 'http://invalid.source.com/media.mp4',
    //                     type: 'video/mp4',
    //                 };
    //                 media.load();
    //             } catch (err) {
    //                 throw new Error('error');
    //             }
    //         })
    //     );

    //     return Promise.all(promises);
    // });
});
