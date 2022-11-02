import { gql } from 'graphql-request'

export const TimeSeriesQuery = gql`
    query timeSeries(
        $uniqueName: String!
        $timeRange: TimeRangeInput!
        $granularity: TimeSeriesGranularity!
    ) {
        metricByName(uniqueName: $uniqueName) {
            timeSeries(
                input: { timeRange: $timeRange, granularity: $granularity }
            ) {
                labels
                values
            }
        }
    }
`
export function getTimeSeriesVariables({ timeRange, granularity }) {
    return {
        uniqueName: 'sales',
        timeRange: {
            relative: timeRange || 'LAST_30_DAYS',
        },
        granularity: granularity || 'DAY',
    }
}
