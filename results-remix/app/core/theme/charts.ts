export default {
    emptyPattern: {
        id: 'empty',
        type: 'patternLines',
        background: 'inherit',
        color: 'rgba(0, 0, 0, .07)',
        rotation: -45,
        lineWidth: 3,
        spacing: 6,
    },
    axis: {
        domain: {
            line: {
                strokeWidth: 0,
            },
        },
        ticks: {
            text: {
                fontSize: 12,
            },
        },
        legend: {
            text: {
                fontSize: 14,
                fontWeight: 600,
            },
        },
    },
    streamTimelineAxis: {
        ticks: {
            line: {
                strokeWidth: 2,
            },
            text: {
                fontSize: 12,
            },
        },
    },
    grid: {
        line: {
            strokeDasharray: '1 2',
            strokeOpacity: 0.4,
        },
    },
    legends: {
        text: {
            fontSize: 11,
        },
    },
    tooltip: {
        container: {
            fontSize: 14,
            borderRadius: 0,
            boxShadow: `9px 9px 0 rgba(0, 0, 0, 0.15)`,
        },
    },
    labels: {
        text: {
            fontSize: 12,
            fontWeight: 500,
            textShadow: `0px 2px 3px rgba(0,0,0,0.35)`,
        },
    },
    dots: {
        text: {
            fontSize: 12,
        },
    },
}
