import moment from 'moment-timezone';
import moment_duration_format from 'moment-duration-format';

export default {
    getLeadTime: (startDate, endDate) => {
        const startOfDay = {hour: 10, minute: 30};
        const endOfDay = {hour: 18, minute: 30};

        const timeOpened = moment(startDate).tz('America/New_York');
        const timeEnded = moment(endDate).tz('America/New_York');

        // first day duration
        const endOfFirstWorkingDay = timeOpened.clone().set(endOfDay);
        const endOfFirstDay = timeEnded.isBefore(endOfFirstWorkingDay) ? timeEnded : endOfFirstWorkingDay;
        let timeToClose = moment.duration(endOfFirstDay.diff(timeOpened)).asMinutes();

        // add x day durations
        let daysToProcess = timeEnded.diff(timeOpened.clone().startOf('day'), 'days');
        while (daysToProcess >= 1) {
            const nextDay = timeOpened.clone().add(1, 'days');

            const isClosingDay = timeEnded.format('YYYY-MM-DD') === nextDay.format('YYYY-MM-DD');

            const endOfDuration = isClosingDay ? {hour: timeEnded.hour(), minute: timeEnded.minutes()} : endOfDay;

            const startOfNextDay = nextDay.clone().set(startOfDay)
            const endOfNextDay = nextDay.clone().set(endOfDuration)

            if (endOfNextDay.isBefore(startOfNextDay)) {
                daysToProcess--

                continue;
            }

            timeToClose += moment.duration(endOfNextDay.diff(startOfNextDay)).asMinutes();

            daysToProcess--;
        }

        return timeToClose;
    },

    isStale: (minutes) => {
        return minutes >= (60 * 4);
    },

    getSize: (pullRequest) => {
        const linesChanged = pullRequest.additions - pullRequest.deletions;

        const optimal = linesChanged <= 250;
        const veryComplex = linesChanged >= 600;
        const complex = !(optimal || veryComplex);

        if (optimal) return 'optimal';
        if (complex) return 'complex';
        if (veryComplex) return 'very complex';
    }
};
