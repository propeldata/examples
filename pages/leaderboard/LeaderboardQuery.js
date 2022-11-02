import { gql } from 'graphql-request'

export const LeaderboardQuery = gql`
    query timeSeries(
        $uniqueName: String!
        $timeRange: TimeRangeInput!
        $rowLimit: Int!
        $sort: Sort
        $dimensions: [DimensionInput!]!
    ) {
        metricByName(uniqueName: $uniqueName) {
            leaderboard: leaderboard(
                input: {
                    timeRange: $timeRange
                    rowLimit: $rowLimit
                    sort: $sort
                    dimensions: $dimensions
                }
            ) {
                headers
                rows
            }
        }
    }
`
export function getLeaderboardVariables({ timeRange }) {
    return {
        uniqueName: 'sales',
        timeRange: {
            relative: timeRange || 'YESTERDAY',
        },
        rowLimit: 10,
        sort: 'DESC',
        dimensions: [
            {
                columnName: 'PRODUCT_CATEGORY',
            },
        ],
    }
}
