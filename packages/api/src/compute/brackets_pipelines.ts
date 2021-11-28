// see https://github.com/StateOfJS/state-of-js-graphql-results-api/issues/190#issuecomment-952308689
// thanks @thomasheyenbrock!!
export const getWinsPipeline = (match: any, key: String) => [
    { $match: match },
    /**
     * Reduce over the bracketResult array and determine the round. (Use $reduce
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
                                        round: {
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
     * Group by player and round, summing up the totals and wins.
     */
    {
        $project: {
            player: '$match.player',
            round: '$match.round',
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
            _id: { player: '$player', round: '$round' },
            totalCount: { $sum: 1 },
            count: { $sum: '$hasWon' }
        }
    },
    /**
     * Create the three properties "round1", "round2", and "round3". Only one of
     * them will actually contain data at this stage.
     */
    {
        $project: {
            _id: 0,
            player: '$_id.player',
            round1: {
                $cond: {
                    if: { $eq: ['$_id.round', 1] },
                    then: {
                        totalCount: '$totalCount',
                        count: '$count',
                        percentage: { $divide: ['$count', '$totalCount'] }
                    },
                    else: {}
                }
            },
            round2: {
                $cond: {
                    if: { $eq: ['$_id.round', 2] },
                    then: {
                        totalCount: '$totalCount',
                        count: '$count',
                        percentage: { $divide: ['$count', '$totalCount'] }
                    },
                    else: {}
                }
            },
            round3: {
                $cond: {
                    if: { $eq: ['$_id.round', 3] },
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
     * Group by player and merge together the round-fields created in the
     * previous stage.
     */
    {
        $group: {
            _id: '$player',
            round1: { $mergeObjects: '$round1' },
            round2: { $mergeObjects: '$round2' },
            round3: { $mergeObjects: '$round3' }
        }
    },
    /**
     * Sum up the totals and wins of all three rounds.
     */
    {
        $project: {
            _id: 0,
            id: '$_id',
            combined: {
                totalCount: {
                    $sum: ['$round1.totalCount', '$round2.totalCount', '$round3.totalCount']
                },
                count: {
                    $sum: ['$round1.count', '$round2.count', '$round3.count']
                }
            },
            round1: 1,
            round2: 1,
            round3: 1
        }
    },
    /**
     * Final formatting.
     */
    {
        $project: {
            id: 1,
            year: { $literal: 2021 },
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
            round1: {
                count: { $ifNull: ['$round1.count', 0] },
                percentage: {
                    $round: [{ $multiply: [{ $ifNull: ['$round1.percentage', null] }, 100] }, 1]
                }
            },
            round2: {
                count: { $ifNull: ['$round2.count', 0] },
                percentage: {
                    $round: [{ $multiply: [{ $ifNull: ['$round2.percentage', null] }, 100] }, 1]
                }
            },
            round3: {
                count: { $ifNull: ['$round3.count', 0] },
                percentage: {
                    $round: [{ $multiply: [{ $ifNull: ['$round3.percentage', null] }, 100] }, 1]
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
export const getMatchupsPipeline = (match: any, key: String) => [
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
            year: { $literal: 2021 }
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
