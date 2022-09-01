// see https://github.com/StateOfJS/state-of-js-graphql-results-api/issues/190#issuecomment-952308689
// thanks @thomasheyenbrock!!
export const getWinsPipeline = (match: any, key: String, year: Number) => [
    { $match: match },
    /**
     * Reduce over the bracketResult array and determine the roundNumber. (Use $reduce
     * instead of $map in order to get a running index.)
     */
    {
        $project: {
            _id: 0,
            matches: {
                $reduce: {
                    input: `$${key}`,
                    initialValue: { acc: [], index: 0 },
                    in: {
                        acc: {
                            $concatArrays: [
                                '$$value.acc',
                                [
                                    {
                                        player: { $slice: ['$$this', 2] },
                                        winner: { $arrayElemAt: ['$$this', 2] },
                                        roundNumber: {
                                            $switch: {
                                                branches: [
                                                    {
                                                        case: { $lt: ['$$value.index', 4] },
                                                        then: 1
                                                    },
                                                    { case: { $lt: ['$$value.index', 6] }, then: 2 }
                                                ],
                                                default: 3
                                            }
                                        }
                                    }
                                ]
                            ]
                        },
                        index: { $add: ['$$value.index', 1] }
                    }
                }
            }
        }
    },
    { $project: { match: '$matches.acc' } },
    /**
     * Unwrap the individual matches, and also the players, effectively producing
     * two documents for a single match (one will be used for each player).
     */
    { $unwind: '$match' },
    { $unwind: '$match.player' },
    /**
     * Group by player and roundNumber, summing up the totals and wins.
     */
    {
        $project: {
            player: '$match.player',
            roundNumber: '$match.roundNumber',
            hasWon: {
                $cond: {
                    if: { $eq: ['$match.player', '$match.winner'] },
                    then: 1,
                    else: 0
                }
            }
        }
    },
    {
        $group: {
            _id: { player: '$player', roundNumber: '$roundNumber' },
            totalCount: { $sum: 1 },
            count: { $sum: '$hasWon' }
        }
    },
    /**
     * Create the three properties "roundNumber1", "roundNumber2", and "roundNumber3". Only one of
     * them will actually contain data at this stage.
     */
    {
        $project: {
            _id: 0,
            player: '$_id.player',
            roundNumber1: {
                $cond: {
                    if: { $eq: ['$_id.roundNumber', 1] },
                    then: {
                        totalCount: '$totalCount',
                        count: '$count',
                        percentage: { $divide: ['$count', '$totalCount'] }
                    },
                    else: {}
                }
            },
            roundNumber2: {
                $cond: {
                    if: { $eq: ['$_id.roundNumber', 2] },
                    then: {
                        totalCount: '$totalCount',
                        count: '$count',
                        percentage: { $divide: ['$count', '$totalCount'] }
                    },
                    else: {}
                }
            },
            roundNumber3: {
                $cond: {
                    if: { $eq: ['$_id.roundNumber', 3] },
                    then: {
                        totalCount: '$totalCount',
                        count: '$count',
                        percentage: { $divide: ['$count', '$totalCount'] }
                    },
                    else: {}
                }
            }
        }
    },
    /**
     * Group by player and merge together the roundNumber-fields created in the
     * previous stage.
     */
    {
        $group: {
            _id: '$player',
            roundNumber1: { $mergeObjects: '$roundNumber1' },
            roundNumber2: { $mergeObjects: '$roundNumber2' },
            roundNumber3: { $mergeObjects: '$roundNumber3' }
        }
    },
    /**
     * Sum up the totals and wins of all three roundNumbers.
     */
    {
        $project: {
            _id: 0,
            id: '$_id',
            combined: {
                totalCount: {
                    $sum: ['$roundNumber1.totalCount', '$roundNumber2.totalCount', '$roundNumber3.totalCount']
                },
                count: {
                    $sum: ['$roundNumber1.count', '$roundNumber2.count', '$roundNumber3.count']
                }
            },
            roundNumber1: 1,
            roundNumber2: 1,
            roundNumber3: 1
        }
    },
    /**
     * Final formatting.
     */
    {
        $project: {
            id: 1,
            year: { $literal: year },
            combined: {
                count: '$combined.count',
                percentage: {
                    $round: [
                        {
                            $multiply: [
                                { $divide: ['$combined.count', '$combined.totalCount'] },
                                100
                            ]
                        },
                        1
                    ]
                }
            },
            roundNumber1: {
                count: { $ifNull: ['$roundNumber1.count', 0] },
                percentage: {
                    $round: [{ $multiply: [{ $ifNull: ['$roundNumber1.percentage', null] }, 100] }, 1]
                }
            },
            roundNumber2: {
                count: { $ifNull: ['$roundNumber2.count', 0] },
                percentage: {
                    $round: [{ $multiply: [{ $ifNull: ['$roundNumber2.percentage', null] }, 100] }, 1]
                }
            },
            roundNumber3: {
                count: { $ifNull: ['$roundNumber3.count', 0] },
                percentage: {
                    $round: [{ $multiply: [{ $ifNull: ['$roundNumber3.percentage', null] }, 100] }, 1]
                }
            }
        }
    },
    /**
     * remove any item with id: null
     */
    {
        $match: {
            id: { $ne: null }
        }
    }
]

