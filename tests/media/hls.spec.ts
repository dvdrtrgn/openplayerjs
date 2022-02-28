/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom';
import fs from 'fs';
import HlsMedia from 'media/hls';
import path from 'path';

describe('media > hls', (): void => {
    let hls: HlsMedia;

    beforeAll(() => {
        // Mock the MediaSource element to pass validations
        Object.defineProperty(window, 'MediaSource', {
            writable: true,
            value: {
                isTypeSupported: () => true,
            },
        });

        const html = fs.readFileSync(path.resolve(__dirname, '../player.html'), 'utf-8');
        document.documentElement.innerHTML = html.toString();
    });

    beforeEach(() => {
        hls = new HlsMedia(document.getElementById('video') as HTMLMediaElement);
    });

    afterEach(() => {
        if (hls.instance) {
            hls.destroy();
        }
    });
    test('implementation enables the hls.js library by dynamically loading it', async () => {
        expect(typeof (window as any).Hls).not.toEqual(undefined);
    });

    test('only play M3U8 media', async () => {
        expect(hls.canPlayType('application/vnd.apple.mpegurl')).toEqual(true);
        expect(hls.canPlayType('application/x-mpegURL')).toEqual(true);
        expect(hls.canPlayType('video/mp4')).toEqual(false);
    });
});
