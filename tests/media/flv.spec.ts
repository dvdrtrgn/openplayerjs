/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom';
import fs from 'fs';
import FlvMedia from 'media/flv';
import path from 'path';

describe('media > flv', (): void => {
    let flv: FlvMedia;

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
        flv = new FlvMedia(document.getElementById('video') as HTMLMediaElement, {
            type: 'video/x-flv',
            src: 'http://flv.bdplay.nodemedia.cn/live/bbb.flv',
        });
    });

    afterEach(() => {
        if (flv.instance) {
            flv.destroy();
        }
    });
    test('implementation enables the flv.js library by dynamically loading it', async () => {
        expect(typeof (window as any).flvjs).not.toEqual(undefined);
    });

    test('only play FLV media', async () => {
        expect(flv.canPlayType('video/x-flv')).toEqual(true);
        expect(flv.canPlayType('video/flv')).toEqual(true);
        expect(flv.canPlayType('video/mp4')).toEqual(false);
    });
});
