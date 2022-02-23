import '@testing-library/jest-dom';
import * as time from 'utils/time';

describe('utils > time', () => {
    test('returns a number of seconds in STMPE format', (done) => {
        let formatted = time.formatTime(0);
        expect(formatted).toEqual('00:00');

        formatted = time.formatTime(3600);
        expect(formatted).toEqual('01:00:00');
        done();
    });
    test('returns an STMPE string to a number of seconds', (done) => {
        let formatted = time.timeToSeconds('00:00');
        expect(formatted).toEqual(0);

        formatted = time.timeToSeconds('01:00:00');
        expect(formatted).toEqual(3600);
        done();
    });
});
