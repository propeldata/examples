import { GraphQLClient, gql } from 'graphql-request'

export const CounterQuery = gql`
        query timeSeries(
            $uniqueName: String!
            $timeRange: TimeRangeInput!
            $comparisonTimeRange: TimeRangeInput!
        ) {
            metricByName(uniqueName: $uniqueName) {
                mainCounter: counter(input: { timeRange: $timeRange }) {
                    value
                }
                comparisonCounter: counter(
                    input: { timeRange: $comparisonTimeRange }
                ) {
                    value
                }
            }
        }
    `
export function getCounterVariables({timeRange,comparisonTimeRange}) {
    return ({
    uniqueName: 'sales',
    timeRange: {
        relative: timeRange || 'TODAY',
    },
    comparisonTimeRange: {
        relative: comparisonTimeRange || 'YESTERDAY',
    },})
}