// count how many matches each item won
export const getMatchupsPipeline = (match: any, key: String, year: Number) => [
    { $match: match },
    /**
     * Map over the individual matches and transform the shape.
     */
    {
        $project: {
            _id: 0,
            matches: {
                $map: {
                    input: `$${key}`,
                    in: {
                        /**
                         * We store an array here that we'll unwrap later in order to split
                         * a single match into two documents (one for each player).
                         */
                        players: [
                            {
                                player: { $arrayElemAt: ['$$this', 0] },
                                opponent: { $arrayElemAt: ['$$this', 1] }
                            },
                            {
                                player: { $arrayElemAt: ['$$this', 1] },
                                opponent: { $arrayElemAt: ['$$this', 0] }
                            }
                        ],
                        winner: { $arrayElemAt: ['$$this', 2] }
                    }
                }
            }
        }
    },
    /**
     * Unwind the individual matches and players.
     */
    { $unwind: '$matches' },
    { $unwind: '$matches.players' },

    /**
     * Group by player-opponent-combination and sum up totals and wins.
     */
    {
        $project: {
            player: '$matches.players.player',
            opponent: '$matches.players.opponent',
            hasWon: {
                $cond: {
                    if: { $eq: ['$matches.players.player', '$matches.winner'] },
                    then: 1,
                    else: 0
                }
            }
        }
    },
    {
        $group: {
            _id: { player: '$player', opponent: '$opponent' },
            totalCount: { $sum: 1 },
            count: { $sum: '$hasWon' }
        }
    },
    /**
     * Calculate the percentage.
     */
    {
        $project: {
            _id: 0,
            player: '$_id.player',
            opponent: '$_id.opponent',
            count: '$count',
            percentage: {
                $round: [{ $multiply: [{ $divide: ['$count', '$totalCount'] }, 100] }, 1]
            }
        }
    },
    /**
     * Sort by percentage descending
     */
    { $sort: { percentage: -1 } },
    /**
     * Remove any match where the player or opponent is null
     */
    { $match: { player: { $ne: null }, opponent: { $ne: null } } },
    /**
     * Group by player and push an object for each opponent.
     */
    {
        $group: {
            _id: '$player',
            matchups: {
                $push: { id: '$opponent', count: '$count', percentage: '$percentage' }
            }
        }
    },
    {
        $project: {
            _id: 0,
            id: '$_id',
            matchups: 1,
            year: { $literal: year }
        }
    },
    /**
     * Remove any item where id is null
     */
    { $match: { id: { $ne: null } } },
    /**
     * Sort by id
     */
    { $sort: { id: 1 } }
]
