/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom';
import fs from 'fs';
import DashMedia from 'media/dash';
import path from 'path';

describe('media > dash', (): void => {
    let dash: DashMedia;

    beforeAll(() => {
        // Mock the MediaSource element to pass validations
        Object.defineProperty(window, 'MediaSource', {
            writable: true,
            value: jest.fn().mockImplementation(() => ({
                addEventListener: jest.fn(),
            })),
        });

        const html = fs.readFileSync(path.resolve(__dirname, '../player.html'), 'utf-8');
        document.documentElement.innerHTML = html.toString();
    });

    beforeEach(() => {
        dash = new DashMedia(document.getElementById('video') as HTMLMediaElement);
    });

    afterEach(() => {
        if (dash.instance) {
            dash.destroy();
        }
    });
    test('implementation enables the Dash.js library by dynamically loading it', async () => {
        expect(typeof (window as any).dashjs).not.toEqual(undefined);
    });

    test('only play M(PEG)-DASH media', async () => {
        expect(dash.canPlayType('application/dash+xml')).toEqual(true);
        expect(dash.canPlayType('video/mp4')).toEqual(false);
    });
});
