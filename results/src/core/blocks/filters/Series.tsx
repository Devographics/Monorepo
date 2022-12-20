import React, { useState, useRef, useEffect } from 'react'
import Condition from './Condition'

const Series = ({ conditions }) => {
    return (
        <div>
            {conditions.map(condition => (
                <Condition key={condition.id} {...condition} />
            ))}
        </div>
    )
}

export default Series
