import React, { useState, useRef, useEffect } from 'react'
import Series from './Series'
import AddSeries from './AddSeries'

const sampleFilters = [
    {
        id: 1,
        conditions: [
            {
                id: 'gender',
                operator: 'eq',
                value: 'female'
            },
            {
                id: 'country',
                operator: 'eq',
                value: 'FRA'
            }
        ]
    },
    {
        id: 2,
        conditions: [
            {
                id: 'gender',
                operator: 'eq',
                value: 'non_binary'
            },
            {
                id: 'country',
                operator: 'eq',
                value: 'FRA'
            }
        ]
    }
]

const Filter = () => {
    const [filtersState, setFiltersState] = useState(sampleFilters)

    const stateStuff = {
        filtersState,
        setFiltersState
    }
    return <div>
        {filtersState.map(series => <Series key={series.id} {...series} stateStuff={stateStuff}/>)}
        {/* <AddSeries stateStuff={stateStuff}/> */}
    </div>
}
