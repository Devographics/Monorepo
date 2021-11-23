import PropTypes from 'prop-types'
import FeaturesCirclePackingChart from 'core/charts/features/FeaturesCirclePackingChart'

// reuse chart component but keep separate file in order to define different propTypes
FeaturesCirclePackingChart.propTypes = {
    data: PropTypes.shape({
        sections: PropTypes.arrayOf(
            PropTypes.shape({
                features: PropTypes.arrayOf(
                    PropTypes.shape({
                        id: PropTypes.string.isRequired,
                        usage: PropTypes.shape({
                            total: PropTypes.number.isRequired,
                            buckets: PropTypes.arrayOf(
                                PropTypes.shape({
                                    id: PropTypes.string.isRequired,
                                    count: PropTypes.number.isRequired,
                                    percentage: PropTypes.number.isRequired,
                                })
                            ).isRequired,
                        }).isRequired,
                    })
                ),
            })
        ),
    }),
}

export default FeaturesCirclePackingChart
