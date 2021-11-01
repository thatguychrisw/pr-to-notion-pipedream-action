import moment from 'moment-timezone';
import moment_duration_format from 'moment-duration-format';

export default {
    getLeadTime: (startDate, endDate) => {
        const startOfDay = {hour: 10, minute: 30};
        const endOfDay = {hour: 18, minute: 30};

        const timeOpened = moment(startDate).tz("America/New_York");
        const timeClosed = moment(endDate).tz("America/New_York");

        const daysToComplete = timeClosed.diff(timeOpened, 'days') + 1;

        let timeToClose = 0;

        // if only open for one day and after working hours
        if (timeOpened.clone().set(endOfDay).isBefore(timeOpened)) {
            return timeToClose
        }

        // first day duration
        timeToClose += moment.duration(timeOpened.clone().set(endOfDay).diff(timeOpened)).asMilliseconds();

        if (daysToComplete > 1) {
            const nextDay = timeOpened.clone().add(1, 'days');

            const isClosingDay = timeClosed.format('YYYY-MM-DD') === nextDay.format('YYYY-MM-DD');

            const endOfDuration = isClosingDay ? {hour: timeClosed.hour(), minute: timeClosed.minutes()} : endOfDay;

            timeToClose += moment.duration(nextDay.clone().set(endOfDuration).diff(nextDay.clone().set(startOfDay))).asMilliseconds();
        }

        return timeToClose / 60000; // convert ms to m
    },

    isStale: (minutes) => {
        return minutes >= (60 * 4);
    },

    getSize: (pullRequest) => {
        const linesChanged = pullRequest.additions - pullRequest.deletions;

        const optimal = linesChanged <= 250;
        const complex = !(optimal || veryComplex);
        const veryComplex = linesChanged >= 600;

        if (optimal) return 'optimal';
        if (complex) return 'complex';
        if (veryComplex) return 'very complex';
    }
};
