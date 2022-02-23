/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom';
import * as general from 'utils/general';

describe('utils > general', () => {
    test('must return the absolute URL of a relative one', () => {
        expect(general.getAbsoluteUrl('example.pdf')).toEqual(`${window.location.origin}/example.pdf`);
    });

    test('must detect if media is a video element', () => {
        const video = document.createElement('video');
        expect(general.isVideo(video)).toEqual(true);

        const audio = document.createElement('audio');
        expect(general.isVideo(audio)).toEqual(false);
    });

    test('must detect if media is an audio element', () => {
        const video = document.createElement('video');
        expect(general.isAudio(video)).toEqual(false);

        const audio = document.createElement('audio');
        expect(general.isAudio(audio)).toEqual(true);
    });

    // test('should load a script and destroy the script tag on the header', async () => {
    //     try {
    //         await general.loadScript('https://cdn.jsdelivr.net/npm/openplayerjs@latest/dist/openplayer.min.js');
    //         expect((window as any).OpenPlayerJS).not.toBeNull();
    //     } catch (err) {
    //         expect((err as Record<string, unknown>).src).toBeNull();
    //     }

    //     // try {
    //     //     await general.loadScript('https://cdn.jsdelivr.net/npm/openplayerjs@0.0.0/dist/openplayer.min.js');
    //     // } catch (err) {
    //     //     expect(err.src).toEqual('https://cdn.jsdelivr.net/npm/openplayerjs@0.0.0/dist/openplayer.min.js');
    //     // }
    // });

    test('sanitizes string from XSS attacks', (done) => {
        const content = '<div onclick="javascript:alert(\'XSS\')">Test<script>alert("Test");</script></div>';
        expect(general.sanitize(content)).toEqual('Test');
        expect(general.sanitize(content, false)).toEqual('<div>Test</div>');
        done();
    });

    test('checks if string is a valid XML source', (done) => {
        expect(general.isXml('<invalid>')).toEqual(false);
        expect(
            general.isXml(`<note>
            <to>Tove</to>
            <from>Jani</from>
            <heading>Reminder</heading>
            <body>Don't forget me this weekend!</body>
            </note>`)
        ).toEqual(true);
        done();
    });

    test('checks if string is a valid JSON source', (done) => {
        expect(general.isJson('abc123')).toEqual(false);
        expect(
            general.isJson(`{
                "test": true,
                "id": 12345,
                "name": "test"
            }`)
        ).toEqual(true);
        done();
    });

    test('must return a custom event to be dispatched', (done) => {
        let event = general.addEvent('custom');
        let custom = new CustomEvent('custom');
        expect(event.type).toEqual(custom.type);

        event = general.addEvent('test', { detail: { data: 'test' } });
        custom = new CustomEvent('test', { detail: { data: 'test' } });
        expect(event.detail.data).toEqual((custom.detail as any).data);
        done();
    });
});
